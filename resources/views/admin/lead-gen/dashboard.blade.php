@extends('admin.layout')

@section('content')
<div class="page-header d-flex justify-content-between align-items-center">
    <div>
        <h2><i class="fa-solid fa-users me-2"></i> Lead Generator</h2>
        <p class="text-muted mb-0">AI-powered lead generation via Apify — Instagram & Google Maps</p>
    </div>
    <div>
        <a href="{{ route('admin.lead-gen.categories') }}" class="btn btn-outline-primary me-2">
            <i class="fa-solid fa-tags me-1"></i> Categories
        </a>
        <a href="{{ route('admin.lead-gen.leads') }}" class="btn btn-primary">
            <i class="fa-solid fa-list me-1"></i> View All Leads
        </a>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show">{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif
@if(session('error'))
    <div class="alert alert-danger alert-dismissible fade show">{{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

{{-- Stats Row --}}
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="stat-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="stat-label">Total Leads</div>
                    <div class="stat-value">{{ number_format($totalLeads) }}</div>
                </div>
                <div class="stat-icon" style="background:var(--accent-light);color:var(--accent);">
                    <i class="fa-solid fa-users"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="stat-label">New (Uncontacted)</div>
                    <div class="stat-value">{{ number_format($newLeads) }}</div>
                </div>
                <div class="stat-icon" style="background:var(--success-light);color:var(--success);">
                    <i class="fa-solid fa-star"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="stat-label">Hot Leads (score ≥ 70)</div>
                    <div class="stat-value">{{ number_format($hotLeads) }}</div>
                </div>
                <div class="stat-icon" style="background:var(--warning-light);color:var(--warning);">
                    <i class="fa-solid fa-fire"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="stat-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="stat-label">This Week</div>
                    <div class="stat-value">{{ number_format($leadsThisWeek) }}</div>
                </div>
                <div class="stat-icon" style="background:var(--info-light);color:var(--info);">
                    <i class="fa-solid fa-calendar-week"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    {{-- Quick Generate --}}
    <div class="col-md-5 mb-4">
        <div class="card">
            <div class="card-header d-flex align-items-center">
                <h5 class="mb-0"><i class="fa-solid fa-bolt me-2" style="color:var(--accent)"></i> Quick Generate</h5>
            </div>
            <div class="card-body">
                @if(!($settings['apify_api_token'] ?? null))
                    <div class="alert alert-warning">
                        <i class="fa-solid fa-triangle-exclamation me-1"></i>
                        Apify API token not configured.
                        <a href="{{ route('admin.settings') }}" class="fw-bold">Add it in Settings</a>
                    </div>
                @elseif($categories->isEmpty())
                    <div class="alert alert-info">
                        <i class="fa-solid fa-circle-info me-1"></i>
                        No categories yet.
                        <a href="{{ route('admin.lead-gen.categories') }}" class="fw-bold">Create one first</a>
                    </div>
                @else
                <div class="mb-3">
                    <label class="form-label">Service Category Preset <small class="text-muted">(auto-fills keyword)</small></label>
                    <select class="form-select" id="servicePreset">
                        <option value="">Custom keyword...</option>
                        <option value="beauty salon, spa, hairdresser">Beauty & Salon</option>
                        <option value="lawyer, legal services, law firm">Legal Services</option>
                        <option value="cleaning services, janitorial, house cleaning">Cleaning Services</option>
                        <option value="hospital, clinic, doctor, healthcare">Healthcare & Medical</option>
                        <option value="real estate, property, realtor">Real Estate</option>
                        <option value="auto repair, car mechanic, garage">Automotive & Repair</option>
                        <option value="restaurant, cafe, catering, food">Food & Restaurant</option>
                        <option value="fitness gym, personal trainer, yoga">Fitness & Gym</option>
                        <option value="it services, software, web development">IT & Software</option>
                        <option value="construction, contractor, building">Construction & Contracting</option>
                        <option value="education, school, training, tutoring">Education & Training</option>
                        <option value="photography, videography, media">Photography & Media</option>
                        <option value="accountant, accounting, tax services">Accounting & Finance</option>
                        <option value="marketing agency, digital marketing, seo">Marketing & Advertising</option>
                        <option value="travel agency, tourism, hotel">Travel & Hospitality</option>
                    </select>
                </div>
                <hr>
                <form method="POST" action="{{ route('admin.lead-gen.quick-generate') }}" id="quickGenForm">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Keyword / Search Term</label>
                        <input type="text" class="form-control" name="keyword" id="keywordInput"
                               placeholder="e.g., beauty salon, lawyer, cleaning services" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-control" name="location"
                               placeholder="e.g., Manama, Bahrain (leave empty for worldwide)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label mb-2">Platforms <small class="text-muted">(select all that apply)</small></label>
                        @php
                            $iconMap = [
                                'google_maps'=>'fa-map-pin','instagram'=>'fa-instagram','tiktok'=>'fa-tiktok',
                                'youtube'=>'fa-youtube','facebook'=>'fa-facebook','twitter'=>'fa-x-twitter',
                                'google_search'=>'fa-search','google_reviews'=>'fa-star','ecommerce'=>'fa-cart-shopping',
                                'website_content'=>'fa-globe','expatriates'=>'fa-earth-asia','opensooq'=>'fa-store',
                                'olx'=>'fa-tag','arabiantalks'=>'fa-comments','dcciinfo'=>'fa-building',
                                'abcgcc'=>'fa-handshake',
                            ];
                        @endphp
                        <div class="platform-grid">
                            @foreach($platforms as $key => $label)
                            <label class="platform-card">
                                <input type="checkbox" name="platforms[]" value="{{ $key }}"
                                       class="platform-checkbox"
                                       {{ in_array($key, ['google_maps','instagram','expatriates','opensooq']) ? 'checked' : '' }}>
                                <span class="pc-check"><i class="fa-solid fa-check"></i></span>
                                <span class="pc-icon {{ $key }}"><i class="fa-brands {{ $iconMap[$key] ?? 'fa-globe' }}"></i></span>
                                <span>{{ $label }}</span>
                            </label>
                            @endforeach
                        </div>
                        <div class="mt-2 d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="selectAllPlatforms">Select All</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="deselectAllPlatforms">Clear</button>
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" name="enrich" value="1" id="enrichToggle" checked>
                            <label class="form-check-label" for="enrichToggle">
                                <i class="fa-solid fa-brain me-1" style="color:var(--info)"></i> Auto-Enrich with AI
                                <small class="text-muted">(extract emails & phones)</small>
                            </label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Category <small class="text-muted">(auto-assign)</small></label>
                        <select name="category_id" class="form-select">
                            <option value="">No Category</option>
                            @foreach($categories as $cat)
                                <option value="{{ $cat->id }}">{{ $cat->category_name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div="mb-3">
                        <label class="form-label">Max Leads per Platform</label>
                        <select name="limit" class="form-select">
                            <option value="5" selected>5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary w-100" id="quickGenBtn">
                        <i class="fa-solid fa-play me-1"></i> Generate Leads Now
                    </button>
                </form>
                @endif
                <div id="quickGenResult" class="mt-3" style="display:none"></div>
            </div>
        </div>

        {{-- Source Breakdown --}}
        <div class="card mt-4">
            <div class="card-header">
                <h5 class="mb-0"><i class="fa-solid fa-chart-pie me-2" style="color:var(--accent)"></i> By Source</h5>
            </div>
            <div class="card-body">
                @forelse($sourceStats as $source => $count)
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span style="font-size:0.88rem;font-weight:500;">
                            @php
                                $sourceIcons = [
                                    'google_maps' => '<i class="fa-brands fa-google" style="color:#eab308"></i>',
                                    'instagram' => '<i class="fa-brands fa-instagram" style="color:#ec4899"></i>',
                                    'tiktok' => '<i class="fa-brands fa-tiktok"></i>',
                                    'youtube' => '<i class="fa-brands fa-youtube" style="color:#ef4444"></i>',
                                    'facebook' => '<i class="fa-brands fa-facebook" style="color:#3b82f6"></i>',
                                    'twitter' => '<i class="fa-brands fa-x-twitter"></i>',
                                    'google_search' => '<i class="fa-solid fa-search" style="color:#3b82f6"></i>',
                                    'google_reviews' => '<i class="fa-solid fa-star" style="color:#eab308"></i>',
                                    'ecommerce' => '<i class="fa-solid fa-cart-shopping" style="color:var(--success)"></i>',
                                    'website_content' => '<i class="fa-solid fa-globe" style="color:#6366f1"></i>',
                                    'expatriates' => '<i class="fa-solid fa-earth-asia" style="color:#0ea5e9"></i>',
                                    'opensooq' => '<i class="fa-solid fa-store" style="color:#f97316"></i>',
                                    'olx' => '<i class="fa-solid fa-tag" style="color:#06b6d4"></i>',
                                    'arabiantalks' => '<i class="fa-solid fa-comments" style="color:#a855f7"></i>',
                                    'dcciinfo' => '<i class="fa-solid fa-building" style="color:#eab308"></i>',
                                    'abcgcc' => '<i class="fa-solid fa-handshake" style="color:var(--success)"></i>',
                                ];
                                $icon = $sourceIcons[$source] ?? '<i class="fa-solid fa-globe"></i>';
                            @endphp
                            <span class="me-2">{!! $icon !!}</span>
                            {{ ucfirst(str_replace('_', ' ', $source)) }}
                        </span>
                        <span class="badge bg-secondary">{{ number_format($count) }}</span>
                    </div>
                @empty
                    <p class="text-muted mb-0">No leads yet</p>
                @endforelse
            </div>
        </div>
    </div>

    {{-- Recent Leads --}}
    <div class="col-md-7 mb-4">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fa-solid fa-clock-rotate-left me-2" style="color:var(--accent)"></i> Recent Leads</h5>
                <a href="{{ route('admin.lead-gen.leads') }}" class="btn btn-sm btn-outline-primary">View All</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Business</th>
                                <th>Source</th>
                                <th>Contact</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentLeads as $lead)
                                <tr>
                                    <td>
                                        <strong>{{ $lead->business_name ?: 'N/A' }}</strong>
                                        @if($lead->website)
                                            <br><small class="text-muted">{{ $lead->website }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        @php
                                            $sourceLabels = [
                                                'google_maps' => ['Google Maps', 'bg-warning'],
                                                'instagram' => ['Instagram', 'bg-danger'],
                                                'tiktok' => ['TikTok', 'bg-secondary'],
                                                'youtube' => ['YouTube', 'bg-danger'],
                                                'facebook' => ['Facebook', 'bg-info'],
                                                'twitter' => ['Twitter/X', 'bg-secondary'],
                                                'google_search' => ['Google Search', 'bg-info'],
                                                'google_reviews' => ['Google Reviews', 'bg-warning'],
                                                'ecommerce' => ['E-Commerce', 'bg-secondary'],
                                                'website_content' => ['Website Crawler', 'bg-secondary'],
                                                'expatriates' => ['Expatriates', 'bg-success'],
                                                'opensooq' => ['OpenSooq', 'bg-secondary'],
                                                'olx' => ['OLX', 'bg-secondary'],
                                                'arabiantalks' => ['ArabianTalks', 'bg-secondary'],
                                                'dcciinfo' => ['DCCI Info', 'bg-secondary'],
                                                'abcgcc' => ['ABC GCC', 'bg-secondary'],
                                            ];
                                            $sl = $sourceLabels[$lead->source] ?? [ucfirst(str_replace('_', ' ', $lead->source)), 'bg-secondary'];
                                        @endphp
                                        <span class="badge {{ $sl[1] }}">{{ $sl[0] }}</span>
                                    </td>
                                    <td>
                                        @if($lead->email)
                                            <small><i class="fa-regular fa-envelope me-1"></i>{{ $lead->email }}</small><br>
                                        @endif
                                        @if($lead->phone)
                                            <small><i class="fa-regular fa-phone me-1"></i>{{ $lead->phone }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge bg-{{ $lead->lead_score >= 70 ? 'success' : ($lead->lead_score >= 30 ? 'warning' : 'secondary') }}">
                                            {{ $lead->lead_score }}
                                        </span>
                                    </td>
                                    <td><span class="badge bg-info">{{ ucfirst($lead->status) }}</span></td>
                                    <td><small class="text-muted">{{ $lead->created_at->format('M d, H:i') }}</small></td>
                                </tr>
                            @empty
                                <tr><td colspan="6" class="text-center text-muted py-4">No leads yet. Generate some!</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
$(document).ready(function() {
    // ─── Service Category Presets ─────────────────────────────
    $('#servicePreset').change(function() {
        var val = $(this).val();
        if (val) { $('#keywordInput').val(val); }
    });

    // ─── Select / Deselect All Platforms ──────────────────────
    $('#selectAllPlatforms').click(function() {
        $('.platform-checkbox').prop('checked', true);
        $('.platform-card').addClass('selected');
    });
    $('#deselectAllPlatforms').click(function() {
        $('.platform-checkbox').prop('checked', false);
        $('.platform-card').removeClass('selected');
    });

    // ─── Quick Generate with AJAX ─────────────────────────────
    $('#quickGenForm').submit(function(e) {
        e.preventDefault();
        var btn = $('#quickGenBtn');
        var resultDiv = $('#quickGenResult');

        var checked = $('.platform-checkbox:checked').length;
        if (checked === 0) {
            showQuickResult('Select at least one platform', 'error');
            return;
        }

        btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...');
        resultDiv.hide();

        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            dataType: 'json',
            data: $(this).serialize(),
            success: function(res) {
                if (res.success) {
                    showQuickResult(res.message, 'success');
                } else {
                    showQuickResult(res.message, 'error');
                }
                setTimeout(function() { location.reload(); }, 2000);
            },
            error: function(xhr) {
                var msg = 'Server error';
                try { var j = JSON.parse(xhr.responseText); msg = j.message || msg; } catch(e) {}
                showQuickResult(msg, 'error');
            },
            complete: function() {
                btn.prop('disabled', false).html('<i class="fa-solid fa-play me-1"></i> Generate Leads Now');
            }
        });
    });

    function showQuickResult(msg, type) {
        var cssVar = type === 'success' ? 'var(--success)' : 'var(--danger)';
        $('#quickGenResult')
            .html('<div class="alert" style="background:'+cssVar+';color:#fff;border:none;border-radius:10px;padding:12px 24px">'+msg+'</div>')
            .show();
        setTimeout(function() { $('#quickGenResult').fadeOut(); }, 5000);
    }
});
</script>
@endsection
