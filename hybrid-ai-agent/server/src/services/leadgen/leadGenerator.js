import axios from "axios";
import Lead from "../../models/Lead.js";
import aiService from "../ai/aiService.js";

const APIFY_BASE_URL = "https://api.apify.com/v2";

// Platform actors
const ACTORS = {
  googleMaps: "compass/crawler-google-places",
  googleBusiness: "compass/crawler-google-places",
  linkedin: "2SyF0bVxmgGr8IVCZ",
  instagram: "apify/instagram-profile-scraper",
  facebook: "apify/facebook-pages-scraper",
  website: "apify/web-scraper",
};

const SOURCE_MAP = {
  googleMaps: "google_maps",
  googleBusiness: "google_business",
  linkedin: "linkedin",
  instagram: "instagram",
  facebook: "facebook",
  website: "website",
};

// Country-specific classifieds and marketplace websites
const COUNTRY_CLASSIFIEDS = {
  bahrain: {
    code: "bh",
    name: "Bahrain",
    classifieds: [
      {
        id: "dubizzle",
        name: "Dubizzle Bahrain",
        baseUrl: "https://www.dubizzle.com.bh",
        searchPath: "/en/search/",
        icon: "🏷️",
      },
      {
        id: "openSooq",
        name: "OpenSooq Bahrain",
        baseUrl: "https://bh.opensooq.com",
        searchPath: "/en/search/",
        icon: "🛒",
      },
      {
        id: "gdnClassified",
        name: "GDN Classifieds",
        baseUrl: "https://www.gdnclassifieds.com",
        searchPath: "/search/",
        icon: "📋",
      },
      {
        id: "expatriates",
        name: "Expatriates Bahrain",
        baseUrl: "https://www.expatriates.com",
        searchPath: "/cls/",
        icon: "🌐",
      },
      {
        id: "redditBahrain",
        name: "Reddit r/Bahrain",
        baseUrl: "https://www.reddit.com",
        searchPath: "/r/Bahrain/search/",
        icon: "💬",
      },
    ],
  },
  uae: {
    code: "ae",
    name: "United Arab Emirates",
    classifieds: [
      {
        id: "dubizzle",
        name: "Dubizzle UAE",
        baseUrl: "https://www.dubizzle.com",
        searchPath: "/en/search/",
        icon: "🏷️",
      },
      {
        id: "openSooq",
        name: "OpenSooq UAE",
        baseUrl: "https://ae.opensooq.com",
        searchPath: "/en/search/",
        icon: "🛒",
      },
      {
        id: "bayut",
        name: "Bayut",
        baseUrl: "https://www.bayut.com",
        searchPath: "/to-rent/",
        icon: "🏠",
      },
      {
        id: "propertyFinder",
        name: "Property Finder",
        baseUrl: "https://www.propertyfinder.ae",
        searchPath: "/en/search/",
        icon: "🏘️",
      },
      {
        id: "khaliji",
        name: "Khaliji",
        baseUrl: "https://www.khaliji.com",
        searchPath: "/search/",
        icon: "🌐",
      },
    ],
  },
  saudiArabia: {
    code: "sa",
    name: "Saudi Arabia",
    classifieds: [
      {
        id: "haraj",
        name: "Haraj",
        baseUrl: "https://www.haraj.com.sa",
        searchPath: "/",
        icon: "🏷️",
      },
      {
        id: "openSooq",
        name: "OpenSooq Saudi",
        baseUrl: "https://sa.opensooq.com",
        searchPath: "/en/search/",
        icon: "🛒",
      },
      {
        id: "jarir",
        name: "Jarir Marketing",
        baseUrl: "https://www.jarir.com",
        searchPath: "/search/",
        icon: "📦",
      },
      {
        id: "extraStores",
        name: "Extra Stores",
        baseUrl: "https://www.extra.com",
        searchPath: "/search/",
        icon: "🏪",
      },
    ],
  },
  qatar: {
    code: "qa",
    name: "Qatar",
    classifieds: [
      {
        id: "dubizzle",
        name: "Dubizzle Qatar",
        baseUrl: "https://www.dubizzle.com.qa",
        searchPath: "/en/search/",
        icon: "🏷️",
      },
      {
        id: "openSooq",
        name: "OpenSooq Qatar",
        baseUrl: "https://qa.opensooq.com",
        searchPath: "/en/search/",
        icon: "🛒",
      },
      {
        id: "propertyFinder",
        name: "Property Finder Qatar",
        baseUrl: "https://www.propertyfinder.qa",
        searchPath: "/en/search/",
        icon: "🏘️",
      },
    ],
  },
  kuwait: {
    code: "kw",
    name: "Kuwait",
    classifieds: [
      {
        id: "openSooq",
        name: "OpenSooq Kuwait",
        baseUrl: "https://kw.opensooq.com",
        searchPath: "/en/search/",
        icon: "🛒",
      },
      {
        id: "360moms",
        name: "360Moms",
        baseUrl: "https://www.360moms.net",
        searchPath: "/classifieds/",
        icon: "👶",
      },
    ],
  },
  oman: {
    code: "om",
    name: "Oman",
    classifieds: [
      {
        id: "openSooq",
        name: "OpenSooq Oman",
        baseUrl: "https://om.opensooq.com",
        searchPath: "/en/search/",
        icon: "🛒",
      },
      {
        id: "dubizzle",
        name: "Dubizzle Oman",
        baseUrl: "https://www.dubizzle.com.om",
        searchPath: "/en/search/",
        icon: "🏷️",
      },
    ],
  },
  egypt: {
    code: "eg",
    name: "Egypt",
    classifieds: [
      {
        id: "openSooq",
        name: "OpenSooq Egypt",
        baseUrl: "https://eg.opensooq.com",
        searchPath: "/ar/search/",
        icon: "🛒",
      },
      {
        id: "youm7",
        name: "Youm7",
        baseUrl: "https://www.youm7.com",
        searchPath: "/search/",
        icon: "📰",
      },
      {
        id: "horna",
        name: "Horna",
        baseUrl: "https://www.horna.com",
        searchPath: "/search/",
        icon: "🏷️",
      },
    ],
  },
  jordan: {
    code: "jo",
    name: "Jordan",
    classifieds: [
      {
        id: "openSooq",
        name: "OpenSooq Jordan",
        baseUrl: "https://jo.opensooq.com",
        searchPath: "/en/search/",
        icon: "🛒",
      },
      {
        id: "baida",
        name: "Baida",
        baseUrl: "https://www.baida.com",
        searchPath: "/search/",
        icon: "🏷️",
      },
    ],
  },
  usa: {
    code: "us",
    name: "United States",
    classifieds: [
      {
        id: "craigslist",
        name: "Craigslist",
        baseUrl: "https://www.craigslist.org",
        searchPath: "/search/",
        icon: "🏷️",
      },
      {
        id: "facebookMarketplace",
        name: "Facebook Marketplace",
        baseUrl: "https://www.facebook.com/marketplace",
        searchPath: "/search/",
        icon: "🛒",
      },
      {
        id: "offerup",
        name: "OfferUp",
        baseUrl: "https://offerup.com",
        searchPath: "/search/",
        icon: "📦",
      },
      {
        id: "letgo",
        name: "Letgo",
        baseUrl: "https://www.letgo.com",
        searchPath: "/search/",
        icon: "🏷️",
      },
      {
        id: "nextdoor",
        name: "Nextdoor",
        baseUrl: "https://nextdoor.com",
        searchPath: "/classifieds/",
        icon: "🏘️",
      },
    ],
  },
  uk: {
    code: "uk",
    name: "United Kingdom",
    classifieds: [
      {
        id: "gumtree",
        name: "Gumtree",
        baseUrl: "https://www.gumtree.com",
        searchPath: "/s/",
        icon: "🏷️",
      },
      {
        id: "preloved",
        name: "Preloved",
        baseUrl: "https://www.preloved.co.uk",
        searchPath: "/classifieds/",
        icon: "♻️",
      },
      {
        id: "shpock",
        name: "Shpock",
        baseUrl: "https://www.shpock.com",
        searchPath: "/en-gb/search/",
        icon: "🛒",
      },
    ],
  },
  india: {
    code: "in",
    name: "India",
    classifieds: [
      {
        id: "olx",
        name: "OLX India",
        baseUrl: "https://www.olx.in",
        searchPath: "/search/",
        icon: "🏷️",
      },
      {
        id: "quikr",
        name: "Quikr",
        baseUrl: "https://www.quikr.com",
        searchPath: "/search/",
        icon: "🛒",
      },
      {
        id: "bikewale",
        name: "BikeWale",
        baseUrl: "https://www.bikewale.com",
        searchPath: "/search/",
        icon: "🏍️",
      },
      {
        id: "carwale",
        name: "CarWale",
        baseUrl: "https://www.carwale.com",
        searchPath: "/search/",
        icon: "🚗",
      },
    ],
  },
  pakistan: {
    code: "pk",
    name: "Pakistan",
    classifieds: [
      {
        id: "olx",
        name: "OLX Pakistan",
        baseUrl: "https://www.olx.com.pk",
        searchPath: "/items/",
        icon: "🏷️",
      },
      {
        id: "dubizzle",
        name: "Dubizzle Pakistan",
        baseUrl: "https://www.dubizzle.com.pk",
        searchPath: "/en/search/",
        icon: "🛒",
      },
      {
        id: "pakwheels",
        name: "PakWheels",
        baseUrl: "https://www.pakwheels.com",
        searchPath: "/used-cars/",
        icon: "🚗",
      },
    ],
  },
  australia: {
    code: "au",
    name: "Australia",
    classifieds: [
      {
        id: "gumtree",
        name: "Gumtree Australia",
        baseUrl: "https://www.gumtree.com.au",
        searchPath: "/s-",
        icon: "🏷️",
      },
      {
        id: "carsales",
        name: "Carsales",
        baseUrl: "https://www.carsales.com.au",
        searchPath: "/cars/",
        icon: "🚗",
      },
      {
        id: "realestate",
        name: "realestate.com.au",
        baseUrl: "https://www.realestate.com.au",
        searchPath: "/buy/",
        icon: "🏠",
      },
    ],
  },
  canada: {
    code: "ca",
    name: "Canada",
    classifieds: [
      {
        id: "kijiji",
        name: "Kijiji",
        baseUrl: "https://www.kijiji.ca",
        searchPath: "/b-",
        icon: "🏷️",
      },
      {
        id: "usedottawa",
        name: "Used Ottawa",
        baseUrl: "https://www.usedottawa.com",
        searchPath: "/search/",
        icon: "🛒",
      },
      {
        id: "autotrader",
        name: "AutoTrader Canada",
        baseUrl: "https://www.autotrader.ca",
        searchPath: "/search/",
        icon: "🚗",
      },
    ],
  },
  germany: {
    code: "de",
    name: "Germany",
    classifieds: [
      {
        id: "ebayKleinanzeigen",
        name: "eBay Kleinanzeigen",
        baseUrl: "https://www.ebay-kleinanzeigen.de",
        searchPath: "/s-",
        icon: "🏷️",
      },
      {
        id: "immobilienscout",
        name: "ImmobilienScout24",
        baseUrl: "https://www.immobilienscout24.de",
        searchPath: "/suche/",
        icon: "🏠",
      },
      {
        id: "mobileDe",
        name: "Mobile.de",
        baseUrl: "https://www.mobile.de",
        searchPath: "/fahrzeuge/",
        icon: "🚗",
      },
    ],
  },
  france: {
    code: "fr",
    name: "France",
    classifieds: [
      {
        id: "leboncoin",
        name: "Leboncoin",
        baseUrl: "https://www.leboncoin.fr",
        searchPath: "/recherche/",
        icon: "🏷️",
      },
      {
        id: "seloger",
        name: "SeLoger",
        baseUrl: "https://www.seloger.com",
        searchPath: "/annonces/",
        icon: "🏠",
      },
      {
        id: "laCentrale",
        name: "La Centrale",
        baseUrl: "https://www.lacentrale.fr",
        searchPath: "/listing/",
        icon: "🚗",
      },
    ],
  },
};

