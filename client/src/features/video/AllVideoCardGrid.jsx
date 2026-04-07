import React, { useState,} from "react";
import { useSelector } from "react-redux";
import VideoCardGrid from "../../components/VideoCardGrid";
import Pagination from "../../components/Pagination";
import { fetchAllVideos } from "../../store/slices/videoSlice";

const AllVideoCardGrid = () => {

  const [page, setPage] = useState(1);
  const { totalPages, error} = useSelector((state) => state.video);


  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <VideoCardGrid
        title="🆕 All Videos"
        thunk={fetchAllVideos} 
        selector={(state) => ({
          items: state.video?.videos || [],
          loading: state.video?.loading,
          error: state.video.error || null,
          totalPages: state.video.totalPages || 1,
        })}
        page={page}
        limit={8}
        linkPrefix="/video"
        className="py-12"
      />
      <Pagination
        page={page}
        setPage={setPage}
        totalPages={totalPages || 1}
        className="pb-8"
      />
    </div>
  );
};

export default AllVideoCardGrid;
