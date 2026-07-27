@extends('admin.layout')

@section('content')
<div class="page-header d-flex justify-content-between align-items-center">
    <div>
        <h2><i class="fa-brands fa-whatsapp me-2"></i> WhatsApp Import History</h2>
        <p class="text-muted mb-0">{{ $histories->total() }} imports</p>
    </div>
    <div>
        <a href="{{ route('admin.lead-gen.leads') }}" class="btn btn-outline-secondary">Back to Leads</a>
    </div>
</div>

<div class="card mt-3">
    <div class="card-body table-responsive">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Group Name</th>
                    <th>Importer</th>
                    <th>Imported</th>
                    <th>Skipped</th>
                    <th>Sample</th>
                    <th>Errors</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach($histories as $h)
                    <tr>
                        <td>{{ $h->id }}</td>
                        <td>{{ $h->group_name }}</td>
                        <td>{{ optional($h->importer)->name ?? ($h->importer_id ? 'User#'.$h->importer_id : 'System') }}</td>
                        <td>{{ $h->imported_count }}</td>
                        <td>{{ $h->skipped_count }}</td>
                        <td>
                            @if(is_array($h->sample_rows))
                                @foreach($h->sample_rows as $s)
                                    <div class="small text-monospace">{{ $s }}</div>
                                @endforeach
                            @endif
                        </td>
                        <td>
                            @if(is_array($h->errors) && count($h->errors))
                                <ul class="small mb-0">
                                    @foreach($h->errors as $err)
                                        <li>{{ $err }}</li>
                                    @endforeach
                                </ul>
                            @endif
                        </td>
                        <td>{{ $h->created_at->format('Y-m-d H:i') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="d-flex justify-content-center">
            {{ $histories->links() }}
        </div>
    </div>
</div>

@endsection
