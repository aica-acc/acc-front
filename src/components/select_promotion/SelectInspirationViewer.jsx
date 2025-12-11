// src/components/select_promotion/SelectInspirationViewer.jsx
import React from "react";

// --- Poster Inspiration Images ---
import poster_1 from "../../assets/promotion/poster/poster_1.jpg";
import poster_2 from "../../assets/promotion/poster/poster_2.png";
import poster_3 from "../../assets/promotion/poster/poster_3.PNG";
import poster_4 from "../../assets/promotion/poster/poster_4.jpg";
import poster_5 from "../../assets/promotion/poster/poster_5.jpg";
import poster_6 from "../../assets/promotion/poster/poster_6.png";
import poster_7 from "../../assets/promotion/poster/poster_7.png";
import poster_8 from "../../assets/promotion/poster/poster_8.jpg";

// --- Mascot Inspiration Images ---
import mascot_1 from "../../assets/promotion/mascot/mascot_1.png";
import mascot_2 from "../../assets/promotion/mascot/mascot_2.png";
import mascot_3 from "../../assets/promotion/mascot/mascot_3.png";
import mascot_4 from "../../assets/promotion/mascot/mascot_4.png";
import mascot_5 from "../../assets/promotion/mascot/mascot_5.png";
import mascot_6 from "../../assets/promotion/mascot/mascot_6.png";
import mascot_7 from "../../assets/promotion/mascot/mascot_7.png";

const inspirationImages = {
  poster: [poster_1, poster_2, poster_3, poster_4, poster_5, poster_6, poster_7, poster_8],
  mascot: [mascot_1, mascot_2, mascot_3, mascot_4, mascot_5, mascot_6, mascot_7],
  etc: [], // 필요하면 나중에 넣으면 됨
};

export default function SelectInspirationViewer({ category }) {
  const images = inspirationImages[category] || [];

  return (
    <div className="mt-10 mb-12">
      <h2 className="text-xl font-bold text-white mb-4">영감 이미지</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt=""
            className="w-full h-48 object-cover rounded-lg border border-gray-700 shadow"
          />
        ))}
      </div>
    </div>
  );
}
