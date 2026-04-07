import React from "react";
import { motion } from "framer-motion";

const Pagination = ({
  page,
  setPage,
  totalPages,
  className = "",
  buttonClassName = "",
}) => {
  return (
    <div
      className={`flex justify-between items-center mt-6 px-4 sm:px-6 lg:px-8 bg-transparent ${className}`}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className={`py-2 px-4 rounded-lg bg-slate-700 text-gray-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-all duration-200 ${buttonClassName}`}
      >
        Previous
      </motion.button>
      <span className="text-gray-100 font-medium">
        Page {page} of {totalPages}
      </span>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={page === totalPages}
        className={`py-2 px-4 rounded-lg bg-slate-700 text-gray-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-all duration-200 ${buttonClassName}`}
      >
        Next
      </motion.button>
    </div>
  );
};

export default Pagination;
