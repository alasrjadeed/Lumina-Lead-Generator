<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Cache Store
    |--------------------------------------------------------------------------
    |
    | This option controls the default cache connection that gets used while
    | using this caching library. This connection is used when another is
    | not explicitly specified when executing a given caching function.
    |
    */

    'default' => env('CACHE_DRIVER', 'file'),

    /*
    |--------------------------------------------------------------------------
    | Cache Stores
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the cache "stores" for your application as
    | well as their drivers. You may even define multiple stores for the
    | same cache driver to group types of items stored in your cache.
    |
    | Supported drivers: "file", "database", "apc", "array", "memcached",
    |                    "redis", "dynamodb", "octane", "null"
    |
    */

    'stores' => [

        'array' => [
            'driver' => 'array',
            'serialize' => false,
        ],

        'database' => [
            'driver' => 'database',
            'table' => env('CACHE_TABLE', 'cache'),
            'connection' => env('CACHE_DATABASE_CONNECTION'),
            'lock_connection' => env('CACHE_DATABASE_LOCK_CONNECTION'),
        ],

        'file' => [
            'driver' => 'file',
            'path' => storage_path('framework/cache/data'),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Key Prefix
    |--------------------------------------------------------------------------
    |
    | When using a RAM based store such as APC or Memcached, there might be
    | other applications using the same cache. So, it's a good idea to get
    | prefixed with your application name. By default the prefix is empty.
    |
    */

    'prefix' => env('CACHE_PREFIX', ''),

];
