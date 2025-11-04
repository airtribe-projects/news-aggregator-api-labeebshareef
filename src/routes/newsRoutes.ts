import express from "express";
import { getPersonalizedNews, getTrendingNews } from "../controllers/newsController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// All news routes require authentication
router.get("/", protect, getPersonalizedNews);
router.get("/trending", protect, getTrendingNews);

export default router;
