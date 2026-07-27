@extends('admin.layout')

@section('content')
<div class="page-header d-flex justify-content-between align-items-center">
    <div>
        <h2><i class="fa-solid fa-{{ isset($lead) ? 'edit' : 'plus' }} me-2"></i> {{ isset($lead) ? 'Edit Lead' : 'New Lead' }}</h2>
        <p class="text-muted mb-0">{{ isset($lead) ? 'Update lead information' : 'Add a new lead manually' }}</p>
    </div>
    <a href="{{ route('admin.lead-gen.leads') }}" class="btn btn-outline-secondary">
        <i class="fa-solid fa-arrow-left me-1"></i> Back to Leads
    </a>
</div>

<form method="POST" action="{{ isset($lead) ? route('admin.lead-gen.leads.update', $lead->id) : route('admin.lead-gen.leads.store') }}">
    @csrf
    @if(isset($lead)) @method('POST') @endif

    <div class="row">
        <div class="col-md-8">
            <div class="card mb-4">
                <div class="card-header"><i class="fa-solid fa-building me-2"></i> Business Info</div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Business Name</label>
                            <input type="text" name="business_name" class="form-control" value="{{ old('business_name', $lead->business_name ?? '') }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Contact Person</label>
                            <input type="text" name="contact_person" class="form-control" value="{{ old('contact_person', $lead->contact_person ?? '') }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-control" value="{{ old('email', $lead->email ?? '') }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Phone</label>
                            <input type="text" name="phone" class="form-control" value="{{ old('phone', $lead->phone ?? '') }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">WhatsApp Phone</label>
                            <input type="text" name="whatsapp_phone" class="form-control" value="{{ old('whatsapp_phone', $lead->whatsapp_phone ?? '') }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Website</label>
                            <input type="url" name="website" class="form-control" value="{{ old('website', $lead->website ?? '') }}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Address</label>
                            <input type="text" name="address" class="form-control" value="{{ old('address', $lead->address ?? '') }}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">City</label>
                            <input type="text" name="city" class="form-control" value="{{ old('city', $lead->city ?? '') }}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Country</label>
                            <input type="text" name="country" class="form-control" value="{{ old('country', $lead->country ?? '') }}">
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header"><i class="fa-solid fa-note-sticky me-2"></i> Notes</div>
                <div class="card-body">
                    <textarea name="notes" class="form-control" rows="4">{{ old('notes', $lead->notes ?? '') }}</textarea>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card mb-4">
                <div class="card-header"><i class="fa-solid fa-gear me-2"></i> Settings</div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">Category</label>
                        <select name="category_id" class="form-select">
                            <option value="">None</option>
                            @foreach($categories as $cat)
                                <option value="{{ $cat->id }}" {{ old('category_id', $lead->category_id ?? '') == $cat->id ? 'selected' : '' }}>
                                    {{ $cat->category_name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-select">
                            <option value="new" {{ old('status', $lead->status ?? 'new') == 'new' ? 'selected' : '' }}>New</option>
                            <option value="contacted" {{ old('status', $lead->status ?? '') == 'contacted' ? 'selected' : '' }}>Contacted</option>
                            <option value="qualified" {{ old('status', $lead->status ?? '') == 'qualified' ? 'selected' : '' }}>Qualified</option>
                            <option value="converted" {{ old('status', $lead->status ?? '') == 'converted' ? 'selected' : '' }}>Converted</option>
                            <option value="lost" {{ old('status', $lead->status ?? '') == 'lost' ? 'selected' : '' }}>Lost</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Lead Type</label>
                        <select name="lead_type" class="form-select">
                            <option value="unknown" {{ old('lead_type', $lead->lead_type ?? 'unknown') == 'unknown' ? 'selected' : '' }}>Unknown</option>
                            <option value="provider" {{ old('lead_type', $lead->lead_type ?? '') == 'provider' ? 'selected' : '' }}>Provider</option>
                            <option value="customer" {{ old('lead_type', $lead->lead_type ?? '') == 'customer' ? 'selected' : '' }}>Customer</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Source</label>
                        <input type="text" name="source" class="form-control" value="{{ old('source', $lead->source ?? 'manual') }}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Rating (0-5)</label>
                        <input type="number" name="rating" class="form-control" step="0.1" min="0" max="5" value="{{ old('rating', $lead->rating ?? '') }}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Lead Score (0-100)</label>
                        <input type="number" name="lead_score" class="form-control" min="0" max="100" value="{{ old('lead_score', $lead->lead_score ?? '') }}">
                    </div>
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100">
                <i class="fa-solid fa-{{ isset($lead) ? 'save' : 'plus' }} me-1"></i>
                {{ isset($lead) ? 'Update Lead' : 'Create Lead' }}
            </button>
        </div>
    </div>
</form>
@endsection
