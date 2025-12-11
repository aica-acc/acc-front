import React, { useState, useRef, useEffect } from "react";

/**
 * 이미지/영상 모달 컴포넌트
 * @param {Object} props
 * @param {string} props.mediaUrl - 표시할 이미지 또는 영상 URL
 * @param {string} props.mediaType - "image" 또는 "video" (선택사항, 자동 감지)
 * @param {boolean} props.isOpen - 모달 열림/닫힘 상태
 * @param {function} props.onClose - 모달 닫기 핸들러
 */
const ImageModal = ({ mediaUrl, mediaType, isOpen, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // mediaType 자동 감지
  const detectedType = mediaType || (mediaUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ? "video" : "image");
  const isVideo = detectedType === "video";

  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 영상 정지
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
      }
    } else if (isVideo && videoRef.current) {
      // 모달이 열릴 때 영상 메타데이터 로드
      videoRef.current.load();
    }
  }, [isOpen, isVideo]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10"
        >
          ✕
        </button>
        
        {/* 이미지 또는 영상 */}
        {isVideo ? (
          <div
            className="relative max-w-full max-h-[80vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={mediaUrl}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* 영상 컨트롤 */}
            <div className="mt-4 w-full max-w-2xl bg-black/80 rounded-lg p-4">
              {/* 재생/정지 버튼 */}
              <div className="flex items-center gap-4 mb-3">
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>

                {/* 시간 표시 */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* 진행 바 */}
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />

                {/* 볼륨 컨트롤 */}
                <button
                  onClick={handleMuteToggle}
                  className="text-white hover:text-gray-300"
                >
                  {isMuted || volume === 0 ? "🔇" : "🔊"}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={mediaUrl}
            alt="원본 이미지"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
};

export default ImageModal;

