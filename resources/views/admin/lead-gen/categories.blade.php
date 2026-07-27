@extends('admin.layout')

@section('content')
<div class="page-header d-flex justify-content-between align-items-center">
    <div>
        <h2><i class="fa-solid fa-tags me-2"></i> Lead Categories</h2>
        <p class="text-muted mb-0">Manage business categories for automated lead generation</p>
    </div>
    <div>
        <a href="{{ route('admin.lead-gen.dashboard') }}" class="btn btn-outline-primary me-2">
            <i class="fa-solid fa-gauge me-1"></i> Dashboard
        </a>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCategoryModal">
            <i class="fa-solid fa-plus me-1"></i> Add Category
        </button>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show">{{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

{{-- Stats Row --}}
<div class="row mb-4">
    <div class="col-md-4 mb-3">
        <div class="stat-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="stat-label">Total Categories</div>
                    <div class="stat-value">{{ $stats['total'] }}</div>
                </div>
                <div class="stat-icon" style="background:var(--accent-light);color:var(--accent);">
                    <i class="fa-solid fa-folder-open"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="stat-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="stat-label">Active</div>
                    <div class="stat-value">{{ $stats['active'] }}</div>
                </div>
                <div class="stat-icon" style="background:var(--success-light);color:var(--success);">
                    <i class="fa-solid fa-check-circle"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="stat-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="stat-label">Leads (30 days)</div>
                    <div class="stat-value">{{ number_format($stats['leads30d']) }}</div>
                </div>
                <div class="stat-icon" style="background:var(--warning-light);color:var(--warning);">
                    <i class="fa-solid fa-chart-line"></i>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Categories Table --}}
<div class="card">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover mb-0" id="categoriesTable">
                <thead>
                    <tr>
                        <th style="width:40px"><input type="checkbox" id="selectAll"></th>
                        <th>Priority</th>
                        <th>Category</th>
                        <th>Keywords</th>
                        <th>Location</th>
                        <th>Platforms</th>
                        <th>Max</th>
                        <th>Active</th>
                        <th>Enrich</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($categories as $cat)
                        <tr>
                            <td><input type="checkbox" class="category-checkbox" value="{{ $cat->id }}"></td>
                            <td><span class="badge bg-secondary">{{ $cat->priority }}</span></td>
                            <td>
                                <strong>{{ $cat->category_name }}</strong>
                                @if($cat->target_audience)
                                    <br><small class="text-muted">{{ \Illuminate\Support\Str::limit($cat->target_audience, 50) }}</small>
                                @endif
                            </td>
                            <td>
                                @foreach(array_slice(explode(',', $cat->keywords ?? ''), 0, 3) as $kw)
                                    <span class="badge bg-primary me-1">{{ trim($kw) }}</span>
                                @endforeach
                                @if(count(explode(',', $cat->keywords ?? '')) > 3)
                                    <span class="badge bg-secondary">+{{ count(explode(',', $cat->keywords)) - 3 }}</span>
                                @endif
                            </td>
                            <td>{{ $cat->location ?: 'Worldwide' }}</td>
                            <td>
                                @if(in_array('google_maps', $cat->platforms ?? []))
                                    <i class="fa-brands fa-google text-warning me-1" title="Google Maps"></i>
                                @endif
                                @if(in_array('instagram', $cat->platforms ?? []))
                                    <i class="fa-brands fa-instagram text-danger me-1" title="Instagram"></i>
                                @endif
                                @if(in_array('linkedin', $cat->platforms ?? []))
                                    <i class="fa-brands fa-linkedin text-info" title="LinkedIn"></i>
                                @endif
                            </td>
                            <td>{{ $cat->max_leads }}</td>
                            <td>
                                <div class="form-check form-switch">
                                    <input class="form-check-input toggle-status" type="checkbox"
                                           data-id="{{ $cat->id }}"
                                           {{ $cat->is_active ? 'checked' : '' }}>
                                </div>
                            </td>
                            <td>
                                @if($cat->auto_enrich)
                                    <span class="badge bg-success"><i class="fa-solid fa-brain me-1"></i>On</span>
                                @else
                                    <span class="badge bg-secondary">Off</span>
                                @endif
                            </td>
                            <td>
                                <a href="{{ route('admin.lead-gen.leads', ['category_id' => $cat->id]) }}"
                                   class="btn btn-sm btn-outline-info me-1" title="View Leads">
                                    <i class="fa-solid fa-eye"></i>
                                </a>
                                <button class="btn btn-sm btn-outline-primary edit-category me-1"
                                        data-id="{{ $cat->id }}"
                                        data-name="{{ $cat->category_name }}"
                                        data-keywords="{{ $cat->keywords }}"
                                        data-location="{{ $cat->location }}"
                                        data-platforms="{{ json_encode($cat->platforms) }}"
                                        data-max-leads="{{ $cat->max_leads }}"
                                        data-priority="{{ $cat->priority }}"
                                        data-auto-enrich="{{ $cat->auto_enrich ? '1' : '0' }}"
                                        data-min-score="{{ $cat->min_score_threshold }}"
                                        data-target-audience="{{ $cat->target_audience }}"
                                        data-notes="{{ $cat->notes }}"
                                        title="Edit">
                                    <i class="fa-solid fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-category me-1"
                                        data-id="{{ $cat->id }}"
                                        data-name="{{ $cat->category_name }}"
                                        title="Delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-success generate-now"
                                        data-id="{{ $cat->id }}"
                                        title="Generate Leads Now">
                                    <i class="fa-solid fa-play"></i>
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="10" class="text-center text-muted py-4">No categories yet</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- Bulk Actions --}}
<div class="mt-3 d-flex gap-2">
    <button class="btn btn-sm btn-danger" id="bulkDeleteBtn" disabled>
        <i class="fa-solid fa-trash me-1"></i> Delete Selected
    </button>
    <button class="btn btn-sm btn-success" id="bulkGenerateBtn" disabled>
        <i class="fa-solid fa-play me-1"></i> Generate Leads
    </button>
