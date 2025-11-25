import React, { useState } from "react";

const ImageViewer = ({ images, index, onChangeIndex }) => {
  const [showModal, setShowModal] = useState(false);

  if (!images || images.length === 0) return null;

  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  return (
    <>
      <div className="relative w-full flex flex-col items-center">
        {/* 이미지 카드 (반응형 비율 + 최대 크기 제한) */}
        <div
          className="
            relative 
            w-[60vw]
            md:w-[38vw]
            aspect-[3/4]
            max-h-[70vh]
            rounded-xl 
            overflow-hidden 
            shadow-lg
            cursor-pointer
          "
          onClick={() => setShowModal(true)}
        >
          <img
            src={images[index]}
            alt="generated"
            className="w-full h-full object-cover"
          />

          {/* prev arrow */}
          {hasPrev && (
            <button
              className="
                absolute left-3 top-1/2 -translate-y-1/2
                bg-white/90 p-2 rounded-full shadow
                hover:bg-white transition
              "
              onClick={(e) => {
                e.stopPropagation();
                onChangeIndex(index - 1);
              }}
            >
              <i className="bi bi-chevron-left text-xl"></i>
            </button>
          )}

          {/* next arrow */}
          {hasNext && (
            <button
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                bg-white/90 p-2 rounded-full shadow
                hover:bg-white transition
              "
              onClick={(e) => {
                e.stopPropagation();
                onChangeIndex(index + 1);
              }}
            >
              <i className="bi bi-chevron-right text-xl"></i>
            </button>
          )}
        </div>

        {/* 페이지 표시 */}
        <div className="mt-3 text-gray-500 text-sm">
          {index + 1} / {images.length}
        </div>
      </div>

      {/* full image modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-[2000]"
          onClick={() => setShowModal(false)}
        >
          <img
            src={images[index]}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-xl"
            alt="full"
          />
        </div>
      )}
    </>
  );
};

export default ImageViewer;
