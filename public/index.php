<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (php_sapi_name() === 'cli') {
    echo "You are running in CLI mode. Laravel requires a web server to function properly.";
    exit(1);
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
);

$response->send();

$kernel->terminate($request, $response);
