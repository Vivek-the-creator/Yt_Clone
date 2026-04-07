import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleBookmark } from "../../store/Slices/videoSlice";
import { motion } from "framer-motion";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { toast } from "react-toastify";

function BookmarkButton({ videoId }) {
  const dispatch = useDispatch();
  const { currentUser, loading: userLoading } = useSelector(
    (state) => state.user
  );


  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.savedVideos && videoId) {
      const bookmarked = currentUser.savedVideos.some((entry) => {
        const id = entry.videoId?._id || entry.videoId;
        return id?.toString() === videoId?.toString();
      });
      setIsBookmarked(bookmarked);
    }
  }, [currentUser, videoId]);

  const handleBookmark = async () => {
    if (!currentUser) return toast.error("Please log in to save videos!");
    if (!videoId) return toast.error("Invalid video ID");

    // Optimistic update
    const wasBookmarked = isBookmarked;
    setIsBookmarked(!isBookmarked);
    setLocalLoading(true);

    try {
      const result = await dispatch(toggleBookmark(videoId)).unwrap();
     
     
    } catch (error) {
      // Revert on failure
      setIsBookmarked(wasBookmarked);
      toast.error(error?.message || "Failed to toggle bookmark.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleBookmark}
      disabled={!videoId || localLoading || userLoading}
      className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
        isBookmarked ? "text-amber-400" : "text-white/80 hover:text-amber-400"
      } ${localLoading || userLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isBookmarked ? "Remove from saved videos" : "Save video"}
    >
      {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
      <span className="hidden sm:inline text-xs sm:text-sm font-medium text-white/90">
        {isBookmarked ? "Saved" : "Save"}
      </span>
    </motion.button>
  );
}

export default BookmarkButton;
