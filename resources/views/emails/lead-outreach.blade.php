<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $businessName ?? 'Your Company' }}</title>
</head>
<body style="margin:0;padding:0;background-color:#e9eef3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#e9eef3;padding:30px 10px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:28px;">
<tr><td style="padding:32px 32px 20px;text-align:left;border-bottom:1px solid #f0f2f5;">
<p style="font-size:24px;font-weight:800;color:#1f2e3a;margin:0 0 2px;letter-spacing:-0.3px;">{{ $businessName ?? 'Your Company' }}</p>
<p style="color:#5b6f82;font-size:14px;font-weight:500;margin:0;">{{ $tagline ?? 'Your tagline here' }}</p>
</td></tr>

<tr><td style="padding:32px 32px 24px;">
<div style="color:#334e68;font-size:16px;line-height:1.8;">
{!! nl2br(e($emailMessageBody)) !!}
</div>
<hr style="margin:32px 0 0;border:none;height:1px;background:linear-gradient(to right,#e2e8f0,transparent);">
</td></tr>

<tr><td style="background:#fafcff;padding:32px 32px 28px;border-top:1px solid #eef2f8;text-align:left;">

<!-- Sender Block -->
<p style="font-weight:800;font-size:18px;color:#0a1c2a;text-align:left;margin:0 0 2px;letter-spacing:-0.2px;">{{ $senderName ?? 'Your Name' }}</p>
<p style="font-size:13px;font-weight:500;color:#5f7f9a;text-align:left;margin:0 0 2px;text-transform:uppercase;letter-spacing:1px;">{{ $senderTitle ?? 'Your Title' }}</p>
<p style="font-weight:600;color:#1e3b4a;text-align:left;margin:0;font-size:15px;">{{ $businessName ?? 'Your Company' }}</p>

<!-- Contact Details -->
<table cellpadding="0" cellspacing="0" align="center" style="background:#ffffff;border-radius:24px;border:1px solid #ecf3fa;padding:20px;margin:20px 0 16px;">
<tr><td style="text-align:center;">
<p style="font-size:14px;color:#1f3a4b;margin:0 0 10px;">
<a href="mailto:{{ $senderEmail ?? 'email@example.com' }}" style="color:#1f3a4b;text-decoration:none;">{{ $senderEmail ?? 'email@example.com' }}</a>
</p>
<p style="font-size:14px;color:#1f3a4b;margin:0 0 10px;">
<a href="tel:{{ $senderPhone ?? '+1234567890' }}" style="color:#1f3a4b;text-decoration:none;">{{ $senderPhone ?? '+1 234 567 890' }}</a>
</p>
<p style="font-size:14px;color:#4f6f8f;text-align:center;line-height:1.5;margin:0;">
{{ $businessName ?? 'Your Company' }}<br>
{{ $businessAddress ?? 'Your Business Address' }}
</p>
<p style="text-align:center;margin:14px 0 0;">
<a href="{{ $businessWebsite ?? '#' }}" target="_blank" style="color:#1f6e8c;font-weight:600;text-decoration:none;font-size:15px;">{{ $businessWebsite ?? 'www.yourcompany.com' }}</a>
</p>
</td></tr>
</table>

<p style="font-size:12px;color:#8ca3b9;text-align:center;margin:28px 0 0;padding-top:22px;border-top:1px solid #eef3fc;">&copy; {{ date('Y') }} {{ $businessName ?? 'Your Company' }} &bull; All rights reserved</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
