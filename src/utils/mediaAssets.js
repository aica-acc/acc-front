const mediaBase = (import.meta.env.VITE_MEDIA_BASE_URL || "https://media.donghwan.cloud")
  .replace(/\/$/, "");

export const mainVideoUrl = `${mediaBase}/acc/main_video_720.mp4`;
export const sampleVideoUrl = `${mediaBase}/acc/sample_1080.mp4`;
