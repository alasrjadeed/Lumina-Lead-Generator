<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Auth Routes
Route::get('/login', [\App\Http\Controllers\Auth\AuthController::class, 'showLogin'])->name('admin.login');
Route::post('/login', [\App\Http\Controllers\Auth\AuthController::class, 'login']);
Route::post('/logout', [\App\Http\Controllers\Auth\AuthController::class, 'logout'])->name('admin.logout');

Route::get('/', fn() => redirect('/admin/lead-gen/dashboard'));

Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    // Settings
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('admin.settings');
    Route::put('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('admin.settings.update');

    // Dashboard
    Route::get('/lead-gen/dashboard', [\App\Http\Controllers\Admin\LeadGenController::class, 'dashboard'])->name('admin.lead-gen.dashboard');

    // Categories
    Route::get('/lead-gen/categories', [\App\Http\Controllers\Admin\LeadGenController::class, 'categories'])->name('admin.lead-gen.categories');
    Route::post('/lead-gen/categories', [\App\Http\Controllers\Admin\LeadGenController::class, 'storeCategory'])->name('admin.lead-gen.categories.store');
    Route::put('/lead-gen/categories/{id}', [\App\Http\Controllers\Admin\LeadGenController::class, 'updateCategory'])->name('admin.lead-gen.categories.update');
    Route::delete('/lead-gen/categories/{id}', [\App\Http\Controllers\Admin\LeadGenController::class, 'deleteCategory'])->name('admin.lead-gen.categories.delete');
    Route::post('/lead-gen/categories/{id}/toggle', [\App\Http\Controllers\Admin\LeadGenController::class, 'toggleCategory'])->name('admin.lead-gen.categories.toggle');

    // Leads
    Route::get('/lead-gen/leads', [\App\Http\Controllers\Admin\LeadGenController::class, 'leads'])->name('admin.lead-gen.leads');
    Route::get('/lead-gen/leads/create', [\App\Http\Controllers\Admin\LeadGenController::class, 'createLead'])->name('admin.lead-gen.leads.create');
    Route::post('/lead-gen/leads', [\App\Http\Controllers\Admin\LeadGenController::class, 'storeLead'])->name('admin.lead-gen.leads.store');
    Route::get('/lead-gen/leads/{id}/edit', [\App\Http\Controllers\Admin\LeadGenController::class, 'editLead'])->name('admin.lead-gen.leads.edit');
    Route::put('/lead-gen/leads/{id}', [\App\Http\Controllers\Admin\LeadGenController::class, 'updateLead'])->name('admin.lead-gen.leads.update');
    Route::delete('/lead-gen/leads/{id}', [\App\Http\Controllers\Admin\LeadGenController::class, 'destroyLead'])->name('admin.lead-gen.leads.delete');
    Route::delete('/lead-gen/leads/{id}/destroy', [\App\Http\Controllers\Admin\LeadGenController::class, 'destroyLead'])->name('admin.lead-gen.leads.destroy');
    Route::get('/lead-gen/leads/{id}', [\App\Http\Controllers\Admin\LeadGenController::class, 'show'])->name('admin.lead-gen.leads.show');

    // Generation
    Route::post('/lead-gen/generate', [\App\Http\Controllers\Admin\LeadGenController::class, 'generate'])->name('admin.lead-gen.generate');
    Route::post('/lead-gen/quick-generate', [\App\Http\Controllers\Admin\LeadGenController::class, 'quickGenerate'])->name('admin.lead-gen.quick-generate');
    Route::post('/lead-gen/bulk-generate', [\App\Http\Controllers\Admin\LeadGenController::class, 'bulkGenerate'])->name('admin.lead-gen.bulk-generate');

    // Outreach (view uses these names)
    Route::post('/lead-gen/outreach/send', [\App\Http\Controllers\Admin\LeadGenController::class, 'sendOutreach'])->name('admin.lead-gen.outreach.send');
    Route::post('/lead-gen/send-outreach', [\App\Http\Controllers\Admin\LeadGenController::class, 'sendOutreach'])->name('admin.lead-gen.send-outreach');
    Route::post('/lead-gen/send-custom-email', [\App\Http\Controllers\Admin\LeadGenController::class, 'sendOutreach'])->name('admin.lead-gen.send-custom-email');
    Route::post('/lead-gen/outreach/bulk-whatsapp', [\App\Http\Controllers\Admin\LeadGenController::class, 'bulkSendWhatsApp'])->name('admin.lead-gen.outreach.bulk-whatsapp');
    Route::post('/lead-gen/bulk-send-whatsapp', [\App\Http\Controllers\Admin\LeadGenController::class, 'bulkSendWhatsApp'])->name('admin.lead-gen.bulk-send-whatsapp');
    Route::post('/lead-gen/bulk-send-outreach', [\App\Http\Controllers\Admin\LeadGenController::class, 'bulkSendOutreach'])->name('admin.lead-gen.bulk-send-outreach');
    Route::post('/lead-gen/outreach/draft-whatsapp', [\App\Http\Controllers\Admin\LeadGenController::class, 'generateWhatsAppDraft'])->name('admin.lead-gen.outreach.draft-whatsapp');
    Route::post('/lead-gen/generate-whatsapp-draft', [\App\Http\Controllers\Admin\LeadGenController::class, 'generateWhatsAppDraft'])->name('admin.lead-gen.generate-whatsapp-draft');
    Route::post('/lead-gen/outreach/draft-email', [\App\Http\Controllers\Admin\LeadGenController::class, 'generateEmailDraft'])->name('admin.lead-gen.outreach.draft-email');
    Route::post('/lead-gen/generate-email-draft', [\App\Http\Controllers\Admin\LeadGenController::class, 'generateEmailDraft'])->name('admin.lead-gen.generate-email-draft');

    // WhatsApp Import
    Route::post('/lead-gen/whatsapp/import', [\App\Http\Controllers\Admin\LeadGenController::class, 'importWhatsappGroup'])->name('admin.lead-gen.whatsapp.import');
    Route::post('/lead-gen/import-whatsapp-group', [\App\Http\Controllers\Admin\LeadGenController::class, 'importWhatsappGroup'])->name('admin.lead-gen.import-whatsapp-group');
    Route::get('/lead-gen/whatsapp/history', [\App\Http\Controllers\Admin\LeadGenController::class, 'whatsappImportHistory'])->name('admin.lead-gen.whatsapp.history');
    Route::get('/lead-gen/whatsapp/imports', [\App\Http\Controllers\Admin\LeadGenController::class, 'whatsappImportHistory'])->name('admin.lead-gen.whatsapp-imports');

    // Export/Import
    Route::get('/lead-gen/export/csv', [\App\Http\Controllers\Admin\LeadGenController::class, 'exportCsv'])->name('admin.lead-gen.export.csv');
    Route::get('/lead-gen/export-csv', [\App\Http\Controllers\Admin\LeadGenController::class, 'exportCsv'])->name('admin.lead-gen.export-csv');
    Route::get('/lead-gen/export-vcard', [\App\Http\Controllers\Admin\LeadGenController::class, 'exportVcard'])->name('admin.lead-gen.export-vcard');
    Route::get('/lead-gen/export-selected-csv', [\App\Http\Controllers\Admin\LeadGenController::class, 'exportSelectedCsv'])->name('admin.lead-gen.export-selected-csv');
    Route::post('/lead-gen/export/selected/csv', [\App\Http\Controllers\Admin\LeadGenController::class, 'exportSelectedCsv'])->name('admin.lead-gen.export.selected.csv');
    Route::post('/lead-gen/import/csv', [\App\Http\Controllers\Admin\LeadGenController::class, 'importCsv'])->name('admin.lead-gen.import.csv');
    Route::post('/lead-gen/import-csv', [\App\Http\Controllers\Admin\LeadGenController::class, 'importCsv'])->name('admin.lead-gen.import-csv');
    Route::post('/lead-gen/import-vcard', [\App\Http\Controllers\Admin\LeadGenController::class, 'importCsv'])->name('admin.lead-gen.import-vcard');

    // Generation status
    Route::get('/lead-gen/generation-status/{jobId}', [\App\Http\Controllers\Admin\LeadGenController::class, 'generationStatus'])->name('admin.lead-gen.generation-status');

    // Utilities (POST routes that receive lead_id in body, not URL)
    Route::post('/lead-gen/leads/{id}/enrich', [\App\Http\Controllers\Admin\LeadGenController::class, 'enrich'])->name('admin.lead-gen.leads.enrich');
    Route::post('/lead-gen/enrich', [\App\Http\Controllers\Admin\LeadGenController::class, 'enrich'])->name('admin.lead-gen.enrich');
    Route::post('/lead-gen/leads/{id}/status', [\App\Http\Controllers\Admin\LeadGenController::class, 'updateStatus'])->name('admin.lead-gen.leads.status');
    Route::post('/lead-gen/bulk-update-status', [\App\Http\Controllers\Admin\LeadGenController::class, 'bulkUpdateStatus'])->name('admin.lead-gen.bulk-update-status');
    Route::post('/lead-gen/bulk-delete-leads', [\App\Http\Controllers\Admin\LeadGenController::class, 'bulkDeleteLeads'])->name('admin.lead-gen.bulk-delete-leads');
    Route::post('/lead-gen/leads/{id}/whatsapp', [\App\Http\Controllers\Admin\LeadGenController::class, 'setWhatsapp'])->name('admin.lead-gen.leads.whatsapp');
    Route::post('/lead-gen/leads/{id}/toggle-type', [\App\Http\Controllers\Admin\LeadGenController::class, 'toggleType'])->name('admin.lead-gen.leads.toggle-type');
    Route::match(['get', 'post'], '/lead-gen/check-emails', [\App\Http\Controllers\Admin\LeadGenController::class, 'checkEmails'])->name('admin.lead-gen.check-emails');
    Route::match(['get', 'post'], '/lead-gen/check-whatsapp', [\App\Http\Controllers\Admin\LeadGenController::class, 'checkWhatsapp'])->name('admin.lead-gen.check-whatsapp');
});
