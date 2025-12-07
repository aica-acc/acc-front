// src/assets/promotionIcons.jsx
import React from "react";
import {
  Brush,
  Type,
  LayoutGrid,
  Video,
  BookOpen,
  RectangleHorizontal,
  Bus,
  Lightbulb,
  BusFront,
  LampPost,
  TrainFront,
  Square,
  Hand,
  UsersRound,
  Film,
  Sticker,
  Key,
  Smile,
  Newspaper,
  Clapperboard,
  Image as ImageIcon, // fallback
} from "lucide-react";

// option value -> lucide 아이콘 매핑
const ICON_MAP = {
  // poster
  logo_illustration: Brush,
  logo_typography: Type,
  poster_cardnews: LayoutGrid,
  poster_video: Video,
  leaflet: BookOpen,
  road_banner: RectangleHorizontal,
  bus_shelter: Bus,
  subway_light: Lightbulb,
  bus_road: BusFront,
  streetlamp_banner: LampPost,
  subway_inner: TrainFront,

  // mascot
  sign_parking: Square,
  sign_welcome: Hand,
  sign_toilet: UsersRound,
  mascot_video: Film,
  goods_sticker: Sticker,
  goods_key_ring: Key,
  goods_emoticon: Smile,

  // etc
  news: Newspaper,
  etc_video: Clapperboard,
};

// 🔥 여기서 "기본 export 컴포넌트"로 만든다
export default function PromotionIcon({ type, className }) {
  const Icon = ICON_MAP[type] || ImageIcon; // 혹시 매핑 없으면 기본 아이콘

  return <Icon className={className} />;
}
