import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./AppAuthLayout";
import MainLayout from "./AppMainLayout";

import Login from "../pages/register/Login";
import Signup from "../pages/register/Singup";
import Home from "../pages/home/Home";
import Explore from "../pages/explore/Explore"
import UserProfile from "../pages/profile/UserProfile"
import UpdateUser from "../pages/profile/UpdateUser"
import Library from "../pages/library/Library"
import UploadVideo from "../features/video/UploadVideo"
import AllVideo  from "../features/video/AllVideoCardGrid"
import VideoPlayer from "../features/video/VideoPlayer"
import PopularVideoCardGrid from "../pages/home/PopularVideoCardGrid";
import VideoSearchResults from "../features/search/VideoSearchResults";
import Subscriptions from "../pages/Subscriptions";
import History from "../pages/History";
import MyVideos from "../pages/MyVideos";

export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* MAIN APP ROUTES */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/library" element={<Library />} />
        <Route path="/update-user/:id" element={<UpdateUser />} />
        <Route path="/upload-video" element={<UploadVideo />} />
        <Route path="/all-videos" element={<AllVideo />} />
        <Route path="/popular" element={<PopularVideoCardGrid />} />
        <Route path="/video/:id" element={<VideoPlayer />} />
        <Route path="/search" element={<VideoSearchResults />} />
        <Route path="/my-videos" element={<MyVideos />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  );
}
