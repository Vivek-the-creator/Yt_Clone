import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Video from "./models/video.model.js";
import {
  getAbsoluteStoragePath,
  getVideoDurationFromFile,
} from "./services/video.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const backfillDurations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const videos = await Video.find({});

    for (const video of videos) {
      const absolutePath = getAbsoluteStoragePath(video.videoUrl);
      const duration = await getVideoDurationFromFile(absolutePath);
      video.duration = duration;
      await video.save();
      console.log(`Updated duration for ${video.title}: ${duration}s`);
    }

    console.log("Video durations updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to backfill video durations:", error);
    process.exit(1);
  }
};

backfillDurations();
