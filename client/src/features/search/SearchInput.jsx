import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";

const SearchInput = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Handle input change
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(""); // Clear input after submission
    }
  };

  return (
    <motion.form
      onSubmit={handleSearch}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg shadow-lg p-4 mb-8 max-w-3xl mx-auto"
    >
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search"
          className="w-full p-3 pr-12 text-sm sm:text-base text-white bg-[#121212] border border-[#303030] rounded-full focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300 placeholder-gray-500"
          aria-label="Search content"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
          aria-label="Submit search"
        >
          <FaSearch className="w-5 h-5" />
        </button>
      </div>
    </motion.form>
  );
};

export default SearchInput;
