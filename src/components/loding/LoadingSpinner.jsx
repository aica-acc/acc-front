// src/components/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ message = "로딩중입니다..." }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-10">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>

      {/* Message */}
      <p className="mt-4 text-gray-700 text-lg font-medium">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
