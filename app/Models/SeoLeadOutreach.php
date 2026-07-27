<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoLeadOutreach extends Model
{
    protected $table = 'seo_lead_outreach';

    protected $fillable = [
        'lead_id', 'outreach_type', 'message_template',
        'sent_at', 'response_received', 'notes',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'response_received' => 'boolean',
    ];

    public function lead()
    {
        return $this->belongsTo(SeoLead::class);
    }
}
