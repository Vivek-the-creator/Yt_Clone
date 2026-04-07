import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchAllVideos } from "../../store/Slices/videoSlice";
import { formatDuration, formatViews, timeAgo } from "../../utils/formatters";

const VideoSearchResults = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { videos, loading, error, totalPages } = useSelector(
    (state) => state.video
  );

  const [page, setPage] = useState(1);

  // Parse query parameter
  const query = new URLSearchParams(location.search);
  const searchTerm = query.get("q") || "";
  const hasSearched = searchTerm.trim().length > 0;

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Fetch search results
  useEffect(() => {
    if (hasSearched) {
      dispatch(fetchAllVideos({ search: searchTerm, page, limit: 6 }))
        .unwrap()
        .catch((err) => console.error("Fetch videos error:", err));
    }
  }, [dispatch, hasSearched, searchTerm, page]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full h-full text-[#f1f1f1] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[20px] font-bold text-[#f1f1f1] mb-8 tracking-tight"
        >
          Search Results for "{searchTerm}"
        </motion.h2>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton height={200} borderRadius={12} baseColor="#272727" highlightColor="#3f3f3f" />
                <div className="flex flex-col gap-2 mt-1 px-1">
                  <Skeleton height={14} baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
                  <Skeleton height={14} width="70%" baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/50 border-l-4 border-red-600 text-red-200 p-4 rounded-lg shadow-sm mb-10"
          >
            <p className="font-medium">Error: {error}</p>
          </motion.div>
        )}

        {/* Search Results: Videos */}
        <div className="mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6">
            Videos
          </h3>
          <AnimatePresence>
            {hasSearched && videos?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                {videos.map((video) => (
                  <Link
                    key={video._id}
                    to={`/video/${video._id}`}
                    className="block group cursor-pointer"
                    aria-label={`View details for ${
                      video.title || "Untitled Video"
                    }`}
                  >
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex flex-col gap-3"
                    >
                      <div className="relative aspect-video overflow-hidden rounded-xl">
                        <img
                          src={
                            video.thumbnailUrl ||
                            "/default-thumbnail.png"
                          }
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:rounded-none group-hover:scale-[1.01] transition-all duration-200"
                          loading="lazy"
                          onError={(e) =>
                            (e.target.src = "/default-thumbnail.png")
                          }
                        />
                        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded-md">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div className="flex gap-3 px-1 mt-1">
                        <div className="flex-shrink-0">
                          <div className="h-9 w-9 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg leading-none">
                            {video.title ? video.title.charAt(0).toUpperCase() : "U"}
                          </div>
                        </div>
                        <div className="flex flex-col overflow-hidden max-w-full">
                          <h4 className="text-base font-semibold text-[#f1f1f1] leading-tight line-clamp-2 max-h-[2.5rem] group-hover:text-white transition-colors pr-6">
                            {video.title || "Untitled Video"}
                          </h4>
                          <div className="flex flex-col text-[13px] text-[#aaaaaa] mt-1 space-y-0.5">
                            <p className="hover:text-white transition-colors cursor-pointer truncate max-w-full">
                              {video.category || "Uncategorized"}
                            </p>
                            <p className="truncate">
                              {formatViews(video.viewCount)} • {timeAgo(video.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : hasSearched && !loading ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-center text-lg py-8"
              >
                No videos found.
              </motion.p>
            ) : !loading ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-center text-lg py-8"
              >
                Enter a search term to find videos.
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {!loading && videos?.length > 0 && (
          <div className="mt-6 flex justify-center gap-4 items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="py-2 px-4 rounded-full bg-[#272727] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3f3f3f] transition-all duration-200"
            >
              Previous
            </motion.button>
            <span className="text-gray-300">
              Page {page} of {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="py-2 px-4 rounded-full bg-[#272727] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3f3f3f] transition-all duration-200"
            >
              Next
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSearchResults;
