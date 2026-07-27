<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadScore;
use App\Models\LeadConversation;
use App\Models\Followup;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class LeadAutomationService
{
    protected LuminaAIService $lumina;
    protected array $settings;

    protected array $scoringRules = [
        'high_intent_keywords' => ['price', 'cost', 'quote', 'buy', 'order', 'start', 'package', 'subscribe', 'pricing', 'how much'],
        'contact_signals' => ['phone', 'email', 'whatsapp', 'call me', 'contact'],
        'urgent_signals' => ['urgent', 'asap', 'immediately', 'today', 'emergency', 'quick'],
        'service_keywords' => ['website', 'seo', 'social media', 'google ads', 'branding', 'logo', 'marketing'],
    ];

    public function __construct()
    {
        $this->lumina = new LuminaAIService();
        $this->settings = DB::table('settings')->pluck('value', 'key')->toArray();
    }

    public function captureLead(array $data): Lead
    {
        $existing = Lead::where('email', $data['email'] ?? '')
            ->orWhere('phone', $data['phone'] ?? '')
            ->first();

        if ($existing) {
            $existing->update([
                'name' => $data['name'] ?? $existing->name,
                'notes' => $existing->notes . "\n[Updated] " . ($data['notes'] ?? ''),
                'last_contacted_at' => now(),
            ]);
            $lead = $existing;
        } else {
            $lead = Lead::create([
                'name' => $data['name'] ?? 'Unknown',
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'source' => $data['source'] ?? 'website',
                'service_interest' => $data['service_interest'] ?? null,
                'notes' => $data['notes'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'status' => 'new',
                'score' => 0,
                'last_contacted_at' => now(),
            ]);
        }

        $this->scoreLead($lead);
        Log::info("Lead captured: {$lead->name} <{$lead->email}> via {$lead->source}");

        return $lead;
    }

    public function scoreLead(Lead $lead): float
    {
        $signals = [];
        $score = 0;
        $notes = strtolower($lead->notes ?? '');
        $interest = strtolower($lead->service_interest ?? '');

        foreach ($this->scoringRules['high_intent_keywords'] as $kw) {
            if (strpos($notes, $kw) !== false || strpos($interest, $kw) !== false) {
                $score += 15;
                $signals[] = "high_intent:{$kw}";
            }
        }

        foreach ($this->scoringRules['contact_signals'] as $kw) {
            if (strpos($notes, $kw) !== false) {
                $score += 10;
                $signals[] = "contact_signal:{$kw}";
            }
        }

        foreach ($this->scoringRules['urgent_signals'] as $kw) {
            if (strpos($notes, $kw) !== false) {
                $score += 20;
                $signals[] = "urgent:{$kw}";
            }
        }

        foreach ($this->scoringRules['service_keywords'] as $kw) {
            if (strpos($interest, $kw) !== false) {
                $score += 10;
                $signals[] = "service_match:{$kw}";
            }
        }

        if ($lead->email) $score += 5;
        if ($lead->phone) $score += 10;

        $conversationCount = $lead->conversations()->count();
        if ($conversationCount > 0) $score += min($conversationCount * 2, 10);

        $score = min(max($score, 0), 100);

        LeadScore::create([
            'lead_id' => $lead->id,
            'score' => $score,
            'reason' => implode('; ', $signals) ?: 'initial_scoring',
            'signals' => $signals,
        ]);

        if ($score >= 70) $status = 'qualified';
        elseif ($score >= 30) $status = 'contacted';
        else $status = 'new';

        $lead->update(['score' => $score, 'status' => $status]);

        return $score;
    }

    public function logConversation(Lead $lead, string $message, string $direction, string $channel = 'chat', ?string $aiReply = null): LeadConversation
    {
        $sentiment = $this->analyzeSentiment($message);

        $conv = LeadConversation::create([
            'lead_id' => $lead->id,
            'channel' => $channel,
            'message' => $message,
            'direction' => $direction,
            'ai_reply' => $aiReply,
            'sentiment_score' => $sentiment,
            'status' => $aiReply ? 'replied' : 'pending',
        ]);

        $lead->update(['last_contacted_at' => now()]);
        $this->scoreLead($lead);

        return $conv;
    }

    public function scheduleFollowup(Lead $lead, string $type, string $message, string $when = '+24 hours'): Followup
    {
        return Followup::create([
            'lead_id' => $lead->id,
            'type' => $type,
            'message' => $message,
            'scheduled_at' => now()->modify($when),
            'status' => 'pending',
        ]);
    }

    public function processPendingFollowups(): int
    {
        $processed = 0;
        $due = Followup::pending()->where('scheduled_at', '<=', now())->get();

        foreach ($due as $followup) {
            try {
                $lead = $followup->lead;
                $message = $this->personalizeMessage($followup->message, $lead);

                $this->logConversation(
                    $lead,
                    $followup->message,
                    'outbound',
                    'followup',
                    $message
                );

                $followup->update(['status' => 'sent', 'sent_at' => now()]);
                $processed++;
            } catch (\Exception $e) {
                Log::error("Followup #{$followup->id} failed: {$e->getMessage()}");
            }
        }

        return $processed;
    }

    public function getLeadSummary(Lead $lead): array
    {
        $conversations = $lead->conversations()->latest()->take(10)->get();
        $followups = $lead->followups()->latest()->take(5)->get();

        return [
            'lead' => $lead->toArray(),
            'score' => $lead->score,
            'status' => $lead->status,
            'conversation_count' => $conversations->count(),
            'last_contact' => $lead->last_contacted_at?->diffForHumans(),
            'recent_messages' => $conversations->map(fn($c) => [
                'message' => substr($c->message, 0, 100),
                'direction' => $c->direction,
                'channel' => $c->channel,
                'sentiment' => $c->sentiment_score,
                'time' => $c->created_at->diffForHumans(),
            ]),
            'pending_followups' => $followups->where('status', 'pending')->count(),
            'ai_insight' => $this->generateLeadInsight($lead),
        ];
    }

    public function getDashboardStats(): array
    {
        return [
            'total' => Lead::count(),
            'new' => Lead::new()->count(),
            'qualified' => Lead::qualified()->count(),
            'converted' => Lead::converted()->count(),
            'hot' => Lead::hot()->count(),
            'warm' => Lead::warm()->count(),
            'cold' => Lead::cold()->count(),
            'pending_followups' => Followup::pending()->count(),
            'avg_score' => round(Lead::avg('score') ?? 0, 1),
            'top_sources' => Lead::select('source', DB::raw('count(*) as total'))
                ->groupBy('source')->orderByDesc('total')->limit(5)->get()->toArray(),
        ];
    }

    protected function analyzeSentiment(string $text): float
    {
        $positive = ['thanks', 'great', 'perfect', 'awesome', 'good', 'love', 'interested', 'yes', 'sure', 'please', 'want', 'need', 'start', 'go'];
        $negative = ['bad', 'terrible', 'awful', 'hate', 'angry', 'upset', 'cancel', 'stop', 'refund', 'complaint', 'poor', 'worst', 'slow', 'expensive'];

        $lower = mb_strtolower($text);
        $posScore = 0;
        $negScore = 0;

        foreach ($positive as $w) { if (strpos($lower, $w) !== false) $posScore++; }
        foreach ($negative as $w) { if (strpos($lower, $w) !== false) $negScore++; }

        $total = $posScore + $negScore;
        if ($total === 0) return 0.5;

        return round($posScore / $total, 2);
    }

    protected function generateLeadInsight(Lead $lead): string
    {
        $prompt = "Analyze this lead and provide a brief insight:\n" .
            "Name: {$lead->name}\nEmail: {$lead->email}\nPhone: {$lead->phone}\n" .
            "Source: {$lead->source}\nInterest: {$lead->service_interest}\n" .
            "Score: {$lead->score}/100\nStatus: {$lead->status}\nNotes: {$lead->notes}\n\n" .
            "Provide a 1-sentence recommendation on how to approach this lead.";

        $result = $this->lumina->quickAsk($prompt, 'lead_insight');
        return $result['content'] ?? 'Review lead details manually.';
    }

    protected function personalizeMessage(string $template, Lead $lead): string
    {
        return str_replace(
            ['{name}', '{email}', '{phone}', '{service}', '{score}'],
            [$lead->name, $lead->email, $lead->phone, $lead->service_interest, $lead->score],
            $template
        );
    }
}
