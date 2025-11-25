import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ImageViewer from "../../components/create/ImageViewer";

export default function CreatePosterPromptPage() {
  const { state } = useLocation();
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // 1) state에서 이미지 받기
    if (state?.images) {
      const urls = state.images.map((img) => img.imageUrl);
      setImages(urls);
    } else {
      // 2) 새로고침 대비 sessionStorage fallback
      const saved = sessionStorage.getItem("generatedImages");
      if (saved) {
        const parsed = JSON.parse(saved);
        const urls = parsed.map((img) => img.imageUrl);
        setImages(urls);
      }
    }
  }, [state]);

  if (!images || images.length === 0)
    return <p className="text-gray-500 mt-10">이미지를 불러오는 중입니다...</p>;

  return (
    <div className="relative flex flex-col items-center">

      <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow">
        <i className="bi bi-three-dots-vertical text-lg"></i>
      </button>

      <ImageViewer images={images} index={index} onChangeIndex={setIndex} />
    </div>
  );
}
