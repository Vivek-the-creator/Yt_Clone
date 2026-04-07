import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Video from "./models/video.model.js";
import { processVideo } from "./services/video.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const reprocessVideos = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const videos = await Video.find({});

    for (const video of videos) {
      console.log(`Reprocessing ${video.title}...`);
      await processVideo(video._id);
    }

    console.log("All videos reprocessed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to reprocess videos:", error);
    process.exit(1);
  }
};

reprocessVideos();