// Search fields for lead generation
const LEAD_SEARCH_FIELDS = [
  "name",
  "email",
  "phone",
  "website",
  "company",
  "address",
  "physicalAddress",
  "googleMapsUrl",
  "city",
  "country",
  "description",
];

class LeadGenerator {
  constructor() {
    this.token = process.env.APIFY_TOKEN;
    if (!this.token) {
      console.warn("[LeadGenerator] APIFY_TOKEN not set. Scraping will fail.");
    }
  }

  _buildUrl(actorId) {
    return `${APIFY_BASE_URL}/acts/${actorId}/run-sync-get-dataset-items?token=${this.token}&timeout=120`;
  }

  /**
   * Get classifieds for a specific country
   */
  getCountryClassifieds(countryKey) {
    const normalizedKey = countryKey.toLowerCase().replace(/[\s-_]/g, "");

    // Try direct match first
    if (COUNTRY_CLASSIFIEDS[normalizedKey]) {
      return COUNTRY_CLASSIFIEDS[normalizedKey];
    }

    // Try matching by country code
    for (const [key, country] of Object.entries(COUNTRY_CLASSIFIEDS)) {
      if (country.code === normalizedKey) {
        return country;
      }
    }

    // Try partial match
    for (const [key, country] of Object.entries(COUNTRY_CLASSIFIEDS)) {
      if (key.includes(normalizedKey) || normalizedKey.includes(key)) {
        return country;
      }
    }

    return null;
  }

