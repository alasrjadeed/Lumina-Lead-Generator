<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoLead extends Model
{
    protected $fillable = [
        'source', 'business_name', 'contact_person', 'email', 'phone', 'whatsapp_phone',
        'website', 'address', 'city', 'country', 'category',
        'social_instagram', 'social_facebook', 'social_tiktok', 'social_youtube',
        'social_linkedin', 'social_twitter', 'platform_profile_name',
        'followers_count', 'engagement_count', 'last_post_content',
        'rating', 'reviews_count',
        'lead_score', 'lead_type', 'status', 'notes', 'category_id',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'reviews_count' => 'integer',
        'lead_score' => 'integer',
    ];

    public function isProvider(): bool { return $this->lead_type === 'provider'; }
    public function isCustomer(): bool { return $this->lead_type === 'customer'; }
    public function scopeProviders($q) { return $q->where('lead_type', 'provider'); }
    public function scopeCustomers($q) { return $q->where('lead_type', 'customer'); }
    public function scopeUnknown($q) { return $q->where('lead_type', 'unknown'); }

    public function leadCategory()
    {
        return $this->belongsTo(SeoLeadCategory::class, 'category_id');
    }

    public function outreach()
    {
        return $this->hasMany(SeoLeadOutreach::class);
    }

    public function scopeNew($q) { return $q->where('status', 'new'); }
    public function scopeContacted($q) { return $q->where('status', 'contacted'); }
    public function scopeQualified($q) { return $q->where('status', 'qualified'); }
    public function scopeConverted($q) { return $q->where('status', 'converted'); }
    public function scopeLost($q) { return $q->where('status', 'lost'); }
    public function scopeHot($q) { return $q->where('lead_score', '>=', 70); }
    public function scopeWarm($q) { return $q->whereBetween('lead_score', [30, 69]); }
    public function scopeCold($q) { return $q->where('lead_score', '<', 30); }
    public function scopeFromSource($q, $source) { return $q->where('source', $source); }
}
