import React from "react";
import AllVideoCardGrid from "../../features/video/AllVideoCardGrid";
import SearchInput from "../../features/search/SearchInput";

const Explore = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <SearchInput />
      <AllVideoCardGrid />
    </div>
  );
};

export default Explore;
