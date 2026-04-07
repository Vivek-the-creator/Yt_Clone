import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FaUserEdit, FaSignOutAlt, FaTrashAlt, FaUpload } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchCurrentUser,
  logoutUser,
  deleteUser,
} from "../../store/Slices/userSlice";
import { toast } from "react-toastify";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    currentUser,
    updateUserLoading: loading,
    error,
  } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, currentUser]);

  const formatJoinDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed: " + (err.message || "Unknown error"));
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await dispatch(deleteUser(currentUser._id)).unwrap();
        toast.success("Account deleted successfully!");
        navigate("/signup");
      } catch (err) {
        toast.error(
          "Delete account failed: " + (err.message || "Unknown error")
        );
      }
    }
  };

  if (loading || (!currentUser && !error)) {
    return (
      <div className="flex justify-center flex-col items-center min-h-[50vh] text-white">
        <div className="h-8 w-8 border-4 border-t-[#3ea6ff] border-[#272727] rounded-full animate-spin mb-4" />
        <p className="text-[#aaaaaa]">Loading...</p>
      </div>
    );
  }

  if (!currentUser && error) {
    navigate("/login");
    return null;
  }

  return (
    <div className="w-full h-full p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/20 text-red-200 rounded-lg text-center font-medium backdrop-blur-lg border border-white/20"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-[#303030] pb-8 mb-8"
        >
          <img
            src={currentUser.profileImage}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
            onError={(e) => (e.target.src = "/default-profile.png")}
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {currentUser.name || "N/A"}
            </h1>
            <p className="text-white/80">@{currentUser.username || "N/A"}</p>
            <p className="text-white/80">
              Joined: {formatJoinDate(currentUser.createdAt)}
            </p>
          </div>
        </motion.div>

        {/* Account and Creator Sections */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-bold text-[#f1f1f1] mb-2">
              Account
            </h2>
            <div className="flex flex-col">
              <Link
                to={`/update-user/${currentUser._id}`}
                className="flex items-center gap-4 p-4 hover:bg-[#272727] transition-all duration-200 rounded-lg text-[#f1f1f1]"
              >
                <FaUserEdit className="text-xl text-[#aaaaaa]" />
                <span className="font-medium">Edit Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className={`flex items-center gap-4 p-4 hover:bg-[#272727] transition-all duration-200 rounded-lg text-left text-[#f1f1f1] ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaSignOutAlt className="text-xl text-[#aaaaaa]" />
                <span className="font-medium">{loading ? "Logging out..." : "Logout"}</span>
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className={`flex items-center gap-4 p-4 hover:bg-[#272727] transition-all duration-200 rounded-lg text-left text-red-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaTrashAlt className="text-xl" />
                <span className="font-medium">{loading ? "Deleting..." : "Delete Account"}</span>
              </button>
            </div>
          </div>

          {/* Creator Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-bold text-[#f1f1f1] mb-2">
              Creator
            </h2>
            <div className="flex flex-col">
              <Link
                to="/upload-video"
                className="flex items-center gap-4 p-4 hover:bg-[#272727] transition-all duration-200 rounded-lg text-[#f1f1f1]"
              >
                <FaUpload className="text-xl text-[#aaaaaa]" />
                <span className="font-medium">Upload Video</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
