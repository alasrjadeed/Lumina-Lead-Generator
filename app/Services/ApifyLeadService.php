<?php

namespace App\Services;

use App\Models\SeoLead;
use App\Models\SeoLeadCategory;
use App\Traits\DecryptsSettings;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApifyLeadService
{
    use DecryptsSettings;

    protected array $settings = [];
    protected array $apiTokens = [];
    protected int $currentTokenIndex = 0;
    protected array $exhaustedTokens = [];

    protected array $actorMap = [
        'google_maps' => 'compass~crawler-google-places',
        'instagram' => 'apify~instagram-scraper',
        'tiktok' => 'clockworks~tiktok-scraper',
        'youtube' => 'streamers~youtube-scraper',
        'facebook' => 'apify~facebook-posts-scraper',
        'twitter' => 'apidojo~tweet-scraper',
        'google_search' => 'apify~google-search-scraper',
        'google_reviews' => 'compass~Google-Maps-Reviews-Scraper',
        'ecommerce' => 'apify~e-commerce-scraping-tool',
        'website_content' => 'vaclavrut~website-content-crawler',
    ];

    public function __construct()
    {
        $this->settings = $this->getDecryptedSettings();
        $this->apiTokens = array_filter([
            $this->settings['apify_api_token'] ?? '',
            $this->settings['apify_api_token_2'] ?? '',
        ]);
    }

    public function hasToken(): bool
    {
        return !empty($this->apiTokens);
    }

    protected function getCurrentToken(): string
    {
        $available = array_diff($this->apiTokens, $this->exhaustedTokens);
        if (empty($available)) {
            $this->exhaustedTokens = [];
            $available = $this->apiTokens;
        }
        return reset($available);
    }

    protected function markTokenExhausted(string $token): void
    {
        $this->exhaustedTokens[] = $token;
        Log::warning('ApifyLeadService: Token exhausted — ' . $this->tokenPreview($token) . ' (will fallback to next)');
    }

    protected function tokenPreview(string $token): string
    {
        return strlen($token) > 8
            ? substr($token, 0, 4) . '...' . substr($token, -4)
            : '(invalid)';
    }

    protected function isRateLimitOrQuotaError(int $httpCode, string $response): bool
    {
        if (in_array($httpCode, [429, 402, 403])) return true;
        $lower = strtolower($response);
        return str_contains($lower, 'rate limit')
            || str_contains($lower, 'quota')
            || str_contains($lower, 'credit')
            || str_contains($lower, 'billing')
            || str_contains($lower, 'too many requests')
            || str_contains($lower, 'maximum usage');
    }

    public function getAvailablePlatforms(): array
    {
        return [
            'google_maps' => 'Google Maps',
            'instagram' => 'Instagram',
            'tiktok' => 'TikTok',
            'youtube' => 'YouTube',
            'facebook' => 'Facebook',
            'twitter' => 'Twitter / X',
            'google_search' => 'Google Search',
            'google_reviews' => 'Google Maps Reviews',
            'ecommerce' => 'E-Commerce',
            'website_content' => 'Website Content Crawler',
            'expatriates' => 'Expatriates.com',
            'opensooq' => 'OpenSooq',
            'olx' => 'OLX / Dubizzle',
            'arabiantalks' => 'Arabian Talks',
            'dcciinfo' => 'DCCI Info',
            'abcgcc' => 'ABC GCC',
        ];
    }

    public function getActorId(string $platform): ?string
    {
        return $this->actorMap[$platform] ?? null;
    }

    protected function runActor(string $actorId, array $input): array
    {
        if (!$this->hasToken()) {
            Log::warning('ApifyLeadService: No API token configured');
            return [];
        }

        $maxAttempts = count($this->apiTokens);
        $this->exhaustedTokens = [];

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            $token = $this->getCurrentToken();
            $tokenLabel = $this->tokenPreview($token);

            // Start async run
            $run = $this->apifyPost("/v2/acts/{$actorId}/runs", $input, $token);
            if (empty($run)) {
                $this->markTokenExhausted($token);
                continue;
            }
            if (empty($run['data']['id'])) {
                // Check if error response indicates rate limit
                $errorStr = json_encode($run);
                if ($this->isRateLimitOrQuotaError(0, $errorStr)) {
                    $this->markTokenExhausted($token);
                    continue;
                }
                return [];
            }

            $runId = $run['data']['id'];
            $maxWait = 90;
            $pollInterval = 3;
            $waited = 0;

            while ($waited < $maxWait) {
                sleep($pollInterval);
                $waited += $pollInterval;

                $status = $this->apifyGet("/v2/acts/{$actorId}/runs/{$runId}", $token);
                if (empty($status) || empty($status['data'])) {
                    break;
                }

                $state = $status['data']['status'] ?? '';

                if ($state === 'SUCCEEDED') {
                    $datasetId = $status['data']['defaultDatasetId'] ?? '';
                    if (!empty($datasetId)) {
                        $dataset = $this->apifyGet("/v2/datasets/{$datasetId}/items", $token);
                        return is_array($dataset) ? $dataset : [];
                    }
                    return [];
                }

                if (in_array($state, ['FAILED', 'ABORTED', 'TIMED-OUT'])) {
                    Log::warning("ApifyLeadService: Run {$runId} for {$actorId} ended with status {$state} [token: {$tokenLabel}]");
                    return [];
                }
            }

            // Timed out — abort
            $this->apifyPost("/v2/acts/{$actorId}/runs/{$runId}/abort", [], $token);
            Log::warning("ApifyLeadService: Run {$runId} for {$actorId} timed out after {$maxWait}s [token: {$tokenLabel}]");
            $this->markTokenExhausted($token);
        }

        Log::error("ApifyLeadService: All {$maxAttempts} tokens exhausted for {$actorId}");
        return [];
    }

    protected function apifyPost(string $path, array $data, string $token): array
    {
        $url = "https://api.apify.com{$path}?token={$token}";
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        $tokenLabel = $this->tokenPreview($token);

        if ($error) {
            Log::error("ApifyLeadService: POST {$path} cURL error [{$tokenLabel}]: {$error}");
            return [];
        }

        if ($this->isRateLimitOrQuotaError($httpCode, $response)) {
            Log::warning("ApifyLeadService: POST {$path} rate limit/quota HTTP {$httpCode} [{$tokenLabel}]");
            $this->markTokenExhausted($token);
            return [];
        }

        if (!in_array($httpCode, [200, 201], true)) {
            $truncated = mb_substr($response, 0, 300);
            Log::error("ApifyLeadService: POST {$path} HTTP {$httpCode} [{$tokenLabel}]: {$truncated}");
            return [];
        }
        return json_decode($response, true) ?? [];
    }

    protected function apifyGet(string $path, string $token): array
    {
        $url = "https://api.apify.com{$path}?token={$token}";
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        $tokenLabel = $this->tokenPreview($token);

        if ($error) {
            Log::error("ApifyLeadService: GET {$path} cURL error [{$tokenLabel}]: {$error}");
            return [];
        }

        if ($this->isRateLimitOrQuotaError($httpCode, $response)) {
            Log::warning("ApifyLeadService: GET {$path} rate limit/quota HTTP {$httpCode} [{$tokenLabel}]");
            $this->markTokenExhausted($token);
            return [];
        }

        if ($httpCode !== 200) {
            $truncated = mb_substr($response, 0, 300);
            Log::error("ApifyLeadService: GET {$path} HTTP {$httpCode} [{$tokenLabel}]: {$truncated}");
            return [];
        }
        return json_decode($response, true) ?? [];
    }

    // ─── Platform-specific fetch methods ─────────────────────────

    public function fetchGoogleMapsLeads(string $query, string $location, int $limit = 30): array
    {
        $input = [
            'searchStringsArray' => [$query],
            'locationQuery' => $location,
            'maxCrawledPlacesPerSearch' => min($limit, 5),
            'language' => 'en',
            'maxReviews' => 0,
            'scrapeSocialMediaProfiles' => [
                'facebooks' => false, 'instagrams' => false,
                'youtubes' => false, 'tiktoks' => false, 'twitters' => false,
            ],
            'maximumLeadsEnrichmentRecords' => 0,
        ];

        $results = $this->runActor('compass~crawler-google-places', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            $leads[] = [
                'source' => 'google_maps',
                'business_name' => $item['title'] ?? '',
                'email' => $item['email'] ?? '',
                'phone' => $item['phoneUnformatted'] ?? $item['phone'] ?? '',
                'website' => $item['website'] ?? '',
                'address' => $item['address'] ?? '',
                'city' => $item['city'] ?? '',
                'country' => $item['countryCode'] ?? '',
                'category' => $item['categoryName'] ?? '',
                'rating' => $item['totalScore'] ?? null,
                'reviews_count' => $item['reviewsCount'] ?? 0,
                'social_facebook' => $item['facebookUrl'] ?? '',
                'social_instagram' => $item['instagramUrl'] ?? '',
                'social_tiktok' => $item['tiktokUrl'] ?? '',
                'social_youtube' => $item['youtubeUrl'] ?? '',
                'social_twitter' => $item['twitterUrl'] ?? '',
                'lead_score' => $item['totalScore'] ? round($item['totalScore'] * 20) : 50,
                'notes' => json_encode(['google_maps_data' => $item]),
            ];
        }
        return $leads;
    }

    public function fetchTikTokLeads(string $keyword, int $limit = 10): array
    {
        $input = [
            'search' => $keyword,
            'searchType' => 'hashtag',
            'resultsLimit' => $limit,
        ];

        $results = $this->runActor('clockworks~tiktok-scraper', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            $username = $item['authorMeta']['name'] ?? $item['author'] ?? '';

            $leads[] = [
                'source' => 'tiktok',
                'business_name' => $item['authorMeta']['nickName'] ?? $username,
                'contact_person' => $username,
                'social_tiktok' => "https://tiktok.com/@{$username}",
                'platform_profile_name' => $username,
                'followers_count' => $item['authorMeta']['fans'] ?? $item['stats']['followerCount'] ?? 0,
                'engagement_count' => ($item['stats']['diggCount'] ?? 0) + ($item['stats']['commentCount'] ?? 0),
                'last_post_content' => $item['text'] ?? $item['desc'] ?? '',
                'lead_score' => 50,
                'notes' => json_encode(['tiktok_data' => [
                    'username' => $username,
                    'caption' => $item['text'] ?? '',
                    'hashtags' => $item['hashtags'] ?? [],
                    'likes' => $item['stats']['diggCount'] ?? 0,
                    'comments' => $item['stats']['commentCount'] ?? 0,
                    'shares' => $item['stats']['shareCount'] ?? 0,
                ]]),
            ];
        }
        return $this->deduplicate($leads, 'social_tiktok');
    }

    public function fetchYouTubeLeads(string $keyword, int $limit = 10): array
    {
        $input = [
            'searchKeywords' => [$keyword],
            'maxResults' => $limit,
            'extractChannelStats' => true,
        ];

        $results = $this->runActor('streamers~youtube-scraper', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            $channelName = $item['channelName'] ?? $item['channel']['name'] ?? '';
            $channelId = $item['channelId'] ?? $item['channel']['id'] ?? '';

            $leads[] = [
                'source' => 'youtube',
                'business_name' => $item['title'] ?? $channelName,
                'contact_person' => $channelName,
                'social_youtube' => $channelId ? "https://youtube.com/channel/{$channelId}" : "https://youtube.com/@{$channelName}",
                'platform_profile_name' => $channelName,
                'followers_count' => $item['channel']['subscriberCount'] ?? $item['subscriberCount'] ?? 0,
                'engagement_count' => $item['viewCount'] ?? 0,
                'last_post_content' => $item['description'] ?? '',
                'lead_score' => 50,
                'notes' => json_encode(['youtube_data' => [
                    'channel' => $channelName,
                    'title' => $item['title'] ?? '',
                    'views' => $item['viewCount'] ?? 0,
                    'likes' => $item['likeCount'] ?? 0,
                    'comments' => $item['commentCount'] ?? 0,
                ]]),
            ];
        }
        return $this->deduplicate($leads, 'social_youtube');
    }

    public function fetchTwitterLeads(string $keyword, int $limit = 10): array
    {
        $input = [
            'searchTerms' => [$keyword],
            'maxItems' => $limit,
            'sort' => 'Top',
        ];

        $results = $this->runActor('apidojo~tweet-scraper', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            $username = $item['user']['screen_name'] ?? $item['user']['username'] ?? '';

            $leads[] = [
                'source' => 'twitter',
                'business_name' => $item['user']['name'] ?? $username,
                'contact_person' => $username,
                'email' => $item['user']['email'] ?? '',
                'social_twitter' => "https://x.com/{$username}",
                'platform_profile_name' => $username,
                'followers_count' => $item['user']['followers_count'] ?? 0,
                'engagement_count' => ($item['retweet_count'] ?? 0) + ($item['favorite_count'] ?? 0),
                'last_post_content' => $item['full_text'] ?? $item['text'] ?? '',
                'lead_score' => 50,
                'notes' => json_encode(['twitter_data' => [
                    'username' => $username,
                    'bio' => $item['user']['description'] ?? '',
                    'tweet' => $item['full_text'] ?? '',
                    'retweets' => $item['retweet_count'] ?? 0,
                    'likes' => $item['favorite_count'] ?? 0,
                ]]),
            ];
        }
        return $this->deduplicate($leads, 'social_twitter');
    }

    public function fetchFacebookLeads(string $keyword, int $limit = 10): array
    {
        $input = [
            'searchPages' => [$keyword],
            'resultsLimit' => $limit,
            'scrapePosts' => true,
            'postDateLimit' => 30,
        ];

        $results = $this->runActor('apify~facebook-posts-scraper', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            $pageName = $item['page']['name'] ?? $item['pageName'] ?? '';
            $pageUrl = $item['page']['url'] ?? $item['pageUrl'] ?? '';

            $leads[] = [
                'source' => 'facebook',
                'business_name' => $pageName,
                'contact_person' => $pageName,
                'social_facebook' => $pageUrl ?: "https://facebook.com/{$pageName}",
                'platform_profile_name' => $pageName,
                'followers_count' => $item['page']['followers'] ?? $item['page']['likes'] ?? 0,
                'engagement_count' => ($item['likesCount'] ?? 0) + ($item['commentsCount'] ?? 0) + ($item['sharesCount'] ?? 0),
                'last_post_content' => $item['message'] ?? $item['text'] ?? '',
                'lead_score' => 50,
                'notes' => json_encode(['facebook_data' => [
                    'page' => $pageName,
                    'category' => $item['page']['category'] ?? '',
                    'message' => $item['message'] ?? '',
                    'likes' => $item['likesCount'] ?? 0,
                    'comments' => $item['commentsCount'] ?? 0,
                    'shares' => $item['sharesCount'] ?? 0,
                ]]),
            ];
        }
        return $this->deduplicate($leads, 'social_facebook');
    }

    public function fetchGoogleSearchLeads(string $query, string $location = '', int $limit = 10): array
    {
        $input = [
            'queries' => [$query],
            'maxPagesPerQuery' => 1,
            'resultsPerPage' => $limit,
            'countryCode' => $location ?: 'BH',
            'languageCode' => 'en',
        ];

        $results = $this->runActor('apify~google-search-scraper', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            foreach ($item['organicResults'] ?? [$item] as $result) {
                $link = $result['url'] ?? $result['link'] ?? '';
                if (empty($link) || $this->isSearchEngineUrl($link)) continue;

                $parsed = parse_url($link);
                $domain = $parsed['host'] ?? '';
                $domain = preg_replace('/^www\./', '', $domain);

                $leads[] = [
                    'source' => 'google_search',
                    'business_name' => $result['title'] ?? $domain,
                    'website' => $link,
                    'category' => $result['description'] ?? '',
                    'lead_score' => 60,
                    'notes' => json_encode(['google_search_data' => $result]),
                ];
            }
        }
        return $this->deduplicate($leads, 'website');
    }

    public function fetchGoogleMapsReviews(string $query, string $location = '', int $limit = 20): array
    {
        $input = [
            'searchStringsArray' => [$query],
            'locationQuery' => $location,
            'maxCrawledPlacesPerSearch' => min(3, $limit),
            'maxReviewsPerPlace' => $limit,
            'maxReviewsPerPlace' => $limit,
            'language' => 'en',
        ];

        $results = $this->runActor('compass~Google-Maps-Reviews-Scraper', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            foreach ($item['reviews'] ?? [] as $review) {
                $reviewerName = $review['reviewerName'] ?? $review['name'] ?? '';
                if (empty($reviewerName)) continue;

                $leads[] = [
                    'source' => 'google_reviews',
                    'business_name' => "{$reviewerName} (reviewed {$item['title']})",
                    'contact_person' => $reviewerName,
                    'rating' => $review['stars'] ?? $review['rating'] ?? null,
                    'last_post_content' => $review['text'] ?? $review['reviewText'] ?? '',
                    'lead_score' => ($review['stars'] ?? 3) * 20,
                    'notes' => json_encode(['google_review_data' => [
                        'place' => $item['title'] ?? '',
                        'reviewer' => $reviewerName,
                        'rating' => $review['stars'] ?? null,
                        'text' => $review['text'] ?? '',
                        'date' => $review['publishedDate'] ?? $review['date'] ?? '',
                    ]]),
                ];
            }
        }
        return $leads;
    }

    public function fetchEcommerceLeads(string $query, int $limit = 10): array
    {
        $input = [
            'searchTerms' => [$query],
            'maxItems' => $limit,
        ];

        $results = $this->runActor('apify~e-commerce-scraping-tool', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            $store = $item['store'] ?? $item['merchant'] ?? '';
            $product = $item['title'] ?? $item['name'] ?? '';

            $leads[] = [
                'source' => 'ecommerce',
                'business_name' => $store ?: $product,
                'website' => $item['url'] ?? $item['productUrl'] ?? '',
                'lead_score' => 50,
                'notes' => json_encode(['ecommerce_data' => [
                    'product' => $product,
                    'store' => $store,
                    'price' => $item['price'] ?? '',
                    'currency' => $item['currency'] ?? '',
                ]]),
            ];
        }
        return $this->deduplicate($leads, 'website');
    }

    public function fetchInstagramLeads(array $keywords, int $limit = 10): array
    {
        if (empty($keywords)) return [];

        $keyword = $keywords[0];

        $input = [
            'search' => $keyword,
            'searchType' => 'hashtag',
            'searchLimit' => 3,
            'resultsType' => 'posts',
            'resultsLimit' => $limit,
        ];

        $results = $this->runActor('apify~instagram-scraper', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            $username = $item['ownerUsername'] ?? '';
            if (empty($username)) continue;

            $leads[] = [
                'source' => 'instagram',
                'business_name' => $item['ownerFullName'] ?? $username,
                'contact_person' => $item['ownerFullName'] ?? '',
                'social_instagram' => "https://instagram.com/{$username}",
                'platform_profile_name' => $username,
                'followers_count' => $item['ownerFollowersCount'] ?? 0,
                'engagement_count' => ($item['likesCount'] ?? 0) + ($item['commentsCount'] ?? 0),
                'last_post_content' => $item['caption'] ?? '',
                'lead_score' => 50,
                'notes' => json_encode(['instagram_data' => [
                    'username' => $username,
                    'caption' => $item['caption'] ?? '',
                    'hashtags' => $item['hashtags'] ?? [],
                    'likes' => $item['likesCount'] ?? 0,
                    'comments' => $item['commentsCount'] ?? 0,
                ]]),
            ];
        }
        return $this->deduplicate($leads, 'social_instagram');
    }

    // ─── Website Content Crawler ──────────────────────────────────

    public function fetchWebsiteContent(string $url, int $limit = 10): array
    {
        $input = [
            'startUrls' => [['url' => $url]],
            'maxPagesPerStartUrl' => 1,
            'maxCrawlPages' => $limit,
        ];

        $results = $this->runActor('vaclavrut~website-content-crawler', $input);
        if (empty($results)) return [];

        $leads = [];
        foreach ($results as $item) {
            $text = $item['text'] ?? $item['content'] ?? '';
            if (empty($text)) continue;

            $leads[] = [
                'source' => 'website_content',
                'business_name' => $item['title'] ?? parse_url($url, PHP_URL_HOST) ?? '',
                'website' => $item['url'] ?? $url,
                'last_post_content' => mb_substr(strip_tags($text), 0, 500),
                'lead_score' => 50,
                'notes' => json_encode(['crawled_url' => $item['url'] ?? $url]),
            ];
        }
        return $leads;
    }

    // ─── Classifieds & Business Directory Scrapers ────────────────

    public function fetchExpatriatesLeads(string $keyword, string $location = '', int $limit = 20): array
    {
        $category = urlencode(strtolower($keyword));
        $loc = strtolower($location ?: 'bahrain');

        $url = "https://www.expatriates.com/classifieds/{$loc}/{$category}/";
        $html = $this->fetchUrl($url);

        if (empty($html)) return [];

        $leads = [];
        preg_match_all('/<a[^>]*class="[^"]*listing-title[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/si', $html, $links);

        if (empty($links[1])) {
            preg_match_all('/<h3[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>.*?<\/h3>/si', $html, $links);
        }

        if (empty($links[1])) {
            preg_match_all('/<a[^>]*href="(\/[^"]*)"[^>]*class="[^"]*"[^>]*>([^<]{3,})<\/a>/si', $html, $links);
        }

        foreach (array_slice($links[1], 0, $limit) as $i => $href) {
            $name = strip_tags(trim($links[2][$i] ?? ''));
            if (empty($name) || strlen($name) < 3) continue;

            $fullUrl = strpos($href, 'http') === 0 ? $href : "https://www.expatriates.com{$href}";

            $leads[] = [
                'source' => 'expatriates',
                'business_name' => $name,
                'website' => $fullUrl,
                'category' => $keyword,
                'country' => $location ?: 'Bahrain',
                'lead_score' => 50,
                'notes' => json_encode(['classified_url' => $fullUrl, 'source' => 'expatriates']),
            ];
        }

        return $this->deduplicate($leads, 'website');
    }

    public function fetchOpenSooqLeads(string $keyword, string $location = '', int $limit = 20): array
    {
        $loc = strtolower($location ?: 'bahrain');
        $query = urlencode($keyword);
        $url = "https://{$loc}.opensooq.com/en/search?q={$query}";

        $html = $this->fetchUrl($url);
        if (empty($html)) return [];

        $leads = [];
        preg_match_all('/<div[^>]*class="[^"]*post-card[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>.*?<\/div>/si', $html, $posts);

        if (empty($posts[1])) {
            preg_match_all('/<a[^>]*class="[^"]*title[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/si', $html, $posts);
        }

        if (empty($posts[1])) {
            preg_match_all('/<a[^>]*href="(\/[^"]+)"[^>]*class="[^"]*post[^"]*"[^>]*>([^<]{3,})<\/a>/si', $html, $posts);
        }

        foreach (array_slice($posts[1], 0, $limit) as $i => $href) {
            $name = strip_tags(trim($posts[2][$i] ?? ''));
            if (empty($name) || strlen($name) < 3) continue;

            $fullUrl = strpos($href, 'http') === 0 ? $href : "https://{$loc}.opensooq.com{$href}";

            $leads[] = [
                'source' => 'opensooq',
                'business_name' => $name,
                'website' => $fullUrl,
                'category' => $keyword,
                'country' => $location ?: 'Bahrain',
                'lead_score' => 50,
                'notes' => json_encode(['classified_url' => $fullUrl, 'source' => 'opensooq']),
            ];
        }

        return $this->deduplicate($leads, 'website');
    }

    public function fetchOlxLeads(string $keyword, string $location = '', int $limit = 20): array
    {
        $locMap = ['bahrain' => 'bahrain', 'saudi' => 'riyadh', 'uae' => 'dubai', 'qatar' => 'qatar', 'oman' => 'oman', 'kuwait' => 'kuwait'];
        $locKey = strtolower($location ?: 'bahrain');
        $subdomain = $locMap[$locKey] ?? 'bahrain';

        $query = urlencode($keyword);
        $url = "https://{$subdomain}.olx.com/en/search/?q={$query}";
        $html = $this->fetchUrl($url);
        if (empty($html)) return [];

        $leads = [];
        preg_match_all('/<a[^>]*href="(\/en\/listings[^"]*)"[^>]*>([^<]{3,})<\/a>/si', $html, $posts);

        if (empty($posts[1])) {
            preg_match_all('/<h2[^>]*class="[^"]*title[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>.*?<\/h2>/si', $html, $posts);
        }

        foreach (array_slice($posts[1], 0, $limit) as $i => $href) {
            $name = strip_tags(trim($posts[2][$i] ?? ''));
            if (empty($name) || strlen($name) < 3) continue;

            $fullUrl = strpos($href, 'http') === 0 ? $href : "https://{$subdomain}.olx.com{$href}";

            $leads[] = [
                'source' => 'olx',
                'business_name' => $name,
                'website' => $fullUrl,
                'category' => $keyword,
                'country' => $location,
                'lead_score' => 50,
                'notes' => json_encode(['classified_url' => $fullUrl, 'source' => 'olx']),
            ];
        }

        return $this->deduplicate($leads, 'website');
    }

    public function fetchArabianTalksLeads(string $keyword, string $location = '', int $limit = 20): array
    {
        $query = urlencode($keyword);
        $url = "https://www.arabiantalks.com/search?q={$query}";
        $html = $this->fetchUrl($url);
        if (empty($html)) return [];

        $leads = [];
        preg_match_all('/<div[^>]*class="[^"]*listing-item[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>.*?<\/div>/si', $html, $items);

        if (empty($items[1])) {
            preg_match_all('/<a[^>]*href="(\/[^"]+)"[^>]*class="[^"]*title[^"]*"[^>]*>([^<]{3,})<\/a>/si', $html, $items);
        }

        foreach (array_slice($items[1], 0, $limit) as $i => $href) {
            $name = strip_tags(trim($items[2][$i] ?? ''));
            if (empty($name) || strlen($name) < 3) continue;

            $fullUrl = strpos($href, 'http') === 0 ? $href : "https://www.arabiantalks.com{$href}";

            $leads[] = [
                'source' => 'arabiantalks',
                'business_name' => $name,
                'website' => $fullUrl,
                'category' => $keyword,
                'country' => $location ?: 'UAE',
                'lead_score' => 50,
                'notes' => json_encode(['classified_url' => $fullUrl, 'source' => 'arabiantalks']),
            ];
        }

        return $this->deduplicate($leads, 'website');
    }

    public function fetchDcciInfoLeads(string $keyword, string $location = '', int $limit = 20): array
    {
        $query = urlencode($keyword);
        $url = "https://dcciinfo.com/search?q={$query}";
        $html = $this->fetchUrl($url);
        if (empty($html)) return [];

        $leads = [];
        preg_match_all('/<a[^>]*href="([^"]*\/company\/[^"]*)"[^>]*>([^<]{3,})<\/a>/si', $html, $items);

        foreach (array_slice($items[1], 0, $limit) as $i => $href) {
            $name = strip_tags(trim($items[2][$i] ?? ''));
            if (empty($name)) continue;

            $fullUrl = strpos($href, 'http') === 0 ? $href : "https://dcciinfo.com{$href}";

            $leads[] = [
                'source' => 'dcciinfo',
                'business_name' => $name,
                'website' => $fullUrl,
                'category' => $keyword,
                'country' => $location ?: 'GCC',
                'lead_score' => 50,
                'notes' => json_encode(['classified_url' => $fullUrl, 'source' => 'dcciinfo']),
            ];
        }

        return $this->deduplicate($leads, 'website');
    }

    public function fetchAbcGccLeads(string $keyword, string $location = '', int $limit = 20): array
    {
        $query = urlencode($keyword);
        $url = "https://abc-gcc.net/search?q={$query}";
        $html = $this->fetchUrl($url);
        if (empty($html)) return [];

        $leads = [];
        preg_match_all('/<a[^>]*href="([^"]*)"[^>]*class="[^"]*company[^"]*"[^>]*>([^<]{3,})<\/a>/si', $html, $items);

        foreach (array_slice($items[1], 0, $limit) as $i => $href) {
            $name = strip_tags(trim($items[2][$i] ?? ''));
            if (empty($name)) continue;

            $fullUrl = strpos($href, 'http') === 0 ? $href : "https://abc-gcc.net{$href}";

            $leads[] = [
                'source' => 'abcgcc',
                'business_name' => $name,
                'website' => $fullUrl,
                'category' => $keyword,
                'country' => $location ?: 'GCC',
                'lead_score' => 50,
                'notes' => json_encode(['classified_url' => $fullUrl, 'source' => 'abcgcc']),
            ];
        }

        return $this->deduplicate($leads, 'website');
    }

    public function fetchForPlatform(string $platform, string $keyword, string $location, int $limit): array
    {
        return match ($platform) {
            'google_maps' => $this->fetchGoogleMapsLeads($keyword, $location, $limit),
            'instagram' => $this->fetchInstagramLeads([$keyword], min(10, $limit)),
            'tiktok' => $this->fetchTikTokLeads($keyword, min(10, $limit)),
            'youtube' => $this->fetchYouTubeLeads($keyword, min(10, $limit)),
            'facebook' => $this->fetchFacebookLeads($keyword, min(10, $limit)),
            'twitter' => $this->fetchTwitterLeads($keyword, min(10, $limit)),
            'google_search' => $this->fetchGoogleSearchLeads($keyword, $location, min(10, $limit)),
            'google_reviews' => $this->fetchGoogleMapsReviews($keyword, $location, min(20, $limit)),
            'ecommerce' => $this->fetchEcommerceLeads($keyword, min(10, $limit)),
            'expatriates' => $this->fetchExpatriatesLeads($keyword, $location, $limit),
            'opensooq' => $this->fetchOpenSooqLeads($keyword, $location, $limit),
            'olx' => $this->fetchOlxLeads($keyword, $location, $limit),
            'arabiantalks' => $this->fetchArabianTalksLeads($keyword, $location, $limit),
            'dcciinfo' => $this->fetchDcciInfoLeads($keyword, $location, $limit),
            'abcgcc' => $this->fetchAbcGccLeads($keyword, $location, $limit),
            'website_content' => $this->fetchWebsiteContent($keyword, $limit),
            default => [],
        };
    }

    protected function fetchUrl(string $url): string
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ]);

        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || empty($html)) return '';

        return mb_convert_encoding($html, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
    }

    // ─── Helpers ─────────────────────────────────────────────────

    protected function deduplicate(array $leads, string $field): array
    {
        $seen = [];
        $unique = [];
        foreach ($leads as $lead) {
            $key = strtolower(trim($lead[$field] ?? $lead['website'] ?? $lead['business_name'] ?? ''));
            if (empty($key) || isset($seen[$key])) continue;
            $seen[$key] = true;
            $unique[] = $lead;
        }
        return $unique;
    }

    protected function isSearchEngineUrl(string $url): bool
    {
        $host = parse_url($url, PHP_URL_HOST) ?? '';
        $engines = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'];
        foreach ($engines as $e) {
            if (strpos($host, $e) !== false) return true;
        }
        return false;
    }

    public function classifyLeadType(array $lead): string
    {
        $providerKeywords = [
            'agency', 'studio', 'solutions', 'services', 'designer', 'developer',
            'digital', 'marketing', 'media', 'creative', 'tech', 'software',
            'consulting', 'consultancy', 'house', 'lab', 'hub', 'partner',
            'it solutions', 'technology', 'technologies', 'wll', 'co.',
            'freelance', 'freelancer', 'design', 'development', 'shop', 'store',
            'official', 'brand', 'enterprise', 'company', 'corporation', 'ltd',
        ];

        $name = strtolower($lead['business_name'] ?? '');
        $category = strtolower($lead['category'] ?? '');

        if (empty($name) && empty($category)) return 'unknown';

        foreach ($providerKeywords as $kw) {
            if (strpos($name, $kw) !== false || strpos($category, $kw) !== false) {
                return 'provider';
            }
        }

        return 'unknown';
    }

    public function saveLeads(array $leads, ?int $categoryId = null): int
    {
        $inserted = 0;
        $existingEmails = [];
        $existingWebsites = [];

        $allEmails = array_filter(array_column($leads, 'email'));
        $allWebsites = array_filter(array_map(function ($l) {
            return !empty($l['website']) ? $this->normalizeUrl($l['website']) : '';
        }, $leads));

        if (!empty($allEmails)) {
            $existingEmails = SeoLead::whereIn('email', $allEmails)
                ->whereNotNull('email')
                ->pluck('email')
                ->map(fn($e) => strtolower(trim($e)))
                ->toArray();
        }

        if (!empty($allWebsites)) {
            $existingWebsites = SeoLead::whereIn('website', $allWebsites)
                ->whereNotNull('website')
                ->pluck('website')
                ->map(fn($w) => $this->normalizeUrl($w))
                ->toArray();
        }

        foreach ($leads as $lead) {
            $leadEmail = !empty($lead['email']) ? strtolower(trim($lead['email'])) : '';
            $leadWebsite = !empty($lead['website']) ? $this->normalizeUrl($lead['website']) : '';

            if (!empty($leadEmail) && in_array($leadEmail, $existingEmails)) continue;
            if (!empty($leadWebsite) && in_array($leadWebsite, $existingWebsites)) continue;

            $data = [
                'source' => $lead['source'] ?? 'other',
                'business_name' => $lead['business_name'] ?? '',
                'contact_person' => $lead['contact_person'] ?? '',
                'email' => $lead['email'] ?? '',
                'phone' => $lead['phone'] ?? '',
                'website' => $lead['website'] ?? '',
                'address' => $lead['address'] ?? '',
                'city' => $lead['city'] ?? '',
                'country' => $lead['country'] ?? '',
                'category' => $lead['category'] ?? '',
                'social_instagram' => $lead['social_instagram'] ?? '',
                'social_facebook' => $lead['social_facebook'] ?? '',
                'social_tiktok' => $lead['social_tiktok'] ?? '',
                'social_youtube' => $lead['social_youtube'] ?? '',
                'social_linkedin' => $lead['social_linkedin'] ?? '',
                'social_twitter' => $lead['social_twitter'] ?? '',
                'platform_profile_name' => $lead['platform_profile_name'] ?? '',
                'followers_count' => $lead['followers_count'] ?? 0,
                'engagement_count' => $lead['engagement_count'] ?? 0,
                'last_post_content' => $lead['last_post_content'] ?? '',
                'rating' => $lead['rating'] ?? null,
                'reviews_count' => $lead['reviews_count'] ?? 0,
                'lead_score' => $lead['lead_score'] ?? 0,
                'lead_type' => $this->classifyLeadType($lead),
                'notes' => $lead['notes'] ?? null,
                'category_id' => $categoryId,
            ];

            SeoLead::create($data);
            $inserted++;
        }

        return $inserted;
    }

    public function generateForCategory(SeoLeadCategory $category, bool $skipEnrich = false): array
    {
        $platformLabels = array_keys($this->getAvailablePlatforms());
        $results = array_merge(
            array_fill_keys($platformLabels, 0),
            ['errors' => [], 'total' => 0]
        );

        if (!$this->hasToken()) {
            $saved = $this->aiGenerateFallback(
                $category->keywords ?? $category->category_name,
                $category->location ?? 'Bahrain',
                $category->id,
                $category->max_leads ?: 15
            );
            $results['ai_generated'] = $saved;
            $results['total'] = $saved;
            return $results;
        }

        $keywords = array_map('trim', explode(',', $category->keywords ?? ''));
        $keywords = array_filter($keywords);

        if (empty($keywords)) {
            $results['errors'][] = 'No keywords defined';
            return $results;
        }

        $platforms = $category->platforms ?? ['google_maps', 'instagram'];
        $perKeywordLimit = max(3, intdiv($category->max_leads, max(1, count($keywords) * count($platforms))));
        $totalFetched = 0;

        foreach ($platforms as $platform) {
            if (!in_array($platform, $platformLabels)) continue;

            try {
                foreach ($keywords as $kw) {
                    if ($totalFetched >= $category->max_leads) break;
                    $remaining = $category->max_leads - $totalFetched;
                    $leads = $this->fetchForPlatform($platform, $kw, $category->location ?? '', min($perKeywordLimit, $remaining));
                    if (!empty($leads)) {
                        $saved = $this->saveLeads($leads, $category->id);
                        $results[$platform] += $saved;
                        $results['total'] += $saved;
                        $totalFetched += $saved;

                        if ($category->auto_enrich && !$skipEnrich) {
                            $enriched = $this->batchEnrichLeads($leads);
                            $results['enriched'] = ($results['enriched'] ?? 0) + $enriched;
                        }
                    }
                    sleep(1);
                }
            } catch (\Exception $e) {
                $results['errors'][] = ucfirst(str_replace('_', ' ', $platform)) . ': ' . $e->getMessage();
            }
        }

        // Secondary fallback: if Apify returned 0, try AI
        if ($results['total'] === 0) {
            $saved = $this->aiGenerateFallback(
                $category->keywords ?? $category->category_name,
                $category->location ?? 'Bahrain',
                $category->id,
                $category->max_leads ?: 15
            );
            if ($saved > 0) {
                $results['ai_generated'] = $saved;
                $results['total'] = $saved;
            }
        }

        return $results;
    }

    public function quickGenerate(string $keyword, string $location, array $platforms, bool $enrich = false, int $limit = 30, ?int $categoryId = null): array
    {
        $platformLabels = array_keys($this->getAvailablePlatforms());
        $results = array_merge(
            array_fill_keys($platformLabels, 0),
            ['errors' => [], 'total' => 0]
        );

        if (!$this->hasToken()) {
            $saved = $this->aiGenerateFallback($keyword, $location ?: 'Bahrain', $categoryId, $limit);
            $results['ai_generated'] = $saved;
            $results['total'] = $saved;
            return $results;
        }

        // Split comma-separated keywords and try each separately (like generateForCategory does)
        $keywords = array_map('trim', explode(',', $keyword));
        $keywords = array_filter($keywords);
        if (empty($keywords)) {
            $keywords = [$keyword];
        }

        foreach ($platforms as $platform) {
            if (!in_array($platform, $platformLabels)) continue;

            try {
                foreach ($keywords as $kw) {
                    $leads = $this->fetchForPlatform($platform, $kw, $location, $limit);
                    if (!empty($leads)) {
                        $saved = $this->saveLeads($leads, $categoryId);
                        $results[$platform] += $saved;
                        $results['total'] += $saved;

                        if ($enrich) {
                            $enriched = $this->batchEnrichLeads($leads);
                            $results['enriched'] = ($results['enriched'] ?? 0) + $enriched;
                        }
                    }
                    sleep(1);
                }
            } catch (\Exception $e) {
                $results['errors'][] = ucfirst(str_replace('_', ' ', $platform)) . ': ' . $e->getMessage();
            }
        }

        // Secondary fallback: if Apify returned 0, try AI
        if ($results['total'] === 0) {
            $saved = $this->aiGenerateFallback($keyword, $location ?: 'Bahrain', $categoryId, $limit);
            if ($saved > 0) {
                $results['ai_generated'] = $saved;
                $results['total'] = $saved;
            }
        }

        return $results;
    }

    protected function aiGenerateFallback(string $keyword, string $location, ?int $categoryId, int $count): int
    {
        $leads = $this->callAIForLeads($keyword, $location, $count);
        if (empty($leads)) return 0;

        $normalized = [];
        foreach ($leads as $lead) {
            if (empty($lead['business_name'])) continue;
            $normalized[] = [
                'source' => 'ai_generated',
                'business_name' => $lead['business_name'] ?? '',
                'contact_person' => $lead['contact_person'] ?? '',
                'email' => $lead['email'] ?? '',
                'phone' => $lead['phone'] ?? '',
                'website' => $lead['website'] ?? '',
                'address' => $lead['address'] ?? '',
                'city' => $lead['city'] ?? '',
                'country' => $lead['country'] ?? $location,
                'rating' => $lead['rating'] ?? null,
                'reviews_count' => $lead['reviews_count'] ?? 0,
                'lead_score' => $lead['lead_score'] ?? 50,
                'notes' => json_encode(['ai_generated' => true, 'keyword' => $keyword]),
            ];
        }

        if (empty($normalized)) return 0;
        return $this->saveLeads($normalized, $categoryId);
    }

    protected function callAIForLeads(string $keyword, string $location, int $count): array
    {
        $prompt = "Generate a JSON array of {$count} realistic business leads in {$location} related to '{$keyword}'. "
            . "Each lead must be a JSON object with these exact keys: "
            . "business_name, contact_person, email, phone, website, address, city, country, "
            . "rating (0-5), reviews_count, lead_score (0-100). "
            . "Use realistic Bahrain phone numbers (starting with +973), "
            . "realistic email addresses, and real city names in Bahrain. "
            . "Return ONLY a valid JSON array. No markdown, no backticks, no explanation.";

        $ai = app(\App\Services\AiKeyManager::class);
        return $ai->generateWithFallback($prompt);
    }

    public function batchEnrichLeads(array $leads): int
    {
        $enriched = 0;
        foreach ($leads as $lead) {
            $website = $lead['website'] ?? '';
            if (empty($website)) continue;
            try {
                $result = $this->enrichLead($website);
                if ($result !== null && (!empty($result['email']) || !empty($result['phone']))) {
                    $leadRecord = SeoLead::where('website', $this->normalizeUrl($website))
                        ->orWhere('business_name', $lead['business_name'] ?? '')
                        ->latest()
                        ->first();
                    if ($leadRecord) {
                        if (!empty($result['email']) && empty($leadRecord->email)) {
                            $leadRecord->email = $result['email'];
                        }
                        if (!empty($result['phone']) && empty($leadRecord->phone)) {
                            $leadRecord->phone = $result['phone'];
                        }
                        if (!empty($result['leadScore'])) {
                            $leadRecord->lead_score = max($leadRecord->lead_score, $result['leadScore']);
                        }
                        $existing = json_decode($leadRecord->notes ?? '{}', true) ?: [];
                        $existing['enriched_at'] = now()->toDateTimeString();
                        $existing['found_emails'] = $result['allEmails'] ?? [];
                        $existing['found_phones'] = $result['allPhones'] ?? [];
                        $leadRecord->notes = json_encode($existing);
                        $leadRecord->save();
                        $enriched++;
                    }
                }
                usleep(500000);
            } catch (\Exception $e) {
                continue;
            }
        }
        return $enriched;
    }

    public function enrichLead(string $websiteUrl): ?array
    {
        $url = $websiteUrl;
        if (!preg_match('#^https?://#', $url)) {
            $url = 'https://' . $url;
        }

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ]);

        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || empty($html)) {
            return null;
        }

        $html = preg_replace('/<script[^>]*>.*?<\/script>/si', '', $html);
        $html = preg_replace('/<style[^>]*>.*?<\/style>/si', '', $html);
        $html = preg_replace('/<[^>]+>/', ' ', $html);
        $html = preg_replace('/\s+/', ' ', $html);

        $emails = [];
        preg_match_all('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $html, $matches);
        foreach ($matches[0] ?? [] as $e) {
            $e = strtolower(trim($e));
            if (strpos($e, 'example.com') === false && strpos($e, '@.') === false && substr_count($e, '@') === 1) {
                $emails[] = $e;
            }
        }
        $emails = array_values(array_unique($emails));

        $phones = [];
        preg_match_all('/\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{2,4}/', $html, $matches);
        foreach ($matches[0] ?? [] as $p) {
            $p = trim($p);
            $digits = preg_replace('/\D/', '', $p);
            if (strlen($digits) >= 7 && strlen($digits) <= 15) {
                $phones[] = $p;
            }
        }
        $phones = array_values(array_unique($phones));

        return [
            'email' => $emails[0] ?? '',
            'phone' => $phones[0] ?? '',
            'allEmails' => $emails,
            'allPhones' => $phones,
            'leadScore' => !empty($emails) ? 70 : 50,
        ];
    }

    protected function normalizeUrl(string $url): string
    {
        $url = strtolower(trim($url));
        $url = rtrim($url, '/');
        $url = preg_replace('#^https?://#', '', $url);
        $url = preg_replace('#^www\.#', '', $url);
        return $url;
    }
}
