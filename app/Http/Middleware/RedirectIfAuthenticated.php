<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Closure;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated extends RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                return redirect('/admin/lead-gen/dashboard');
            }
        }

        return $next($request);
    }
}
