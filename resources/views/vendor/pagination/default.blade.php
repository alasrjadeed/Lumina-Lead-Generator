@if ($paginator->hasPages())
    <nav role="navigation" aria-label="{{ __('Pagination Navigation') }}">
        {{-- Mobile: Previous / Next --}}
        <div class="d-flex d-sm-none justify-content-between mb-3">
            @if ($paginator->onFirstPage())
                <span class="page-link disabled">{{ __('pagination.previous') }}</span>
            @else
                <a href="{{ $paginator->previousPageUrl() }}" class="page-link">{{ __('pagination.previous') }}</a>
            @endif
            @if ($paginator->hasMorePages())
                <a href="{{ $paginator->nextPageUrl() }}" class="page-link">{{ __('pagination.next') }}</a>
            @else
                <span class="page-link disabled">{{ __('pagination.next') }}</span>
            @endif
        </div>

        {{-- Desktop --}}
        <div class="d-none d-sm-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0" style="color:var(--text-secondary);font-size:14px;">
                    {!! __('Showing') !!}
                    @if ($paginator->firstItem())
                        <strong>{{ $paginator->firstItem() }}</strong>
                        {!! __('to') !!}
                        <strong>{{ $paginator->lastItem() }}</strong>
                    @else
                        {{ $paginator->count() }}
                    @endif
                    {!! __('of') !!}
                    <strong>{{ $paginator->total() }}</strong>
                    {!! __('results') !!}
                </p>
            </div>
            <div>
                <ul class="pagination pagination-sm mb-0">
                    {{-- Previous --}}
                    @if ($paginator->onFirstPage())
                        <li class="page-item disabled"><span class="page-link">&laquo;</span></li>
                    @else
                        <li class="page-item"><a class="page-link" href="{{ $paginator->previousPageUrl() }}">&laquo;</a></li>
                    @endif

                    {{-- Pages --}}
                    @foreach ($elements as $element)
                        @if (is_string($element))
                            <li class="page-item disabled"><span class="page-link">{{ $element }}</span></li>
                        @endif
                        @if (is_array($element))
                            @foreach ($element as $page => $url)
                                @if ($page == $paginator->currentPage())
                                    <li class="page-item active" aria-current="page"><span class="page-link">{{ $page }}</span></li>
                                @else
                                    <li class="page-item"><a class="page-link" href="{{ $url }}">{{ $page }}</a></li>
                                @endif
                            @endforeach
                        @endif
                    @endforeach

                    {{-- Next --}}
                    @if ($paginator->hasMorePages())
                        <li class="page-item"><a class="page-link" href="{{ $paginator->nextPageUrl() }}">&raquo;</a></li>
                    @else
                        <li class="page-item disabled"><span class="page-link">&raquo;</span></li>
                    @endif
                </ul>
            </div>
        </div>
    </nav>
@endif
