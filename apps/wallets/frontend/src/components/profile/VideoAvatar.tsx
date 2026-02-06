'use client';

/**
 * VideoAvatar - Video profile avatar component (Apple Watch squircle style)
 *
 * Ported from DAO - uses next/image and lucide-react (both available in Wallets).
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX, Play, User } from 'lucide-react';

interface VideoAvatarProps {
  videoSrc?: string;
  imageSrc?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: number;
  height?: number;
  className?: string;
  enableSound?: boolean;
  enableFloat?: boolean;
  onClick?: () => void;
  isLocked?: boolean;
  disableHoverEffects?: boolean;
}

const sizeMap = {
  sm: { container: 40, icon: 16 },
  md: { container: 56, icon: 20 },
  lg: { container: 80, icon: 28 },
  xl: { container: 112, icon: 36 },
};

export function VideoAvatar({
  videoSrc,
  imageSrc,
  alt = 'Profile avatar',
  size = 'md',
  width,
  height,
  className = '',
  enableSound = false,
  enableFloat = false,
  onClick,
  isLocked = false,
  disableHoverEffects = false,
}: VideoAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideo, setHasVideo] = useState(!!videoSrc);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const baseDimensions = sizeMap[size];
  const dimensions = {
    container: width || height || baseDimensions.container,
    icon: baseDimensions.icon,
  };
  const containerWidth = width || baseDimensions.container;
  const containerHeight = height || baseDimensions.container;

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [videoSrc]);

  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);
  const handleVideoError = () => setHasVideo(false);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleClick = () => {
    if (!isPlaying && videoRef.current) {
      videoRef.current.play();
    }
    onClick?.();
  };

  const showVideo = hasVideo && videoSrc;
  const showImage = !showVideo && imageSrc && !imageError;
  const showFallback = !showVideo && (!imageSrc || imageError);

  return (
    <div
      className={`
        relative overflow-visible
        cursor-pointer
        ${disableHoverEffects ? '' : 'transition-transform duration-300 ease-out hover:scale-105'}
        ${enableFloat ? 'animate-apexFloat' : ''}
        ${className}
      `}
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div
        className="absolute inset-0 rounded-[22%] opacity-40"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      />

      <div
        className={`relative w-full h-full rounded-[22%] overflow-hidden border-2 bg-gradient-to-br from-slate-700 to-slate-900 transition-colors duration-300 ${
          isLocked
            ? 'border-amber-400/70 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
            : 'border-white/20 dark:border-white/10'
        }`}
      >
        {showVideo && (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onError={handleVideoError}
            />

            {enableSound && isHovered && (
              <button
                onClick={toggleMute}
                className="absolute bottom-1 right-1 p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white transition-opacity z-10"
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </button>
            )}

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Play className="w-6 h-6 text-white" />
              </div>
            )}
          </>
        )}

        {showImage && (
          <>
            <Image
              src={imageSrc}
              alt={alt}
              fill
              sizes={`${dimensions.container}px`}
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </>
        )}

        {showFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700">
            <User className="text-white/80" style={{ width: dimensions.icon, height: dimensions.icon }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoAvatar;
