import React from "react";

import VideoCardGrid from "../../components/VideoCardGrid";

import { fetchPopularVideos } from "../../store/Slices/videoSlice";

const PopularVideoCardGrid = () => {


  return (
    <div className="w-full">
      <VideoCardGrid
        title="🆕 Popular Videos"
        thunk={() => fetchPopularVideos({ limit: 8 })}
        selector={(state) => ({
          items: state.video.popularVideos || [],
          loading: state.video.popularVideosLoading || false,
          error: state.video.error || null,
        })}
        linkPrefix="/video"
        className="py-12"
      />
    </div>
  );
};

export default PopularVideoCardGrid;
