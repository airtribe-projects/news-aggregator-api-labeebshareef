import { Response } from "express";
import { UserPreference } from "../models/UserPreference";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * Save or update user preferences
 * POST /api/preferences
 */
export const savePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { topics, language, country, sources } = req.body;

    // Find existing preferences or create new
    let preferences = await UserPreference.findOne({ userId });

    if (preferences) {
      // Update existing preferences
      preferences.topics = topics || preferences.topics;
      preferences.language = language || preferences.language;
      preferences.country = country || preferences.country;
      preferences.sources = sources || preferences.sources;
      await preferences.save();
    } else {
      // Create new preferences
      preferences = await UserPreference.create({
        userId,
        topics: topics || [],
        language: language || "en",
        country: country || "us",
        sources: sources || [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Preferences saved successfully",
      preferences: {
        topics: preferences.topics,
        language: preferences.language,
        country: preferences.country,
        sources: preferences.sources,
      },
    });
  } catch (error: any) {
    console.error("Error saving preferences:", error);
    res.status(500).json({
      message: "Failed to save preferences",
      error: error.message,
    });
  }
};

/**
 * Get current user preferences
 * GET /api/preferences
 */
export const getPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const preferences = await UserPreference.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({
        message: "No preferences found. Please set your preferences first.",
      });
    }

    res.status(200).json({
      success: true,
      preferences: {
        topics: preferences.topics,
        language: preferences.language,
        country: preferences.country,
        sources: preferences.sources,
      },
    });
  } catch (error: any) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({
      message: "Failed to fetch preferences",
      error: error.message,
    });
  }
};
