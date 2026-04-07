import React, { useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { formatDuration, formatViews, timeAgo } from "../utils/formatters";

const VideoCardGrid = ({
  title,
  thunk,
  selector,
  linkPrefix = "/video",
  className = "",
}) => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(selector, shallowEqual);

  useEffect(() => {
    dispatch(thunk({ page: 1, limit: 6 }));
  }, [dispatch, thunk]);

  const cardVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <section
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 ${className}`}
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-[20px] font-bold text-[#f1f1f1] mb-6 tracking-tight ml-2"
      >
        {title.replace('🆕 ', '').replace('🎥 ', '')}
      </motion.h2>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-500/20 border-l-4 border-red-500 text-red-200 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton
                height={200}
                borderRadius={12}
                baseColor="#272727"
                highlightColor="#3f3f3f"
              />
              <div className="flex gap-3 pr-6 mt-1">
                <Skeleton circle width={36} height={36} baseColor="#272727" highlightColor="#3f3f3f" />
                <div className="flex flex-col w-full gap-2 mt-0.5">
                  <Skeleton height={14} baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
                  <Skeleton height={14} width="70%" baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          <AnimatePresence>
            {items?.length > 0 ? (
              items?.map((item) => (
                <Link
                  key={item._id}
                  to={`${linkPrefix}/${item._id}`}
                  className="block group cursor-pointer"
                  aria-label={`View details for ${
                    item.title || "Untitled Video"
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
                        src={item.thumbnailUrl || "/default-thumbnail.png"}
                        alt={item.title || "Untitled Video"}
                        className="w-full h-full object-cover group-hover:rounded-none group-hover:scale-[1.01] transition-all duration-200"
                        loading="lazy"
                        onError={(e) =>
                          (e.target.src = "/default-thumbnail.png")
                        }
                      />
                      {/* Video duration */}
                      <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded-md">
                        {formatDuration(item.duration)}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 px-1 mt-1">
                      {/* Avatar Placeholder */}
                      <div className="flex-shrink-0">
                        <div className="h-9 w-9 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg leading-none">
                          {item.title ? item.title.charAt(0).toUpperCase() : "U"}
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <div className="flex flex-col overflow-hidden max-w-full">
                        <h3 className="text-base font-semibold text-[#f1f1f1] leading-tight line-clamp-2 max-h-[2.5rem] group-hover:text-white transition-colors pr-6">
                          {item.title || "Untitled Video"}
                        </h3>
                        <div className="flex flex-col text-[13px] text-[#aaaaaa] mt-1 space-y-0.5">
                          <p className="hover:text-white transition-colors cursor-pointer truncate max-w-full">
                            {item.category ? item.category : "Unknown Channel"}
                          </p>
                          <p className="truncate">
                            {formatViews(item.viewCount)} • {timeAgo(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/80 text-center text-lg py-8 col-span-full"
              >
                No videos found.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};

export default VideoCardGrid;