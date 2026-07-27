@extends('admin.layout')

@section('content')
<div class="page-header d-flex justify-content-between align-items-center">
    <div>
        <h2><i class="fa-solid fa-list me-2"></i> All Leads</h2>
        <p class="text-muted mb-0">{{ $leads->total() }} total leads</p>
    </div>
    <div class="d-flex gap-2">
        <div class="dropdown">
            <button class="btn btn-outline-success dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fa-solid fa-file-import me-1"></i> Import
            </button>
            <ul class="dropdown-menu">
                <li><button class="dropdown-item" id="importVcardBtn"><i class="fa-regular fa-address-card me-1"></i> Import vCard</button></li>
                <li><button class="dropdown-item" id="importCsvBtn"><i class="fa-solid fa-file-csv me-1"></i> Import CSV</button></li>
                <li><button class="dropdown-item" id="importWhatsappGroupBtn"><i class="fa-brands fa-whatsapp me-1"></i> Import WhatsApp Group</button></li>
                <li><a class="dropdown-item" href="{{ route('admin.lead-gen.whatsapp-imports') }}"><i class="fa-solid fa-list-check me-1"></i> WhatsApp Import History</a></li>
            </ul>
        </div>
        <div class="dropdown">
            <button class="btn btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fa-solid fa-file-export me-1"></i> Export
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="{{ route('admin.lead-gen.export-vcard', request()->query()) }}"><i class="fa-regular fa-address-card me-1"></i> Export vCard</a></li>
                <li><a class="dropdown-item" href="{{ route('admin.lead-gen.export-csv', request()->query()) }}"><i class="fa-solid fa-file-csv me-1"></i> Export CSV</a></li>
            </ul>
        </div>
        <a href="{{ route('admin.lead-gen.dashboard') }}" class="btn btn-outline-primary">
            <i class="fa-solid fa-gauge me-1"></i> Dashboard
        </a>
        <a href="{{ route('admin.lead-gen.leads.create') }}" class="btn btn-success">
            <i class="fa-solid fa-plus me-1"></i> Add Lead
        </a>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

