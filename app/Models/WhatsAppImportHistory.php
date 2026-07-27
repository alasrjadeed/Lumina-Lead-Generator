<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppImportHistory extends Model
{
    protected $table = 'whatsapp_import_histories';

    protected $fillable = [
        'group_name',
        'filename',
        'importer_id',
        'imported_count',
        'skipped_count',
        'sample_rows',
        'errors',
    ];

    protected $casts = [
        'sample_rows' => 'array',
        'errors' => 'array',
    ];

    public function importer()
    {
        return $this->belongsTo(\App\Models\User::class, 'importer_id');
    }
}