</div>

{{-- Add Category Modal --}}
<div class="modal fade" id="addCategoryModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content ">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa-solid fa-plus-circle me-2"></i> Add Category</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST" action="{{ route('admin.lead-gen.categories.store') }}">
                @csrf
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Category Name *</label>
                            <input type="text" class="form-control" name="category_name" required placeholder="e.g., E-commerce Stores">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Priority</label>
                            <input type="number" class="form-control" name="priority" value="5" min="1" max="10">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Keywords (comma-separated) *</label>
                        <textarea class="form-control" name="keywords" rows="2" required placeholder="seo agency, digital marketing, web design"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Target Location</label>
                        <input type="text" class="form-control" name="location" placeholder="e.g., New York, USA (leave empty for worldwide)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Platforms</label>
                        <div class="row">
                            @foreach($platforms as $key => $label)
                            <div class="col-md-4 col-lg-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="platforms[]"
                                           value="{{ $key }}"{{ in_array($key, ['google_maps','instagram']) ? ' checked' : '' }}
                                           id="create_platform_{{ $key }}">
                                    <label class="form-check-label" for="create_platform_{{ $key }}">
                                        @php
                                            $icons = ['google_maps'=>'fa-map-pin','instagram'=>'fa-instagram','tiktok'=>'fa-tiktok','youtube'=>'fa-youtube','facebook'=>'fa-facebook','twitter'=>'fa-x-twitter','google_search'=>'fa-search','google_reviews'=>'fa-star','ecommerce'=>'fa-cart-shopping'];
                                        @endphp
                                        <i class="fa-brands {{ $icons[$key] ?? 'fa-globe' }} me-1"></i> {{ $label }}
                                    </label>
                                </div>
                            </div>
                            @endforeach
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Max Leads per Run</label>
                            <input type="number" class="form-control" name="max_leads" value="50" min="10" max="500">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Min Score Threshold</label>
                            <input type="number" class="form-control" name="min_score_threshold" value="0" min="0" max="100">
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="auto_enrich" value="1">
                            <label class="form-check-label">Auto-Enrich with AI</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Target Audience / ICP</label>
                        <textarea class="form-control" name="target_audience" rows="2" placeholder="e.g., Small to medium businesses needing SEO"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Notes</label>
                        <textarea class="form-control" name="notes" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Category</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- Edit Category Modal --}}