  /**
   * Get list of all supported countries
   */
  getSupportedCountries() {
    return Object.entries(COUNTRY_CLASSIFIEDS).map(([key, country]) => ({
      key,
      code: country.code,
      name: country.name,
      classifiedsCount: country.classifieds.length,
      classifieds: country.classifieds.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
      })),
    }));
  }

  /**
   * Get all available platforms for a country
   */
  getPlatformsForCountry(countryKey) {
    const basePlatforms = [
      { id: "googleMaps", name: "Google Maps", icon: "🗺️", category: "search" },
      { id: "googleBusiness", name: "Google Business", icon: "🏢", category: "search" },
      { id: "linkedin", name: "LinkedIn", icon: "💼", category: "social" },
      { id: "instagram", name: "Instagram", icon: "📸", category: "social" },
      { id: "facebook", name: "Facebook", icon: "📘", category: "social" },
      { id: "website", name: "Custom Website", icon: "🌐", category: "web" },
    ];

    const country = this.getCountryClassifieds(countryKey);
    if (country) {
      country.classifieds.forEach((classified) => {
        basePlatforms.push({
          id: classified.id,
          name: classified.name,
          icon: classified.icon,
          category: "classifieds",
          countrySpecific: true,
        });
      });
    }

    return basePlatforms;
  }

  /**
   * Normalize platform name to internal key
   */
  normalizePlatformKey(platform, countryKey = "bahrain") {
    const platformLower = platform.toLowerCase().replace(/[\s-_]/g, "");

    // Direct matches for main platforms
    if (platformLower.includes("googlemap") || platformLower === "googlemap") {
      return "googleMaps";
    }
    if (platformLower === "googlebusiness" || platformLower === "googlemybusiness") {
      return "googleBusiness";
    }
    if (platformLower.includes("instagram")) return "instagram";
    if (platformLower.includes("facebook") || platformLower.includes("fb")) return "facebook";
    if (platformLower.includes("linkedin")) return "linkedin";
    if (platformLower === "website" || platformLower === "customwebsite") return "website";

    // Check country-specific classifieds
    const country = this.getCountryClassifieds(countryKey);
    if (country) {
      for (const classified of country.classifieds) {
        if (
          platformLower.includes(classified.id.toLowerCase()) ||
          classified.name.toLowerCase().includes(platformLower)
        ) {
          return classified.id;
        }
      }
    }

    return platform;
  }

  /**
   * Get classified config for a platform key
   */
  getClassifiedConfig(platformKey, countryKey = "bahrain") {
    const country = this.getCountryClassifieds(countryKey);
    if (!country) return null;

    return country.classifieds.find(
      (c) => c.id === platformKey || c.id.toLowerCase() === platformKey.toLowerCase()
    );
  }

  async scrapeBusinesses(query, location, platform = "googleMaps", country = "bahrain") {
    if (!this.token) {
      throw new Error("APIFY_TOKEN environment variable is not set");
    }

    const platformKey = this.normalizePlatformKey(platform, country);

    // Check if it's a classified site
    const classifiedConfig = this.getClassifiedConfig(platformKey, country);

    let actorId;
    if (classifiedConfig) {
      actorId = ACTORS.website;
    } else {
      actorId = ACTORS[platformKey];
    }

    if (!actorId) {
      throw new Error(
        `Unknown platform "${platform}". Supported: ${Object.keys(ACTORS).join(", ")}`
      );
    }

    const url = this._buildUrl(actorId);

    let input;
    switch (platformKey) {
      case "googleMaps":
      case "googleBusiness":
        input = {
          searchStringsArray: [`${query} in ${location}`],
          maxCrawledPlacesPerSearch: 50,
          language: "en",
        };
        break;
      case "linkedin":
        input = {
          searchUrl: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(query)}&geoUrn=${encodeURIComponent(location)}`,
          maxResults: 50,
        };
        break;
      case "instagram":
        input = {
          directUrls: [`https://www.instagram.com/explore/tags/${encodeURIComponent(query.replace(/\s+/g, ""))}/`],
          resultsLimit: 50,
          searchType: "hashtag",
        };
        break;
      case "facebook":
        input = {
          startUrls: [
            {
              url: `https://www.facebook.com/search/pages/?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
            },
          ],
          maxPagesPerCrawl: 10,
        };
        break;
      case "website":
        input = {
          startUrls: [{ url: query }],
          maxPagesPerCrawl: 10,
        };
        break;
      default: {
        // Handle country-specific classifieds
        if (classifiedConfig) {
          const searchUrl = `${classifiedConfig.baseUrl}${classifiedConfig.searchPath}${encodeURIComponent(query)}`;
          input = {
            startUrls: [{ url: searchUrl }],
            maxPagesPerCrawl: 10,
            pageFunction: `async function pageFunction(context) {
              const $ = context.jQuery;
              const items = [];
              $('article, .listing-item, .post-item, [class*="listing"], [class*="result"], [class*="card"]').each((i, el) => {
                const title = $(el).find('h2, h3, .title, [class*="title"]').first().text().trim();
                const link = $(el).find('a').first().attr('href') || '';
                const phone = $(el).text().match(/[\\+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]{7,15}/)?.[0] || '';
                const description = $(el).find('.description, p, [class*="desc"]').first().text().trim();
                const location = $(el).find('[class*="location"], [class*="area"], .location').first().text().trim();
                if (title) items.push({ title, link, phone, description, location });
              });
              return items;
            }`,
          };
        } else {
          throw new Error(`No input template for platform: ${platform}`);
        }
      }
    }

    const { data } = await axios.post(url, input, { timeout: 130000 });

    const results = Array.isArray(data) ? data : [];

    return results.map((item) => ({
      name: item.title || item.name || "",
      phone: item.phone || item.phoneNumber || "",
      email: item.email || "",
      website: item.url || item.website || "",
      address: item.address || item.street || "",
      physicalAddress: item.fullAddress || item.completeAddress || item.address || "",
      googleMapsUrl: item.googleMapsUrl || item.mapUrl || item.url || "",
      city: item.city || location,
      country: country,
      company: item.company || item.title || "",
      platform: platformKey,
      description: item.description || "",
      classifiedSite: classifiedConfig ? classifiedConfig.name : null,
      raw: item,
    }));
  }

  async generateAndSaveLeads(query, location, platform, businessId, country = "bahrain") {
    const scraped = await this.scrapeBusinesses(query, location, platform, country);
    const platformKey = this.normalizePlatformKey(platform, country);
    const source = SOURCE_MAP[platformKey] || "classifieds";
    const saved = [];

    for (const item of scraped) {
      try {
        let lead;

        if (item.email) {
          lead = await Lead.findOneAndUpdate(
            { email: item.email, businessId },
            {
              $set: {
                name: item.name,
                phone: item.phone || undefined,
                company: item.company,
                source,
                status: "new",
                score: 10,
                "metadata.website": item.website,
                "metadata.address": item.address,
                "metadata.physicalAddress": item.physicalAddress,
                "metadata.googleMapsUrl": item.googleMapsUrl,
                "metadata.city": item.city,
                "metadata.country": item.country,
                "metadata.platform": platformKey,
                "metadata.classifiedSite": item.classifiedSite,
                "metadata.scrapedAt": new Date(),
              },
              $setOnInsert: { businessId },
            },
            { upsert: true, new: true, runValidators: true }
          );
        } else {
          const existing = await Lead.findOne({
            name: item.name,
            businessId,
            isDeleted: false,
          });

          if (existing) {
            lead = await Lead.findByIdAndUpdate(
              existing._id,
              {
                $set: {
                  phone: item.phone || existing.phone,
                  company: item.company || existing.company,
                  "metadata.website": item.website,
                  "metadata.address": item.address,
                  "metadata.physicalAddress": item.physicalAddress || existing.metadata?.physicalAddress,
                  "metadata.googleMapsUrl": item.googleMapsUrl || existing.metadata?.googleMapsUrl,
                  "metadata.city": item.city,
                  "metadata.country": item.country,
                  "metadata.platform": platformKey,
                  "metadata.classifiedSite": item.classifiedSite,
                  "metadata.scrapedAt": new Date(),
                },
              },
              { new: true }
            );
          } else {
            lead = await Lead.create({
              name: item.name,
              email: item.email || null,
              phone: item.phone || null,
              company: item.company || null,
              source,
              status: "new",
              score: 10,
              businessId,
              metadata: new Map([
                ["website", item.website],
                ["address", item.address],
                ["physicalAddress", item.physicalAddress],
                ["googleMapsUrl", item.googleMapsUrl],
                ["city", item.city],
                ["country", item.country],
                ["platform", platformKey],
                ["classifiedSite", item.classifiedSite],
                ["scrapedAt", new Date().toISOString()],
              ]),
            });
          }
        }

        if (lead) {
          saved.push(lead);
        }
      } catch (err) {
        console.warn(`[LeadGenerator] Failed to save lead "${item.name}":`, err.message);
      }
    }

    return { leads: saved, count: saved.length };
  }

  /**
   * Search leads by multiple fields
   */
  async searchLeads(query, businessId, filters = {}) {
    const searchRegex = new RegExp(query, "i");

    // Build the $or conditions for text search (only include fields not being filtered)
    const orConditions = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { company: searchRegex },
      { "metadata.website": searchRegex },
      { "metadata.address": searchRegex },
      { "metadata.physicalAddress": searchRegex },
      { "metadata.googleMapsUrl": searchRegex },
      { "metadata.description": searchRegex },
      { tags: { $in: [searchRegex] } },
    ];

    // Only add city/country to $or if not being used as a filter
    if (!filters.city) {
      orConditions.push({ "metadata.city": searchRegex });
    }
    if (!filters.country) {
      orConditions.push({ "metadata.country": searchRegex });
    }

    const searchConditions = {
      businessId,
      isDeleted: { $ne: true },
      $or: orConditions,
    };

    // Apply additional filters
    if (filters.status) searchConditions.status = filters.status;
    if (filters.source) searchConditions.source = filters.source;
    if (filters.country) searchConditions["metadata.country"] = filters.country;
    if (filters.city) searchConditions["metadata.city"] = filters.city;

    // Score filter
    if (filters.minScore || filters.maxScore) {
      searchConditions.score = {};
      if (filters.minScore) searchConditions.score.$gte = parseInt(filters.minScore);
      if (filters.maxScore) searchConditions.score.$lte = parseInt(filters.maxScore);
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const leads = await Lead.find(searchConditions)
      .populate("assignedAgent", "name email avatar")
      .sort({ score: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Lead.countDocuments(searchConditions);

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async enrichLead(leadData) {
    const enriched = { ...leadData, enriched: true, enrichedAt: new Date().toISOString() };

    try {
      if (leadData.website) {
        const { data } = await axios.get(leadData.website, {
          timeout: 10000,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; LeadBot/1.0)" },
          maxRedirects: 3,
        });

        const html = typeof data === "string" ? data : "";

        const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) enriched.email = enriched.email || emailMatch[0];

        const phoneMatch = html.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}/);
        if (phoneMatch) enriched.phone = enriched.phone || phoneMatch[0];

        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        if (descMatch) enriched.description = descMatch[1];

        // Extract address if present
        const addressMatch = html.match(/address["\s:]+([^"<,]+(?:,\s*[^"<]+)*)/i);
        if (addressMatch) enriched.physicalAddress = enriched.physicalAddress || addressMatch[1];
      }
    } catch (error) {
      console.warn(`[LeadGenerator] Enrichment failed for ${leadData.name}:`, error.message);
    }

    return enriched;
  }

  async generateFromWebsite(url) {
    if (!this.token) {
      throw new Error("APIFY_TOKEN environment variable is not set");
    }

    const actorId = ACTORS.website;
    const apiUrl = this._buildUrl(actorId);

    const input = {
      startUrls: [{ url }],
      maxPagesPerCrawl: 5,
      pageFunction: `async function pageFunction(context) {
        const $ = context.jQuery;
        const title = $('title').text() || '';
        const description = $('meta[name="description"]').attr('content') || '';
        const phone = document.body.innerText.match(/[\\+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]{7,15}/)?.[0] || '';
        const emails = [...new Set((document.body.innerHTML.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g) || []))];
        const address = $('[itemprop="address"], [class*="address"], address').first().text().trim() || '';
        return { title, description, phone, emails, address, url: context.request.url };
      }`,
    };

    const { data } = await axios.post(apiUrl, input, { timeout: 130000 });

    const results = Array.isArray(data) ? data : [];

    return results.map((item) => ({
      name: item.title || "",
      website: item.url || url,
      description: item.description || "",
      phone: item.phone || "",
      emails: item.emails || [],
      physicalAddress: item.address || "",
      source: "website_scraper",
    }));
  }

  async bulkEnrichLeads(leadIds) {
    const leads = await Lead.find({ _id: { $in: leadIds }, isDeleted: false });
    const enriched = [];

    for (const lead of leads) {
      try {
        const leadObj = lead.toObject();
        const enrichedData = await this.enrichLead(leadObj);

        const update = {};
        if (enrichedData.email && !lead.email) update.email = enrichedData.email;
        if (enrichedData.phone && !lead.phone) update.phone = enrichedData.phone;
        if (enrichedData.description) update["metadata.description"] = enrichedData.description;
        if (enrichedData.physicalAddress)
          update["metadata.physicalAddress"] = enrichedData.physicalAddress;
        update["metadata.enrichedAt"] = new Date();

        if (
          Object.keys(update).length > 1 ||
          Object.keys(update)[0] !== "metadata.enrichedAt"
        ) {
          const saved = await Lead.findByIdAndUpdate(lead._id, { $set: update }, { new: true });
          enriched.push(saved);
        } else {
          enriched.push(lead);
        }
      } catch (err) {
        console.warn(`[LeadGenerator] Bulk enrich failed for lead ${lead._id}:`, err.message);
        enriched.push(lead);
      }
    }

    return enriched;
  }

  async scoreLeadsWithAI(leadIds) {
    const leads = await Lead.find({ _id: { $in: leadIds }, isDeleted: false });
    const scored = [];

    for (const lead of leads) {
      try {
        const leadObj = lead.toObject();
        const result = await aiService.analyzeLead(leadObj, lead.interactions || []);

        const updated = await Lead.findByIdAndUpdate(
          lead._id,
          {
            $set: {
              score: Math.min(100, Math.max(0, result.score || 50)),
              "metadata.aiIntent": result.intent,
              "metadata.aiSummary": result.summary,
              "metadata.aiRecommendedAction": result.recommendedAction,
              "metadata.aiTalkingPoints": result.talkingPoints,
              "metadata.scoredAt": new Date(),
            },
          },
          { new: true }
        );

        scored.push(updated);
      } catch (err) {
        console.warn(`[LeadGenerator] AI scoring failed for lead ${lead._id}:`, err.message);
        scored.push(lead);
      }
    }

    return scored;
  }

  async importFromCSV(csvData, businessId) {
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have a header row and at least one data row");
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const phoneIdx = headers.indexOf("phone");
    const companyIdx = headers.indexOf("company");
    const sourceIdx = headers.indexOf("source");
    const websiteIdx = headers.indexOf("website");
    const addressIdx = headers.indexOf("address");
    const physicalAddressIdx = headers.indexOf("physicaladdress") || headers.indexOf("physical_address");
    const googleMapsUrlIdx = headers.indexOf("googlemapsurl") || headers.indexOf("google_maps_url");
    const cityIdx = headers.indexOf("city");
    const countryIdx = headers.indexOf("country");

    const saved = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const name = nameIdx >= 0 ? values[nameIdx] : null;

      if (!name) continue;

      const email = emailIdx >= 0 ? values[emailIdx] || null : null;
      const phone = phoneIdx >= 0 ? values[phoneIdx] || null : null;
      const company = companyIdx >= 0 ? values[companyIdx] || null : null;
      const source = sourceIdx >= 0 ? values[sourceIdx] || "manual" : "manual";
      const website = websiteIdx >= 0 ? values[websiteIdx] || null : null;
      const address = addressIdx >= 0 ? values[addressIdx] || null : null;
      const physicalAddress = physicalAddressIdx >= 0 ? values[physicalAddressIdx] || null : null;
      const googleMapsUrl = googleMapsUrlIdx >= 0 ? values[googleMapsUrlIdx] || null : null;
      const city = cityIdx >= 0 ? values[cityIdx] || null : null;
      const country = countryIdx >= 0 ? values[countryIdx] || null : null;

      try {
        let lead;

        if (email) {
          lead = await Lead.findOneAndUpdate(
            { email, businessId },
            {
              $set: {
                name,
                phone: phone || undefined,
                company: company || undefined,
                source,
                status: "new",
                score: 10,
                "metadata.website": website,
                "metadata.address": address,
                "metadata.physicalAddress": physicalAddress,
                "metadata.googleMapsUrl": googleMapsUrl,
                "metadata.city": city,
                "metadata.country": country,
              },
              $setOnInsert: { businessId },
            },
            { upsert: true, new: true, runValidators: true }
          );
        } else {
          const existing = await Lead.findOne({ name, businessId, isDeleted: false });

          if (existing) {
            lead = await Lead.findByIdAndUpdate(
              existing._id,
              {
                $set: {
                  phone: phone || existing.phone,
                  company: company || existing.company,
                  "metadata.website": website || existing.metadata?.website,
                  "metadata.address": address || existing.metadata?.address,
                  "metadata.physicalAddress": physicalAddress || existing.metadata?.physicalAddress,
                  "metadata.googleMapsUrl": googleMapsUrl || existing.metadata?.googleMapsUrl,
                  "metadata.city": city || existing.metadata?.city,
                  "metadata.country": country || existing.metadata?.country,
                },
              },
              { new: true }
            );
          } else {
            lead = await Lead.create({
              name,
              email: null,
              phone: phone || null,
              company: company || null,
              source,
              status: "new",
              score: 10,
              businessId,
              metadata: new Map([
                ["website", website],
                ["address", address],
                ["physicalAddress", physicalAddress],
                ["googleMapsUrl", googleMapsUrl],
                ["city", city],
                ["country", country],
              ]),
            });
          }
        }

        if (lead) {
          saved.push(lead);
        }
      } catch (err) {
        console.warn(`[LeadGenerator] Failed to import row ${i} ("${name}"):`, err.message);
      }
    }

    return { leads: saved, count: saved.length };
  }
}

export default new LeadGenerator();
