// KOREAN_TYPE_NAME_MAP과 일치하는 매핑
export const promotionItems = [
  {
    id: "poster",
    title: "Poster",
    titleKo: "포스터",
    icon: "🖼️",
    colors: {
      base: "bg-gray-800",
      active: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600",
    },
    subOptions: [
      { value: "logo_illustration", label: "로고 일러스트" },
      { value: "logo_typography", label: "로고 타이포그래피" },
      { value: "poster_cardnews", label: "안내 카드뉴스" },
      { value: "poster_video", label: "포스터 홍보영상" },
      { value: "live_poster", label: "라이브 포스터" },
      { value: "road_banner", label: "도로용 현수막" },
      { value: "bus_shelter", label: "버스정류장 광고" },
      { value: "subway_light", label: "지하철 조명광고" },
      { value: "bus_road", label: "버스 도로 광고" },
      { value: "streetlamp_banner", label: "가로등 현수막" },
      { value: "subway_inner", label: "지하철 내부 광고" },
    ],
  },
  {
    id: "mascot",
    title: "Mascot",
    titleKo: "마스코트",
    icon: "😊",
    colors: {
      base: "bg-gray-800",
      active: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600",
    },
    subOptions: [
      { value: "sign_parking", label: "주차 표지판" },
      { value: "sign_welcome", label: "입구 표지판" },
      { value: "sign_toilet", label: "화장실 표지판" },
      { value: "mascot_video", label: "마스코트 홍보영상" },
      { value: "goods_sticker", label: "스티커" },
      { value: "goods_key_ring", label: "키링" },
      { value: "goods_emoticon", label: "이모티콘" },
    ],
  },
  {
    id: "etc",
    title: "Etc",
    titleKo: "기타",
    icon: "📄",
    colors: {
      base: "bg-gray-800",
      active: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600",
    },
    subOptions: [
      { value: "news", label: "뉴스" },
      { value: "etc_video", label: "축제 홍보영상" },
    ],
  },
];
