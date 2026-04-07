import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addComment } from "../../store/Slices/videoSlice";
import { motion, AnimatePresence } from "framer-motion";

const VideoComment = ({ videoId }) => {
  const dispatch = useDispatch();
  const {
    currentVideo,
    loading,
    error: videoError,
  } = useSelector((state) => state.video);
  const { currentUser } = useSelector((state) => state.user);
  const [commentText, setCommentText] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle comment submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await dispatch(addComment({ videoId, content: commentText })).unwrap();
      setCommentText(""); // Clear input
      setSuccessMessage("Comment posted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3s
    } catch (err) {
      console.error("Failed to add comment:", err);
      setSuccessMessage(null);
    }
  };

  // Loading state for initial video load
  if (!currentVideo) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-white/80 animate-pulse"
      >
        Loading comments...
      </motion.div>
    );
  }

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 border border-white/20">
      {/* Comment Form */}
      <h3 className="text-lg sm:text-xl font-bold text-purple-400 mb-3 sm:mb-4">
        Comments
      </h3>
      <AnimatePresence>
        {videoError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-center text-sm sm:text-base mb-3 sm:mb-4"
          >
            {videoError}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-green-400 text-center text-sm sm:text-base mb-3 sm:mb-4"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
      {currentUser ? (
        <form
          onSubmit={handleAddComment}
          className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base resize-none"
            rows={4}
            disabled={loading}
            aria-label="Write a comment"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || !commentText.trim()}
            className="self-end px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all text-sm sm:text-base"
          >
            {loading ? "Posting..." : "Post Comment"}
          </motion.button>
        </form>
      ) : (
        <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">
          <Link to="/login" className="text-purple-400 hover:underline">
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      )}

      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4">
        {currentVideo?.comments && currentVideo.comments.length > 0 ? (
          currentVideo.comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3 sm:gap-4 items-start border-b border-white/10 pb-3 sm:pb-4 last:border-b-0"
            >
              <img
                src={comment.author?.profileImage || "/default-avatar.png"}
                alt={comment.author?.name || "User"}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-white/20 flex-shrink-0"
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <p className="font-semibold text-white text-sm sm:text-base">
                    {comment?.author?.name || "Unknown User"}
                  </p>
                  <span className="text-xs sm:text-sm text-white/80">
                    {new Date(comment.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-white/90 text-sm sm:text-base break-words">
                  {comment.content}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-white/80 text-center text-sm sm:text-base">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoComment;
