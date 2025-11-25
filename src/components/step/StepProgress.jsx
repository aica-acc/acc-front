// src/components/step/StepProgress.jsx
import React from "react";
import { useLocation } from "react-router-dom";

export default function StepProgress({ total = 7 }) {
  const { pathname } = useLocation();

  let current = 1;
  if (pathname === "/select") current = 1;
  else if (pathname === "/upload") current = 2;
  else if (pathname.startsWith("/analyze")) current = 3;
  else if (pathname.startsWith("/create")) current = 4;

  return (
    <div>
      <p className="text-sm text-gray-700 mb-1 font-medium">
        전체 진행률 {current} / {total}
      </p>

      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-black rounded-full transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
