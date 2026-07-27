<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'source', 'service_interest',
        'score', 'status', 'notes', 'metadata', 'last_contacted_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'score' => 'float',
        'last_contacted_at' => 'datetime',
    ];

    public function scores()
    {
        return $this->hasMany(LeadScore::class);
    }

    public function conversations()
    {
        return $this->hasMany(LeadConversation::class);
    }

    public function followups()
    {
        return $this->hasMany(Followup::class);
    }

    public function whatsappMessages()
    {
        return $this->hasMany(WhatsAppMessage::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    public function scopeNew($q) { return $q->where('status', 'new'); }
    public function scopeContacted($q) { return $q->where('status', 'contacted'); }
    public function scopeQualified($q) { return $q->where('status', 'qualified'); }
    public function scopeConverted($q) { return $q->where('status', 'converted'); }
    public function scopeLost($q) { return $q->where('status', 'lost'); }
    public function scopeHot($q) { return $q->where('score', '>=', 70); }
    public function scopeWarm($q) { return $q->whereBetween('score', [30, 69]); }
    public function scopeCold($q) { return $q->where('score', '<', 30); }
}
