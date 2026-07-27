<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\LeadOutreachMail;
use App\Models\SeoLead;
use App\Models\SeoLeadCategory;
use App\Models\SeoLeadOutreach;
use App\Services\ApifyLeadService;
use App\Services\AiContentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\WhatsAppImportHistory;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class LeadGenController extends Controller
{
    protected ApifyLeadService $apify;

    public function __construct()
    {
        $this->apify = new ApifyLeadService();
    }

    public function dashboard()
    {
        $settings = DB::table('settings')->pluck('value', 'key')->toArray();
        $totalLeads = SeoLead::count();
        $newLeads = SeoLead::where('status', 'new')->count();
        $hotLeads = SeoLead::where('lead_score', '>=', 70)->count();
        $categories = SeoLeadCategory::active()->byPriority()->get();
        $recentLeads = SeoLead::latest()->take(20)->get();
        $leadsThisWeek = SeoLead::where('created_at', '>=', now()->subDays(7))->count();
        $sourceStats = SeoLead::selectRaw('source, count(*) as total')
            ->groupBy('source')->pluck('total', 'source');
        $platforms = $this->apify->getAvailablePlatforms();

        return view('admin.lead-gen.dashboard', compact(
            'settings', 'totalLeads', 'newLeads', 'hotLeads',
            'categories', 'recentLeads', 'leadsThisWeek', 'sourceStats', 'platforms'
        ));
    }

    public function leads(Request $request)
    {
        $settings = DB::table('settings')->pluck('value', 'key')->toArray();
        $query = SeoLead::with('leadCategory');

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('lead_type')) {
            $query->where('lead_type', $request->lead_type);
        }
        if ($request->filled('country')) {
            $query->where('country', 'like', "%{$request->country}%");
        }
        if ($request->filled('phone')) {
            $query->where('phone', 'like', "%{$request->phone}%");
        }
        if ($request->filled('website')) {
            $query->where('website', 'like', "%{$request->website}%");
        }
        if ($request->filled('whatsapp_phone')) {
            $query->where('whatsapp_phone', 'like', "%{$request->whatsapp_phone}%");
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('business_name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('whatsapp_phone', 'like', "%{$s}%")
                  ->orWhere('website', 'like', "%{$s}%")
                  ->orWhere('address', 'like', "%{$s}%");
            });
        }

        if ($request->boolean('has_email')) {
            $query->whereNotNull('email')->where('email', '!=', '');
        }
        if ($request->boolean('has_phone')) {
            $query->whereNotNull('phone')->where('phone', '!=', '');
        }
        if ($request->boolean('has_website')) {
            $query->whereNotNull('website')->where('website', '!=', '');
        }
        if ($request->boolean('has_whatsapp')) {
            $query->whereNotNull('whatsapp_phone')->where('whatsapp_phone', '!=', '');
        }

        $leads = $query->latest()->paginate(50)->withQueryString();
        $categories = SeoLeadCategory::active()->byPriority()->get();
        $platforms = (new ApifyLeadService())->getAvailablePlatforms();
        $sourceOptions = SeoLead::select('source')->distinct()->whereNotNull('source')->pluck('source');
        $countryOptions = SeoLead::select('country')->distinct()->whereNotNull('country')->pluck('country');

        return view('admin.lead-gen.leads', compact('settings', 'leads', 'categories', 'platforms', 'sourceOptions', 'countryOptions'));
    }

    public function categories()
    {
        $settings = DB::table('settings')->pluck('value', 'key')->toArray();
        $categories = SeoLeadCategory::byPriority()->get();
        $platforms = (new ApifyLeadService())->getAvailablePlatforms();
        $stats = [
            'total' => SeoLeadCategory::count(),
            'active' => SeoLeadCategory::where('is_active', true)->count(),
            'leads30d' => SeoLead::where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return view('admin.lead-gen.categories', compact('settings', 'categories', 'platforms', 'stats'));
    }

    public function storeCategory(Request $request)
    {
        $data = $request->validate([
            'category_name' => 'required|string|max:255',
            'keywords' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'platforms' => 'nullable|array',
            'max_leads' => 'nullable|integer|min:10|max:500',
            'priority' => 'nullable|integer|min:1|max:10',
            'auto_enrich' => 'nullable|boolean',
            'min_score_threshold' => 'nullable|integer|min:0|max:100',
            'target_audience' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $data['platforms'] = $data['platforms'] ?? ['google_maps', 'instagram'];
        $data['auto_enrich'] = $request->boolean('auto_enrich');

        SeoLeadCategory::create($data);

        return redirect()->route('admin.lead-gen.categories')
            ->with('success', 'Category created successfully');
    }

    public function updateCategory(Request $request, $id)
    {
        $category = SeoLeadCategory::findOrFail($id);

        $data = $request->validate([
            'category_name' => 'required|string|max:255',
            'keywords' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'platforms' => 'nullable|array',
            'max_leads' => 'nullable|integer|min:10|max:500',
            'priority' => 'nullable|integer|min:1|max:10',
            'auto_enrich' => 'nullable|boolean',
            'min_score_threshold' => 'nullable|integer|min:0|max:100',
            'target_audience' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $data['platforms'] = $data['platforms'] ?? ['google_maps', 'instagram'];
        $data['auto_enrich'] = $request->boolean('auto_enrich');

        $category->update($data);

        return redirect()->route('admin.lead-gen.categories')
            ->with('success', 'Category updated successfully');
    }

    public function deleteCategory($id)
    {
        $category = SeoLeadCategory::findOrFail($id);
        $category->leads()->update(['category_id' => null]);
        $category->delete();

        if (request()->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Category deleted']);
        }

        return redirect()->route('admin.lead-gen.categories')
            ->with('success', 'Category deleted');
    }

    public function toggleCategory($id)
    {
        $category = SeoLeadCategory::findOrFail($id);
        $category->update(['is_active' => !$category->is_active]);

        return response()->json([
            'success' => true,
            'is_active' => $category->is_active,
        ]);
    }

    public function generate(Request $request)
    {
        set_time_limit(300);
        try {
            $request->validate(['category_id' => 'required|exists:seo_lead_categories,id']);
            $category = SeoLeadCategory::findOrFail($request->category_id);
            $results = $this->apify->generateForCategory($category);
        } catch (\Exception $e) {
            Log::error('LeadGen generate: ' . $e->getMessage());
            if ($request->ajax()) {
                return response()->json(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
            }
            return redirect()->back()->with('error', 'Server error: ' . $e->getMessage());
        }

        $total = $results['total'] ?? 0;
        $msg = "Generated {$total} leads for '{$category->category_name}'";
        if (!empty($results['enriched'])) {
            $msg .= " ({$results['enriched']} enriched)";
        }

        if (!empty($results['errors'])) {
            $msg .= '. Errors: ' . implode('; ', $results['errors']);
        }

        if ($request->ajax()) {
            return response()->json(['success' => $total > 0, 'message' => $msg]);
        }

        return redirect()->back()->with('success', $msg);
    }

    public function quickGenerate(Request $request)
    {
        try {
            $data = $request->validate([
                'keyword' => 'required|string|max:255',
                'location' => 'nullable|string|max:255',
                'platforms' => 'required|array|min:1',
                'platforms.*' => 'string',
                'enrich' => 'nullable|boolean',
                'limit' => 'nullable|integer|min:5|max:200',
                'category_id' => 'nullable|integer|exists:seo_lead_categories,id',
            ]);
        } catch (\Exception $e) {
            Log::error('LeadGen quickGenerate validation: ' . $e->getMessage());
            if ($request->ajax()) {
                return response()->json(['success' => false, 'message' => 'Validation failed'], 422);
            }
            return redirect()->back()->with('error', 'Validation failed');
        }

        $jobId = (string) Str::uuid();
        $jobData = [
            'keyword' => $data['keyword'],
            'location' => $data['location'] ?? '',
            'platforms' => $data['platforms'],
            'enrich' => $request->boolean('enrich'),
            'limit' => $data['limit'] ?? 30,
            'category_id' => $data['category_id'] ?? null,
        ];

        // Write config and initial status
        $jobDir = storage_path("app/generation_jobs");
        @mkdir($jobDir, 0755, true);
        file_put_contents("{$jobDir}/{$jobId}.config.json", json_encode($jobData, JSON_PRETTY_PRINT));
        file_put_contents("{$jobDir}/{$jobId}.json", json_encode([
            'status' => 'queued',
            'message' => 'Job queued, waiting to start...',
            'updated_at' => now()->toIso8601String(),
        ], JSON_PRETTY_PRINT));

        // Launch background process
        $script = base_path('scripts/generate_background.php');
        $cmd = "php " . escapeshellarg($script) . " " . escapeshellarg($jobId) . " > /dev/null 2>&1 &";
        exec($cmd);

        $msg = "Generation started for '{$data['keyword']}' — running in background. Check status below.";

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => $msg,
                'job_id' => $jobId,
                'status_url' => route('admin.lead-gen.generation-status', $jobId),
            ]);
        }

        return redirect()->back()->with('success', $msg)->with('generation_job_id', $jobId);
    }

    public function generationStatus(Request $request, string $jobId)
    {
        $statusPath = storage_path("app/generation_jobs/{$jobId}.json");
        if (!file_exists($statusPath)) {
            return response()->json(['status' => 'unknown', 'message' => 'Job not found'], 404);
        }

        $status = json_decode(file_get_contents($statusPath), true);
        return response()->json($status);
    }

    public function bulkGenerate(Request $request)
    {
        $ids = $request->input('category_ids', []);
        $categories = SeoLeadCategory::whereIn('id', $ids)->get();
        if ($categories->isEmpty()) {
            if ($request->ajax()) {
                return response()->json(['success' => false, 'message' => 'No categories found']);
            }
            return redirect()->back()->with('error', 'No categories selected');
        }

        $jobId = (string) Str::uuid();
        $jobData = [
            'keyword' => $categories->pluck('category_name')->implode(', '),
            'location' => $categories->first()->location ?? '',
            'platforms' => ['google_maps'],
            'enrich' => false,
            'limit' => $categories->sum('max_leads'),
            'category_ids' => $ids,
        ];

        $jobDir = storage_path("app/generation_jobs");
        @mkdir($jobDir, 0755, true);
        file_put_contents("{$jobDir}/{$jobId}.config.json", json_encode($jobData, JSON_PRETTY_PRINT));
        file_put_contents("{$jobDir}/{$jobId}.json", json_encode([
            'status' => 'queued',
            'message' => 'Bulk generation queued for ' . $categories->count() . ' categories...',
            'updated_at' => now()->toIso8601String(),
        ], JSON_PRETTY_PRINT));

        // Launch background process
        $script = base_path('scripts/generate_background.php');
        $cmd = "php " . escapeshellarg($script) . " " . escapeshellarg($jobId) . " > /dev/null 2>&1 &";
        exec($cmd);

        $msg = "Bulk generation started for {$categories->count()} categories — running in background.";

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => $msg,
                'job_id' => $jobId,
                'status_url' => route('admin.lead-gen.generation-status', $jobId),
            ]);
        }

        return redirect()->back()->with('success', $msg)->with('generation_job_id', $jobId);
    }

    public function createLead()
    {
        $categories = SeoLeadCategory::active()->byPriority()->get();
        return view('admin.lead-gen.lead-form', compact('categories'));
    }

    public function storeLead(Request $request)
    {
        $data = $request->validate([
            'business_name' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'whatsapp_phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:500',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'category_id' => 'nullable|integer|exists:seo_lead_categories,id',
            'source' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:new,contacted,qualified,converted,lost',
            'lead_type' => 'nullable|string|in:provider,customer,unknown',
            'notes' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'lead_score' => 'nullable|integer|min:0|max:100',
        ]);

        $data['source'] = $data['source'] ?? 'manual';
        $data['status'] = $data['status'] ?? 'new';
        $data['lead_type'] = $data['lead_type'] ?? 'unknown';

        SeoLead::create($data);

        return redirect()->route('admin.lead-gen.leads')->with('success', 'Lead created successfully');
    }

    public function editLead($id)
    {
        $lead = SeoLead::findOrFail($id);
        $categories = SeoLeadCategory::active()->byPriority()->get();
        return view('admin.lead-gen.lead-form', compact('lead', 'categories'));
    }

    public function updateLead(Request $request, $id)
    {
        $lead = SeoLead::findOrFail($id);

        $data = $request->validate([
            'business_name' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'whatsapp_phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:500',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'category_id' => 'nullable|integer|exists:seo_lead_categories,id',
            'source' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:new,contacted,qualified,converted,lost',
            'lead_type' => 'nullable|string|in:provider,customer,unknown',
            'notes' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'lead_score' => 'nullable|integer|min:0|max:100',
        ]);

        $lead->update($data);

        return redirect()->route('admin.lead-gen.leads')->with('success', 'Lead updated successfully');
    }

    public function destroyLead($id)
    {
        $lead = SeoLead::findOrFail($id);
        $lead->delete();

        return redirect()->route('admin.lead-gen.leads')->with('success', 'Lead deleted successfully');
    }

    public function show($id)
    {
        $lead = SeoLead::with('leadCategory')->findOrFail($id);

        $enriched = [];
        $gmData = null;
        if ($lead->notes) {
            $parsed = json_decode($lead->notes, true);
            if (is_array($parsed)) {
                $gmData = $parsed['google_maps_data'] ?? null;
                unset($parsed['google_maps_data']);
                $enriched = $parsed;
            } else {
                $enriched = ['note' => $lead->notes];
            }
        }

        $openingHours = [];
        if ($gmData && !empty($gmData['openingHours'])) {
            foreach ($gmData['openingHours'] as $oh) {
                $day = $oh['day'] ?? '';
                $hours = $oh['hours'] ?? '';
                if ($day && $hours) {
                    $openingHours[] = ['day' => $day, 'hours' => $hours];
                }
            }
        }

        $location = null;
        if ($gmData && !empty($gmData['location'])) {
            $location = $gmData['location'];
        }

        $gmCategories = [];
        if ($gmData && !empty($gmData['categories'])) {
            $gmCategories = $gmData['categories'];
        }

        $additionalInfo = [];
        if ($gmData && !empty($gmData['additionalInfo'])) {
            $additionalInfo = $gmData['additionalInfo'];
        }

        $gmUseful = array_filter([
            'totalScore' => $gmData['totalScore'] ?? null,
            'reviewsCount' => $gmData['reviewsCount'] ?? null,
            'price' => $gmData['price'] ?? null,
            'neighborhood' => $gmData['neighborhood'] ?? null,
            'street' => $gmData['street'] ?? null,
            'postalCode' => $gmData['postalCode'] ?? null,
            'categoryName' => $gmData['categoryName'] ?? null,
            'permanentlyClosed' => !empty($gmData['permanentlyClosed']) ? true : null,
            'temporarilyClosed' => !empty($gmData['temporarilyClosed']) ? true : null,
        ]);

        return response()->json([
            'success' => true,
            'lead' => array_merge($lead->toArray(), [
                'category_name' => $lead->leadCategory?->category_name,
                'gm_data' => $gmUseful,
                'opening_hours' => $openingHours,
                'location_coords' => $location,
                'gm_categories' => $gmCategories,
                'additional_info' => $additionalInfo,
                'enriched_data' => $enriched,
                'map_url' => $lead->address ? 'https://www.google.com/maps/search/?api=1&query=' . urlencode($lead->address) : null,
                'created_readable' => $lead->created_at ? $lead->created_at->format('M d, Y g:i A') : null,
                'updated_readable' => $lead->updated_at ? $lead->updated_at->format('M d, Y g:i A') : null,
                'social_links' => array_filter([
                    'facebook' => $lead->social_facebook,
                    'instagram' => $lead->social_instagram,
                    'tiktok' => $lead->social_tiktok,
                    'youtube' => $lead->social_youtube,
                    'twitter' => $lead->social_twitter,
                ]),
            ]),
        ]);
    }

    public function enrich(Request $request)
    {
        set_time_limit(60);
        $request->validate([
            'lead_id' => 'required|exists:seo_leads,id',
        ]);

        $lead = SeoLead::findOrFail($request->lead_id);
        if (empty($lead->website)) {
            return response()->json(['success' => false, 'error' => 'Lead has no website to enrich'], 400);
        }

        $result = $this->apify->enrichLead($lead->website);
        if ($result === null) {
            return response()->json(['success' => false, 'error' => 'Could not fetch website'], 500);
        }

        $updated = [];
        if (!empty($result['email']) && empty($lead->email)) {
            $lead->email = $result['email'];
            $updated[] = 'email';
        }
        if (!empty($result['phone']) && empty($lead->phone)) {
            $lead->phone = $result['phone'];
            $updated[] = 'phone';
        }
        if (!empty($result['leadScore'])) {
            $lead->lead_score = max($lead->lead_score, $result['leadScore']);
            $updated[] = 'score';
        }

        $existing = json_decode($lead->notes ?? '{}', true) ?: [];
        $existing['enriched_at'] = now()->toDateTimeString();
        $existing['found_emails'] = $result['allEmails'] ?? [];
        $existing['found_phones'] = $result['allPhones'] ?? [];
        $lead->notes = json_encode($existing);
        $lead->save();

        return response()->json([
            'success' => true,
            'message' => 'Lead enriched' . (!empty($updated) ? ': ' . implode(', ', $updated) : ' — no new data found'),
            'data' => $result,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $lead = SeoLead::findOrFail($id);
        $lead->update(['status' => $request->input('status', 'new')]);
        return response()->json(['success' => true]);
    }

    public function setWhatsapp(Request $request, $id)
    {
        $lead = SeoLead::findOrFail($id);
        $lead->update(['whatsapp_phone' => $request->whatsapp_phone]);
        return response()->json(['success' => true]);
    }

    public function toggleType(Request $request, $id)
    {
        $lead = SeoLead::findOrFail($id);
        $next = ['provider' => 'customer', 'customer' => 'unknown', 'unknown' => 'provider'];
        $lead->update(['lead_type' => $next[$lead->lead_type] ?? 'unknown']);
        return response()->json(['success' => true, 'lead_type' => $lead->lead_type]);
    }

    private function replacePlaceholders(string $text, SeoLead $lead): string
    {
        $replacements = [
            '{business_name}' => !empty($lead->business_name) ? $lead->business_name : 'your business',
            '{contact_person}' => !empty($lead->contact_person) ? $lead->contact_person : 'there',
            '{email}' => $lead->email ?? '',
            '{phone}' => $lead->phone ?? '',
            '{website}' => $lead->website ?? '',
            '{address}' => $lead->address ?? '',
            '{city}' => $lead->city ?? '',
            '{country}' => $lead->country ?? '',
        ];
        return str_replace(array_keys($replacements), array_values($replacements), $text);
    }

    public function sendOutreach(Request $request)
    {
        $data = $request->validate([
            'lead_id' => 'required|exists:seo_leads,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $lead = SeoLead::findOrFail($data['lead_id']);
        if (empty($lead->email)) {
            return response()->json(['success' => false, 'error' => 'Lead has no email address']);
        }

        $email = trim($lead->email);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $lead->update(['status' => 'lost', 'notes' => ($lead->notes ? $lead->notes . ' | ' : '') . 'Invalid email format']);
            return response()->json(['success' => false, 'error' => 'Invalid email format: ' . $email]);
        }

        $domain = substr(strrchr($email, "@"), 1);
        $hasMx = checkdnsrr($domain, 'MX');
        $hasA = checkdnsrr($domain, 'A');
        $dnsWarning = !$hasMx && !$hasA;

        $personalizedMessage = $this->replacePlaceholders($data['message'], $lead);

        try {
            Mail::to($email)->send(new LeadOutreachMail($lead, $data['subject'], $personalizedMessage));

            SeoLeadOutreach::create([
                'lead_id' => $lead->id,
                'outreach_type' => 'email',
                'message_template' => $data['message'],
                'sent_at' => now(),
            ]);

            $noteSuffix = $dnsWarning ? ' | DNS warning: no MX/A records for ' . $domain : '';
            $lead->update(['status' => 'contacted', 'notes' => ($lead->notes ? $lead->notes . $noteSuffix : ltrim($noteSuffix, ' | '))]);

            return response()->json(['success' => true, 'message' => "Email sent to {$email}" . ($dnsWarning ? ' (DNS warning)' : '')]);
        } catch (\Exception $e) {
            $msg = $e->getMessage();
            if (strpos($msg, '550') !== false || strpos($msg, 'does not exist') !== false || strpos($msg, 'mailbox not found') !== false || strpos($msg, 'user not found') !== false || strpos($msg, 'invalid recipient') !== false) {
                $lead->update(['status' => 'lost', 'notes' => ($lead->notes ? $lead->notes . ' | ' : '') . 'Bounced: ' . $msg]);
                return response()->json(['success' => false, 'error' => 'Email bounced (mailbox does not exist): ' . $email]);
            }
            return response()->json(['success' => false, 'error' => $msg]);
        }
    }

    public function checkEmails(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return response()->json(['success' => false, 'error' => 'No IDs provided']);
        }

        $withEmail = SeoLead::whereIn('id', $ids)->whereNotNull('email')->pluck('id')->toArray();
        $withoutEmail = count($ids) - count($withEmail);

        return response()->json([
            'success' => true,
            'with_email' => count($withEmail),
            'without_email' => $withoutEmail,
            'valid_ids' => $withEmail,
        ]);
    }

    public function checkWhatsapp(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return response()->json(['success' => false, 'error' => 'No IDs provided']);
        }

        $withWhatsapp = SeoLead::whereIn('id', $ids)
            ->whereNotNull('whatsapp_phone')
            ->where('whatsapp_phone', '!=', '')
            ->pluck('id')
            ->toArray();

        $withoutWhatsapp = count($ids) - count($withWhatsapp);

        return response()->json([
            'success' => true,
            'with_whatsapp' => count($withWhatsapp),
            'without_whatsapp' => $withoutWhatsapp,
            'valid_ids' => $withWhatsapp,
        ]);
    }

    public function bulkSendWhatsApp(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:seo_leads,id',
            'message' => 'required|string|max:4096',
        ]);

        $isSingle = count($data['ids']) === 1;

        $leads = SeoLead::whereIn('id', $data['ids'])->get();

        $filtered = $leads->filter(function ($lead) use ($isSingle) {
            $hasWhatsapp = !is_null($lead->whatsapp_phone) && $lead->whatsapp_phone !== '';
            if ($isSingle) {
                return $hasWhatsapp || !is_null($lead->phone);
            }
            return $hasWhatsapp;
        });

        if ($filtered->isEmpty()) {
            return response()->json(['success' => false, 'error' => 'None of the selected leads have a WhatsApp number']);
        }

        // Load WhatsApp Cloud API credentials (Meta permanent solution)
        $settings = DB::table('settings')->pluck('value', 'key')->toArray();
        $cloudToken = $settings['whatsapp_cloud_token'] ?? '';
        $cloudPhoneId = $settings['whatsapp_cloud_phone_id'] ?? '';
        if (!empty($cloudToken)) {
            try { $cloudToken = decrypt($cloudToken); } catch (\Exception $e) {}
        }
        $cloud = new \App\Services\WhatsAppCloudService($cloudToken, $cloudPhoneId);

        $sent = 0;
        $errors = [];

        foreach ($filtered as $lead) {
            try {
                $phone = $lead->whatsapp_phone ?: $lead->phone;
                $personalized = $this->replacePlaceholders($data['message'], $lead);

                $whatsappSent = false;
                if ($cloud->isConfigured()) {
                    try {
                        $whatsappSent = $cloud->sendMessage(ltrim($phone, '+'), $personalized);
                    } catch (\Exception $e) {
                        Log::error('WhatsApp Cloud API exception: ' . $e->getMessage());
                    }
                }

                SeoLeadOutreach::create([
                    'lead_id' => $lead->id,
                    'outreach_type' => 'whatsapp',
                    'message_template' => $personalized,
                    'sent_at' => now(),
                    'notes' => $whatsappSent
                        ? 'Sent via WhatsApp Cloud API'
                        : ($cloud->isConfigured() ? 'WhatsApp Cloud API send failed' : 'Cloud API not configured'),
                ]);
                $sent++;

                Log::info("[WhatsApp] To: {$phone} | Lead: {$lead->business_name} | Sent: " . ($whatsappSent ? 'yes' : 'no') . " | Message: {$personalized}");
            } catch (\Exception $e) {
                $errors[] = "{$lead->business_name}: {$e->getMessage()}";
            }
        }

        $msg = "WhatsApp sent to {$sent} lead(s)";
        if ($cloud->isConfigured()) {
            $msg .= " via WhatsApp Cloud API";
        } else {
            $msg .= " (logged only — Cloud API not configured)";
        }
        if (!empty($errors)) {
            $msg .= '. Errors: ' . implode('; ', array_slice($errors, 0, 3));
        }

        return response()->json([
            'success' => $sent > 0,
            'message' => $msg,
            'sent' => $sent,
            'errors' => $errors,
        ]);
    }

    public function generateWhatsAppDraft(Request $request)
    {
        $data = $request->validate([
            'lead_id' => 'required|exists:seo_leads,id',
            'language' => 'nullable|string|in:en,ar',
        ]);

        $lead = SeoLead::findOrFail($data['lead_id']);
        $ai = new AiContentService();
        $language = $data['language'] === 'ar' ? 'Arabic' : 'English';

        $prompt = "Write a short professional WhatsApp message in {$language} for contacting a business lead.";
        $prompt .= " Use the lead details to personalize the message. Business name: {$lead->business_name}.";
        $prompt .= $lead->contact_person ? " Contact person: {$lead->contact_person}." : '';
        $prompt .= $lead->website ? " Website: {$lead->website}." : '';
        $prompt .= $lead->email ? " Email: {$lead->email}." : '';
        $prompt .= $lead->phone ? " Phone: {$lead->phone}." : '';
        $prompt .= " Keep it friendly, concise, and end with a call to action asking for a brief call or WhatsApp reply.";

        $result = $ai->generate($prompt, '', 150);
        return response()->json([ 'success' => $result['success'] ?? false, 'message' => $result['content'] ?? '', 'error' => $result['error'] ?? null ]);
    }

    public function generateEmailDraft(Request $request)
    {
        $data = $request->validate([
            'lead_id' => 'required|exists:seo_leads,id',
            'language' => 'nullable|string|in:en,ar',
        ]);

        $lead = SeoLead::findOrFail($data['lead_id']);
        $ai = new AiContentService();
        $language = $data['language'] === 'ar' ? 'Arabic' : 'English';

        $prompt = "Write a professional business outreach email in {$language} to a lead.";
        $prompt .= " Personalize it with the following lead details: Business name: {$lead->business_name}.";
        $prompt .= $lead->contact_person ? " Contact person: {$lead->contact_person}." : '';
        $prompt .= $lead->website ? " Website: {$lead->website}." : '';
        $prompt .= $lead->email ? " Email: {$lead->email}." : '';
        $prompt .= $lead->phone ? " Phone: {$lead->phone}." : '';
        $prompt .= " Mention our digital marketing, SEO, web design and WhatsApp outreach capabilities. Keep it under 250 words and include a direct call to action.";

        $result = $ai->generate($prompt, '', 250);
        return response()->json([ 'success' => $result['success'] ?? false, 'message' => $result['content'] ?? '', 'error' => $result['error'] ?? null ]);
    }

    public function importWhatsappGroup(Request $request)
    {
        $request->validate([
            'group_name' => 'required|string|max:255',
            'contacts' => 'required|string',
        ]);

        $contacts = preg_split('/[\r\n,;]+/', trim($request->input('contacts')));
        $inserted = 0;
        $errors = [];
        $sample = [];
        foreach ($contacts as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            if (!preg_match('/(\+?\d[\d\s\-\(\)]{7,})/', $line, $m)) {
                $errors[] = "Invalid phone: {$line}";
                continue;
            }
            $phone = preg_replace('/[^\d+]/', '', $m[1]);
            if (SeoLead::where('whatsapp_phone', $phone)->exists() || SeoLead::where('phone', $phone)->exists()) {
                continue;
            }
            try {
                SeoLead::create([
                    'business_name' => $request->input('group_name'),
                    'whatsapp_phone' => $phone,
                    'phone' => $phone,
                    'source' => 'whatsapp_group_import',
                    'lead_type' => 'unknown',
                    'status' => 'new',
                    'lead_score' => 50,
                ]);
                $inserted++;
                if (count($sample) < 10) $sample[] = $phone;
            } catch (\Exception $e) {
                $errors[] = "{$phone}: {$e->getMessage()}";
            }
        }

        // record import history
        try {
            $history = WhatsAppImportHistory::create([
                'group_name' => $request->input('group_name'),
                'filename' => null,
                'importer_id' => auth()->id() ?? null,
                'imported_count' => $inserted,
                'skipped_count' => max(0, count($contacts) - $inserted),
                'sample_rows' => $sample,
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to record WhatsApp import history: ' . $e->getMessage());
        }

        return response()->json([ 'success' => $inserted > 0, 'imported' => $inserted, 'errors' => $errors ]);
    }

    public function whatsappImportHistory(Request $request)
    {
        $query = WhatsAppImportHistory::query()->orderBy('created_at', 'desc');
        $histories = $query->paginate(20);
        return view('admin.lead-gen.whatsapp-imports', compact('histories'));
    }

    public function exportCsv(Request $request)
    {
        $query = SeoLead::with('leadCategory');

        if ($request->filled('source')) { $query->where('source', $request->source); }
        if ($request->filled('status')) { $query->where('status', $request->status); }
        if ($request->filled('category_id')) { $query->where('category_id', $request->category_id); }
        if ($request->filled('lead_type')) { $query->where('lead_type', $request->lead_type); }
        if ($request->filled('country')) { $query->where('country', 'like', "%{$request->country}%"); }
        if ($request->filled('phone')) { $query->where('phone', 'like', "%{$request->phone}%"); }
        if ($request->filled('website')) { $query->where('website', 'like', "%{$request->website}%"); }
        if ($request->filled('whatsapp_phone')) { $query->where('whatsapp_phone', 'like', "%{$request->whatsapp_phone}%"); }
        if ($request->boolean('has_email')) { $query->whereNotNull('email')->where('email', '!=', ''); }
        if ($request->boolean('has_phone')) { $query->whereNotNull('phone')->where('phone', '!=', ''); }
        if ($request->boolean('has_website')) { $query->whereNotNull('website')->where('website', '!=', ''); }
        if ($request->boolean('has_whatsapp')) { $query->whereNotNull('whatsapp_phone')->where('whatsapp_phone', '!=', ''); }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('business_name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('whatsapp_phone', 'like', "%{$s}%")
                  ->orWhere('website', 'like', "%{$s}%")
                  ->orWhere('address', 'like', "%{$s}%");
            });
        }

        $leads = $query->latest()->get();

        $columns = [
            'Business Name', 'Contact Person', 'Email', 'Phone', 'WhatsApp Phone',
            'Website', 'Address', 'City', 'Country', 'Source', 'Category',
            'Lead Type', 'Status', 'Score', 'Rating', 'Reviews',
            'Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter',
            'Followers', 'Engagement',
        ];

        $callback = function () use ($leads, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($leads as $lead) {
                fputcsv($file, [
                    $lead->business_name,
                    $lead->contact_person,
                    $lead->email,
                    $lead->phone,
                    $lead->whatsapp_phone,
                    $lead->website,
                    $lead->address,
                    $lead->city,
                    $lead->country,
                    $lead->source,
                    $lead->leadCategory?->category_name,
                    $lead->lead_type,
                    $lead->status,
                    $lead->lead_score,
                    $lead->rating,
                    $lead->reviews_count,
                    $lead->social_facebook,
                    $lead->social_instagram,
                    $lead->social_tiktok,
                    $lead->social_youtube,
                    $lead->social_linkedin,
                    $lead->social_twitter,
                    $lead->followers_count,
                    $lead->engagement_count,
                ]);
            }

            fclose($file);
        };

        $filename = 'leads_export_' . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv; charset=utf-8',
        ]);
    }

    public function exportSelectedCsv(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return redirect()->back()->with('error', 'No leads selected for export');
        }

        $leads = SeoLead::with('leadCategory')->whereIn('id', $ids)->latest()->get();

        $columns = [
            'Business Name', 'Contact Person', 'Email', 'Phone', 'WhatsApp Phone',
            'Website', 'Address', 'City', 'Country', 'Source', 'Category',
            'Lead Type', 'Status', 'Score', 'Rating', 'Reviews',
            'Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter',
            'Followers', 'Engagement',
        ];

        $callback = function () use ($leads, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($leads as $lead) {
                fputcsv($file, [
                    $lead->business_name,
                    $lead->contact_person,
                    $lead->email,
                    $lead->phone,
                    $lead->whatsapp_phone,
                    $lead->website,
                    $lead->address,
                    $lead->city,
                    $lead->country,
                    $lead->source,
                    $lead->leadCategory?->category_name,
                    $lead->lead_type,
                    $lead->status,
                    $lead->lead_score,
                    $lead->rating,
                    $lead->reviews_count,
                    $lead->social_facebook,
                    $lead->social_instagram,
                    $lead->social_tiktok,
                    $lead->social_youtube,
                    $lead->social_linkedin,
                    $lead->social_twitter,
                    $lead->followers_count,
                    $lead->engagement_count,
                ]);
            }

            fclose($file);
        };

        $filename = 'leads_selected_' . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv; charset=utf-8',
        ]);
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $path = $request->file('csv_file')->getRealPath();
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);

        if (!$header) {
            fclose($handle);
            return redirect()->route('admin.lead-gen.leads')->with('success', 'Invalid CSV file');
        }

        $header = array_map('trim', $header);
        $headerMap = [];
        foreach ($header as $i => $col) {
            $key = strtolower(str_replace([' ', '-', '_'], '', $col));
            $headerMap[$key] = $i;
        }

        $imported = 0;
        $errors = [];
        $categoryNames = SeoLeadCategory::pluck('id', 'category_name')->toArray();

        while (($row = fgetcsv($handle)) !== false) {
            $data = [];
            foreach ($headerMap as $key => $i) {
                $data[$key] = $row[$i] ?? null;
            }

            $businessName = $data['businessname'] ?? $data['name'] ?? null;
            if (!$businessName) continue;

            $email = $data['email'] ?? null;
            if ($email) {
                $existing = SeoLead::where('email', $email)->first();
                if ($existing) continue;
            }

            $phone = $data['phone'] ?? null;
            $whatsapp = $data['whatsappphone'] ?? $data['whatsapp'] ?? null;
            $website = $data['website'] ?? null;

            // Map website-like keys
            if ($website) {
                if (!strpos($website, 'http') === 0) {
                    $website = 'https://' . $website;
                }
            }

            $source = $data['source'] ?? 'csv_import';
            $leadType = $data['leadtype'] ?? $data['type'] ?? 'unknown';
            if (!in_array($leadType, ['provider', 'customer', 'unknown'])) $leadType = 'unknown';
            $status = $data['status'] ?? 'new';
            if (!in_array($status, ['new', 'contacted', 'qualified', 'converted', 'lost'])) $status = 'new';
            $leadScore = isset($data['score']) ? (int)$data['score'] : null;

            $catName = $data['category'] ?? null;
            $categoryId = $catName && isset($categoryNames[$catName]) ? $categoryNames[$catName] : null;

            try {
                SeoLead::create([
                    'business_name' => $businessName,
                    'contact_person' => $data['contactperson'] ?? $data['contact'] ?? null,
                    'email' => $email,
                    'phone' => $phone,
                    'whatsapp_phone' => $whatsapp,
                    'website' => $website,
                    'address' => $data['address'] ?? null,
                    'city' => $data['city'] ?? null,
                    'country' => $data['country'] ?? null,
                    'source' => $source,
                    'lead_type' => $leadType,
                    'status' => $status,
                    'lead_score' => $leadScore,
                    'rating' => isset($data['rating']) ? (float)$data['rating'] : null,
                    'reviews_count' => isset($data['reviews']) ? (int)$data['reviews'] : null,
                    'social_facebook' => $data['facebook'] ?? null,
                    'social_instagram' => $data['instagram'] ?? null,
                    'social_tiktok' => $data['tiktok'] ?? null,
                    'social_youtube' => $data['youtube'] ?? null,
                    'social_linkedin' => $data['linkedin'] ?? null,
                    'social_twitter' => $data['twitter'] ?? null,
                    'followers_count' => isset($data['followers']) ? (int)$data['followers'] : null,
                    'engagement_count' => isset($data['engagement']) ? (int)$data['engagement'] : null,
                    'category_id' => $categoryId,
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "{$businessName}: {$e->getMessage()}";
            }
        }

        fclose($handle);

        $msg = "Imported {$imported} leads from CSV";
        if (!empty($errors)) {
            $msg .= '. Errors: ' . implode('; ', array_slice($errors, 0, 5));
        }

        return redirect()->route('admin.lead-gen.leads')->with('success', $msg);
    }

    public function bulkSendOutreach(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:seo_leads,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $leads = SeoLead::whereIn('id', $data['ids'])->whereNotNull('email')->get();

        if ($leads->isEmpty()) {
            return response()->json(['success' => false, 'error' => 'None of the selected leads have an email address']);
        }

        $sent = 0;
        $skipped = 0;
        $skippedLeads = [];
        $errors = [];

        foreach ($leads as $lead) {
            $email = trim($lead->email);

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $lead->update(['status' => 'lost', 'notes' => ($lead->notes ? $lead->notes . ' | ' : '') . 'Invalid email format: ' . $email]);
                $skipped++;
                $skippedLeads[] = "{$lead->business_name} (invalid format)";
                continue;
            }

            $domain = substr(strrchr($email, "@"), 1);
            $hasMx = checkdnsrr($domain, 'MX');
            $hasA = checkdnsrr($domain, 'A');
            $dnsWarning = !$hasMx && !$hasA;

            try {
                $personalizedMessage = $this->replacePlaceholders($data['message'], $lead);

                Mail::to($email)->send(new LeadOutreachMail($lead, $data['subject'], $personalizedMessage));

                SeoLeadOutreach::create([
                    'lead_id' => $lead->id,
                    'outreach_type' => 'email',
                    'message_template' => $data['message'],
                    'sent_at' => now(),
                ]);

                $noteSuffix = $dnsWarning ? ' | DNS warning: no MX/A records for ' . $domain : '';
                $lead->update(['status' => 'contacted', 'notes' => ($lead->notes ? $lead->notes . $noteSuffix : ltrim($noteSuffix, ' | '))]);
                $sent++;
            } catch (\Exception $e) {
                $msg = $e->getMessage();
                if (strpos($msg, '550') !== false || strpos($msg, 'does not exist') !== false || strpos($msg, 'mailbox not found') !== false || strpos($msg, 'user not found') !== false || strpos($msg, 'invalid recipient') !== false) {
                    $lead->update(['status' => 'lost', 'notes' => ($lead->notes ? $lead->notes . ' | ' : '') . 'Bounced: ' . $msg]);
                    $skipped++;
                    $skippedLeads[] = "{$lead->business_name} (bounced)";
                } else {
                    $errors[] = "{$lead->business_name}: {$msg}";
                }
            }
        }

        $msg = "Sent to {$sent} lead(s)";
        if ($skipped > 0) {
            $msg .= ". Skipped {$skipped} invalid/bounced (marked as lost)";
        }
        if (!empty($errors)) {
            $msg .= '. Errors: ' . implode('; ', array_slice($errors, 0, 3));
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'sent' => $sent,
            'skipped' => $skipped,
            'skipped_leads' => $skippedLeads,
            'errors' => $errors,
        ]);
    }

    public function sendCustomEmail(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            Mail::to($data['email'])->send(new \App\Mail\SimpleEmail($data['subject'], $data['message']));

            return response()->json(['success' => true, 'message' => "Email sent to {$data['email']}"]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function bulkUpdateStatus(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:seo_leads,id',
            'status' => 'required|string|in:new,contacted,qualified,converted,lost',
        ]);

        $updated = SeoLead::whereIn('id', $data['ids'])
            ->update(['status' => $data['status']]);

        return response()->json([
            'success' => true,
            'updated' => $updated,
            'message' => "Updated {$updated} leads to {$data['status']}"
        ]);
    }

    public function bulkDeleteLeads(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return response()->json(['success' => false, 'error' => 'No IDs provided']);
        }

        $deleted = SeoLead::whereIn('id', $ids)->delete();

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
            'message' => "Deleted {$deleted} leads"
        ]);
    }

    public function exportVcard(Request $request)
    {
        $query = SeoLead::with('leadCategory');

        if ($request->filled('source')) { $query->where('source', $request->source); }
        if ($request->filled('status')) { $query->where('status', $request->status); }
        if ($request->filled('category_id')) { $query->where('category_id', $request->category_id); }
        if ($request->filled('lead_type')) { $query->where('lead_type', $request->lead_type); }
        if ($request->filled('country')) { $query->where('country', 'like', "%{$request->country}%"); }
        if ($request->filled('phone')) { $query->where('phone', 'like', "%{$request->phone}%"); }
        if ($request->filled('website')) { $query->where('website', 'like', "%{$request->website}%"); }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('business_name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('website', 'like', "%{$s}%")
                  ->orWhere('address', 'like', "%{$s}%");
            });
        }

        $leads = $query->latest()->get();

        $vcard = '';
        foreach ($leads as $lead) {
            $fn = $this->vcardEscape($lead->business_name ?: 'Unknown Business');
            $vcard .= "BEGIN:VCARD\nVERSION:3.0\nFN:{$fn}\nORG:{$fn}\n";

            if ($lead->phone) {
                $vcard .= "TEL;TYPE=WORK,VOICE:{$lead->phone}\n";
            }
            if ($lead->email) {
                $vcard .= "EMAIL;TYPE=INTERNET:{$lead->email}\n";
            }
            if ($lead->website) {
                $vcard .= "URL:{$lead->website}\n";
            }
            if ($lead->address) {
                $esc = $this->vcardEscape($lead->address);
                $country = $this->vcardEscape($lead->country ?: '');
                $vcard .= "ADR;TYPE=WORK:;;{$esc};;;{$country}\n";
            }
            $note = [];
            if ($lead->rating) { $note[] = "Rating: {$lead->rating}/5 ({$lead->reviews_count} reviews)"; }
            if ($lead->lead_score) { $note[] = "Score: {$lead->lead_score}"; }
            if ($lead->source) { $note[] = "Source: {$lead->source}"; }
            if ($lead->lead_type) { $note[] = "Type: {$lead->lead_type}"; }
            if ($lead->status) { $note[] = "Status: {$lead->status}"; }
            $cat = $lead->leadCategory?->category_name;
            if ($cat) { $note[] = "Category: {$cat}"; }
            if (!empty($note)) {
                $vcard .= "NOTE:" . $this->vcardEscape(implode(' | ', $note)) . "\n";
            }

            $vcard .= "END:VCARD\n";
        }

        return response($vcard, 200, [
            'Content-Type' => 'text/vcard; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="leads_export_' . now()->format('Y-m-d') . '.vcf"',
        ]);
    }

    public function importVcard(Request $request)
    {
        $request->validate([
            'vcard_file' => 'required|file|mimes:vcf,vcard,txt|max:2048',
        ]);

        $content = file_get_contents($request->file('vcard_file')->getRealPath());
        $content = mb_convert_encoding($content, 'UTF-8', mb_detect_encoding($content, 'UTF-8, ISO-8859-1, Windows-1252', true) ?: 'UTF-8');

        $blocks = preg_split('/\n\s*BEGIN:VCARD\s*\n/i', "\n" . $content);
        $imported = 0;
        $errors = [];
        $categoryNames = SeoLeadCategory::pluck('id', 'category_name')->toArray();

        foreach ($blocks as $block) {
            $block = trim($block);
            if (empty($block)) { continue; }
            $endPos = stripos($block, 'END:VCARD');
            if ($endPos === false) { continue; }
            $block = substr($block, 0, $endPos + 9);

            $data = $this->parseVcard($block);
            if (empty($data['fn'])) { continue; }

            $existing = SeoLead::where('business_name', $data['fn'])->first();
            if ($existing) { continue; }

            $country = $data['country'] ?? null;
            $phone = $data['tel'] ?? null;
            $website = $data['url'] ?? null;
            $email = $data['email'] ?? null;
            $address = $data['adr'] ?? null;

            $noteText = $data['note'] ?? '';
            $leadScore = null;
            $leadType = 'unknown';
            $status = 'new';
            $source = 'vcard_import';
            $categoryId = null;

            if (preg_match('/Score:\s*(\d+)/i', $noteText, $m)) { $leadScore = (int)$m[1]; }
            if (preg_match('/Source:\s*(\S+)/i', $noteText, $m)) { $source = $m[1]; }
            if (preg_match('/Status:\s*(\w+)/i', $noteText, $m) && in_array($m[1], ['new','contacted','qualified','converted','lost'])) { $status = $m[1]; }
            if (preg_match('/Type:\s*(\w+)/i', $noteText, $m) && in_array($m[1], ['provider','customer','unknown'])) { $leadType = $m[1]; }
            if (preg_match('/Category:\s*(.+)/i', $noteText, $m)) {
                $catName = trim($m[1]);
                if (isset($categoryNames[$catName])) {
                    $categoryId = $categoryNames[$catName];
                }
            }

            try {
                SeoLead::create([
                    'business_name' => $data['fn'],
                    'phone' => $phone,
                    'email' => $email,
                    'website' => $website,
                    'address' => $address,
                    'country' => $country,
                    'lead_score' => $leadScore,
                    'lead_type' => $leadType,
                    'status' => $status,
                    'source' => $source,
                    'category_id' => $categoryId,
                    'notes' => !empty($noteText) ? json_encode(['import_note' => $noteText]) : null,
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "{$data['fn']}: {$e->getMessage()}";
            }
        }

        $msg = "Imported {$imported} leads";
        if (!empty($errors)) {
            $msg .= '. Errors: ' . implode('; ', array_slice($errors, 0, 5));
        }

        return redirect()->route('admin.lead-gen.leads')->with('success', $msg);
    }

    private function vcardEscape(string $value): string
    {
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $value);
        $value = str_replace(["\r\n", "\r"], "\n", $value);
        $value = str_replace("\n", '\\n', $value);
        $value = str_replace([',', ';', ':'], ['\\,', '\\;', '\\:'], $value);
        return trim($value);
    }

    private function parseVcard(string $block): array
    {
        $data = [];
        $lines = preg_split('/\r?\n/', $block);

        $folded = [];
        foreach ($lines as $line) {
            if (strlen($line) > 0 && ($line[0] === ' ' || $line[0] === "\t")) {
                if (!empty($folded)) {
                    $folded[count($folded) - 1] .= substr($line, 1);
                }
            } else {
                $folded[] = $line;
            }
        }

        foreach ($folded as $line) {
            if (empty($line)) { continue; }
            $line = trim($line);
            if (stripos($line, 'BEGIN:') === 0 || stripos($line, 'END:') === 0 || stripos($line, 'VERSION:') === 0) {
                continue;
            }

            if (preg_match('/^FN[^:]*:(.*)$/i', $line, $m)) { $data['fn'] = trim($m[1]); }
            elseif (preg_match('/^ORG[^:]*:(.*)$/i', $line, $m) && empty($data['fn'])) { $data['fn'] = trim($m[1]); }
            elseif (preg_match('/^TEL[^:]*:(.*)$/i', $line, $m)) { $data['tel'] = trim($m[1]); }
            elseif (preg_match('/^EMAIL[^:]*:(.*)$/i', $line, $m)) { $data['email'] = trim($m[1]); }
            elseif (preg_match('/^URL[^:]*:(.*)$/i', $line, $m)) { $data['url'] = trim($m[1]); }
            elseif (preg_match('/^ADR[^:]*:(.*)$/i', $line, $m)) {
                $parts = explode(';', $m[1]);
                $adrParts = [];
                if (!empty($parts[2])) { $adrParts[] = trim($parts[2]); }
                if (!empty($parts[1])) { $adrParts[] = trim($parts[1]); }
                if (!empty($parts[3])) { $adrParts[] = trim($parts[3]); }
                $data['adr'] = implode(', ', $adrParts);
                if (!empty($parts[5]) && empty($data['country'])) { $data['country'] = trim($parts[5]); }
                if (!empty($parts[6]) && empty($data['country'])) { $data['country'] = trim($parts[6]); }
            }
            elseif (preg_match('/^NOTE[^:]*:(.*)$/i', $line, $m)) { $data['note'] = trim($m[1]); }
        }

        return $data;
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return response()->json(['success' => false, 'error' => 'No IDs provided']);
        }
        SeoLeadCategory::whereIn('id', $ids)->delete();
        return response()->json(['success' => true]);
    }
}
