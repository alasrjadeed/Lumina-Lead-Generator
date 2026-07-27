<?php

/**
 * Background lead generation script.
 * Called by the controller via exec(). Reads job config, runs generation, writes status.
 *
 * Usage: php generate_background.php <job_id>
 */

$jobId = $argv[1] ?? null;
if (!$jobId || !preg_match('/^[a-f0-9\-]{36}$/i', $jobId)) {
    fwrite(STDERR, "Invalid job ID\n");
    exit(1);
}

$statusPath = __DIR__ . '/../storage/app/generation_jobs/' . $jobId . '.json';

function writeStatus(string $status, string $message, array $extra = []): void {
    global $statusPath;
    $payload = array_merge([
        'status' => $status,
        'message' => $message,
        'updated_at' => date('c'),
    ], $extra);
    file_put_contents($statusPath, json_encode($payload, JSON_PRETTY_PRINT));
}

// Load Laravel
$autoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoload)) {
    writeStatus('failed', 'Autoloader not found');
    exit(1);
}
require $autoload;

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Read job config from a separate file
$configPath = __DIR__ . '/../storage/app/generation_jobs/' . $jobId . '.config.json';
if (!file_exists($configPath)) {
    writeStatus('failed', 'Job config not found');
    exit(1);
}

$data = json_decode(file_get_contents($configPath), true);
if (!$data) {
    writeStatus('failed', 'Invalid job config');
    exit(1);
}

writeStatus('running', 'Starting generation...');

try {
    $apify = new \App\Services\ApifyLeadService();

    // Bulk generation by category IDs
    if (!empty($data['category_ids'])) {
        $categories = \App\Models\SeoLeadCategory::whereIn('id', $data['category_ids'])->get();
        $totalGenerated = 0;
        $allErrors = [];
        $done = 0;

        foreach ($categories as $category) {
            $done++;
            writeStatus('running', "Processing category {$done}/{$categories->count()}: {$category->category_name}...");
            $results = $apify->generateForCategory($category);
            $totalGenerated += $results['total'] ?? 0;
            if (!empty($results['errors'])) {
                $allErrors = array_merge($allErrors, $results['errors']);
            }
        }

        $msg = "Generated {$totalGenerated} leads across {$categories->count()} categories";
        if (!empty($allErrors)) {
            $msg .= '. Errors: ' . implode('; ', array_slice($allErrors, 0, 5));
        }
        writeStatus('completed', $msg, ['total' => $totalGenerated, 'errors' => $allErrors]);
        exit(0);
    }

    // Single keyword generation
    $keyword = $data['keyword'] ?? '';
    $location = $data['location'] ?? '';
    $platforms = $data['platforms'] ?? ['google_maps'];
    $enrich = $data['enrich'] ?? false;
    $limit = $data['limit'] ?? 30;
    $categoryId = $data['category_id'] ?? null;

    writeStatus('running', "Generating leads for '{$keyword}' across " . count($platforms) . " platform(s)...");

    $results = $apify->quickGenerate(
        $keyword,
        $location,
        $platforms,
        $enrich,
        $limit,
        $categoryId
    );

    $total = $results['total'] ?? 0;
    $enriched = $results['enriched'] ?? 0;
    $errors = $results['errors'] ?? [];

    $msg = "Generated {$total} leads for '{$keyword}'";
    if ($enriched > 0) {
        $msg .= " ({$enriched} enriched)";
    }
    if (!empty($errors)) {
        $msg .= '. Errors: ' . implode('; ', array_slice($errors, 0, 5));
    }

    writeStatus('completed', $msg, [
        'total' => $total,
        'enriched' => $enriched,
        'errors' => $errors,
        'results' => $results,
    ]);

    \Illuminate\Support\Facades\Log::info("Background generation completed: {$msg}");

} catch (\Exception $e) {
    writeStatus('failed', 'Generation failed: ' . $e->getMessage());
    \Illuminate\Support\Facades\Log::error("Background generation failed: " . $e->getMessage());
}
