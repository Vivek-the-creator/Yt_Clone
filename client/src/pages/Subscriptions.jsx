import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";

const Subscriptions = () => {
  const [loading, setLoading] = useState(false);
  const [subscribedVideos, setSubscribedVideos] = useState([]);

  useEffect(() => {
    // Basic implementation for UI placeholder
    // Currently, backend needs an endpoint to fetch videos of subscribed channels
    // We could fetch them here when that endpoint is available.
    setLoading(false);
    setSubscribedVideos([]);
  }, []);

  return (
    <div className="w-full h-full p-4 sm:p-8">
      <h2 className="text-[24px] sm:text-[32px] font-bold text-[#f1f1f1] mb-8">Subscriptions</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton height={200} borderRadius={12} baseColor="#272727" highlightColor="#3f3f3f" />
              <div className="flex flex-col gap-2 mt-1 px-1">
                 <Skeleton height={14} baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
                 <Skeleton height={14} width="70%" baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
              </div>
            </div>
          ))}
        </div>
      ) : subscribedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Render subscribed videos here */}
        </div>
      ) : (
        <div className="text-center text-[#aaaaaa] mt-10">
          <p>You haven't subscribed to any channels or there are no new videos.</p>
          <Link to="/explore" className="text-[#3ea6ff] mt-4 inline-block font-medium hover:text-white transition-colors">
            Explore channels
          </Link>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
