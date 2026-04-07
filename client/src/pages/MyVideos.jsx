import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaTrashAlt, FaVideo } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchCurrentUser } from "../store/Slices/userSlice";
import { deleteVideo, fetchAllVideos } from "../store/Slices/videoSlice";
import { formatDuration, formatViews, timeAgo } from "../utils/formatters";

const MyVideos = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, fetchUserLoading } = useSelector((state) => state.user);
  const { videos, loading, error } = useSelector((state) => state.video);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(
        fetchAllVideos({
          page: 1,
          limit: 50,
          author: currentUser._id,
        })
      );
    }
  }, [currentUser?._id, dispatch]);

  const handleDelete = async (videoId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(videoId);
      const result = await dispatch(deleteVideo(videoId)).unwrap();
      toast.success(result.message || "Video deleted successfully.");
      dispatch(fetchCurrentUser());
    } catch (err) {
      toast.error(err || "Failed to delete video.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!fetchUserLoading && !currentUser) {
    navigate("/login");
    return null;
  }

  return (
    <div className="w-full h-full p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[24px] sm:text-[32px] font-bold text-[#f1f1f1]">
              My Videos
            </h1>
            <p className="text-[#aaaaaa] mt-2">
              Manage the videos uploaded from your account.
            </p>
          </div>
          <Link
            to="/upload-video"
            className="inline-flex items-center gap-2 rounded-full bg-[#3ea6ff] px-5 py-3 text-black font-semibold hover:bg-[#65b8ff] transition-all duration-200"
          >
            <FaVideo />
            Upload Video
          </Link>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 bg-red-500/20 border-l-4 border-red-500 text-red-200 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {loading || fetchUserLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-3">
                <Skeleton
                  height={200}
                  borderRadius={12}
                  baseColor="#272727"
                  highlightColor="#3f3f3f"
                />
                <Skeleton
                  height={16}
                  baseColor="#272727"
                  highlightColor="#3f3f3f"
                  borderRadius={4}
                />
                <Skeleton
                  height={14}
                  width="70%"
                  baseColor="#272727"
                  highlightColor="#3f3f3f"
                  borderRadius={4}
                />
              </div>
            ))}
          </div>
        ) : videos?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {videos.map((video) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                <Link
                  to={`/video/${video._id}`}
                  className="block group cursor-pointer"
                  aria-label={`Open ${video.title || "Untitled Video"}`}
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl">
                    <img
                      src={video.thumbnailUrl || "/default-thumbnail.png"}
                      alt={video.title || "Untitled Video"}
                      className="w-full h-full object-cover group-hover:scale-[1.01] transition-all duration-200"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/default-thumbnail.png";
                      }}
                    />
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded-md">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                </Link>

                <div className="flex flex-col gap-2 px-1">
                  <h2 className="text-base font-semibold text-[#f1f1f1] leading-tight line-clamp-2">
                    {video.title || "Untitled Video"}
                  </h2>
                  <p className="text-[13px] text-[#aaaaaa]">
                    {video.category || "Uncategorized"}
                  </p>
                  <p className="text-[13px] text-[#aaaaaa]">
                    {formatViews(video.viewCount)} • {timeAgo(video.createdAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(video._id)}
                    disabled={deletingId === video._id}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-red-500/50 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <FaTrashAlt />
                    {deletingId === video._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#303030] bg-[#181818] p-10 text-center">
            <h2 className="text-xl font-semibold text-[#f1f1f1]">No uploaded videos yet</h2>
            <p className="text-[#aaaaaa] mt-2">
              Videos you upload from this account will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVideos;
