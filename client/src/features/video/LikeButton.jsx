import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleLike } from "../../store/Slices/videoSlice";
import { motion} from "framer-motion";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";

function LikeButton({ videoId }) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { currentVideo } = useSelector((state) => state.video);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (currentVideo && currentUser) {
      const isLiked = currentVideo.likes?.includes(currentUser._id);
      setLiked(isLiked);
      setLikesCount(currentVideo.likes?.length || 0);
    }
  }, [currentVideo, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return toast.error("Please log in to like videos.");
    if (!videoId) return toast.error("Invalid video ID.");

    // Optimistic update
    const wasLiked = liked;
    setLiked(!liked);
    setLikesCount((prev) => prev + (liked ? -1 : 1));
    setLocalLoading(true);

    try {
      const result = await dispatch(toggleLike(videoId)).unwrap();
      
    } catch (error) {
      // Revert on failure
      setLiked(wasLiked);
      setLikesCount((prev) => prev + (wasLiked ? 1 : -1));
      toast.error(error?.message || "Failed to toggle like.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleLike}
      disabled={!videoId || localLoading}
      className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
        liked ? "text-red-500" : "text-white/80 hover:text-red-400"
      } ${localLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={liked ? "Unlike video" : "Like video"}
    >
      {liked ? <FaHeart /> : <FaRegHeart />}
      <span className="hidden sm:inline text-xs sm:text-sm font-medium text-white/90">
        {likesCount} {likesCount === 1 ? "Like" : "Likes"}
      </span>
    </motion.button>
  );
}

export default LikeButton;