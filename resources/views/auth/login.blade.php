<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login — Lmina MyAI</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 3rem; width: 100%; max-width: 420px; }
        .login-card h2 { color: #fff; }
        .form-control { background: #0f172a; border: 1px solid #334155; color: #e2e8f0; }
        .form-control:focus { background: #0f172a; border-color: #6366f1; color: #fff; box-shadow: 0 0 0 0.2rem rgba(99,102,241,0.25); }
        .form-label { color: #94a3b8; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; }
        .btn-primary:hover { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="text-center mb-4">
            <i class="fa-solid fa-robot fa-3x text-primary mb-3" style="color: #8b5cf6 !important;"></i>
            <h2>Lmina MyAI</h2>
            <p class="text-muted">Admin Panel</p>
        </div>

        @if($errors->any())
            <div class="alert alert-danger" style="border-radius:10px;">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('admin.login') }}">
            @csrf
            <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" name="email" class="form-control" value="{{ old('email') }}" required autofocus>
            </div>
            <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" name="password" class="form-control" required>
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" name="remember" class="form-check-input" id="remember">
                <label class="form-check-label text-muted" for="remember">Remember me</label>
            </div>
            <button type="submit" class="btn btn-primary w-100 py-2">
                <i class="fa-solid fa-right-to-bracket me-2"></i>Sign In
            </button>
        </form>
    </div>
</body>
</html>
