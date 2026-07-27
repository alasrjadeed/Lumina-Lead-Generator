<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoLeadCategory extends Model
{
    protected $fillable = [
        'category_name', 'keywords', 'location', 'platforms',
        'max_leads', 'priority', 'auto_enrich', 'min_score_threshold',
        'target_audience', 'notes', 'is_active',
    ];

    protected $casts = [
        'platforms' => 'array',
        'auto_enrich' => 'boolean',
        'is_active' => 'boolean',
        'max_leads' => 'integer',
        'priority' => 'integer',
        'min_score_threshold' => 'integer',
    ];

    public function leads()
    {
        return $this->hasMany(SeoLead::class, 'category_id');
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public function scopeByPriority($q)
    {
        return $q->orderBy('priority')->orderBy('created_at', 'desc');
    }
}
