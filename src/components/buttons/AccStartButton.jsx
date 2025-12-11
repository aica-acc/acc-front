import React from "react";

const AccStartButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-8 py-3 mt-10 rounded-full text-lg font-semibold 
                 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 
                 text-white shadow-md hover:brightness-110 hover:scale-105 
                 transition-transform duration-200"
    >
      ACC 시작하기
    </button>
  );
};

export default AccStartButton;
