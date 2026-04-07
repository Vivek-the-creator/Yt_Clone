import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";
import Video from "../models/video.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STORAGE_ROOT = path.join(__dirname, "../storage");
export const VIDEO_STORAGE_DIR = path.join(STORAGE_ROOT, "videos");
export const THUMBNAIL_STORAGE_DIR = path.join(STORAGE_ROOT, "thumbnails");

const VIDEO_VARIANTS = [
  { quality: "360p", height: 360 },
  { quality: "720p", height: 720 },
  { quality: "1080p", height: 1080 },
];
const execFileAsync = promisify(execFile);

export const ensureStorageDirs = () => {
  for (const dir of [STORAGE_ROOT, VIDEO_STORAGE_DIR, THUMBNAIL_STORAGE_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};

export const normalizeStoredPath = (storedPath = "") =>
  storedPath.replace(/\\/g, "/").replace(/^\/+/, "");

export const buildPublicFileUrl = (storedPath, req) => {
  if (!storedPath) return "";

  const normalizedPath = normalizeStoredPath(storedPath);
  const explicitBaseUrl = process.env.BACKEND_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  const requestBaseUrl = req ? `${req.protocol}://${req.get("host")}` : "";
  const baseUrl = explicitBaseUrl || requestBaseUrl;

  return baseUrl ? `${baseUrl}/storage/${normalizedPath}` : `/storage/${normalizedPath}`;
};

export const getAbsoluteStoragePath = (storedPath = "") =>
  path.join(STORAGE_ROOT, normalizeStoredPath(storedPath));

export const getVideoDurationFromFile = async (absoluteFilePath) => {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    absoluteFilePath,
  ]);

  const seconds = Number.parseFloat(stdout.trim());
  if (!Number.isFinite(seconds)) {
    throw new Error(`Unable to determine duration for ${absoluteFilePath}`);
  }

  return Math.round(seconds);
};

export const getVideoMetadataFromFile = async (absoluteFilePath) => {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "json",
    absoluteFilePath,
  ]);

  const parsed = JSON.parse(stdout || "{}");
  const stream = parsed.streams?.[0];

  if (!stream?.width || !stream?.height) {
    throw new Error(`Unable to determine video dimensions for ${absoluteFilePath}`);
  }

  return {
    width: stream.width,
    height: stream.height,
  };
};

const transcodeVariant = async ({ sourceAbsolutePath, targetAbsolutePath, targetHeight }) => {
  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    sourceAbsolutePath,
    "-vf",
    `scale=-2:${targetHeight}`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-ac",
    "2",
    "-b:a",
    "128k",
    targetAbsolutePath,
  ]);
};

export const serializeVideo = (videoDoc, req) => {
  if (!videoDoc) return null;

  const video =
    typeof videoDoc.toObject === "function" ? videoDoc.toObject() : { ...videoDoc };

  const sourcePublicUrl = buildPublicFileUrl(video.videoUrl, req);
  const thumbnailPublicUrl = buildPublicFileUrl(video.thumbnailUrl, req);
  const variants = Array.isArray(video.variants)
    ? video.variants.map((variant) => ({
        ...variant,
        path: buildPublicFileUrl(variant.path, req),
      }))
    : [];

  return {
    ...video,
    owner: video.author,
    sourcePath: sourcePublicUrl,
    sourceRelativePath: normalizeStoredPath(video.videoUrl),
    thumbnailPath: thumbnailPublicUrl,
    thumbnailRelativePath: normalizeStoredPath(video.thumbnailUrl),
    videoUrl: variants[variants.length - 1]?.path || sourcePublicUrl,
    thumbnailUrl: thumbnailPublicUrl,
    variants,
  };
};

export const processVideo = async (videoId) => {
  ensureStorageDirs();

  const video = await Video.findById(videoId);
  if (!video) {
    throw new Error("Video not found for processing");
  }

  const sourceRelativePath = normalizeStoredPath(video.videoUrl);
  const sourceAbsolutePath = getAbsoluteStoragePath(sourceRelativePath);

  if (!fs.existsSync(sourceAbsolutePath)) {
    throw new Error(`Source video file missing at ${sourceAbsolutePath}`);
  }

  const parsedSource = path.parse(sourceAbsolutePath);
  const variants = [];
  const metadata = await getVideoMetadataFromFile(sourceAbsolutePath);

  for (const variantConfig of VIDEO_VARIANTS) {
    const effectiveHeight = Math.min(metadata.height, variantConfig.height);
    const variantFilename = `${parsedSource.name}_${variantConfig.quality}.mp4`;
    const variantAbsolutePath = path.join(parsedSource.dir, variantFilename);
    const variantRelativePath = normalizeStoredPath(
      path.relative(STORAGE_ROOT, variantAbsolutePath)
    );

    await transcodeVariant({
      sourceAbsolutePath,
      targetAbsolutePath: variantAbsolutePath,
      targetHeight: effectiveHeight,
    });

    variants.push({
      quality: variantConfig.quality,
      path: variantRelativePath,
    });
  }

  video.variants = variants;
  video.duration = await getVideoDurationFromFile(sourceAbsolutePath);
  video.processingStatus = "ready";
  await video.save();

  return video;
};

export const deleteVideoFiles = async (videoDoc) => {
  if (!videoDoc) return;

  const storedPaths = new Set();

  if (videoDoc.videoUrl) {
    storedPaths.add(normalizeStoredPath(videoDoc.videoUrl));
  }

  if (videoDoc.thumbnailUrl) {
    storedPaths.add(normalizeStoredPath(videoDoc.thumbnailUrl));
  }

  if (Array.isArray(videoDoc.variants)) {
    for (const variant of videoDoc.variants) {
      if (variant?.path) {
        storedPaths.add(normalizeStoredPath(variant.path));
      }
    }
  }

  await Promise.all(
    [...storedPaths].map(async (storedPath) => {
      const absolutePath = path.join(STORAGE_ROOT, storedPath);
      if (fs.existsSync(absolutePath)) {
        await fsPromises.unlink(absolutePath);
      }
    })
  );
};

ensureStorageDirs();
