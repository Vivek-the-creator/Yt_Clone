import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../../store/Slices/userSlice";
import { Link, useLocation } from "react-router-dom";
import { FaRedo, FaPlayCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";

const Library = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  // Fetch user data on mount or when navigating back from VideoPlayer
  useEffect(() => {
    dispatch(fetchCurrentUser()).catch(() => {
      toast.error("Failed to load library. Please try again.");
    });
  }, [dispatch, location.pathname]); // Re-fetch when pathname changes

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle retry on error
  const handleRetry = () => {
    dispatch(fetchCurrentUser());
  };

  // Loading skeleton for cards
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton
            height={200}
            borderRadius={12}
            baseColor="#272727"
            highlightColor="#3f3f3f"
          />
          <div className="flex flex-col gap-2 mt-1 px-1">
            <Skeleton height={14} baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
            <Skeleton height={14} width="70%" baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );

  // Render video card
  const renderVideoCard = (item, type) => (
    <motion.li
      key={item._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3 w-full group cursor-pointer"
    >
      <Link
        to={`/video/${item.videoId._id}`}
        className="block"
        aria-label={`View video: ${item.videoId.title || "Untitled Video"}`}
      >
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <img
            src={item.videoId.thumbnailUrl || "/default-thumbnail.png"}
            alt={item.videoId.title || "Untitled Video"}
            className="w-full h-full object-cover group-hover:rounded-none group-hover:scale-[1.01] transition-all duration-200"
            loading="lazy"
            onError={(e) => (e.target.src = "/default-thumbnail.png")}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/40">
            <FaPlayCircle className="text-white text-4xl" />
          </div>
        </div>
        <div className="flex flex-col px-1 mt-3">
          <h3 className="text-base font-semibold text-[#f1f1f1] leading-tight line-clamp-2 pr-6 group-hover:text-white transition-colors">
            {item.videoId.title || "Untitled Video"}
          </h3>
          <p className="text-[13px] text-[#aaaaaa] mt-1">
            {type === "liked" ? "Liked" : "Saved"}:{" "}
            {formatDate(type === "liked" ? item.likedAt : item.savedAt)}
          </p>
        </div>
      </Link>
    </motion.li>
  );

  // Main render
  return (
    <div className="w-full h-full p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Library Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[24px] sm:text-[32px] font-bold text-[#f1f1f1] mb-8"
        >
          Your Library
        </motion.h1>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 bg-red-500/20 text-red-200 rounded-lg flex items-center justify-between border border-white/20"
            >
              <span>{error}</span>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/30 rounded hover:bg-red-500/50 transition-colors duration-200"
                aria-label="Retry loading library"
              >
                <FaRedo />
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && !currentUser ? (
          renderSkeleton()
        ) : (
          <div className="space-y-12">
            {/* Liked Videos Section */}
            <div>
              <h2 className="text-[20px] font-bold text-[#f1f1f1] mb-6">
                Liked Videos
              </h2>
              {currentUser?.likedVideos?.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                  {currentUser.likedVideos.map((item) =>
                    item.videoId && typeof item.videoId === "object" ? (
                      renderVideoCard(item, "liked")
                    ) : (
                      <li
                        key={item._id}
                        className="p-4 bg-[#272727] rounded-xl text-[#aaaaaa]"
                      >
                        Invalid video data (ID: {item.videoId})
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-[#aaaaaa]">No liked videos yet.</p>
              )}
            </div>

            {/* Saved Videos Section */}
            <div>
              <h2 className="text-[20px] font-bold text-[#f1f1f1] mb-6 pt-6 border-t border-[#303030]">
                Saved Videos
              </h2>
              {currentUser?.savedVideos?.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                  {currentUser.savedVideos.map((item) =>
                    item.videoId && typeof item.videoId === "object" ? (
                      renderVideoCard(item, "saved")
                    ) : (
                      <li
                        key={item._id}
                        className="p-4 bg-[#272727] rounded-xl text-[#aaaaaa]"
                      >
                        Invalid video data (ID: {item.videoId})
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-[#aaaaaa]">No saved videos yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
