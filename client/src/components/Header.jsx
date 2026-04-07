import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/Slices/userSlice";
import { FaSearch, FaUserCircle, FaSignOutAlt, FaBars, FaMicrophone } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Youtube from "../assets/Youtube Logo.png";

function Header({ toggleSidebar, isSidebarOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        setIsUserMenuOpen(false);
        navigate("/login");
      })
      .catch((err) => {
        console.error("Logout error:", err);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <header className="bg-[#0f0f0f] text-[#f1f1f1] fixed top-0 z-50 w-full h-[56px] flex items-center">
      <div className="w-full px-4 flex items-center justify-between">
        {/* Menu Icon and Logo */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle Button (hidden on mobile) */}
          <button
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="hidden sm:flex p-2 rounded-full hover:bg-[#272727] transition-all duration-200 focus:outline-none"
          >
            <FaBars className="text-xl sm:text-lg" />
          </button>

          {/* Logo + Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1"
          >
            {/* Logo Image */}
            <img
              src={Youtube}
              alt="YouTube Logo"
              className="w-10 h-10 sm:w-10 sm:h-10 object-contain"
            />

            {/* Title */}
            <span className="text-lg font-roboto font-bold tracking-tighter text-white">
              YouTube
            </span>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden sm:flex justify-center ml-10">
          <form onSubmit={handleSearch} className="flex relative w-full items-center">
            <div className="flex w-full items-center h-[40px]">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search"
                aria-label="Search"
                className="w-full px-5 h-full rounded-l-full bg-[#121212] border border-[#303030] text-[#f1f1f1] placeholder-gray-400 focus:border-[#1c62b9] focus:outline-none transition-all duration-200"
              />
              <button
                type="submit"
                className="flex items-center justify-center px-6 h-full bg-[#222222] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#272727] transition-colors duration-200"
                aria-label="Submit search"
              >
                <FaSearch className="w-5 h-5 text-[#f1f1f1]" />
              </button>
            </div>
            <button
              type="button"
              className="ml-4 p-[10px] bg-[#181818] rounded-full hover:bg-[#272727] transition-all duration-200"
            >
              <FaMicrophone className="w-[18px] h-[18px] text-[#f1f1f1]" />
            </button>
          </form>
        </div>

        {/* User Menu */}
        <div className="relative flex items-center justify-end min-w-[225px]">
          {currentUser ? (
            <>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label={`User menu for ${currentUser.name}`}
                className="flex items-center p-1 rounded-full hover:bg-[#272727] focus:outline-none transition-all duration-200 cursor-pointer"
              >
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={`Profile picture of ${currentUser.name}`}
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/default-profile.png")} // Fallback image
                  />
                ) : (
                  <FaUserCircle className="h-8 w-8 text-gray-400" />
                )}
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-64 bg-[#282828] rounded-xl shadow-xl py-2 z-50 border border-[#3f3f3f]"
                  >
                    <div className="px-4 py-3 flex items-center gap-4 border-b border-[#3f3f3f]">
                      {currentUser.profileImage ? (
                        <img
                          src={currentUser.profileImage}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) =>
                            (e.target.src = "/default-profile.png")
                          }
                        />
                      ) : (
                        <FaUserCircle className="h-10 w-10 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-semibold">{currentUser.name}</p>
                        <p className="text-xs text-gray-400 bg-clip-text truncate">
                          @{currentUser.name?.toLowerCase().replace(/\s/g, "")}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/user-profile"
                      className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-[#3f3f3f] transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaUserCircle className="w-5 h-5 text-gray-400" />
                      Your channel
                    </Link>
                    <button
                      className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-[#3f3f3f] transition-colors w-full text-left"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="w-5 h-5 text-gray-400" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-[#3ea6ff] px-3 py-1.5 rounded-full border border-[#3ea6ff] hover:bg-[#263850] hover:border-transparent transition-all duration-200 font-medium"
            >
              <FaUserCircle className="text-xl" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
