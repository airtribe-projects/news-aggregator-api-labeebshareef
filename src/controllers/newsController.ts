import { Response } from "express";
import { UserPreference } from "../models/UserPreference";
import { AuthRequest } from "../middlewares/authMiddleware";
import { searchNews, getTopHeadlines } from "../utils/gnewsClient";

/**
 * Fetch personalized news for the logged-in user
 * GET /api/news
 */
export const getPersonalizedNews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Fetch user preferences
    const preferences = await UserPreference.findOne({ userId });

    if (!preferences) {
      return res.status(400).json({
        message: "Please set your preferences first before fetching news.",
      });
    }

    // Build query string from topics
    const query = preferences.topics.length > 0 
      ? preferences.topics.join(" OR ") 
      : undefined;

    if (!query) {
      return res.status(400).json({
        message: "Please add at least one topic to your preferences.",
      });
    }

    // Fetch news from GNews API
    const newsData = await searchNews({
      q: query,
      lang: preferences.language,
      country: preferences.country,
      max: 10,
    });

    res.status(200).json({
      success: true,
      totalArticles: newsData.totalArticles,
      articles: newsData.articles,
      preferences: {
        topics: preferences.topics,
        language: preferences.language,
        country: preferences.country,
      },
    });
  } catch (error: any) {
    console.error("Error fetching personalized news:", error);

    // Handle rate limit errors
    if (error.message.includes("Rate limit exceeded")) {
      return res.status(429).json({
        message: "GNews API rate limit exceeded. Please try again later.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to fetch news",
      error: error.message,
    });
  }
};

/**
 * Fetch trending/top headlines (global, cached)
 * GET /api/news/trending
 */
export const getTrendingNews = async (req: AuthRequest, res: Response) => {
  try {
    const { lang = "en", country, max = 10 } = req.query;

    // Fetch top headlines
    const newsData = await getTopHeadlines(
      lang as string,
      country as string | undefined,
      parseInt(max as string)
    );

    res.status(200).json({
      success: true,
      totalArticles: newsData.totalArticles,
      articles: newsData.articles,
    });
  } catch (error: any) {
    console.error("Error fetching trending news:", error);

    // Handle rate limit errors
    if (error.message.includes("Rate limit exceeded")) {
      return res.status(429).json({
        message: "GNews API rate limit exceeded. Please try again later.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to fetch trending news",
      error: error.message,
    });
  }
};