{{-- Filters --}}
<div class="card mb-4">
    <div class="card-body">
        <form method="GET" action="{{ route('admin.lead-gen.leads') }}" class="row g-2 align-items-end">
            <div class="col-md-2">
                <label class="form-label">Source</label>
                <select name="source" class="form-select">
                    <option value="">All Sources</option>
                    @foreach($sourceOptions as $src)
                        <option value="{{ $src }}" {{ request('source') == $src ? 'selected' : '' }}>
                            {{ \Illuminate\Support\Str::title(str_replace('_', ' ', $src)) }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Status</label>
                <select name="status" class="form-select">
                    <option value="">All</option>
                    <option value="new" {{ request('status') == 'new' ? 'selected' : '' }}>New</option>
                    <option value="contacted" {{ request('status') == 'contacted' ? 'selected' : '' }}>Contacted</option>
                    <option value="qualified" {{ request('status') == 'qualified' ? 'selected' : '' }}>Qualified</option>
                    <option value="converted" {{ request('status') == 'converted' ? 'selected' : '' }}>Converted</option>
                    <option value="lost" {{ request('status') == 'lost' ? 'selected' : '' }}>Lost</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Lead Type</label>
                <select name="lead_type" class="form-select">
                    <option value="">All Types</option>
                    <option value="provider" {{ request('lead_type') == 'provider' ? 'selected' : '' }}>Provider</option>
                    <option value="customer" {{ request('lead_type') == 'customer' ? 'selected' : '' }}>Customer</option>
                    <option value="unknown" {{ request('lead_type') == 'unknown' ? 'selected' : '' }}>Unknown</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Category</label>
                <select name="category_id" class="form-select">
                    <option value="">All Categories</option>
                    @foreach($categories as $cat)
                        <option value="{{ $cat->id }}" {{ request('category_id') == $cat->id ? 'selected' : '' }}>
                            {{ $cat->category_name }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Country</label>
                <select name="country" class="form-select">
                    <option value="">All Countries</option>
                    @foreach($countryOptions as $c)
                        <option value="{{ $c }}" {{ request('country') == $c ? 'selected' : '' }}>{{ $c }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Phone</label>
                <input type="text" class="form-control" name="phone" placeholder="Phone number"
                       value="{{ request('phone') }}">
            </div>
            <div class="col-md-2">
                <label class="form-label">WhatsApp</label>
                <input type="text" class="form-control" name="whatsapp_phone" placeholder="WhatsApp number"
                       value="{{ request('whatsapp_phone') }}">
            </div>
            <div class="col-md-2">
                <label class="form-label">Website</label>
                <input type="text" class="form-control" name="website" placeholder="website.com"
                       value="{{ request('website') }}">
            </div>
            <div class="col-md-2">
                <label class="form-label d-block">&nbsp;</label>
                <div class="d-flex gap-3 flex-wrap">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" name="has_email" value="1" id="has_email" {{ request('has_email') ? 'checked' : '' }}>
                        <label class="form-check-label" for="has_email">Has Email</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" name="has_phone" value="1" id="has_phone" {{ request('has_phone') ? 'checked' : '' }}>
                        <label class="form-check-label" for="has_phone">Has Phone</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" name="has_website" value="1" id="has_website" {{ request('has_website') ? 'checked' : '' }}>
                        <label class="form-check-label" for="has_website">Has Website</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" name="has_whatsapp" value="1" id="has_whatsapp" {{ request('has_whatsapp') ? 'checked' : '' }}>
                        <label class="form-check-label" for="has_whatsapp">Has WhatsApp</label>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <label class="form-label">Search</label>
                <input type="text" class="form-control" name="search" placeholder="Name, email, address, WhatsApp..."
                       value="{{ request('search') }}">
            </div>
            <div class="col-md-4 d-flex gap-2">
                <button type="submit" class="btn btn-primary flex-fill"><i class="fa-solid fa-filter me-1"></i> Filter</button>
                <a href="{{ route('admin.lead-gen.leads') }}" class="btn btn-secondary"><i class="fa-solid fa-undo"></i> Reset</a>
            </div>
        </form>
    </div>
</div>

{{-- Leads Table --}}
<div class="card">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
<thead>
                     <tr>
                         <th class="text-center">
                             <input type="checkbox" id="select-all-leads" class="form-check-input">
                         </th>
                         <th>Business</th>
                         <th>Contact</th>
                         <th>Email</th>
                          <th>Phone</th>
                          <th>WhatsApp</th>
                          <th>Website</th>
                         <th>Country</th>
                         <th>Map</th>
                         <th>Rating</th>
                         <th>Score</th>
                         <th>Type</th>
                         <th>Status</th>
                         <th>Category</th>
                         <th>Actions</th>
                     </tr>
                 </thead>
                 <tbody>
                     @forelse($leads as $lead)
                         <tr>
                             <td class="text-center">
                                 <input type="checkbox" class="lead-select-checkbox" value="{{ $lead->id }}">
                             </td>
                             <td>
                                <div class="d-flex align-items-center gap-1 mb-1">
                                    @php
                                        $srcIcons = [
                                            'google_maps' => ['fa-map-pin','#34a853'],
                                            'google_reviews' => ['fa-star','#fbbc04'],
                                            'google_search' => ['fa-search','#4285f4'],
                                            'instagram' => ['fa-instagram','#e4405f'],
                                            'facebook' => ['fa-facebook','#1877f2'],
                                            'tiktok' => ['fa-tiktok','#000'],
                                            'youtube' => ['fa-youtube','#ff0000'],
                                            'twitter' => ['fa-x-twitter','#000'],
                                            'ecommerce' => ['fa-cart-shopping','#ff6d01'],
                                            'vcard_import' => ['fa-address-card','#6c757d'],
                                        ];
                                        $src = $lead->source ?? '';
                                        $icon = $srcIcons[$src] ?? ['fa-globe','#6c757d'];
                                    @endphp
                                    <i class="fa-brands {{ $icon[0] }}" style="color:{{ $icon[1] }}" title="{{ ucfirst(str_replace('_', ' ', $src)) }}"></i>
                                    <strong>{{ $lead->business_name ?: 'N/A' }}</strong>
                                </div>
                                <div>
                                    @if($lead->address)
                                        <small class="text-muted">{{ \Illuminate\Support\Str::limit($lead->address, 30) }}</small>
                                    @endif
                                </div>
                                @php
                                    $socials = [];
                                    if ($lead->social_facebook) $socials[] = ['fa-facebook','#1877f2',$lead->social_facebook];
                                    if ($lead->social_instagram) $socials[] = ['fa-instagram','#e4405f',$lead->social_instagram];
                                    if ($lead->social_tiktok) $socials[] = ['fa-tiktok','#000',$lead->social_tiktok];
                                    if ($lead->social_youtube) $socials[] = ['fa-youtube','#ff0000',$lead->social_youtube];
                                    if ($lead->social_twitter) $socials[] = ['fa-x-twitter','#000',$lead->social_twitter];
                                @endphp
                                @if(!empty($socials))
                                <div class="mt-1">
                                    @foreach($socials as $s)
                                        <a href="{{ $s[2] }}" target="_blank" class="me-1" style="color:{{ $s[1] }};font-size:13px;" title="{{ $s[2] }}">
                                            <i class="fa-brands {{ $s[0] }}"></i>
                                        </a>
                                    @endforeach
                                </div>
                                @endif
                                @if($lead->followers_count > 0 || $lead->engagement_count > 0)
                                <div><small class="text-muted" style="font-size:10px;">
                                    @if($lead->followers_count > 0)<span title="Followers">{{ number_format($lead->followers_count) }} followers</span>@endif
                                    @if($lead->engagement_count > 0) <span title="Engagement" class="ms-1">{{ number_format($lead->engagement_count) }} eng.</span>@endif
                                </small></div>
                                @endif
                            </td>
                            <td>
                                @if($lead->contact_person)
                                    <small>{{ $lead->contact_person }}</small>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                            <td>
                                @if($lead->email)
                                    <small><a href="mailto:{{ $lead->email }}" class="text-decoration-none">{{ $lead->email }}</a></small>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                            <td>
                                @if($lead->phone)
                                    <small>{{ $lead->phone }}</small>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                            <td>
                                @if($lead->whatsapp_phone)
                                    <small><i class="fa-brands fa-whatsapp text-success me-1"></i>{{ $lead->whatsapp_phone }}</small>
                                @elseif($lead->phone)
                                    <small class="text-muted" style="cursor:pointer;" onclick="copyToWhatsapp(this, '{{ $lead->phone }}')" title="Click to use as WhatsApp number">{{ $lead->phone }} <i class="fa-regular fa-copy text-info" style="font-size:10px;"></i></small>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                            <td>
                                @if($lead->website)
                                    <a href="{{ $lead->website }}" target="_blank" class="text-info" title="{{ $lead->website }}">
                                        <small>{{ \Illuminate\Support\Str::limit(str_replace(['https://', 'http://', 'www.'], '', $lead->website), 20) }}</small>
                                    </a>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                            <td><small>{{ $lead->country ?: '—' }}</small></td>
                            <td>
                                @if($lead->address)
                                    <a href="https://www.google.com/maps/search/?api=1&query={{ urlencode($lead->address) }}"
                                       target="_blank" class="btn btn-sm btn-outline-secondary" title="Open in Maps">
                                        <i class="fa-solid fa-location-dot"></i>
                                    </a>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                            <td>
                                @if($lead->rating)
                                    <span class="text-warning">{{ str_repeat('★', round($lead->rating)) }}</span>
                                    <br><small class="text-muted">({{ $lead->reviews_count }})</small>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                            <td>
                                <span class="badge bg-{{ $lead->lead_score >= 70 ? 'success' : ($lead->lead_score >= 30 ? 'warning text-dark' : 'secondary') }}">
                                    {{ $lead->lead_score }}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm toggle-type px-2
                                    {{ $lead->lead_type === 'provider' ? 'btn-warning' : ($lead->lead_type === 'customer' ? 'btn-info' : 'btn-outline-secondary') }}"
                                    data-id="{{ $lead->id }}"
                                    data-type="{{ $lead->lead_type }}"
                                    title="Click to toggle type">
                                    <small>
                                        @if($lead->lead_type === 'provider')
                                            <i class="fa-solid fa-building"></i> Provider
                                        @elseif($lead->lead_type === 'customer')
                                            <i class="fa-solid fa-user"></i> Customer
                                        @else
                                            <i class="fa-solid fa-question"></i> ?
                                        @endif
                                    </small>
                                </button>
                            </td>
                            <td>
                                <select class="form-select form-select-sm status-select" data-id="{{ $lead->id }}"
                                        style="width:auto;display:inline-block">
                                    <option value="new" {{ $lead->status == 'new' ? 'selected' : '' }}>New</option>
                                    <option value="contacted" {{ $lead->status == 'contacted' ? 'selected' : '' }}>Contacted</option>
                                    <option value="qualified" {{ $lead->status == 'qualified' ? 'selected' : '' }}>Qualified</option>
                                    <option value="converted" {{ $lead->status == 'converted' ? 'selected' : '' }}>Converted</option>
                                    <option value="lost" {{ $lead->status == 'lost' ? 'selected' : '' }}>Lost</option>
                                </select>
                            </td>
                            <td><small>{{ $lead->leadCategory?->category_name ?: '—' }}</small></td>
                            <td>
                                <div class="d-flex gap-1 flex-wrap" style="max-width:180px">
                                <a href="{{ route('admin.lead-gen.leads.edit', $lead->id) }}"
                                   class="btn btn-sm btn-outline-primary" title="Edit Lead">
                                    <i class="fa-solid fa-edit"></i>
                                </a>
                                <button class="btn btn-sm btn-outline-secondary view-lead"
                                        data-id="{{ $lead->id }}"
                                        title="View Details">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                @if($lead->email)
                                    <button class="btn btn-sm btn-outline-primary email-lead"
                                            data-id="{{ $lead->id }}"
                                            data-email="{{ $lead->email }}"
                                            data-name="{{ $lead->business_name }}"
                                            title="Send Email">
                                        <i class="fa-regular fa-envelope"></i>
                                    </button>
                                @endif
                                @if($lead->whatsapp_phone || $lead->phone)
                                    <button class="btn btn-sm btn-outline-success whatsapp-lead"
                                            data-id="{{ $lead->id }}"
                                            data-phone="{{ $lead->whatsapp_phone ?: $lead->phone }}"
                                            data-name="{{ $lead->business_name }}"
                                            title="Send WhatsApp">
                                        <i class="fa-brands fa-whatsapp"></i>
                                    </button>
                                @endif
                                @if($lead->website)
                                    <button class="btn btn-sm btn-outline-info enrich-lead" data-id="{{ $lead->id }}"
                                            title="AI Enrich">
                                        <i class="fa-solid fa-brain"></i>
                                    </button>
                                @endif
                                <form method="POST" action="{{ route('admin.lead-gen.leads.destroy', $lead->id) }}"
                                      style="display:inline" onsubmit="return confirm('Delete this lead?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete Lead">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="13" class="text-center text-muted py-4">No leads found</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- Bulk Actions Bar (hidden by default) --}}
<div id="bulk-actions-bar" class="d-none mb-3">
    <div class="btn-group me-2" role="group">
        <button type="button" class="btn btn-outline-danger" id="btn-delete-selected">
            <i class="fa-solid fa-trash me-1"></i> Delete Selected
        </button>
        <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu">
            <li><button class="dropdown-item" type="button" data-status="new">Mark as New</button></li>
            <li><button class="dropdown-item" type="button" data-status="contacted">Mark as Contacted</button></li>
            <li><button class="dropdown-item" type="button" data-status="qualified">Mark as Qualified</button></li>
            <li><button class="dropdown-item" type="button" data-status="converted">Mark as Converted</button></li>
            <li><button class="dropdown-item" type="button" data-status="lost">Mark as Lost</button></li>
        </ul>
    </div>
    <button type="button" class="btn btn-outline-primary me-2" id="btn-email-selected">
        <i class="fa-regular fa-envelope me-1"></i> Send Email
    </button>
    <button type="button" class="btn btn-outline-success me-2" id="btn-whatsapp-selected">
        <i class="fa-brands fa-whatsapp me-1"></i> Send WhatsApp
    </button>
    <button type="button" class="btn btn-outline-info me-2" id="btn-export-selected">
        <i class="fa-solid fa-file-csv me-1"></i> Export CSV
    </button>
    <span id="selected-count" class="ms-3">0 selected</span>
    <button type="button" class="btn btn-outline-secondary ms-2" id="btn-clear-selection">
        Clear Selection
    </button>
</div>

{{ $leads->links() }}

{{-- Compose Email Modal --}}
<div class="modal fade" id="emailModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa-regular fa-paper-plane me-2"></i> Send Email</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
            <div class="mb-3">
                <label class="form-label">To</label>
                <div class="input-group">
                    <input type="email" class="form-control" id="emailTo"
                           placeholder="email@example.com">
                    <button class="btn btn-outline-secondary" type="button" id="addCustomEmailBtn" title="Send to custom email not in list">
                        <i class="fa-regular fa-plus me-1"></i> Custom
                    </button>
                </div>
                <small class="text-muted" id="emailToHelp">Select a lead or type any email address</small>
            </div>
                <div class="mb-3">
                    <label class="form-label">Subject</label>
                    <input type="text" class="form-control" id="emailSubject"
                           placeholder="Enter subject line">
                </div>
                <div class="mb-3">
                    <label class="form-label">Message</label>
                    <textarea class="form-control" id="emailMessage" rows="10"
                              placeholder="Write your message here..."></textarea>
                </div>
                <div class="mb-3">
                    <button class="btn btn-outline-secondary btn-sm" id="insertTemplateBtn">
                        <i class="fa-regular fa-file-lines me-1"></i> Insert Template
                    </button>
                    <div id="templateDropdown" class="mt-2 d-none">
                        <div class="list-group">
                            <button class="list-group-item list-group-item-action template-option"
                                    data-template="intro">Introduction / Pitch</button>
                            <button class="list-group-item list-group-item-action template-option"
                                    data-template="followup">Follow Up</button>
                            <button class="list-group-item list-group-item-action template-option"
                                    data-template="partnership">Partnership Proposal</button>
                </div>
                <div class="mb-2">
                    <small class="text-muted">
                        <i class="fa-regular fa-circle-info me-1"></i> Placeholders auto-replaced on send:
                        <code class="px-1 rounded">{contact_person}</code>
                        <code class="px-1 rounded">{business_name}</code>
                        <code class="px-1 rounded">{email}</code>
                        <code class="px-1 rounded">{phone}</code>
                        <code class="px-1 rounded">{website}</code>
                    </small>
                </div>
            </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-info" id="previewEmailBtn">
                    <i class="fa-regular fa-eye me-1"></i> Preview
                </button>
                <button type="button" class="btn btn-outline-warning" id="generateEmailDraftBtn">
                    <i class="fa-solid fa-robot me-1"></i> Draft with AI
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="sendEmailBtn">
                    <i class="fa-regular fa-paper-plane me-1"></i> Send
                </button>
            </div>
        </div>
    </div>
</div>

{{-- Email Preview Modal --}}
<div class="modal fade modal-fullscreen" id="emailPreviewModal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa-regular fa-eye me-2"></i> Email Preview <small class="text-muted ms-2" style="font-size:12px;">— click to edit</small></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-0" id="emailPreviewBody" style="background:var(--bg-input);color:var(--text-primary);min-height:400px;padding:1rem;" contenteditable="true">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-success" id="savePreviewChangesBtn">
                    <i class="fa-solid fa-check me-1"></i> Save Changes
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="sendFromPreviewBtn">
                    <i class="fa-regular fa-paper-plane me-1"></i> Send
                </button>
            </div>
        </div>
    </div>
</div>

<style>
.modal-fullscreen .modal-dialog { max-width: 95%; width: 800px; }
.modal-fullscreen .modal-body { min-height: 400px; }
#emailPreviewBody:focus { outline: 2px dashed var(--accent); outline-offset: -2px; }
#emailPreviewBody:hover { cursor: text; }
.modal-content { background-color: var(--bg-card) !important; color: var(--text-primary) !important; border-color: var(--border-color) !important; }
.modal-header { border-bottom-color: var(--border-color) !important; }
.modal-footer { border-top-color: var(--border-color) !important; }
.modal-header .modal-title { color: var(--text-primary); }
</style>

{{-- Lead Detail Modal --}}
<div class="modal fade" id="leadDetailModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="detailModalTitle"><i class="fa-regular fa-building me-2"></i> Lead Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="leadDetailBody">
                <div class="text-center py-4">
                    <i class="fa-solid fa-spinner fa-spin fa-2x text-muted"></i>
                    <p class="text-muted mt-2">Loading lead details...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

{{-- WhatsApp Composer Modal --}}
<div class="modal fade" id="whatsappModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa-brands fa-whatsapp me-2 text-success"></i> Send WhatsApp</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">To</label>
                    <input type="text" class="form-control" id="whatsappTo" readonly>
                    <small class="text-muted" id="whatsappToHelp">Select a lead or bulk recipients</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Message</label>
                    <textarea class="form-control" id="whatsappMessage" rows="8"
                              placeholder="Type your WhatsApp message here..."></textarea>
                </div>
                <div class="mb-2">
                    <button class="btn btn-outline-secondary btn-sm" id="insertWpTemplateBtn">
                        <i class="fa-regular fa-file-lines me-1"></i> Insert Template
                    </button>
                    <div id="wpTemplateDropdown" class="mt-2 d-none">
                        <div class="list-group">
                            <button class="list-group-item list-group-item-action wp-template-option"
                                    data-template="intro">Introduction / Pitch</button>
                            <button class="list-group-item list-group-item-action wp-template-option"
                                    data-template="followup">Follow Up</button>
                            <button class="list-group-item list-group-item-action wp-template-option"
                                    data-template="partnership">Partnership Proposal</button>
                        </div>
                    </div>
                </div>
                <div class="mb-2">
                    <small class="text-muted">
                        <i class="fa-regular fa-circle-info me-1"></i> Placeholders auto-replaced on send:
                        <code class="px-1 rounded">{contact_person}</code>
                        <code class="px-1 rounded">{business_name}</code>
                        <code class="px-1 rounded">{email}</code>
                        <code class="px-1 rounded">{phone}</code>
                        <code class="px-1 rounded">{website}</code>
                    </small>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-outline-warning" id="generateWhatsappDraftBtn">
                    <i class="fa-solid fa-robot me-1"></i> Draft with AI
                </button>
                <button type="button" class="btn btn-success" id="sendWhatsappBtn">
                    <i class="fa-brands fa-whatsapp me-1"></i> Send via WhatsApp
                </button>
            </div>
        </div>
    </div>
</div>

{{-- Import WhatsApp Group Modal --}}
<div class="modal fade" id="importWhatsappGroupModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content ">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa-brands fa-whatsapp me-2 text-success"></i> Import WhatsApp Group Contacts</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="importWhatsappGroupForm" action="{{ route('admin.lead-gen.import-whatsapp-group') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Group Name / Company Name</label>
                        <input type="text" class="form-control" name="group_name" placeholder="Example: Expo Group Lead List">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Contacts</label>
                        <textarea class="form-control" name="contacts" rows="8" placeholder="Paste WhatsApp numbers or contact lines here, separated by newline, comma, or semicolon."></textarea>
                    </div>
                    <div class="alert alert-info">
                        <small><i class="fa-solid fa-info-circle me-1"></i> The system will extract phone numbers and create new leads with source <strong>whatsapp_group_import</strong>. Existing numbers will be skipped.</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success"><i class="fa-solid fa-upload me-1"></i> Import Contacts</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- Import CSV Modal --}}
<div class="modal fade" id="importCsvModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content ">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa-solid fa-file-import me-2"></i> Import CSV</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('admin.lead-gen.import-csv') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Select CSV file</label>
                        <input type="file" class="form-control" name="csv_file" accept=".csv,.txt" required>
                    </div>
                    <div class="alert alert-info">
                        <small><i class="fa-solid fa-info-circle me-1"></i> 
                        <strong>Supported columns:</strong> Business Name, Email, Phone, WhatsApp Phone, Website, Address, City, Country, Source, Category, Lead Type, Status, Score, Rating, Reviews, Facebook, Instagram, TikTok, YouTube, LinkedIn, Twitter, Followers, Engagement, Contact Person.<br>
                        Duplicates are skipped by email.
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success">
                        <i class="fa-solid fa-upload me-1"></i> Import
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- Import vCard Modal --}}
<div class="modal fade" id="importVcardModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content ">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa-solid fa-file-import me-2"></i> Import vCard</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('admin.lead-gen.import-vcard') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Select vCard file (.vcf)</label>
                        <input type="file" class="form-control" name="vcard_file" accept=".vcf,.vcard,.txt" required>
                    </div>
                    <div class="alert alert-info">
                        <small><i class="fa-solid fa-info-circle me-1"></i> Will import: Business Name, Phone, Email, Website, Address. Duplicates are skipped automatically.</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success">
                        <i class="fa-solid fa-upload me-1"></i> Import
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
$(document).ready(function() {
    $(document).on('change', '.status-select', function() {
        var id = $(this).data('id');
        var status = $(this).val();
        $.post('{{ url("/admin/lead-gen/leads") }}/' + id + '/status', {
            _token: '{{ csrf_token() }}',
            status: status
        }, function() {
            showToast('Status updated', 'success');
        });
    });

    var currentEmailId = null;
    var bulkEmailIds = null;

    $(document).on('click', '.toggle-type', function() {
        var btn = $(this);
        var id = btn.data('id');
        $.post('{{ url("/admin/lead-gen/leads") }}/' + id + '/toggle-type', {
            _token: '{{ csrf_token() }}'
        }, function(res) {
            if (res.success) location.reload();
        });
    });

    // Email button — auto-fill subject with business name
    $(document).on('click', '.email-lead', function() {
        bulkEmailIds = null;
        currentEmailId = $(this).data('id');
        var name = $(this).data('name');
        $('#emailTo').val($(this).data('email') + ' (' + name + ')').prop('readonly', true);
        $('#emailToHelp').text('Email will be sent to this lead');
        $('#emailSubject').val('Partnership Opportunity with ' + name);
        $('#emailModal').modal('show');
    });

    // Bulk email button — send to all selected leads
    $('#btn-email-selected').click(function() {
        if (selectedLeadIds.size === 0) { showToast('No leads selected', 'error'); return; }
        var ids = Array.from(selectedLeadIds);
        $.getJSON('{{ route('admin.lead-gen.check-emails') }}', { ids: ids }, function(res) {
            if (!res.success || res.with_email === 0) {
                showToast('None of the selected leads have an email address', 'error');
                return;
            }
            if (res.without_email > 0) {
                showToast(res.with_email + ' will receive email, ' + res.without_email + ' skipped (no email)', 'warning');
            }
            bulkEmailIds = res.valid_ids;
            currentEmailId = null;
            $('#emailTo').val(res.with_email + ' recipient(s)').prop('readonly', true);
            $('#emailToHelp').text('Bulk email to ' + res.with_email + ' selected leads');
            $('#emailSubject').val('Partnership Opportunity');
            $('#emailModal').modal('show');
        }).fail(function() {
            showToast('Failed to check email addresses', 'error');
        });
    });

    // Custom email button — clear field for manual entry
    $('#addCustomEmailBtn').click(function() {
        currentEmailId = null;
        bulkEmailIds = null;
        $('#emailTo').val('').prop('readonly', false).focus();
        $('#emailToHelp').text('Type any email address to send a custom email');
        $('#emailSubject').val('Partnership Opportunity');
    });

    // Reset email state when modal closes
    $('#emailModal').on('hidden.bs.modal', function() {
        bulkEmailIds = null;
        currentEmailId = null;
        $('#emailTo').prop('readonly', false);
    });

    // Template toggle
    $('#insertTemplateBtn').click(function() {
        $('#templateDropdown').toggleClass('d-none');
    });

    // Template selection
    $(document).on('click', '.template-option', function() {
        var tpl = $(this).data('template');
        var raw = $('#emailTo').val();
        var name = 'there';
        if (raw && raw.indexOf('(') !== -1) {
            name = raw.replace(/^.*\(/, '').replace(/\).*$/, '').trim();
        } else if (raw && raw.indexOf('@') === -1 && raw.indexOf('recipient') === -1) {
            name = raw.trim();
        }

        function section(title, content) {
            return '\n\u2501\u2501\u2501 ' + title + ' \u2501\u2501\u2501\n' + content + '\n';
        }

        var msgs = {
            intro: [
                'Dear {contact_person},',
                '',
                'I hope this message finds you well. My name is {sender_name} from {company_name}, a leading digital marketing agency.',
                '',
                'I recently came across {business_name} and was impressed by your presence in the market. At {company_name}, we specialize in helping businesses like yours achieve measurable growth through data-driven digital strategies.',
                '',
                '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
                '\u2551            WHAT WE OFFER           \u2551',
                '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
                '',
                '  \u25b8 Search Engine Optimization (SEO) — Rank higher, drive organic traffic',
                '  \u25b8 Lead Generation — Targeted prospects ready to convert',
                '  \u25b8 Web Design & Development — Modern, responsive, conversion-focused sites',
                '  \u25b8 Social Media Management — Brand growth across all platforms',
                '  \u25b8 Google Business Profile Optimization — Local visibility & reviews management',
                '',
                '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
                '\u2551         WHY CHOOSE {company_name}?      \u2551',
                '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
                '',
                '  \u2713 Proven track record of delivering measurable results',
                '  \u2713 Data-driven strategies tailored to your industry',
                '  \u2713 Dedicated account manager & transparent reporting',
                '  \u2713 Competitive pricing with flexible packages',
                '',
                '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
                '\u2551           NEXT STEPS               \u2551',
                '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
                '',
                'I would love to schedule a brief 15-minute call to discuss how we can help your business grow. Please let me know a convenient time this week.',
                '',
                'Looking forward to connecting!',
                '',
                'Best regards,',
            ].join('\n'),

            followup: [
                'Dear {contact_person},',
                '',
                'I hope you are doing well.',
                '',
                'I wanted to follow up on my previous message regarding how {company_name} can help your business grow. I understand you are busy, so I have kept this brief.',
                '',
                '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
                '\u2551     QUICK RECAP \u2022 HOW WE CAN HELP    \u2551',
                '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
                '',
                '  \u25b8 SEO Services — Improve rankings & organic traffic',
                '  \u25b8 Lead Generation — Quality prospects for your sales pipeline',
                '  \u25b8 Web Development — High-performing websites that convert',
                '  \u25b8 Social Media — Build & engage your audience',
                '  \u25b8 Google Business Profile — Get found locally',
                '',
                '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
                '\u2551       RESULTS WE DELIVER            \u2551',
                '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
                '',
                '  \u2713 Increased organic traffic by 150%+ for our clients',
                '  \u2713 Generated 500+ qualified leads per campaign',
                '  \u2713 Improved conversion rates by 30% on average',
                '  \u2713 50+ businesses trust us across Bahrain & the region',
                '',
                '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
                '\u2551        WHAT I AM ASKING              \u2551',
                '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
                '',
                'Would you have 10 minutes this week for a quick call? I would love to share some case studies relevant to your industry.',
                '',
                'Best regards,',
            ].join('\n'),

            partnership: [
                'Dear {contact_person},',
                '',
                'I am reaching out from {company_name}, a leading digital marketing agency, to explore a strategic partnership with your company.',
                '',
                'We are actively seeking partners who share our commitment to quality and results. We believe a collaboration between our companies could create significant mutual value.',
                '',
                '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
                '\u2551     PARTNERSHIP OPPORTUNITIES       \u2551',
                '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
                '',
                '  \u25b8 White-Label SEO — Offer SEO under your own brand, we handle delivery',
                '  \u25b8 Co-Marketing — Joint campaigns that benefit both parties',
                '  \u25b8 Referral Partnership — Earn commissions on referred clients',
                '  \u25b8 Joint Digital Campaigns — Combine expertise for bigger impact',
                '  \u25b8 Lead Sharing — Exchange qualified leads in complementary niches',
                '',
                '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
                '\u2551       WHY PARTNER WITH US?          \u2551',
                '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
                '',
                '  \u2713 5+ years of digital marketing expertise',
                '  \u2713 Proven methodologies & transparent processes',
                '  \u2713 Dedicated support team for partner accounts',
                '  \u2713 Flexible engagement models to suit your needs',
                '  \u2713 Competitive commission structures',
                '',
                '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
                '\u2551        LET US TALK                 \u2551',
                '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
                '',
                'I would be happy to schedule a 15-minute call to discuss how we can structure a partnership that works for both of us.',
                '',
                'Looking forward to exploring this opportunity together!',
                '',
                'Best regards,',
            ].join('\n'),
        };
        $('#emailMessage').val(msgs[tpl] || '');
        $('#templateDropdown').addClass('d-none');
    });

    // Send email (single, bulk, or custom)
    $('#sendEmailBtn').click(function() {
        var btn = $(this);
        var subject = $('#emailSubject').val();
        var message = $('#emailMessage').val();
        var recipient = $('#emailTo').val().trim();
        if (!subject.trim() || !message.trim()) {
            showToast('Please fill in subject and message', 'error');
            return;
        }
        if (!recipient) {
            showToast('Please specify a recipient', 'error');
            return;
        }
        btn.html('<i class="fa-solid fa-spinner fa-spin me-1"></i> Sending...').prop('disabled', true);

        var url, data;

        // Custom email entered manually (just an email address, no lead metadata)
        if (recipient.indexOf('@') !== -1 && recipient.indexOf('(') === -1 && recipient.indexOf('recipient') === -1) {
            url = '{{ route('admin.lead-gen.send-custom-email') }}';
            data = { _token: '{{ csrf_token() }}', email: recipient, subject: subject, message: message };
        } else if (bulkEmailIds && bulkEmailIds.length > 0) {
            url = '{{ route('admin.lead-gen.bulk-send-outreach') }}';
            data = { _token: '{{ csrf_token() }}', ids: bulkEmailIds, subject: subject, message: message };
        } else if (currentEmailId) {
            url = '{{ route('admin.lead-gen.send-outreach') }}';
            data = { _token: '{{ csrf_token() }}', lead_id: currentEmailId, subject: subject, message: message };
        } else {
            showToast('No recipient selected', 'error');
            btn.html('<i class="fa-regular fa-paper-plane me-1"></i> Send').prop('disabled', false);
            return;
        }

        if (!bulkEmailIds && !currentEmailId && recipient.indexOf('@') === -1) {
            // For draft generation, do not submit here unless explicit send
        }

        $.ajax(url, { method: 'POST', contentType: 'application/json', dataType: 'json', data: JSON.stringify(data), headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'X-Requested-With': 'XMLHttpRequest' } })
        .done(function(res) {
            if (res.success) {
                showToast(res.message, 'success');
                $('#emailModal').modal('hide');
            } else {
                showToast(res.error || 'Failed', 'error');
            }
        }).fail(function(xhr) {
            var msg = 'Failed to send email';
            try { var j = JSON.parse(xhr.responseText); msg = j.error || msg; } catch(e) {}
            showToast(msg, 'error');
        }).always(function() {
            btn.html('<i class="fa-regular fa-paper-plane me-1"></i> Send').prop('disabled', false);
        });
    });

    // Helper: extract plain text from preview HTML back to textarea
    function savePreviewEdits() {
        var previewEl = $('#emailPreviewBody');
        var paragraphs = previewEl.find('[data-msg-body] p');
        if (paragraphs.length === 0) {
            paragraphs = previewEl.find('p');
        }
        var text = [];
        paragraphs.each(function() {
            var txt = $(this).text().trim();
            if (txt) text.push(txt);
        });
        if (text.length > 0) {
            $('#emailMessage').val(text.join('\n\n'));
            showToast('Changes saved to editor', 'success');
        }
    }

    // Preview email — shows branded editable HTML preview
    $('#previewEmailBtn').click(function() {
        var body = $('#emailMessage').val();
        if (!body.trim()) { showToast('Please write a message first', 'error'); return; }
        var paragraphs = body.split('\n\n');
        var html = paragraphs.map(function(p) {
            return '<p style="margin:0 0 12px;font-size:15px;line-height:1.8;color:#333;">' + p.replace(/\n/g, '<br>') + '</p>';
        }).join('');
        var previewHtml = [
            '<table width="100%" cellpadding="0" cellspacing="0" style="background:#e9eef3;padding:30px 10px;font-family:Segoe UI,Helvetica,Arial,sans-serif;">',
            '<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:28px;">',
            '<tr><td style="padding:32px 32px 20px;text-align:left;border-bottom:1px solid #f0f2f5;">',
            '<p style="font-size:24px;font-weight:800;color:#1f2e3a;margin:0 0 2px;letter-spacing:-0.3px;">Your Company Name</p>',
            '<p style="color:#5b6f82;font-size:14px;font-weight:500;margin:0;">Your Tagline Here</p>',
            '</td></tr>',
            '<tr><td style="padding:32px 32px 24px;"><div data-msg-body style="color:#334e68;font-size:16px;line-height:1.8;">' + html + '</div>',
            '<hr style="margin:32px 0 0;border:none;height:1px;background:linear-gradient(to right,#e2e8f0,transparent);"></td></tr>',
            '<tr><td style="background:#fafcff;padding:32px 32px 28px;border-top:1px solid #eef2f8;text-align:left;">',
            '<p style="font-weight:800;font-size:18px;color:#0a1c2a;text-align:left;margin:0 0 2px;">Your Name</p>',
            '<p style="font-size:13px;font-weight:500;color:#5f7f9a;text-align:left;margin:0 0 2px;text-transform:uppercase;letter-spacing:1px;">Your Title</p>',
            '<p style="font-weight:600;color:#1e3b4a;text-align:left;margin:0;font-size:15px;">Your Company Name</p>',
            '<table cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;border:1px solid #ecf3fa;padding:20px;margin:20px 0 16px;"><tr><td style="text-align:center;">',
            '<p style="font-size:14px;color:#1f3a4b;margin:0 0 10px;"><a href="mailto:email@example.com" style="color:#1f3a4b;text-decoration:none;">email@example.com</a></p>',
            '<p style="font-size:14px;color:#1f3a4b;margin:0 0 10px;"><a href="tel:+1234567890" style="color:#1f3a4b;text-decoration:none;">+1 234 567 890</a></p>',
            '<p style="font-size:14px;color:#4f6f8f;text-align:center;line-height:1.5;margin:0;">Your Company Name<br>Your Business Address</p>',
            '<p style="text-align:center;margin:14px 0 0;"><a href="https://yourcompany.com" target="_blank" style="color:#1f6e8c;font-weight:600;text-decoration:none;font-size:15px;">www.yourcompany.com</a></p>',
            '</td></tr></table>',
            '<p style="font-size:12px;color:#8ca3b9;text-align:center;margin:28px 0 0;padding-top:22px;border-top:1px solid #eef3fc;">&copy; 2026 Your Company Name &bull; All rights reserved</p>',
            '</td></tr></table></td></tr></table>'
        ].join('\n');
        $('#emailPreviewBody').html(previewHtml);
        $('#emailPreviewModal').modal('show');
    });

    // Save changes from preview back to composer
    $('#savePreviewChangesBtn').click(function() {
        savePreviewEdits();
    });

    // Send from preview — save first, then send
    $('#sendFromPreviewBtn').click(function() {
        savePreviewEdits();
        $('#emailPreviewModal').modal('hide');
        setTimeout(function() { $('#sendEmailBtn').click(); }, 100);
    });

    $(document).on('click', '.enrich-lead', function() {
        var btn = $(this);
        var id = btn.data('id');
        btn.html('<i class="fa-solid fa-spinner fa-spin"></i>').prop('disabled', true);
        $.post('{{ route('admin.lead-gen.enrich') }}', {
            _token: '{{ csrf_token() }}',
            lead_id: id
        }, function(res) {
            if (res.success) {
                showToast(res.message, 'success');
            } else {
                showToast(res.error || 'Failed', 'error');
            }
        }).fail(function(xhr) {
            var msg = 'Enrichment failed';
            try { msg = JSON.parse(xhr.responseText).error || msg; } catch(e) {}
            showToast(msg, 'error');
        }).always(function() {
            btn.html('<i class="fa-solid fa-brain"></i>').prop('disabled', false);
        });
    });

    // Generate email draft with AI for current email or selected lead
    $('#generateEmailDraftBtn').click(function() {
        if (!currentEmailId) {
            showToast('Open a lead email composer or select a lead first', 'error');
            return;
        }
        var btn = $(this);
        btn.html('<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...').prop('disabled', true);
        $.ajax('{{ route('admin.lead-gen.generate-email-draft') }}', {
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({ _token: '{{ csrf_token() }}', lead_id: currentEmailId, language: 'en' })
        }).done(function(res) {
            if (res.success) {
                $('#emailMessage').val(res.message);
                showToast('AI email draft inserted', 'success');
            } else {
                showToast(res.error || 'Failed to generate email draft', 'error');
            }
        }).fail(function() {
            showToast('Failed to generate email draft', 'error');
        }).always(function() {
            btn.html('<i class="fa-solid fa-robot me-1"></i> Draft with AI').prop('disabled', false);
        });
    });

    // Generate WhatsApp message draft with AI
    $('#generateWhatsappDraftBtn').click(function() {
        if (!currentWhatsappId && !bulkWhatsappIds) {
            showToast('Open a WhatsApp composer or select leads first', 'error');
            return;
        }
        var leadId = currentWhatsappId || (bulkWhatsappIds && bulkWhatsappIds[0]);
        var btn = $(this);
        btn.html('<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...').prop('disabled', true);
        $.ajax('{{ route('admin.lead-gen.generate-whatsapp-draft') }}', {
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({ _token: '{{ csrf_token() }}', lead_id: leadId, language: 'en' })
        }).done(function(res) {
            if (res.success) {
                $('#whatsappMessage').val(res.message);
                showToast('AI WhatsApp draft inserted', 'success');
            } else {
                showToast(res.error || 'Failed to generate WhatsApp draft', 'error');
            }
        }).fail(function() {
            showToast('Failed to generate WhatsApp draft', 'error');
        }).always(function() {
            btn.html('<i class="fa-solid fa-robot me-1"></i> Draft with AI').prop('disabled', false);
        });
    });

    // WhatsApp group import modal
    $('#importWhatsappGroupBtn').click(function() {
        $('#importWhatsappGroupModal').modal('show');
    });

    function showToast(msg, type) {
        var bg = type === 'success' ? '#10b981' : '#ef4444';
        var html = '<div class="alert" style="position:fixed;top:20px;right:20px;z-index:9999;background:'+bg+';color:#fff;border:none;border-radius:10px;padding:12px 24px">'+msg+'</div>';
        var el = $(html).appendTo('body');
        setTimeout(function() { el.fadeOut(function() { el.remove(); }); }, 3000);
    }

    // Bulk actions JavaScript
    var selectedLeadIds = new Set();

    // Select all checkbox
    $('#select-all-leads').change(function() {
        if (this.checked) {
            $('.lead-select-checkbox').prop('checked', true);
            selectedLeadIds = new Set($('.lead-select-checkbox').map(function() { return parseInt($(this).val()); }).get());
        } else {
            $('.lead-select-checkbox').prop('checked', false);
            selectedLeadIds.clear();
        }
        updateBulkActionsUI();
    });

    // Individual lead checkboxes
    $(document).on('change', '.lead-select-checkbox', function() {
        var id = parseInt($(this).val());
        if (this.checked) {
            selectedLeadIds.add(id);
        } else {
            selectedLeadIds.delete(id);
            $('#select-all-leads').prop('checked', false);
        }
        updateBulkActionsUI();
    });

    function updateBulkActionsUI() {
        var count = selectedLeadIds.size;
        $('#selected-count').text(count + ' selected');
        if (count > 0) {
            $('#bulk-actions-bar').removeClass('d-none');
            $('#select-all-leads').prop('checked', $('.lead-select-checkbox').length === count && count > 0);
        } else {
            $('#bulk-actions-bar').addClass('d-none');
            $('#select-all-leads').prop('checked', false);
        }
    }

    // Clear selection
    $('#btn-clear-selection').click(function() {
        $('.lead-select-checkbox').prop('checked', false);
        selectedLeadIds.clear();
        updateBulkActionsUI();
    });

    // Delete selected
    $('#btn-delete-selected').click(function() {
        if (selectedLeadIds.size === 0) return;
        if (!confirm('Are you sure you want to delete ' + selectedLeadIds.size + ' selected lead(s)?')) {
            return;
        }
        var btn = $(this);
        btn.html('<i class="fa-solid fa-spinner fa-spin me-1"></i> Deleting...').prop('disabled', true);
        $.ajax('{{ route('admin.lead-gen.bulk-delete-leads') }}', {
            method: 'POST',
            dataType: 'json',
            data: {
                _token: '{{ csrf_token() }}',
                ids: Array.from(selectedLeadIds)
            }
        }).done(function(res) {
            if (res.success) {
                showToast(res.message, 'success');
                // Remove deleted rows
                selectedLeadIds.forEach(function(id) {
                    $('tr td input.lead-select-checkbox[value="' + id + '"]').closest('tr').remove();
                });
                selectedLeadIds.clear();
                updateBulkActionsUI();
            } else {
                showToast(res.error || 'Failed to delete', 'error');
            }
        }).fail(function(xhr) {
            var msg = 'Failed to delete';
            try { var j = JSON.parse(xhr.responseText); msg = j.error || msg; } catch(e) {}
            showToast(msg, 'error');
        }).always(function() {
            btn.html('<i class="fa-solid fa-trash me-1"></i> Delete Selected').prop('disabled', false);
        });
    });

    // Status dropdown in bulk actions
    $(document).on('click', '#bulk-actions-bar .dropdown-item', function() {
        var status = $(this).data('status');
        if (selectedLeadIds.size === 0) return;
        if (!confirm('Are you sure you want to mark ' + selectedLeadIds.size + ' selected lead(s) as ' + status + '?')) {
            return;
        }
        var btn = $(this);
        btn.html('<i class="fa-solid fa-spinner fa-spin me-1"></i> Updating...').prop('disabled', true);
        $.ajax('{{ route('admin.lead-gen.bulk-update-status') }}', {
            method: 'POST',
            dataType: 'json',
            data: {
                _token: '{{ csrf_token() }}',
                ids: Array.from(selectedLeadIds),
                status: status
            }
        }).done(function(res) {
            if (res.success) {
                showToast(res.message, 'success');
                // Update status badges in UI
                selectedLeadIds.forEach(function(id) {
                    var statusSelect = $('tr td select.status-select[data-id="' + id + '"]');
                    statusSelect.val(status);
                    // Update badge color based on new status
                    var badgeClass = 'bg-secondary';
                    if (status === 'new') badgeClass = 'bg-secondary';
                    else if (status === 'contacted') badgeClass = 'bg-info';
                    else if (status === 'qualified') badgeClass = 'bg-success';
                    else if (status === 'converted') badgeClass = 'bg-success';
                    else if (status === 'lost') badgeClass = 'bg-danger';
                    var badge = statusSelect.closest('td').find('.badge');
                    badge.removeClass('bg-success bg-info bg-warning bg-danger bg-secondary text-dark');
                    badge.addClass(badgeClass);
                    if (status === 'qualified' || status === 'converted') badge.addClass('text-dark');
                });
                selectedLeadIds.clear();
                updateBulkActionsUI();
            } else {
                showToast(res.error || 'Failed to update', 'error');
            }
        }).fail(function(xhr) {
            var msg = 'Failed to update';
            try { var j = JSON.parse(xhr.responseText); msg = j.error || msg; } catch(e) {}
            showToast(msg, 'error');
        }).always(function() {
            btn.html($(this).data('original-text') || 'Update').prop('disabled', false);
        });
    });

    // WhatsApp single lead button
    $(document).on('click', '.whatsapp-lead', function() {
        bulkWhatsappIds = null;
        currentWhatsappId = $(this).data('id');
        var phone = $(this).data('phone');
        var name = $(this).data('name');
        $('#whatsappTo').val(phone + ' (' + name + ')');
        $('#whatsappModal').modal('show');
    });

    // Export selected leads as CSV
    $('#btn-export-selected').click(function() {
        if (selectedLeadIds.size === 0) { showToast('No leads selected', 'error'); return; }
        var ids = Array.from(selectedLeadIds);
        var url = '{{ route("admin.lead-gen.export-selected-csv") }}?ids=' + ids.join(',');
        window.location.href = url;
    });

    // WhatsApp bulk button
    $('#btn-whatsapp-selected').click(function() {
        if (selectedLeadIds.size === 0) { showToast('No leads selected', 'error'); return; }
        var ids = Array.from(selectedLeadIds);
        $.getJSON('{{ route('admin.lead-gen.check-whatsapp') }}', { ids: ids }, function(res) {
            if (!res.success || res.with_whatsapp === 0) {
                showToast('None of the selected leads have a WhatsApp number', 'error');
                return;
            }
            if (res.without_whatsapp > 0) {
                showToast(res.with_whatsapp + ' will receive WhatsApp, ' + res.without_whatsapp + ' skipped (no WhatsApp number)', 'warning');
            }
            bulkWhatsappIds = res.valid_ids;
            currentWhatsappId = null;
            $('#whatsappTo').val(res.with_whatsapp + ' recipient(s)').prop('readonly', true);
            $('#whatsappToHelp').text('Bulk WhatsApp to ' + res.with_whatsapp + ' selected leads');
            $('#whatsappModal').modal('show');
        }).fail(function() {
            showToast('Failed to check WhatsApp numbers', 'error');
        });
    });

    var currentWhatsappId = null;
    var bulkWhatsappIds = null;

    // WhatsApp template toggle
    $('#insertWpTemplateBtn').click(function() {
        $('#wpTemplateDropdown').toggleClass('d-none');
    });

    $(document).on('click', '.wp-template-option', function() {
        var tpl = $(this).data('template');
        var raw = $('#whatsappTo').val();
        var name = 'there';
        if (raw && raw.indexOf('(') !== -1) {
            name = raw.replace(/^.*\(/, '').replace(/\).*$/, '').trim();
        }

        var msgs = {
            intro: 'Hello {contact_person},\n\nI hope this message finds you well. My name is Muhammad Aamir from AL ASAR JADEED, a Bahrain-based SEO and digital marketing agency.\n\nI came across {business_name} and was impressed by your presence. We specialize in helping businesses like yours achieve measurable growth through:\n\n\u25b8 SEO Services\n\u25b8 Lead Generation\n\u25b8 Web Design & Development\n\u25b8 Social Media Management\n\nI would love to schedule a brief 15-minute call to discuss how we can help your business grow.\n\nBest regards,\nMuhammad Aamir\nAL ASAR JADEED',
            followup: 'Hello {contact_person},\n\nI hope you are doing well. I wanted to follow up on my previous message regarding how AL ASAR JADEED can help {business_name} grow.\n\nWe have helped 50+ businesses across Bahrain & the GCC achieve:\n\u2713 150%+ increase in organic traffic\n\u2713 500+ qualified leads per campaign\n\u2713 30% average improvement in conversion rates\n\nWould you have 10 minutes this week for a quick call?\n\nBest regards,\nMuhammad Aamir',
            partnership: 'Hello {contact_person},\n\nI am reaching out from AL ASAR JADEED to explore a strategic partnership with {business_name}.\n\nWe are looking for partners in complementary niches and offer:\n\u25b8 White-Label SEO\n\u25b8 Co-Marketing\n\u25b8 Referral Partnership\n\u25b8 Lead Sharing\n\nWould you be open to a 15-minute call to discuss?\n\nBest regards,\nMuhammad Aamir',
        };
        $('#whatsappMessage').val(msgs[tpl] || '');
        $('#wpTemplateDropdown').addClass('d-none');
    });

    // Send WhatsApp
    $('#sendWhatsappBtn').click(function() {
        var btn = $(this);
        var message = $('#whatsappMessage').val().trim();
        if (!message) {
            showToast('Please write a message', 'error');
            return;
        }

        btn.html('<i class="fa-solid fa-spinner fa-spin me-1"></i> Sending...').prop('disabled', true);

        var url, data;

        if (bulkWhatsappIds && bulkWhatsappIds.length > 0) {
            url = '{{ route('admin.lead-gen.bulk-send-whatsapp') }}';
            data = { _token: '{{ csrf_token() }}', ids: bulkWhatsappIds, message: message };
        } else if (currentWhatsappId) {
            url = '{{ route('admin.lead-gen.bulk-send-whatsapp') }}';
            data = { _token: '{{ csrf_token() }}', ids: [currentWhatsappId], message: message };
        } else {
            showToast('No recipient selected', 'error');
            btn.html('<i class="fa-brands fa-whatsapp me-1"></i> Send via WhatsApp').prop('disabled', false);
            return;
        }

        $.ajax(url, { method: 'POST', contentType: 'application/json', dataType: 'json', data: JSON.stringify(data), headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}', 'X-Requested-With': 'XMLHttpRequest' } })
        .done(function(res) {
            if (res.success) {
                showToast(res.message, 'success');
                $('#whatsappModal').modal('hide');
            } else {
                showToast(res.error || 'Failed', 'error');
            }
        }).fail(function(xhr) {
            var msg = 'Failed to send WhatsApp';
            try { var j = JSON.parse(xhr.responseText); msg = j.error || msg; } catch(e) {}
            showToast(msg, 'error');
        }).always(function() {
            btn.html('<i class="fa-brands fa-whatsapp me-1"></i> Send via WhatsApp').prop('disabled', false);
        });
    });

    // Reset WhatsApp state on modal close
    $('#whatsappModal').on('hidden.bs.modal', function() {
        bulkWhatsappIds = null;
        currentWhatsappId = null;
    });

    // Copy phone to WhatsApp (click on non-whatsapp phone in table)
    function copyToWhatsapp(el, phone) {
        if (confirm('Use ' + phone + ' as WhatsApp number for this lead?')) {
            var id = $(el).closest('tr').find('.lead-select-checkbox').val();
            $.post('{{ url("/admin/lead-gen/leads") }}/' + id + '/whatsapp', {
                _token: '{{ csrf_token() }}',
                whatsapp_phone: phone
            }).done(function(res) {
                if (res.success) {
                    showToast('WhatsApp number set', 'success');
                    location.reload();
                }
            }).fail(function() {
                showToast('Failed to set WhatsApp number', 'error');
            });
        }
    }

    // Import CSV button
    $('#importCsvBtn').click(function() {
        $('#importCsvModal').modal('show');
    });

    // Import vCard button
    $('#importVcardBtn').click(function() {
        $('#importVcardModal').modal('show');
    });

    // View lead details
    $(document).on('click', '.view-lead', function() {
        var id = $(this).data('id');
        $('#leadDetailModal').modal('show');
        $('#leadDetailBody').html('<div class="text-center py-4"><i class="fa-solid fa-spinner fa-spin fa-2x text-muted"></i><p class="text-muted mt-2">Loading lead details...</p></div>');

            $.getJSON('{{ url("/admin/lead-gen/leads") }}/' + id, function(res) {
            if (!res.success) {
                $('#leadDetailBody').html('<div class="alert alert-danger">Failed to load lead details.</div>');
                return;
            }
            var l = res.lead;
            var srcIcons = {
                google_maps: ['fa-map-pin','#34a853'], google_reviews: ['fa-star','#fbbc04'],
                google_search: ['fa-search','#4285f4'], instagram: ['fa-instagram','#e4405f'],
                facebook: ['fa-facebook','#1877f2'], tiktok: ['fa-tiktok','#000'],
                youtube: ['fa-youtube','#ff0000'], twitter: ['fa-x-twitter','#000'],
                ecommerce: ['fa-cart-shopping','#ff6d01'], vcard_import: ['fa-address-card','#6c757d']
            };
            var si = srcIcons[l.source] || ['fa-globe','#6c757d'];
            var socialHtml = '';
            $.each(l.social_links, function(platform, url) {
                if (!url) return;
                var icons = { facebook: ['fa-facebook','#1877f2'], instagram: ['fa-instagram','#e4405f'], tiktok: ['fa-tiktok','#000'], youtube: ['fa-youtube','#ff0000'], twitter: ['fa-x-twitter','#000'] };
                var ic = icons[platform] || ['fa-globe','#6c757d'];
                socialHtml += '<a href="' + url + '" target="_blank" class="me-2" style="color:' + ic[1] + ';font-size:18px;" title="' + url + '"><i class="fa-brands ' + ic[0] + '"></i></a>';
            });

            var statusBadge = { new: 'secondary', contacted: 'info', qualified: 'success', converted: 'success', lost: 'danger' };
            var typeBadge = { provider: 'warning', customer: 'info', unknown: 'secondary' };

            var html = '<div class="row g-3">' +
                '<div class="col-md-12"><div class="d-flex align-items-center gap-2 mb-3"><i class="fa-brands ' + si[0] + '" style="color:' + si[1] + ';font-size:24px;"></i><h4 class="mb-0">' + (l.business_name || 'N/A') + '</h4></div></div>' +
                '<div class="col-md-6"><div class="card h-100"><div class="card-body">' +
                '<h6 class="card-title text-muted border-bottom pb-2"><i class="fa-regular fa-address-card me-1"></i> Contact Info</h6>' +
                (l.contact_person ? '<p class="mb-1"><strong>Person:</strong> ' + l.contact_person + '</p>' : '') +
                (l.email ? '<p class="mb-1"><strong>Email:</strong> <a href="mailto:' + l.email + '">' + l.email + '</a></p>' : '') +
                (l.phone ? '<p class="mb-1"><strong>Phone:</strong> <a href="tel:' + l.phone + '">' + l.phone + '</a></p>' : '') +
                (l.website ? '<p class="mb-1"><strong>Website:</strong> <a href="' + l.website + '" target="_blank">' + l.website + '</a></p>' : '') +
                (l.address ? '<p class="mb-1"><strong>Address:</strong> ' + l.address + '</p>' : '') +
                (l.city ? '<p class="mb-1"><strong>City:</strong> ' + l.city + '</p>' : '') +
                (l.country ? '<p class="mb-1"><strong>Country:</strong> ' + l.country + '</p>' : '') +
                (l.map_url ? '<p class="mb-0"><a href="' + l.map_url + '" target="_blank" class="btn btn-sm btn-outline-secondary mt-1"><i class="fa-solid fa-location-dot me-1"></i> Open in Google Maps</a></p>' : '') +
                (l.location_coords ? '<p class="mb-0 mt-1 small text-muted"><strong>Coordinates:</strong> ' + l.location_coords.lat + ', ' + l.location_coords.lng + '</p>' : '') +
                '</div></div></div>' +
                '<div class="col-md-6"><div class="card h-100"><div class="card-body">' +
                '<h6 class="card-title text-muted border-bottom pb-2"><i class="fa-solid fa-chart-simple me-1"></i> Classification</h6>' +
                '<p class="mb-1"><strong>Source:</strong> <span class="badge bg-secondary">' + (l.source ? l.source.replace(/_/g, ' ') : '—') + '</span></p>' +
                '<p class="mb-1"><strong>Type:</strong> <span class="badge bg-' + (typeBadge[l.lead_type] || 'secondary') + '">' + (l.lead_type || '—') + '</span></p>' +
                '<p class="mb-1"><strong>Status:</strong> <span class="badge bg-' + (statusBadge[l.status] || 'secondary') + '">' + (l.status || '—') + '</span></p>' +
                '<p class="mb-1"><strong>Score:</strong> <span class="badge bg-' + (l.lead_score >= 70 ? 'success' : (l.lead_score >= 30 ? 'warning text-dark' : 'secondary')) + '">' + (l.lead_score || 0) + '</span></p>' +
                (l.rating ? '<p class="mb-1"><strong>Rating:</strong> ' + '<span class="text-warning">' + '★'.repeat(Math.round(l.rating)) + '</span> (' + (l.reviews_count || 0) + ' reviews)</p>' : '') +
                (l.gm_data && l.gm_data.totalScore ? '<p class="mb-1"><strong>GM Score:</strong> ' + l.gm_data.totalScore + '</p>' : '') +
                (l.gm_data && l.gm_data.categoryName ? '<p class="mb-1"><strong>GM Category:</strong> ' + l.gm_data.categoryName + '</p>' : '') +
                (l.gm_categories && l.gm_categories.length ? '<p class="mb-0"><strong>Tags:</strong> ' + l.gm_categories.join(', ') + '</p>' : '') +
                (l.category_name ? '<p class="mb-0 mt-1"><strong>Lead Category:</strong> ' + l.category_name + '</p>' : '') +
                '</div></div></div>' +
                (socialHtml ? '<div class="col-12"><div class="card"><div class="card-body"><h6 class="card-title text-muted border-bottom pb-2"><i class="fa-solid fa-share-nodes me-1"></i> Social Links</h6><div>' + socialHtml + '</div></div></div></div>' : '') +
                (l.opening_hours && l.opening_hours.length ? '<div class="col-12"><div class="card"><div class="card-body"><h6 class="card-title text-muted border-bottom pb-2"><i class="fa-regular fa-clock me-1"></i> Opening Hours</h6><div class="row row-cols-2 row-cols-md-4 g-1">' + l.opening_hours.map(function(oh) { return '<div class="col"><small><strong>' + oh.day + ':</strong> ' + oh.hours + '</small></div>'; }).join('') + '</div></div></div></div>' : '') +
                (l.followers_count > 0 || l.engagement_count > 0 || l.platform_profile_name ? '<div class="col-md-6"><div class="card"><div class="card-body"><h6 class="card-title text-muted border-bottom pb-2"><i class="fa-solid fa-users me-1"></i> Platform Stats</h6>' +
                (l.platform_profile_name ? '<p class="mb-1"><strong>Profile:</strong> ' + l.platform_profile_name + '</p>' : '') +
                (l.followers_count > 0 ? '<p class="mb-1"><strong>Followers:</strong> ' + l.followers_count.toLocaleString() + '</p>' : '') +
                (l.engagement_count > 0 ? '<p class="mb-0"><strong>Engagement:</strong> ' + l.engagement_count.toLocaleString() + '</p>' : '') +
                '</div></div></div>' : '') +
                (l.last_post_content ? '<div class="col-md-6"><div class="card"><div class="card-body"><h6 class="card-title text-muted border-bottom pb-2"><i class="fa-regular fa-file-lines me-1"></i> Latest Post</h6><p class="mb-0 small" style="white-space:pre-wrap;">' + l.last_post_content + '</p></div></div></div>' : '') +
                (l.additional_info && Object.keys(l.additional_info).length ? '<div class="col-12"><div class="card"><div class="card-body"><h6 class="card-title text-muted border-bottom pb-2"><i class="fa-solid fa-circle-info me-1"></i> Additional Info</h6>' + (function() { var html = ''; for (var section in l.additional_info) { if (l.additional_info.hasOwnProperty(section)) { html += '<p class="mb-1"><strong>' + section + ':</strong></p>'; var items = l.additional_info[section]; if (Array.isArray(items)) { html += '<ul class="list-unstyled ms-2 mb-2 small">'; items.forEach(function(item) { for (var k in item) { if (item.hasOwnProperty(k)) { html += '<li>' + k + ': ' + (item[k] ? '<span class="text-success">✓</span>' : '<span class="text-danger">✗</span>') + '</li>'; } } }); html += '</ul>'; } } } return html; })() + '</div></div></div>' : '') +
                '<div class="col-12"><div class="card"><div class="card-body"><h6 class="card-title text-muted border-bottom pb-2"><i class="fa-regular fa-clock me-1"></i> Timeline</h6>' +
                '<p class="mb-1 small"><strong>Created:</strong> ' + (l.created_readable || l.created_at || '—') + '</p>' +
                '<p class="mb-0 small"><strong>Updated:</strong> ' + (l.updated_readable || l.updated_at || '—') + '</p>' +
                '</div></div></div>' +
                (l.gm_data && (l.gm_data.neighborhood || l.gm_data.street || l.gm_data.postalCode) ? '<div class="col-12"><div class="card"><div class="card-body"><h6 class="card-title text-muted border-bottom pb-2"><i class="fa-regular fa-building me-1"></i> Location Details</h6>' +
                (l.gm_data.street ? '<p class="mb-1 small"><strong>Street:</strong> ' + l.gm_data.street + '</p>' : '') +
                (l.gm_data.neighborhood ? '<p class="mb-1 small"><strong>Neighborhood:</strong> ' + l.gm_data.neighborhood + '</p>' : '') +
                (l.gm_data.postalCode ? '<p class="mb-0 small"><strong>Postal Code:</strong> ' + l.gm_data.postalCode + '</p>' : '') +
                '</div></div></div>' : '') +
                (Object.keys(l.enriched_data).length > 0 ? '<div class="col-12"><div class="card"><div class="card-body"><h6 class="card-title text-muted border-bottom pb-2"><i class="fa-regular fa-note-sticky me-1"></i> Enrichment Data</h6><pre class="mb-0 small" style="white-space:pre-wrap;font-family:inherit;font-size:11px;">' + JSON.stringify(l.enriched_data, null, 2) + '</pre></div></div></div>' : '') +
                '</div>';

            $('#leadDetailBody').html(html);
            $('#detailModalTitle').html('<i class="fa-regular fa-building me-2"></i> ' + (l.business_name || 'Lead Details'));
        }).fail(function() {
            $('#leadDetailBody').html('<div class="alert alert-danger">Failed to load lead details. Please try again.</div>');
        });
    });
});
</script>
@endsection