<div class="modal fade" id="editCategoryModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content ">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa-solid fa-edit me-2"></i> Edit Category</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST" action="" id="editCategoryForm">
                @csrf
                @method('POST')
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Category Name *</label>
                            <input type="text" class="form-control" name="category_name" id="edit_name" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Priority</label>
                            <input type="number" class="form-control" name="priority" id="edit_priority" min="1" max="10">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Keywords *</label>
                        <textarea class="form-control" name="keywords" id="edit_keywords" rows="2" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-control" name="location" id="edit_location">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Platforms</label>
                        <div class="row">
                            @foreach($platforms as $key => $label)
                            <div class="col-md-4 col-lg-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="platforms[]"
                                           value="{{ $key }}" id="edit_platform_{{ $key }}">
                                    <label class="form-check-label" for="edit_platform_{{ $key }}">
                                        @php
                                            $icons = ['google_maps'=>'fa-map-pin','instagram'=>'fa-instagram','tiktok'=>'fa-tiktok','youtube'=>'fa-youtube','facebook'=>'fa-facebook','twitter'=>'fa-x-twitter','google_search'=>'fa-search','google_reviews'=>'fa-star','ecommerce'=>'fa-cart-shopping'];
                                        @endphp
                                        <i class="fa-brands {{ $icons[$key] ?? 'fa-globe' }} me-1"></i> {{ $label }}
                                    </label>
                                </div>
                            </div>
                            @endforeach
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Max Leads</label>
                            <input type="number" class="form-control" name="max_leads" id="edit_max_leads" min="10" max="500">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Min Score</label>
                            <input type="number" class="form-control" name="min_score_threshold" id="edit_min_score" min="0" max="100">
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="auto_enrich" value="1" id="edit_auto_enrich">
                            <label class="form-check-label">Auto-Enrich with AI</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Target Audience</label>
                        <textarea class="form-control" name="target_audience" id="edit_target_audience" rows="2"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Notes</label>
                        <textarea class="form-control" name="notes" id="edit_notes" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Category</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- Hidden form for delete --}}
<form method="POST" id="deleteForm" style="display:none">
    @csrf
    @method('DELETE')
</form>
@endsection

