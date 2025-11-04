import express from "express";
import { savePreferences, getPreferences } from "../controllers/preferenceController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// All preference routes require authentication
router.post("/", protect, savePreferences);
router.get("/", protect, getPreferences);

export default router;
