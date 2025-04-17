"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoTestimonial {
  id: string;
  videoUrl: string;
  poster?: string;
  alt?: string;
}

interface VideoTestimonialSliderProps {
  videos: VideoTestimonial[];
  className?: string;
}

export function VideoTestimonialSlider({ videos, className = "" }: VideoTestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Helper to check if video is playing
  function isVideoActuallyPlaying(video: HTMLVideoElement | null) {
    return video && !video.paused && !video.ended && video.readyState > 2;
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Immediately set pause state based on current video status
    setIsPaused(!!isVideoActuallyPlaying(video));
    // Robust event listeners
    const handlePlay = () => setIsPaused(true);
    const handlePause = () => setIsPaused(false);
    video.addEventListener('playing', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('playing', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [currentIndex]);

  // Fallback: check if video is playing every second
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && !video.ended && video.readyState > 2) {
        setIsPaused(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [videos.length, isPaused]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + videos.length) % videos.length);
  };

  return (
    <div
      className={`relative w-full max-w-xl mx-auto ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        // Only unpause if the video is not playing
        const video = videoRef.current;
        if (!video || video.paused || video.ended) setIsPaused(false);
      }}
    >
      <div className="overflow-hidden rounded-xl bg-[var(--card)] shadow-lg aspect-square flex items-center justify-center relative" style={{maxWidth: 400, margin: '0 auto'}}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={videos[currentIndex].id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full flex justify-center items-center relative"
            style={{position: 'relative'}}
          >
            <video
              key={videos[currentIndex].id}
              ref={videoRef}
              src={videos[currentIndex].videoUrl}
              poster={videos[currentIndex].poster}
              controls
              className="w-full h-full object-cover rounded-xl"
              preload="metadata"
            >
              Sorry, your browser does not support embedded videos.
            </video>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex flex-col items-center mt-6" aria-live="polite">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => paginate(-1)}
            className="rounded bg-[var(--card)] border border-[var(--border)] p-1.5 text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Previous video"
            style={{ fontSize: 20, minWidth: 32, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => paginate(1)}
            className="rounded bg-[var(--card)] border border-[var(--border)] p-1.5 text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Next video"
            style={{ fontSize: 20, minWidth: 32, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="flex gap-2 mt-1">
          {videos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setDirection(idx > currentIndex ? 1 : -1); }}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${currentIndex === idx ? "bg-[var(--foreground)]" : "bg-[var(--muted)] hover:bg-[var(--foreground)]"}`}
              aria-label={`Go to video ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
