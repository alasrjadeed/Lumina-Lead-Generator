<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin Panel')</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* ═══════════════════════════════════════════════════════════
           THEME SYSTEM — CSS Variables
        ═══════════════════════════════════════════════════════════ */
        :root, [data-theme="light"] {
            --bg-body: #f1f5f9;
            --bg-sidebar: #ffffff;
            --bg-card: #ffffff;
            --bg-card-alt: #f8fafc;
            --bg-input: #f1f5f9;
            --bg-hover: #f1f5f9;
            --bg-active: #ede9fe;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #94a3b8;
            --text-sidebar: #64748b;
            --text-sidebar-active: #6d28d9;
            --accent: #6d28d9;
            --accent-hover: #5b21b6;
            --accent-light: rgba(109,40,217,0.08);
            --accent-border: rgba(109,40,217,0.2);
            --success: #059669;
            --success-light: rgba(5,150,105,0.1);
            --warning: #d97706;
            --warning-light: rgba(217,119,6,0.1);
            --danger: #dc2626;
            --danger-light: rgba(220,38,38,0.1);
            --info: #2563eb;
            --info-light: rgba(37,99,235,0.1);
            --badge-bg: #e2e8f0;
            --badge-text: #475569;
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
            --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);
            --radius: 12px;
            --radius-sm: 8px;
            --sidebar-w: 260px;
            --checkbox-bg: #f1f5f9;
            --checkbox-border: #e2e8f0;
            --checkbox-active-bg: #ede9fe;
            --checkbox-active-border: #6d28d9;
            --checkbox-active-text: #5b21b6;
        }

        [data-theme="dark"] {
            --bg-body: #0c0f1a;
            --bg-sidebar: #111827;
            --bg-card: #1a1f35;
            --bg-card-alt: #1e2444;
            --bg-input: #0f1629;
            --bg-hover: #1e2444;
            --bg-active: #1e1b4b;
            --border-color: #2a3052;
            --border-light: #1e2444;
            --text-primary: #e8ecf4;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --text-sidebar: #8892ab;
            --text-sidebar-active: #a78bfa;
            --accent: #7c3aed;
            --accent-hover: #6d28d9;
            --accent-light: rgba(124,58,237,0.12);
            --accent-border: rgba(124,58,237,0.3);
            --success: #10b981;
            --success-light: rgba(16,185,129,0.12);
            --warning: #f59e0b;
            --warning-light: rgba(245,158,11,0.12);
            --danger: #ef4444;
            --danger-light: rgba(239,68,68,0.12);
            --info: #3b82f6;
            --info-light: rgba(59,130,246,0.12);
            --badge-bg: #1e2444;
            --badge-text: #94a3b8;
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
            --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
            --checkbox-bg: #1a1f35;
            --checkbox-border: #2a3052;
            --checkbox-active-bg: #1e1b4b;
            --checkbox-active-border: #7c3aed;
            --checkbox-active-text: #a78bfa;
        }

        /* ═══════════════════════════════════════════════════════════
           BASE STYLES
        ═══════════════════════════════════════════════════════════ */
        *, *::before, *::after { box-sizing: border-box; }
        :root { --bs-body-bg: var(--bg-body); --bs-body-color: var(--text-primary); }
        [data-theme="dark"] {
            --bs-body-bg: var(--bg-body); --bs-body-color: var(--text-primary);
            --bs-emphasis-color: var(--text-primary);
            --bs-secondary-color: var(--text-secondary);
            --bs-secondary-bg: var(--bg-card-alt);
            --bs-tertiary-bg: var(--bg-card-alt);
            --bs-light: var(--bg-card-alt);
            --bs-light-rgb: 30, 36, 68;
            --bs-border-color: var(--border-color);
            --bs-link-color: var(--accent);
            --bs-link-hover-color: var(--accent-hover);
            --bs-headings-color: var(--text-primary);
            --bs-emphasis-color: var(--text-primary);
            --bs-secondary-bg: var(--bg-card-alt);
        }

        [data-theme="light"] {
            --bs-body-bg: var(--bg-body); --bs-body-color: var(--text-primary);
            --bs-emphasis-color: var(--text-primary);
            --bs-secondary-color: var(--text-secondary);
            --bs-light: var(--bg-card-alt);
            --bs-border-color: var(--border-color);
            --bs-link-color: var(--accent);
            --bs-link-hover-color: var(--accent-hover);
            --bs-headings-color: var(--text-primary);
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: var(--bg-body) !important;
            color: var(--text-primary) !important;
            margin: 0;
            transition: background 0.3s, color 0.3s;
            -webkit-font-smoothing: antialiased;
        }
        html { background-color: var(--bg-body) !important; }
        a { color: var(--accent); text-decoration: none; }
        a:hover { color: var(--accent-hover); }

        /* ═══════════════════════════════════════════════════════════
           SIDEBAR
        ═══════════════════════════════════════════════════════════ */
        .sidebar {
            background: var(--bg-sidebar);
            border-right: 1px solid var(--border-color);
            height: 100vh;
            width: var(--sidebar-w);
            position: fixed;
            top: 0; left: 0;
            padding: 1.25rem 0.75rem;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            transition: background 0.3s, border-color 0.3s;
            overflow: hidden;
        }
        .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0 0.75rem;
            margin-bottom: 1.5rem;
        }
        .sidebar-brand-icon {
            width: 40px; height: 40px;
            background: linear-gradient(135deg, #7c3aed, #a78bfa);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            color: #fff;
            font-size: 1.1rem;
            flex-shrink: 0;
        }
        .sidebar-brand-text {
            font-weight: 700;
            font-size: 1.1rem;
            color: var(--text-primary);
        }
        .sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; }
        .sidebar-nav-label {
            font-size: 0.68rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-muted);
            padding: 0.75rem 0.75rem 0.4rem;
        }
        .sidebar-nav a {
            color: var(--text-sidebar);
            text-decoration: none;
            padding: 0.6rem 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.65rem;
            border-radius: var(--radius-sm);
            margin-bottom: 2px;
            transition: all 0.15s;
            font-size: 0.88rem;
            font-weight: 500;
        }
        .sidebar-nav a i { width: 18px; text-align: center; font-size: 0.9rem; }
        .sidebar-nav a:hover { background: var(--bg-hover); color: var(--text-primary); }
        .sidebar-nav a.active {
            background: var(--accent-light);
            color: var(--text-sidebar-active);
            font-weight: 600;
        }
        .sidebar-nav a.active i { color: var(--accent); }
        .sidebar-footer {
            border-top: 1px solid var(--border-color);
            padding-top: 0.75rem;
            margin-top: 0.5rem;
            flex-shrink: 0;
        }
        .sidebar-footer a {
            color: var(--text-sidebar);
            text-decoration: none;
            padding: 0.6rem 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.65rem;
            border-radius: var(--radius-sm);
            margin-bottom: 2px;
            transition: all 0.15s;
            font-size: 0.88rem;
            font-weight: 500;
        }
        .sidebar-footer a:hover { background: var(--danger-light); color: var(--danger); }
        .sidebar-footer a i { width: 18px; text-align: center; font-size: 0.9rem; }
        .theme-toggle-btn {
            display: flex; align-items: center; gap: 0.65rem;
            width: 100%;
            padding: 0.6rem 0.75rem;
            border: none;
            background: transparent;
            color: var(--text-sidebar);
            font-size: 0.88rem;
            font-weight: 500;
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all 0.15s;
            font-family: inherit;
        }
        .theme-toggle-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
        .theme-toggle-btn i { width: 18px; text-align: center; font-size: 0.9rem; }
        .theme-toggle-track {
            width: 36px; height: 20px;
            background: var(--border-color);
            border-radius: 10px;
            position: relative;
            margin-left: auto;
            transition: background 0.3s;
        }
        .theme-toggle-track::after {
            content: '';
            width: 16px; height: 16px;
            background: #fff;
            border-radius: 50%;
            position: absolute;
            top: 2px; left: 2px;
            transition: transform 0.3s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        [data-theme="dark"] .theme-toggle-track { background: var(--accent); }
        [data-theme="dark"] .theme-toggle-track::after { transform: translateX(16px); }

        /* ═══════════════════════════════════════════════════════════
           MAIN CONTENT
        ═══════════════════════════════════════════════════════════ */
        .main-content {
            margin-left: var(--sidebar-w);
            padding: 2rem;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* ═══════════════════════════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════════════════════════ */
        @media (max-width: 991px) {
            .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
            .sidebar.show { transform: translateX(0); }
            .main-content { margin-left: 0; padding: 1rem; }
            .mobile-toggle {
                display: flex !important;
                position: fixed; top: 0.75rem; left: 0.75rem; z-index: 1100;
                width: 40px; height: 40px; border-radius: 10px;
                background: var(--bg-sidebar); border: 1px solid var(--border-color);
                align-items: center; justify-content: center;
                color: var(--text-primary); font-size: 1.1rem;
                cursor: pointer; box-shadow: var(--shadow-md);
            }
            .sidebar-overlay {
                display: none; position: fixed; inset: 0;
                background: rgba(0,0,0,0.5); z-index: 999;
            }
            .sidebar-overlay.show { display: block; }
        }
        @media (min-width: 992px) {
            .mobile-toggle, .sidebar-overlay { display: none !important; }
        }
        @media (max-width: 575px) {
            .main-content { padding: 0.75rem; }
            .page-header { flex-direction: column; gap: 0.75rem; align-items: flex-start !important; }
            .page-header .d-flex { flex-wrap: wrap; }
        }

        /* ═══════════════════════════════════════════════════════════
           CARDS
        ═══════════════════════════════════════════════════════════ */
        .card {
            background-color: var(--bg-card) !important;
            border: 1px solid var(--border-color) !important;
            border-radius: var(--radius);
            box-shadow: var(--shadow-sm);
            transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
        .card-header {
            background-color: transparent !important;
            border-bottom: 1px solid var(--border-color) !important;
            padding: 1rem 1.25rem;
        }
        .card-header h5,
        .card-header h6 { color: var(--text-primary); }
        .card-body { color: var(--text-primary); }

        /* ═══════════════════════════════════════════════════════════
           FORMS
        ═══════════════════════════════════════════════════════════ */
        .form-label {
            font-weight: 500;
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin-bottom: 0.35rem;
        }
        .form-control, .form-select {
            background-color: var(--bg-input) !important;
            border: 1px solid var(--border-color) !important;
            color: var(--text-primary) !important;
            border-radius: var(--radius-sm);
            padding: 0.55rem 0.75rem;
            transition: all 0.2s;
        }
        .form-control:focus, .form-select:focus {
            background-color: var(--bg-input) !important;
            border-color: var(--accent) !important;
            box-shadow: 0 0 0 3px var(--accent-light) !important;
            color: var(--text-primary) !important;
        }
        .form-control::placeholder { color: var(--text-muted); }
        .form-select option { background-color: var(--bg-card) !important; color: var(--text-primary) !important; }
        .form-text { color: var(--text-muted) !important; }
        .input-group-text {
            background-color: var(--bg-card-alt) !important;
            border-color: var(--border-color) !important;
            color: var(--text-muted) !important;
        }
        .form-check-input:checked { background-color: var(--accent) !important; border-color: var(--accent) !important; }
        .form-check-input:focus { box-shadow: 0 0 0 3px var(--accent-light) !important; }
        .form-switch .form-check-input { width: 2.5em; height: 1.35em; }

        /* ═══════════════════════════════════════════════════════════
           PLATFORM CHECKBOX CARDS
        ═══════════════════════════════════════════════════════════ */
        .platform-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 0.6rem;
        }
        .platform-card {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.65rem 0.85rem;
            background: var(--checkbox-bg);
            border: 2px solid var(--checkbox-border);
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all 0.2s;
            user-select: none;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-secondary);
        }
        .platform-card:hover {
            border-color: var(--accent-border);
            background: var(--bg-hover);
        }
        .platform-card input[type="checkbox"] {
            display: none;
        }
        .platform-card .pc-check {
            width: 18px; height: 18px;
            border: 2px solid var(--border-color);
            border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            transition: all 0.2s;
        }
        .platform-card .pc-check i {
            font-size: 0.65rem;
            color: transparent;
            transition: color 0.2s;
        }
        .platform-card .pc-icon {
            width: 28px; height: 28px;
            border-radius: 6px;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.85rem;
            flex-shrink: 0;
        }
        .platform-card.selected {
            border-color: var(--checkbox-active-border);
            background: var(--checkbox-active-bg);
            color: var(--checkbox-active-text);
        }
        .platform-card.selected .pc-check {
            background: var(--accent);
            border-color: var(--accent);
        }
        .platform-card.selected .pc-check i { color: #fff; }
        .pc-icon.google_maps { background: rgba(234,179,8,0.12); color: #eab308; }
        .pc-icon.instagram { background: linear-gradient(135deg, rgba(236,72,153,0.12), rgba(168,85,247,0.12)); color: #ec4899; }
        .pc-icon.tiktok { background: rgba(0,0,0,0.08); color: var(--text-primary); }
        .pc-icon.youtube { background: rgba(239,68,68,0.12); color: #ef4444; }
        .pc-icon.facebook { background: rgba(59,130,246,0.12); color: #3b82f6; }
        .pc-icon.twitter { background: rgba(107,114,128,0.12); color: #6b7280; }
        .pc-icon.google_search { background: rgba(59,130,246,0.12); color: #3b82f6; }
        .pc-icon.google_reviews { background: rgba(234,179,8,0.12); color: #eab308; }
        .pc-icon.ecommerce { background: rgba(16,185,129,0.12); color: #10b981; }
        .pc-icon.website_content { background: rgba(99,102,241,0.12); color: #6366f1; }
        .pc-icon.expatriates { background: rgba(14,165,233,0.12); color: #0ea5e9; }
        .pc-icon.opensooq { background: rgba(249,115,22,0.12); color: #f97316; }
        .pc-icon.olx { background: rgba(6,182,212,0.12); color: #06b6d4; }
        .pc-icon.arabiantalks { background: rgba(168,85,247,0.12); color: #a855f7; }
        .pc-icon.dcciinfo { background: rgba(234,179,8,0.12); color: #eab308; }
        .pc-icon.abcgcc { background: rgba(16,185,129,0.12); color: #10b981; }

        /* ═══════════════════════════════════════════════════════════
           BUTTONS
        ═══════════════════════════════════════════════════════════ */
        .btn-primary {
            background: var(--accent);
            border-color: var(--accent);
            color: #fff;
            border-radius: var(--radius-sm);
            font-weight: 600;
            padding: 0.55rem 1.25rem;
            transition: all 0.2s;
        }
        .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .btn-outline-primary {
            color: var(--accent);
            border-color: var(--accent-border);
            background: transparent;
            border-radius: var(--radius-sm);
            font-weight: 600;
        }
        .btn-outline-primary:hover { background: var(--accent-light); border-color: var(--accent); color: var(--accent-hover); }
        .btn-outline-secondary {
            color: var(--text-secondary);
            border-color: var(--border-color);
            border-radius: var(--radius-sm);
        }
        .btn-outline-secondary:hover { background: var(--bg-hover); border-color: var(--text-muted); color: var(--text-primary); }
        .btn-success {
            background: var(--success);
            border-color: var(--success);
            border-radius: var(--radius-sm);
            font-weight: 600;
        }
        .btn-outline-success {
            color: var(--success);
            border-color: var(--success);
            border-radius: var(--radius-sm);
            font-weight: 600;
        }
        .btn-outline-success:hover { background: var(--success-light); color: var(--success); }
        .btn-outline-info {
            color: var(--info);
            border-color: var(--info);
            border-radius: var(--radius-sm);
            font-weight: 600;
        }
        .btn-outline-info:hover { background: var(--info-light); color: var(--info); }
        .btn-danger { background: var(--danger); border-color: var(--danger); border-radius: var(--radius-sm); }
        .btn-warning { background: var(--warning); border-color: var(--warning); border-radius: var(--radius-sm); }

        /* ═══════════════════════════════════════════════════════════
           TABLES
        ═══════════════════════════════════════════════════════════ */
        .table { color: var(--text-primary); }
        .table thead th {
            background-color: var(--bg-card-alt) !important;
            color: var(--text-secondary) !important;
            font-weight: 600;
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            border-bottom: 1px solid var(--border-color) !important;
            padding: 0.75rem;
        }
        .table tbody td {
            border-bottom: 1px solid var(--border-light) !important;
            padding: 0.75rem;
            vertical-align: middle;
        }
        .table-hover tbody tr:hover { background-color: var(--bg-hover) !important; }

        /* ═══════════════════════════════════════════════════════════
           BADGES
        ═══════════════════════════════════════════════════════════ */
        .badge {
            font-weight: 600;
            font-size: 0.75rem;
            padding: 0.35em 0.65em;
            border-radius: 6px;
        }
        .badge.bg-secondary { background: var(--badge-bg) !important; color: var(--badge-text) !important; }
        .badge.bg-primary { background: var(--accent) !important; color: #fff !important; }
        .badge.bg-success { background: var(--success) !important; color: #fff !important; }
        .badge.bg-danger { background: var(--danger) !important; color: #fff !important; }
        .badge.bg-warning { background: var(--warning) !important; color: #fff !important; }
        .badge.bg-info { background: var(--info) !important; color: #fff !important; }

        /* ═══════════════════════════════════════════════════════════
           ALERTS
        ═══════════════════════════════════════════════════════════ */
        .alert-success { background-color: var(--success-light) !important; color: var(--success) !important; border: 1px solid rgba(16,185,129,0.2) !important; border-radius: var(--radius-sm); }
        .alert-danger { background-color: var(--danger-light) !important; color: var(--danger) !important; border: 1px solid rgba(239,68,68,0.2) !important; border-radius: var(--radius-sm); }
        .alert-warning { background-color: var(--warning-light) !important; color: var(--warning) !important; border: 1px solid rgba(245,158,11,0.2) !important; border-radius: var(--radius-sm); }
        .alert-info { background-color: var(--info-light) !important; color: var(--info) !important; border: 1px solid rgba(59,130,246,0.2) !important; border-radius: var(--radius-sm); }

        /* ═══════════════════════════════════════════════════════════
           DROPDOWN
        ═══════════════════════════════════════════════════════════ */
        .dropdown-menu {
            background-color: var(--bg-card) !important;
            border: 1px solid var(--border-color) !important;
            box-shadow: var(--shadow-lg);
            border-radius: var(--radius-sm);
        }
        .dropdown-item { color: var(--text-secondary) !important; padding: 0.5rem 1rem; font-size: 0.88rem; }
        .dropdown-item:hover { background-color: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .dropdown-menu-dark { background-color: var(--bg-card) !important; border-color: var(--border-color) !important; }

        /* ═══════════════════════════════════════════════════════════
           STAT CARDS
        ═══════════════════════════════════════════════════════════ */
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 1.25rem;
            transition: all 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .stat-card .stat-icon {
            width: 48px; height: 48px;
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.2rem;
        }
        .stat-card .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
        .stat-card .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }

        /* ═══════════════════════════════════════════════════════════
           MISC
        ═══════════════════════════════════════════════════════════ */
        h2, h3, h4, h5, h6 { color: var(--text-primary); }
        .text-muted { color: var(--text-muted) !important; }
        hr { border-color: var(--border-color); opacity: 0.5; }
        .page-header h2 { font-weight: 700; font-size: 1.5rem; }
        .page-header p { font-size: 0.88rem; }
        ::selection { background: var(--accent); color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
        .btn-close { filter: invert(1); }
        .form-check { display: flex; align-items: center; gap: 0.4rem; }
        .form-check-label { color: var(--text-secondary); cursor: pointer; }

        /* Bootstrap Utility Overrides — use body selector to beat Bootstrap's !important */
        body .bg-body-secondary, body .bg-light, body .bg-body-tertiary, body .bg-white {
            background-color: var(--bg-card-alt) !important;
            color: var(--text-primary) !important;
        }
        body .text-body-secondary, body .text-body, body .text-muted, body .text-secondary, body .text-gray, body .text-dark, body .text-body-emphasis, body .text-black-50, body .text-black-75, body .text-dark-emphasis {
            color: var(--text-secondary) !important;
        }
        body h1, body h2, body h3, body h4, body h5, body h6, body .h1, body .h2, body .h3, body .h4, body .h5, body .h6, body strong, body b, body .fw-bold {
            color: var(--text-primary) !important;
        }
        .modal-backdrop { background-color: rgba(0,0,0,0.6) !important; }
        .tooltip-inner { background-color: var(--bg-card) !important; color: var(--text-primary) !important; border: 1px solid var(--border-color); }
        .popover { background-color: var(--bg-card) !important; border-color: var(--border-color) !important; }
        .popover-header { background-color: var(--bg-card-alt) !important; border-color: var(--border-color) !important; color: var(--text-primary) !important; }
        .popover-body { color: var(--text-primary) !important; }
        .offcanvas { background-color: var(--bg-sidebar) !important; color: var(--text-primary) !important; }

        /* List Group */
        .list-group-item {
            background-color: var(--bg-card) !important;
            color: var(--text-secondary) !important;
            border-color: var(--border-color) !important;
        }
        .list-group-item:hover { background-color: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .list-group-item.active { background-color: var(--accent) !important; border-color: var(--accent) !important; color: #fff !important; }

        /* Table Striped */
        .table-striped > tbody > tr:nth-of-type(odd) > * { background-color: var(--bg-card-alt) !important; color: var(--text-primary) !important; }
        .table-striped > tbody > tr:nth-of-type(even) > * { background-color: var(--bg-card) !important; color: var(--text-primary) !important; }

        /* Code */
        code {
            background-color: var(--bg-input) !important;
            color: var(--accent) !important;
            border: 1px solid var(--border-color) !important;
        }

        /* Pagination container (Laravel default) */
        .pagination { margin-bottom: 0; }
        .pagination .page-link { background-color: var(--bg-card) !important; color: var(--text-secondary) !important; border-color: var(--border-color) !important; }
        .pagination .page-link:hover { background-color: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .pagination .page-item.active .page-link { background-color: var(--accent) !important; border-color: var(--accent) !important; color: #fff !important; }
        .pagination .page-item.disabled .page-link { background-color: var(--bg-card-alt) !important; color: var(--text-muted) !important; opacity: 0.5; }

        /* Breadcrumb */
        .breadcrumb { background-color: transparent !important; }
        .breadcrumb-item a { color: var(--accent); }
        .breadcrumb-item.active { color: var(--text-muted); }

        /* Accordion */
        .accordion-item { background-color: var(--bg-card) !important; border-color: var(--border-color) !important; }
        .accordion-button { background-color: var(--bg-card) !important; color: var(--text-primary) !important; }
        .accordion-button:not(.collapsed) { background-color: var(--accent-light) !important; color: var(--accent) !important; }
        .accordion-button::after { filter: none; }
        .accordion-body { background-color: var(--bg-card) !important; color: var(--text-primary) !important; }

        @yield('head')
    </style>
</head>
<body>
    <div class="mobile-toggle" onclick="document.querySelector('.sidebar').classList.toggle('show');document.querySelector('.sidebar-overlay').classList.toggle('show');">
        <i class="fa-solid fa-bars"></i>
    </div>
    <div class="sidebar-overlay" onclick="document.querySelector('.sidebar').classList.remove('show');this.classList.remove('show');"></div>
    <div class="sidebar">
        <div class="sidebar-brand">
            <div class="sidebar-brand-icon"><i class="fa-solid fa-robot"></i></div>
            <div class="sidebar-brand-text">Lmina MyAI</div>
        </div>
        <nav class="sidebar-nav">
            <div class="sidebar-nav-label">Main</div>
            <a href="{{ route('admin.lead-gen.dashboard') }}" class="{{ request()->routeIs('admin.lead-gen.dashboard') ? 'active' : '' }}">
                <i class="fa-solid fa-gauge-high"></i> Dashboard
            </a>
            <a href="{{ route('admin.lead-gen.leads') }}" class="{{ request()->routeIs('admin.lead-gen.leads*') ? 'active' : '' }}">
                <i class="fa-solid fa-users"></i> Leads
            </a>
            <a href="{{ route('admin.lead-gen.categories') }}" class="{{ request()->routeIs('admin.lead-gen.categories*') ? 'active' : '' }}">
                <i class="fa-solid fa-tags"></i> Categories
            </a>
            <div class="sidebar-nav-label">System</div>
            <a href="{{ route('admin.settings') }}" class="{{ request()->routeIs('admin.settings*') ? 'active' : '' }}">
                <i class="fa-solid fa-gear"></i> Settings
            </a>
        </nav>
        <div class="sidebar-footer">
            <button class="theme-toggle-btn" onclick="toggleTheme()">
                <i class="fa-solid fa-circle-half-stroke"></i>
                <span>Appearance</span>
                <div class="theme-toggle-track"></div>
            </button>
            <a href="{{ route('admin.logout') }}">
                <i class="fa-solid fa-right-from-bracket"></i> Logout
            </a>
        </div>
    </div>

    <div class="main-content">
        @yield('content')
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script>
        // ─── Theme Toggle ──────────────────────────────────────────
        function toggleTheme() {
            var html = document.documentElement;
            var current = html.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('lmina-theme', next);
        }
        (function() {
            var saved = localStorage.getItem('lmina-theme');
            if (saved) document.documentElement.setAttribute('data-theme', saved);
        })();

        // ─── Platform Card Toggle ──────────────────────────────────
        $(document).on('click', '.platform-card', function() {
            var cb = $(this).find('input[type="checkbox"]');
            cb.prop('checked', !cb.prop('checked'));
            $(this).toggleClass('selected', cb.prop('checked'));
        });
        // Init on load
        $(function() {
            $('.platform-card input[type="checkbox"]').each(function() {
                if ($(this).prop('checked')) $(this).closest('.platform-card').addClass('selected');
            });
        });
    </script>
    @yield('scripts')
</body>
</html>
