import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import User from "./models/user.model.js";
import Video from "./models/video.model.js";
import {
  ensureStorageDirs,
  THUMBNAIL_STORAGE_DIR,
  VIDEO_STORAGE_DIR,
  processVideo,
  deleteVideoFiles,
  STORAGE_ROOT,
  getVideoDurationFromFile,
} from "./services/video.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const sampleVideos = [
  {
    title: "Big Buck Bunny",
    description:
      "Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.",
    category: "entertainment",
    thumbnailUrl: "https://picsum.photos/seed/bunny/640/360",
    videoUrl: "https://media.w3.org/2010/05/bunny/trailer.mp4",
    tags: ["cartoon", "bunny", "funny", "animation"],
  },
  {
    title: "Beautiful Flower",
    description: "A beautiful flower blooming in the garden.",
    category: "nature",
    thumbnailUrl: "https://picsum.photos/seed/flower/640/360",
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    tags: ["flower", "nature", "garden", "beautiful"],
  },
  {
    title: "Friday Vibes",
    description: "Enjoying the Friday vibes.",
    category: "entertainment",
    thumbnailUrl: "https://picsum.photos/seed/friday/640/360",
    videoUrl: "https://media.w3.org/2010/05/video/movie_300.mp4",
    tags: ["friday", "vibes", "weekend", "fun"],
  },
  {
    title: "Ocean Walk",
    description: "A calm ocean-side clip for playback testing.",
    category: "nature",
    thumbnailUrl: "https://picsum.photos/seed/oceanwalk/640/360",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    tags: ["ocean", "walk", "travel", "test"],
  },
  {
    title: "Mountain Morning",
    description: "Mountain scenery with a bright morning sky.",
    category: "travel",
    thumbnailUrl: "https://picsum.photos/seed/mountainmorning/640/360",
    videoUrl: "https://media.w3.org/2010/05/bunny/movie.mp4",
    tags: ["mountain", "morning", "scenery", "travel"],
  },
];

const downloadFile = async (url, absoluteTargetPath, retries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      await fs.writeFile(absoluteTargetPath, Buffer.from(arrayBuffer));
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }

  throw lastError;
};

const sanitize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const clearStorage = async () => {
  ensureStorageDirs();
  const entries = await fs.readdir(STORAGE_ROOT, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderPath = path.join(STORAGE_ROOT, entry.name);
    const files = await fs.readdir(folderPath);
    await Promise.all(files.map((file) => fs.unlink(path.join(folderPath, file))));
  }
};

const clearVideoReferencesFromUsers = async () => {
  await User.updateMany(
    {},
    {
      $set: {
        savedVideos: [],
        likedVideos: [],
        viewHistory: [],
      },
    }
  );
};

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    mongoose.set("bufferCommands", false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    ensureStorageDirs();

    const username = "john_doe";
    let user = await User.findOne({ username });

    if (!user) {
      console.log("Creating mock user...");
      user = new User({
        username,
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      });
      await user.save();
    } else {
      console.log(`Using existing user: ${user.name}`);
    }

    const existingVideos = await Video.find({});
    await Promise.all(existingVideos.map((video) => deleteVideoFiles(video)));
    await Video.deleteMany({});
    await clearVideoReferencesFromUsers();
    await clearStorage();

    console.log("Downloading sample assets and inserting local-storage videos...");

    for (let index = 0; index < sampleVideos.length; index += 1) {
      const sample = sampleVideos[index];
      const baseName = `${Date.now()}-${index + 1}-${sanitize(sample.title)}`;
      const videoFilename = `${baseName}.mp4`;
      const thumbnailFilename = `${baseName}.jpg`;
      const videoAbsolutePath = path.join(VIDEO_STORAGE_DIR, videoFilename);
      const thumbnailAbsolutePath = path.join(THUMBNAIL_STORAGE_DIR, thumbnailFilename);

      await downloadFile(sample.videoUrl, videoAbsolutePath);
      await downloadFile(sample.thumbnailUrl, thumbnailAbsolutePath);
      const duration = await getVideoDurationFromFile(videoAbsolutePath);

      const createdVideo = await Video.create({
        author: user._id,
        title: sample.title,
        description: sample.description,
        category: sample.category,
        duration,
        videoUrl: path.relative(STORAGE_ROOT, videoAbsolutePath).replace(/\\/g, "/"),
        thumbnailUrl: path
          .relative(STORAGE_ROOT, thumbnailAbsolutePath)
          .replace(/\\/g, "/"),
        tags: sample.tags,
        processingStatus: "processing",
      });

      await processVideo(createdVideo._id);
      console.log(`Seeded video: ${sample.title}`);
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
