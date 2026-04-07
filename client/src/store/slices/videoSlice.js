import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/videoAPI";
import { fetchCurrentUser } from "./userSlice";

export const uploadVideo = createAsyncThunk(
  "video/uploadVideo",
  async (videoData, thunkAPI) => {
    try {
      const { data } = await api.uploadVideoAPI(videoData);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchAllVideos = createAsyncThunk(
  "video/fetchAllVideos",
  async ({ page, limit, search = "" }, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchAllVideosAPI({ page, limit, search });

      return {
        items: data.videos,
        totalPages: data.totalPages,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch videos"
      );
    }
  }
);

export const fetchPopularVideos = createAsyncThunk(
  "video/fetchPopularVideos",
  async (
    { search = "", limit = 8, firstQueryTime = null },
    { rejectWithValue }
  ) => {
    try {
      const params = { search, limit };
      if (firstQueryTime) {
        params.firstQueryTime = firstQueryTime;
      }
      
      const data = await api.fetchPopularVideosAPI(params);
  
      return {
        popularVideos: data.videos,
        firstQueryTime: data.firstQueryTime,
      };
    } catch (err) {
      console.error("Fetch popular videos error", err.message);
      return rejectWithValue(err.message || "Failed to fetch popular videos");
    }
  }
);

export const fetchVideo = createAsyncThunk(
  "video/fetchVideo",
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await api.fetchVideoAPI(videoId);
      console.log("response", response)
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch video");
      }
      return response.data.video; // Return the video object
    } catch (err) {
      console.error("Fetch video error:", err);
      return rejectWithValue(err.message || "Failed to fetch video");
    }
  }
);

export const toggleLike = createAsyncThunk(
  "video/toggleLike",
  async (videoId, thunkAPI) => {
    try {
      const { data } = await api.toggleLikeAPI(videoId);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const toggleBookmark = createAsyncThunk(
  "video/toggleBookmark",
  async (videoId, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.toggleBookmarkAPI(videoId);
      // Dispatch fetchCurrentUser to update user slice asynchronously
      dispatch(fetchCurrentUser());
      return { videoId, bookmarked: data.bookmarked };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateVideoAsViewed = createAsyncThunk(
  "video/updateVideoAsViewed",
  async (videoId, thunkAPI) => {
    try {
      const { data } = await api.updateVideoAsViewedAPI(videoId);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const addComment = createAsyncThunk(
  "video/addComment",
  async ({ videoId, content }, thunkAPI) => {
    try {
      const { data } = await api.addCommentAPI(videoId, content);
      return data.comment;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

const initialState = {
  videos: [],
  popularVideos: [],
  videoData: null,
  bookmarkedVideos: [],
  currentVideo: null,
  popularVideosLoading:false,
  loading: false,
  error: null,
  totalPages: 1,
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.videos.unshift(action.payload.video);
      })
      .addCase(fetchAllVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload.items;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPopularVideos.fulfilled, (state, action) => {
        state.popularVideos = action.payload.popularVideos;
        state.firstQueryTime = action.payload.firstQueryTime;
        state.popularVideosLoading = false;
      })
      .addCase(fetchPopularVideos.pending, (state) => {
        state.popularVideosLoading = true;
        state.error = null;
      })
      .addCase(fetchPopularVideos.rejected, (state, action) => {
        state.popularVideosLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload;
      })
      .addCase(fetchVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { videoId, liked, userId } = action.payload;
        const video = state.currentVideo;
        if (video?._id === videoId) {
          video.likes = video.likes || [];
          const alreadyLiked = video.likes.includes(userId);
          if (liked && !alreadyLiked) video.likes.push(userId);
          else if (!liked && alreadyLiked)
            video.likes = video.likes.filter((id) => id !== userId);
        }
      })
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const { videoId, bookmarked } = action.payload;
        // Update bookmarkedVideos
        if (bookmarked) {
          if (!state.bookmarkedVideos.includes(videoId)) {
            state.bookmarkedVideos.push(videoId);
          }
        } else {
          state.bookmarkedVideos = state.bookmarkedVideos.filter(
            (id) => id !== videoId
          );
        }
        // Update state.videos and currentVideo for consistency
        const video = state.videos.find((v) => v._id === videoId);
        if (video) {
          video.userBookmarked = bookmarked;
        }
        if (state.currentVideo?._id === videoId) {
          state.currentVideo.userBookmarked = bookmarked;
        }
      })
      .addCase(updateVideoAsViewed.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (
          state.currentVideo?._id &&
          state.currentVideo._id === action.payload.video?._id
        ) {
          state.currentVideo.viewCount = action.payload.video.viewCount;
          state.currentVideo.processingStatus =
            action.payload.video.processingStatus;
          state.currentVideo.variants = action.payload.video.variants || [];
          state.currentVideo.videoUrl =
            action.payload.video.videoUrl || state.currentVideo.videoUrl;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentVideo && state.currentVideo.comments) {
          state.currentVideo.comments.push(action.payload);
        }
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("video") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("video") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearError } = videoSlice.actions;
export default videoSlice.reducer;
