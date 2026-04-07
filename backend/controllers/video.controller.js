import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose";
import path from "path";
import {
  processVideo,
  serializeVideo,
  STORAGE_ROOT,
  getVideoDurationFromFile,
} from "../services/video.service.js";

const parseTags = (tags) => {
  let processedTags = [];

  if (!tags) {
    return processedTags;
  }

  if (typeof tags === "string" && tags.startsWith("[")) {
    processedTags = JSON.parse(tags).map((tag) => tag.trim().toLowerCase());
  } else if (typeof tags === "string") {
    processedTags = tags.split(",").map((tag) => tag.trim().toLowerCase());
  } else if (Array.isArray(tags)) {
    processedTags = tags.map((tag) => tag.trim().toLowerCase());
  }

  const tagRegex = /^[a-zA-Z0-9\s-_]+$/;
  processedTags = processedTags.filter((tag) => tag && tagRegex.test(tag));
  processedTags = processedTags.filter((tag) => tag.length <= 50);

  return [...new Set(processedTags)];
};

const toStoredRelativePath = (absoluteFilePath) =>
  path.relative(STORAGE_ROOT, absoluteFilePath).replace(/\\/g, "/");


export const uploadVideo = async (req, res) => {
  try {
    const { title, category, description, tags } = req.body;
    const authorId = req.user?.userId;
    const { thumbnailImage, videoFile } = req.files || {};

    if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    if (!title?.trim() || !description?.trim() || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category are required",
      });
    }

    if (!videoFile?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Video file is required",
      });
    }

    let processedTags = [];
    if (tags) {
      try {
        processedTags = parseTags(tags);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid tags format",
        });
      }
    }

    const newVideo = new Video({
      author: authorId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      thumbnailUrl: thumbnailImage?.[0]
        ? toStoredRelativePath(thumbnailImage[0].path)
        : "",
      videoUrl: toStoredRelativePath(videoFile[0].path),
      tags: processedTags,
      variants: [],
      processingStatus: "processing",
      duration: await getVideoDurationFromFile(videoFile[0].path),
    });

    await newVideo.save();
    await newVideo.populate("author", "name profileImage");

    processVideo(newVideo._id).catch((error) => {
      console.error("Video processing failed:", error.message);
    });

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video: serializeVideo(newVideo, req),
    });
  } catch (error) {
    console.error("Upload video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload video",
      error: error.message,
    });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
      .populate("author", "name profileImage")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name profileImage",
        },
        options: { sort: { createdAt: -1 } }, // Sort comments by newest first
      });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video successfully fetched",
      video: serializeVideo(video, req),
    });
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllVideo = async (req, res) => {
  try {
    let {
      firstQueryTime,
      page = 1,
      limit = 8,
      author,
      category,
      search,
      sort,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (!firstQueryTime) {
      firstQueryTime = new Date().toISOString();
    }

    const query = { createdAt: { $lte: new Date(firstQueryTime) } };

    if (author) {
      query.author = author;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "popularity") {
      sortOptions = { viewCount: -1 };
    }

    const totalVideos = await Video.countDocuments(query);
    const totalPages = Math.ceil(totalVideos / limit);

    const videos = await Video.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name profileImage");

    return res.status(200).json({
      success: true,
      message: "Videos fetched successfully",
      firstQueryTime,
      page,
      limit,
      totalPages,
      totalVideos,
      videos: videos.map((video) => serializeVideo(video, req)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getPopularVideos = async (req, res) => {
  try {
    let { firstQueryTime, limit = 8, search } = req.query;

    limit = parseInt(limit) || 6;

    if (!firstQueryTime) {
      firstQueryTime = new Date().toISOString();
    }

    const query = { createdAt: { $lte: new Date(firstQueryTime) } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const videos = await Video.find(query).populate("author", "name profileImage");
    const sortedVideos = videos
      .sort((a, b) => {
        const popularityA = (a.viewCount || 0) + (a.likes?.length || 0);
        const popularityB = (b.viewCount || 0) + (b.likes?.length || 0);
        return popularityB - popularityA || new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, limit);

    return res.status(200).json({
      success: true,
      message: "Popular videos fetched successfully",
      firstQueryTime,
      limit,
      videos: sortedVideos.map((video) => serializeVideo(video, req)),
    });
  } catch (error) {
    console.error("getPopularVideos error", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleLikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const authenticatedUserId = req.user?.userId;

    // Validate authentication
    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to like or unlike video.",
      });
    }

    // Validate videoId
    if (!mongoose.isValidObjectId(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID.",
      });
    }

    // Check if video exists
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // Check if user exists
    const userDocument = await User.findById(authenticatedUserId);
    if (!userDocument) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Determine if the user has already liked the video
    const userHasAlreadyLiked = existingVideo.likes.some(
      (id) => id.toString() === authenticatedUserId.toString()
    );

    // Update Video's likes array
    const updateLikesAction = userHasAlreadyLiked
      ? { $pull: { likes: authenticatedUserId } } // Unlike
      : { $addToSet: { likes: authenticatedUserId } }; // Like

    const updatedVideoDocument = await Video.findByIdAndUpdate(
      videoId,
      updateLikesAction,
      { new: true }
    ).populate("author", "name profileImage");

    // Update User's likedVideos array
    if (userHasAlreadyLiked) {
      // Remove from likedVideos
      await User.findByIdAndUpdate(
        authenticatedUserId,
        { $pull: { likedVideos: { videoId } } },
        { new: true }
      );
    } else {
      // Add to likedVideos with videoId and likedAt
      await User.findByIdAndUpdate(
        authenticatedUserId,
        {
          $addToSet: {
            likedVideos: {
              videoId,
              likedAt: new Date(),
            },
          },
        },
        { new: true }
      );
    }

    // Fetch updated user with populated likedVideos.videoId
    const updatedUser = await User.findById(authenticatedUserId).populate({
      path: "likedVideos.videoId",
      select: "title thumbnailUrl author",
      populate: {
        path: "author",
        select: "name profileImage",
      },
    });

    return res.status(200).json({
      success: true,
      message: userHasAlreadyLiked
        ? "Like removed from this video."
        : "Video successfully liked.",
      liked: !userHasAlreadyLiked,
      videoId,
      userId: authenticatedUserId,
      totalLikes: updatedVideoDocument.likes.length,
      user: updatedUser, // Return updated user to reflect likedVideos
    });
  } catch (error) {
    console.error("Error toggling like on video:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating the like status.",
      error: error.message,
    });
  }
};

export const toggleBookmarkVideo = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.userId;
    const { videoId } = req.params;

    if (!authenticatedUserId) {
      return res.status(401).json({
        message: "Unauthorized: Please log in to save or unsave videos.",
      });
    }

    const videoToBookmark = await Video.findById(videoId);
    if (!videoToBookmark) {
      return res.status(404).json({
        message: "Video not found. It may have been deleted.",
      });
    }

    const userDocument = await User.findById(authenticatedUserId);
    if (!userDocument) {
      return res.status(404).json({
        message: "User not found. Please re-login and try again.",
      });
    }

    const alreadyBookmarked = userDocument.savedVideos.some(
      (saved) => saved.videoId?.toString() === videoId
    );

    if (alreadyBookmarked) {
      // Remove bookmark
      userDocument.savedVideos = userDocument.savedVideos.filter(
        (saved) => saved.videoId?.toString() !== videoId
      );
    } else {
      // Add bookmark
      userDocument.savedVideos.push({ videoId });
    }

    await userDocument.save();

    const updatedUserWithBookmarks = await User.findById(
      authenticatedUserId
    ).populate("savedVideos.videoId");

    res.status(200).json({
      message: alreadyBookmarked
        ? "Video removed from your saved list."
        : "Video added to your saved list.",
      bookmarked: !alreadyBookmarked,
      user: updatedUserWithBookmarks,
      videoId,
    });
  } catch (error) {
    console.error("Error toggling video bookmark:", error.message);
    res.status(500).json({
      message: "Something went wrong while bookmarking the video.",
      error: error.message,
    });
  }
};

export const updateVideoAsViewed = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.userId;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    let updatedVideo = video;

    if (!userId) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { viewCount: 1 } },
        { new: true }
      )
        .populate("author", "name profileImage")
        .populate({
          path: "comments",
          populate: {
            path: "author",
            select: "name profileImage",
          },
          options: { sort: { createdAt: -1 } },
        });

      return res.status(200).json({
        success: true,
        message: "Guest view counted",
        video: serializeVideo(updatedVideo, req),
      });
    }

    const viewedByCurrentUser = video.viewedBy.some((view) => view.userId === userId);

    if (!viewedByCurrentUser) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $addToSet: { viewedBy: { userId } },
          $inc: { viewCount: 1 },
        },
        { new: true }
      )
        .populate("author", "name profileImage")
        .populate({
          path: "comments",
          populate: {
            path: "author",
            select: "name profileImage",
          },
          options: { sort: { createdAt: -1 } },
        });
    } else {
      updatedVideo = await Video.findById(videoId)
        .populate("author", "name profileImage")
        .populate({
          path: "comments",
          populate: {
            path: "author",
            select: "name profileImage",
          },
          options: { sort: { createdAt: -1 } },
        });
    }

    await User.findByIdAndUpdate(userId, { $pull: { viewHistory: { videoId } } });
    await User.findByIdAndUpdate(userId, {
      $push: { viewHistory: { videoId, viewedAt: new Date() } },
    });

    return res.status(200).json({
      success: true,
      message: viewedByCurrentUser
        ? "Video already viewed by the user"
        : "Video updated as viewed",
      video: serializeVideo(updatedVideo, req),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addCommentToVideo = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const videoId = req.params.videoId;
    const { content } = req.body;

    // Validate user authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not logged in",
      });
    }

    // Validate comment content
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment content is required and must be a non-empty string",
      });
    }

    // Find the video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Create and save the comment
    const newComment = new Comment({
      content: content.trim(),
      author: userId,
      video: videoId, // Link comment to video
    });

    await newComment.save();

    // Add comment to video's comments array
    video.comments = video.comments || []; // Ensure comments array exists
    video.comments.push(newComment._id);
    await video.save();

    // Populate author details
    const populatedComment = await Comment.findById(newComment._id).populate(
      "author",
      "name profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error adding comment to video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment to video",
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: "You can only delete your own comment" });
    }

    await Comment.findByIdAndDelete(commentId);
    
    // Also remove from video
    await Video.findByIdAndUpdate(comment.video, { $pull: { comments: commentId } });

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


