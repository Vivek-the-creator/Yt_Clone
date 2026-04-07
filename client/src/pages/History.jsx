import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";

const History = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5004/api/users/history/watch", {
          withCredentials: true,
        });
        if (response.data.success) {
          setHistory(response.data.history.reverse());
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="w-full h-full p-4 sm:p-8">
      <h2 className="text-[24px] sm:text-[32px] font-bold text-[#f1f1f1] mb-8">Watch History</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton width={160} height={90} borderRadius={8} baseColor="#272727" highlightColor="#3f3f3f" />
              <div className="flex-1 flex flex-col gap-1">
                <Skeleton height={16} baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
                <Skeleton height={14} width="50%" baseColor="#272727" highlightColor="#3f3f3f" borderRadius={4} />
              </div>
            </div>
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="flex flex-col gap-4">
          {history.map((item) => (
            <Link to={`/video/${item.videoId?._id}`} key={item._id} className="flex gap-4 p-2 hover:bg-[#272727] rounded-xl transition-colors">
              <img src={item.videoId?.thumbnailUrl} alt="Thumbnail" className="w-[160px] h-[90px] object-cover rounded-xl bg-[#272727]" />
              <div className="flex flex-col">
                <h3 className="text-base font-medium text-[#f1f1f1] leading-tight line-clamp-2">{item.videoId?.title}</h3>
                <p className="text-[13px] text-[#aaaaaa] mt-1">{item.videoId?.author?.name}</p>
                <p className="text-[12px] text-[#aaaaaa] mt-0.5">Viewed on {new Date(item.viewedAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-[#aaaaaa] mt-10">
          <p>Your watch history is empty.</p>
        </div>
      )}
    </div>
  );
};

export default History;