@section('scripts')
<script>
$(document).ready(function() {
    @if($categories->count() > 5)
        $('#categoriesTable').DataTable({
            pageLength: 25,
            order: [[1, 'asc']],
            language: { search: "Search:", lengthMenu: "_MENU_" }
        });
    @endif

    $('#selectAll').change(function() {
        $('.category-checkbox').prop('checked', $(this).prop('checked'));
        updateBulkButtons();
    });

    $(document).on('change', '.category-checkbox', updateBulkButtons);

    function updateBulkButtons() {
        var checked = $('.category-checkbox:checked').length;
        $('#bulkDeleteBtn, #bulkGenerateBtn').prop('disabled', checked === 0);
    }

    // Toggle status
    $(document).on('change', '.toggle-status', function() {
        var id = $(this).data('id');
        $.post('{{ url('/admin/lead-gen/categories/toggle') }}/' + id, {
            _token: '{{ csrf_token() }}'
        }, function(res) {
            if (res.success) showToast('Status updated', 'success');
        });
    });

    // Edit category
    $(document).on('click', '.edit-category', function() {
        var btn = $(this);
        $('#edit_name').val(btn.data('name'));
        $('#edit_keywords').val(btn.data('keywords'));
        $('#edit_location').val(btn.data('location'));
        $('#edit_max_leads').val(btn.data('max-leads'));
        $('#edit_priority').val(btn.data('priority'));
        $('#edit_min_score').val(btn.data('min-score'));
        $('#edit_target_audience').val(btn.data('target-audience'));
        $('#edit_notes').val(btn.data('notes'));
        $('#edit_auto_enrich').prop('checked', btn.data('auto-enrich') == '1');

        var platforms = btn.data('platforms') || [];
        if (typeof platforms === 'string') platforms = JSON.parse(platforms);
        $('[id^="edit_platform_"]').prop('checked', false);
        platforms.forEach(function(p) {
            $('#edit_platform_' + p).prop('checked', true);
        });

        $('#editCategoryForm').attr('action', '{{ url('/admin/lead-gen/categories/update') }}/' + btn.data('id'));
        $('#editCategoryModal').modal('show');
    });

    // Delete category
    $(document).on('click', '.delete-category', function() {
        var id = $(this).data('id');
        var name = $(this).data('name');
        if (confirm('Delete "' + name + '"?')) {
            $('#deleteForm').attr('action', '{{ url('/admin/lead-gen/categories') }}/' + id);
            $('#deleteForm').submit();
        }
    });

    // Generate now
    $(document).on('click', '.generate-now', function() {
        var btn = $(this);
        var id = $(this).data('id');
        if (!confirm('Generate leads for this category?')) return;
        btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i>');
        $.ajax('{{ route('admin.lead-gen.generate') }}', {
            method: 'POST',
            dataType: 'json',
            data: { _token: '{{ csrf_token() }}', category_id: id }
        }).done(function(res) {
            if (res.success) {
                showToast(res.message, 'success');
            } else {
                showToast(res.message, 'error');
            }
        }).fail(function(xhr) {
            var msg = 'Server error';
            try { var j = JSON.parse(xhr.responseText); msg = j.message || msg; } catch(e) {}
            showToast(msg, 'error');
        }).always(function() {
            btn.prop('disabled', false).html('<i class="fa-solid fa-play"></i>');
        });
    });

    // Bulk delete
    $('#bulkDeleteBtn').click(function() {
        var ids = [];
        $('.category-checkbox:checked').each(function() { ids.push($(this).val()); });
        if (ids.length === 0) return;
        if (!confirm('Delete ' + ids.length + ' categories?')) return;
        $.post('{{ url('/admin/lead-gen/bulk-delete') }}', {
            _token: '{{ csrf_token() }}', ids: ids
        }, function() { location.reload(); });
    });

    // Bulk generate
    $('#bulkGenerateBtn').click(function() {
        var ids = [];
        $('.category-checkbox:checked').each(function() { ids.push($(this).val()); });
        if (ids.length === 0) return;
        $(this).prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...');
        $.ajax('{{ route('admin.lead-gen.bulk-generate') }}', {
            method: 'POST',
            dataType: 'json',
            data: { _token: '{{ csrf_token() }}', category_ids: ids }
        }).done(function(res) {
            if (res.success) {
                showToast(res.message, 'success');
            } else {
                showToast(res.message, 'error');
            }
        }).fail(function(xhr) {
            var msg = 'Server error';
            try { var j = JSON.parse(xhr.responseText); msg = j.message || msg; } catch(e) {}
            showToast(msg, 'error');
        }).always(function() {
            $('#bulkGenerateBtn').prop('disabled', false).html('<i class="fa-solid fa-play me-1"></i> Generate Leads');
        });
    });

    function showToast(msg, type) {
        var bg = type === 'success' ? '#10b981' : '#ef4444';
        var html = '<div class="alert" style="position:fixed;top:20px;right:20px;z-index:9999;background:'+bg+';color:#fff;border:none;border-radius:10px;padding:12px 24px">'+msg+'</div>';
        var el = $(html).appendTo('body');
        setTimeout(function() { el.fadeOut(function() { el.remove(); }); }, 3000);
    }
});
</script>
@endsection
