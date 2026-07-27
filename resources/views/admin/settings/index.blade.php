@extends('admin.layout')
@section('title', 'Settings - Lmina MyAI')

@section('head')
<style>
    .settings-group { margin-bottom: 2rem; }
    .settings-group .card-header { cursor: pointer; user-select: none; transition: background 0.2s; }
    .settings-group .card-header:hover { background: var(--bg-hover); }
    .password-toggle { cursor: pointer; }
    .password-toggle:hover { color: var(--accent); }
    .group-icon {
        width: 40px; height: 40px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
    }
    .group-icon.ai { background: rgba(139,92,246,0.12); color: #a78bfa; }
    .group-icon.scraping { background: rgba(34,197,94,0.12); color: #4ade80; }
    .group-icon.whatsapp { background: rgba(37,211,102,0.12); color: #25d366; }
    .group-icon.google { background: rgba(239,68,68,0.12); color: #f87171; }
    .group-icon.social { background: rgba(59,130,246,0.12); color: #60a5fa; }
    .group-icon.infra { background: rgba(234,179,8,0.12); color: #facc15; }
    .save-bar {
        position: fixed; bottom: 0; left: var(--sidebar-w); right: 0;
        background: var(--bg-sidebar); border-top: 1px solid var(--border-color);
        padding: 1rem 2rem; z-index: 100;
        display: flex; justify-content: space-between; align-items: center;
        box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
    }
    @media (max-width: 991px) {
        .save-bar { left: 0; padding: 0.75rem 1rem; }
    }
    .save-bar .status { font-size: 0.85rem; color: var(--success); opacity: 0; transition: opacity 0.3s; }
    .save-bar .status.show { opacity: 1; }
    .badge-count {
        background: var(--badge-bg); color: var(--badge-text);
        font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; margin-left: 8px;
    }
    .collapsed .fa-chevron-down { transform: rotate(-90deg); }
    .fa-chevron-down { transition: transform 0.2s; }
</style>
@endsection

@section('content')
<div style="padding-bottom: 80px;">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h4 class="mb-1"><i class="fa-solid fa-gear me-2"></i>Settings</h4>
            <small class="text-muted">Manage API keys, features, and configuration</small>
        </div>
        <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="showAll()">
                <i class="fa-solid fa-expand me-1"></i>Expand All
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="hideAll()">
                <i class="fa-solid fa-compress me-1"></i>Collapse All
            </button>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fa-solid fa-check-circle me-2"></i>{{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <form id="settingsForm" action="{{ route('admin.settings.update') }}" method="POST">
        @csrf
        @method('PUT')

        @foreach($groups as $groupKey => $group)
        <div class="settings-group">
            <div class="card">
                <div class="card-header d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#group-{{ $groupKey }}">
                    @php
                        $iconClass = match($groupKey) {
                            'ai_models' => 'ai',
                            'scraping' => 'scraping',
                            'whatsapp' => 'whatsapp',
                            'google' => 'google',
                            'social' => 'social',
                            default => 'infra',
                        };
                    @endphp
                    <div class="group-icon {{ $iconClass }} me-3">
                        <i class="fa-solid {{ $group['icon'] }}"></i>
                    </div>
                    <div class="flex-grow-1">
                        <strong class="text-white">{{ $group['label'] }}</strong>
                        <br><small class="text-muted">{{ $group['description'] }}</small>
                    </div>
                    <span class="badge-count">{{ count($group['settings']) }} keys</span>
                    <i class="fa-solid fa-chevron-down ms-2 text-muted"></i>
                </div>
                <div id="group-{{ $groupKey }}" class="collapse {{ $loop->first ? 'show' : '' }}">
                    <div class="card-body">
                        @if(($group['type'] ?? '') === 'email_config')
                        <div class="alert alert-info mb-3">
                            <i class="fa-solid fa-lightbulb me-2"></i>
                            <strong>Quick Setup:</strong> Select a provider above to auto-fill SMTP settings. For Gmail, generate an <a href="https://myaccount.google.com/apppasswords" target="_blank" class="fw-bold">App Password</a> (don't use your regular password).
                        </div>
                        @endif
                        <div class="row g-3">
                            @foreach($group['settings'] as $setting)
                            <div class="col-md-6">
                                <label class="form-label" for="{{ $setting['key'] }}">{{ $setting['label'] }}</label>
                                @if(isset($setting['description']))
                                <div class="form-text text-muted mb-1" style="font-size: 0.75rem;">{{ $setting['description'] }}</div>
                                @endif
                                @if($setting['type'] === 'select')
                                <select class="form-select" id="{{ $setting['key'] }}" name="{{ $setting['key'] }}"
                                    @if($setting['key'] === 'smtp_provider') onchange="applyProvider(this.value)" @endif
                                    @if($setting['key'] === 'mail_driver') onchange="toggleMailDriver(this.value)" @endif>
                                    @foreach($setting['options'] as $optVal => $optLabel)
                                    <option value="{{ $optVal }}" {{ ($settings[$setting['key']] ?? '') === $optVal ? 'selected' : '' }}>{{ $optLabel }}</option>
                                    @endforeach
                                </select>
                                @elseif($setting['type'] === 'password')
                                <div class="input-group">
                                    <input type="password" class="form-control" id="{{ $setting['key'] }}" name="{{ $setting['key'] }}" value="{{ $settings[$setting['key']] ?? '' }}" placeholder="{{ $setting['placeholder'] ?? '••••••••' }}">
                                    <span class="input-group-text password-toggle" onclick="togglePassword('{{ $setting['key'] }}')">
                                        <i class="fa-solid fa-eye" id="icon-{{ $setting['key'] }}"></i>
                                    </span>
                                </div>
                                @else
                                <input type="text" class="form-control" id="{{ $setting['key'] }}" name="{{ $setting['key'] }}" value="{{ $settings[$setting['key']] ?? '' }}" placeholder="{{ $setting['placeholder'] ?? '' }}">
                                @endif
                            </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @endforeach
    </form>
</div>

<div class="save-bar">
    <div>
        <span class="status" id="saveStatus"><i class="fa-solid fa-check me-1"></i>Saved!</span>
    </div>
    <div class="d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="resetForm()">
            <i class="fa-solid fa-rotate-left me-1"></i>Reset
        </button>
        <button type="submit" form="settingsForm" class="btn btn-sm btn-primary" id="saveBtn" style="background:var(--accent);border-color:var(--accent);">
            <i class="fa-solid fa-save me-1"></i>Save All Settings
        </button>
    </div>
</div>
@endsection

@section('scripts')
<script>
    const PROVIDERS = {
        gmail:   { host: 'smtp.gmail.com', port: '587', encryption: 'tls' },
        yahoo:   { host: 'smtp.mail.yahoo.com', port: '587', encryption: 'tls' },
        outlook: { host: 'smtp.office365.com', port: '587', encryption: 'tls' },
        custom:  { host: '', port: '587', encryption: 'tls' },
    };

    function applyProvider(provider) {
        const p = PROVIDERS[provider];
        if (!p) return;
        document.getElementById('smtp_host').value = p.host;
        document.getElementById('smtp_port').value = p.port;
        document.getElementById('smtp_encryption').value = p.encryption;
    }

    function toggleMailDriver(driver) {
        const smtpFields = ['smtp_provider', 'smtp_host', 'smtp_port', 'smtp_encryption', 'smtp_username', 'smtp_password'];
        smtpFields.forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                const wrapper = el.closest('.col-md-6');
                if (wrapper) wrapper.style.opacity = driver === 'log' ? '0.4' : '1';
                el.disabled = driver === 'log';
            }
        });
    }

    function togglePassword(key) {
        const input = document.getElementById(key);
        const icon = document.getElementById('icon-' + key);
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    function showAll() {
        document.querySelectorAll('.collapse').forEach(el => el.classList.add('show'));
    }

    function hideAll() {
        document.querySelectorAll('.collapse').forEach(el => el.classList.remove('show'));
    }

    function resetForm() {
        if (confirm('Reset all changes?')) location.reload();
    }

    // Init mail driver state on load
    document.addEventListener('DOMContentLoaded', function() {
        const driver = document.getElementById('mail_driver');
        if (driver) toggleMailDriver(driver.value);
    });

    document.getElementById('settingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = document.getElementById('saveBtn');
        const status = document.getElementById('saveStatus');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i>Saving...';

        fetch(this.action, {
            method: 'POST',
            body: new FormData(this),
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(r => r.json())
        .then(data => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save me-1"></i>Save All Settings';
            if (data.success) {
                status.classList.add('show');
                setTimeout(() => status.classList.remove('show'), 3000);
            } else {
                alert('Error saving settings');
            }
        })
        .catch(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-save me-1"></i>Save All Settings';
            this.submit();
        });
    });
</script>
@endsection
