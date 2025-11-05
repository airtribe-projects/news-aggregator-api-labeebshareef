import axios from "axios";
import cache from "./cache";

const GNEWS_API_URL = "https://gnews.io/api/v4";
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface NewsResponse {
  totalArticles: number;
  articles: NewsArticle[];
}

export interface SearchParams {
  q?: string;
  lang?: string;
  country?: string;
  max?: number;
  from?: string;
  to?: string;
  in?: string;
}

/**
 * Fetch news from GNews API with caching
 */
export const searchNews = async (params: SearchParams): Promise<NewsResponse> => {
  // Create cache key from params
  const cacheKey = `news:${JSON.stringify(params)}`;

  // Check cache first
  const cachedData = cache.get<NewsResponse>(cacheKey);
  if (cachedData) {
    console.log("Returning cached news data");
    return cachedData;
  }

  try {
    const response = await axios.get(`${GNEWS_API_URL}/search`, {
      params: {
        ...params,
        token: GNEWS_API_KEY,
      },
    });

    const newsData: NewsResponse = response.data;

    // Cache the result
    cache.set(cacheKey, newsData);

    return newsData;
  } catch (error: any) {
    if (error.response?.status === 429) {
      // Rate limit exceeded - try to return cached data if available
      const fallbackData = cache.get<NewsResponse>(cacheKey);
      if (fallbackData) {
        console.log("Rate limit exceeded, returning cached fallback data");
        return fallbackData;
      }
      throw new Error("Rate limit exceeded and no cached data available");
    }

    throw new Error(
      error.response?.data?.message || "Failed to fetch news from GNews API"
    );
  }
};

/**
 * Fetch top headlines (trending news)
 */
export const getTopHeadlines = async (
  lang: string = "en",
  country?: string,
  max: number = 10
): Promise<NewsResponse> => {
  const cacheKey = `headlines:${lang}:${country || "global"}`;

  // Check cache first
  const cachedData = cache.get<NewsResponse>(cacheKey);
  if (cachedData) {
    console.log("Returning cached headlines");
    return cachedData;
  }

  try {
    const params: any = {
      lang,
      max,
      token: GNEWS_API_KEY,
    };

    if (country) {
      params.country = country;
    }

    const response = await axios.get(`${GNEWS_API_URL}/top-headlines`, {
      params,
    });

    const newsData: NewsResponse = response.data;

    // Cache the result
    cache.set(cacheKey, newsData);

    return newsData;
  } catch (error: any) {
    if (error.response?.status === 429) {
      const fallbackData = cache.get<NewsResponse>(cacheKey);
      if (fallbackData) {
        console.log("Rate limit exceeded, returning cached fallback headlines");
        return fallbackData;
      }
      throw new Error("Rate limit exceeded and no cached data available");
    }

    throw new Error(
      error.response?.data?.message || "Failed to fetch headlines from GNews API"
    );
  }
};
