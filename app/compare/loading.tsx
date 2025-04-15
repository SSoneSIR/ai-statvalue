import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <span className="ml-4 text-lg text-gray-700">Loading...</span>
    </div>
  );
};

export default Loading;
