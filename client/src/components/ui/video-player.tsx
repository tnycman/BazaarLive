import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayIcon, PauseIcon, Volume2Icon, VolumeXIcon, MaximizeIcon, RotateCcwIcon } from 'lucide-react';

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  description?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '21/9';
  showPlayButton?: boolean;
  showControls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onVolumeChange?: (volume: number) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  dataTestId?: string;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  buffered: TimeRanges | null;
  error: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  description,
  className,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  width = '100%',
  height = 'auto',
  aspectRatio = '16/9',
  showPlayButton = true,
  showControls = true,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onVolumeChange,
  onFullscreenChange,
  dataTestId = 'video-player'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    isMuted: muted,
    isFullscreen: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    buffered: null,
    error: null
  });

  // Aspect ratio styles
  const aspectRatioStyles = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '21/9': 'aspect-[21/9]'
  };

  // Event handlers
  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    onPause?.();
  }, [onPause]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setState(prev => ({ ...prev, currentTime }));
      onTimeUpdate?.(currentTime);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setState(prev => ({
        ...prev,
        duration: videoRef.current.duration,
        buffered: videoRef.current.buffered
      }));
    }
  }, []);

  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      const volume = videoRef.current.volume;
      const isMuted = videoRef.current.muted;
      setState(prev => ({ ...prev, volume, isMuted }));
      onVolumeChange?.(volume);
    }
  }, [onVolumeChange]);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback((error: Event) => {
    const errorMessage = 'Video playback error occurred';
    setState(prev => ({ ...prev, error: errorMessage }));
    console.error('[VideoPlayer] Video error:', error);
  }, []);

  // Control functions
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('[VideoPlayer] Play failed:', error);
          setState(prev => ({ ...prev, error: 'Failed to play video' }));
        });
      }
    }
  }, [state.isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !state.isMuted;
    }
  }, [state.isMuted]);

  const setVolume = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (state.isFullscreen) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error('[VideoPlayer] Fullscreen error:', error);
    }
  }, [state.isFullscreen]);

  const restart = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(error => {
        console.error('[VideoPlayer] Restart failed:', error);
      });
    }
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setState(prev => ({ ...prev, isFullscreen }));
      onFullscreenChange?.(isFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onFullscreenChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          togglePlay();
          break;
        case 'KeyM':
          event.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          event.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyR':
          event.preventDefault();
          restart();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          seekTo(Math.max(0, state.currentTime - 10));
          break;
        case 'ArrowRight':
          event.preventDefault();
          seekTo(Math.min(state.duration, state.currentTime + 10));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, restart, state.currentTime, state.duration]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercentage = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  if (state.error) {
    return (
      <Card className={cn('video-error', className)} data-testid={`${dataTestId}-error`}>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{state.error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            data-testid={`${dataTestId}-retry`}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'video-player-container relative group',
        aspectRatioStyles[aspectRatio],
        className
      )}
      style={{ width, height }}
      data-testid={dataTestId}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onVolumeChange={handleVolumeChange}
        onEnded={handleEnded}
        onError={handleError}
        data-testid={`${dataTestId}-video`}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/ogg" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      {(title || description) && (
        <div className="absolute top-4 left-4 right-4 z-10">
          {title && (
            <h3 className="text-white font-semibold text-lg mb-2 drop-shadow-lg" data-testid={`${dataTestId}-title`}>
              {title}
            </h3>
          )}
          {description && (
            <p className="text-white/90 text-sm drop-shadow-lg" data-testid={`${dataTestId}-description`}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Play Button Overlay */}
      {showPlayButton && !state.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <Button
            onClick={togglePlay}
            size="lg"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30"
            data-testid={`${dataTestId}-play-button`}
          >
            <PlayIcon className="w-8 h-8" />
          </Button>
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="relative h-1 bg-white/30 rounded-full">
              <div 
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
                data-testid={`${dataTestId}-progress`}
              />
              <input
                type="range"
                min="0"
                max={state.duration || 0}
                value={state.currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                data-testid={`${dataTestId}-seek`}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                data-testid={`${dataTestId}-play-pause`}
              >
                {state.isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </Button>

              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                data-testid={`${dataTestId}-mute`}
              >
                {state.isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
              </Button>

              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={state.volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                  data-testid={`${dataTestId}-volume`}
                />
              </div>

              <span className="text-white text-xs">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={restart}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                data-testid={`${dataTestId}-restart`}
              >
                <RotateCcwIcon className="w-4 h-4" />
              </Button>

              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                data-testid={`${dataTestId}-fullscreen`}
              >
                <MaximizeIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 