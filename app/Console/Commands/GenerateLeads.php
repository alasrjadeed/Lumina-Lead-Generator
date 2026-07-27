<?php

namespace App\Console\Commands;

use App\Models\SeoLeadCategory;
use App\Services\ApifyLeadService;
use Illuminate\Console\Command;

class GenerateLeads extends Command
{
    protected $signature = 'leads:generate
                            {--category= : Generate for a specific category ID}
                            {--limit= : Override max leads per category}';

    protected $description = 'Generate leads from Apify for all active categories';

    public function handle(): int
    {
        $service = new ApifyLeadService();

        if (!$service->hasToken()) {
            $this->warn('Apify API token not configured. Using AI fallback for lead generation.');
            // Continue with AI fallback - don't return failure
        }

        $query = SeoLeadCategory::where('is_active', true);

        if ($categoryId = $this->option('category')) {
            $query->where('id', $categoryId);
        }

        $categories = $query->orderBy('priority')->get();

        if ($categories->isEmpty()) {
            $this->info('No active categories found.');
            return Command::SUCCESS;
        }

        $totalGenerated = 0;
        $totalErrors = 0;

        foreach ($categories as $category) {
            $this->info("Processing: {$category->category_name}...");

            if ($limit = $this->option('limit')) {
                $category->max_leads = (int) $limit;
            }

            try {
                $results = $service->generateForCategory($category);
                $generated = ($results['google_maps'] ?? 0) + ($results['instagram'] ?? 0);
                $totalGenerated += $generated;

                $msg = "  → {$generated} leads";
                if (!empty($results['errors'])) {
                    $msg .= ' (' . implode('; ', $results['errors']) . ')';
                    $totalErrors += count($results['errors']);
                }
                $this->line($msg);
            } catch (\Exception $e) {
                $this->error("  → Error: {$e->getMessage()}");
                $totalErrors++;
            }

            if ($category !== $categories->last()) {
                sleep(2);
            }
        }

        $this->newLine();
        $this->info("Done! Generated {$totalGenerated} leads across {$categories->count()} categories.");

        if ($totalErrors > 0) {
            $this->warn("{$totalErrors} errors encountered.");
        }

        return Command::SUCCESS;
    }
}
