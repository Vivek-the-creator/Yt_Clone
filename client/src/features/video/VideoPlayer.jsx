import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaComment,
  FaExpand,
} from "react-icons/fa";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import VideoComment from "./VideoComment";
import { fetchVideo, updateVideoAsViewed } from "../../store/Slices/videoSlice";

const VideoPlayer = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentVideo, error } = useSelector((state) => state.video);

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [toggleComment, setToggleComment] = useState(false);

  useEffect(() => {
    if (id) {
      setIsInitialLoading(true);
      dispatch(fetchVideo(id))
        .unwrap()
        .then(() => {
          dispatch(updateVideoAsViewed(id));
        })
        .finally(() => setIsInitialLoading(false));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!videoRef.current || !currentVideo?.videoUrl) return;

    const player = videoRef.current;
    player.load();

    const playAttempt = player.play();
    if (playAttempt?.catch) {
      playAttempt.catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentVideo?.videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch((err) => console.error("Playback failed:", err));
    } else {
      videoRef.current.pause();
    }
  };

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || duration;
    if (dur) {
      setProgress((current / dur) * 100);
    }
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    videoRef.current.volume = volume;
    videoRef.current.playbackRate = playbackRate;
  };

  const handleSeek = (e) => {
    const { value } = e.target;
    if (!videoRef.current) return;
    videoRef.current.currentTime = (value / 100) * duration;
    setProgress(value);
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      videoRef.current.currentTime - 10
    );
    setProgress((videoRef.current.currentTime / duration) * 100);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      duration,
      videoRef.current.currentTime + 10
    );
    setProgress((videoRef.current.currentTime / duration) * 100);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (volume > 0) {
      setVolume(0);
      videoRef.current.volume = 0;
    } else {
      videoRef.current.volume = volume || 1;
      setVolume(volume || 1);
    }
  };

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    if (!videoRef.current) return;
    videoRef.current.playbackRate = newRate;
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  const toggleCommentHandle = () => {
    setToggleComment((prev) => !prev);
  };

  const formatTime = (sec = 0) => {
    const minutes = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-3xl mx-auto w-full">
        <Skeleton
          height={180}
          baseColor="#202020"
          highlightColor="#444"
          className="rounded-lg"
        />
        <Skeleton
          height={24}
          width="60%"
          baseColor="#202020"
          highlightColor="#444"
          className="rounded-lg"
        />
        <Skeleton
          height={16}
          width="40%"
          baseColor="#202020"
          highlightColor="#444"
          className="rounded-lg"
        />
        <Skeleton
          height={40}
          width="100%"
          baseColor="#202020"
          highlightColor="#444"
          className="rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 max-w-3xl mx-auto w-full bg-red-900/50 border-l-4 border-red-600 text-red-200 rounded-lg shadow-md"
      >
        <p className="font-medium text-center">Error: {error}</p>
      </motion.div>
    );
  }

  if (!currentVideo) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-6 px-4 sm:px-6 lg:px-8 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[1000px] bg-[#0f0f0f] flex flex-col"
      >
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
          <video
            ref={videoRef}
            src={currentVideo.videoUrl}
            poster={currentVideo.thumbnailUrl || "/default-thumbnail.png"}
            className="w-full h-full object-contain rounded-t-lg cursor-pointer"
            controls
            playsInline
            autoPlay
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            preload="metadata"
          />
        </div>

        {/* Details & Controls */}
        <div className="pt-4 pb-6">
          <h1 className="text-[20px] font-bold text-[#f1f1f1] mb-2 line-clamp-2 leading-tight">
            {currentVideo.title}
          </h1>
          {/* Action Buttons */}
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <p>
                <span className="text-gray-400 font-medium">Views:</span>{" "}
                <span className="text-gray-400 font-medium">
                  {currentVideo.viewCount || 0}
                </span>
              </p>
              <LikeButton videoId={currentVideo._id} />
              <BookmarkButton videoId={currentVideo._id} />
              <motion.button
                onClick={toggleCommentHandle}
                aria-label={toggleComment ? "Hide comments" : "Show comments"}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-all duration-200 p-2 rounded-full hover:bg-[#303030]"
                whileTap={{ scale: 0.95 }}
              >
                <FaComment className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline text-xs sm:text-sm font-medium">
                  Comments
                </span>
              </motion.button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-[#606060] rounded-full cursor-pointer accent-red-600 hover:accent-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Seek video"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{formatTime((progress / 100) * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
            {/* Playback Controls */}
            <div className="flex items-center justify-start w-full sm:w-2/3 gap-1 sm:gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={skipBackward}
                aria-label="Skip backward 10 seconds"
                className="flex items-center gap-1 text-[#f1f1f1] transition-all duration-200 p-2 rounded-full hover:bg-[#272727]"
              >
                <FaBackward className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause video" : "Play video"}
                className="text-[#f1f1f1] p-2 transition-all duration-300"
              >
                {isPlaying ? (
                  <FaPause className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <FaPlay className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={skipForward}
                aria-label="Skip forward 10 seconds"
                className="flex items-center gap-1 text-[#f1f1f1] transition-all duration-200 p-2 rounded-full hover:bg-[#272727]"
              >
                <FaForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
            {/* Volume, Playback Speed, Full Screen */}
            <div className="flex items-center justify-between w-full sm:w-1/3 gap-1 sm:gap-2 sm:justify-end">
              <div className="flex items-center gap-1">
                <select
                  value={playbackRate}
                  onChange={handlePlaybackRateChange}
                  className="bg-[#282828] text-white border border-[#303030] rounded-lg p-2 text-xs sm:text-sm focus:ring-red-500 focus:border-red-500 cursor-pointer"
                  aria-label="Playback speed"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMute}
                  aria-label={volume === 0 ? "Unmute video" : "Mute video"}
                  className="text-gray-400 hover:text-white transition-all duration-200 p-2 rounded-full hover:bg-[#303030]"
                >
                  {volume === 0 ? (
                    <FaVolumeMute className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <FaVolumeUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </motion.button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1 bg-[#606060] rounded-full cursor-pointer accent-red-600 hover:accent-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Adjust volume"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFullScreen}
                  aria-label="Toggle full screen"
                  className="text-gray-400 hover:text-white transition-all duration-200 p-2 rounded-full hover:bg-[#303030]"
                >
                  <FaExpand className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Conditionally Render VideoComment */}
          {toggleComment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-4"
            >
              <VideoComment videoId={currentVideo._id} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VideoPlayer;
