"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  image: string
  content: string
}

interface TestimonialSliderProps {
  testimonials: Testimonial[]
  className?: string
}

export function TestimonialSlider({ testimonials, className = '' }: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [testimonials.length])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + testimonials.length) % testimonials.length)
  }

  // --- Actual rendered height measurement for jump-free slider ---
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    // After all testimonials mount, measure their heights
    if (testimonialRefs.current.length === testimonials.length) {
      const heights = testimonialRefs.current.map(ref => ref?.offsetHeight || 0);
      setMaxHeight(Math.max(...heights));
    }
  }, [testimonials]);

  return (
    <div className={`relative max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="text-left mb-16">
        <h2 className="text-5xl font-bold mb-4">
          Read from our satisfied <span className="text-[#B68C5A]">Clients.</span>
        </h2>
        <p className="text-[var(--muted-foreground)] text-lg">
          Our clients are at the core of everything we do. Their satisfaction is not just a goal, it's our commitment.
        </p>
      </div>
      
      <div className="relative flex flex-col items-center" style={maxHeight ? {height: maxHeight} : {}}>
        {/* Navigation Controls on Top */}
        <div className="flex justify-between items-center w-full max-w-3xl mb-4 z-10">
          <div className="flex gap-2">
            <button
              onClick={() => paginate(-1)}
              className="w-10 h-10 rounded-full border border-[#2A2A2A] flex items-center justify-center hover:bg-[#2A2A2A] transition-colors"
              aria-label="Previous testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={() => paginate(1)}
              className="w-10 h-10 rounded-full border border-[#2A2A2A] flex items-center justify-center hover:bg-[#2A2A2A] transition-colors"
              aria-label="Next testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1)
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-[#B68C5A]'
                    : 'bg-[#2A2A2A]'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Hidden testimonials for height measurement */}
        <div style={{position: 'absolute', visibility: 'hidden', pointerEvents: 'none', zIndex: -1, width: '100%'}}>
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              ref={el => { testimonialRefs.current[i] = el; }}
              className="rounded-3xl bg-[#1A1A1A]/20 backdrop-blur-sm p-8 md:p-12"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{t.name}</h4>
                  <p className="text-sm text-[#B68C5A]">{t.role}</p>
                </div>
              </div>
              <p className="text-lg leading-relaxed">{t.content}</p>
            </div>
          ))}
        </div>
        {/* Center the card vertically with max width/height */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div
            className="relative w-full flex justify-center items-center"
            style={{
              height: maxHeight,
              minHeight: 260,
              perspective: 1200,
              perspectiveOrigin: '50% 50%'
            }}
          >
            <div
              className="relative w-full h-full flex justify-center items-center"
              style={{ transformStyle: 'preserve-3d', height: '100%', width: '100%' }}
            >
              {/* 3D Carousel Container */}
              <div
                className="relative w-full h-full flex justify-center items-center"
                style={{
                  transformStyle: 'preserve-3d',
                  height: '100%',
                  width: '100%',
                  transition: 'transform 0.8s cubic-bezier(0.77,0,0.175,1)',
                  transform: `rotateY(${-currentIndex * (360 / testimonials.length)}deg)`
                }}
              >
                {testimonials.map((t, i) => {
                  const total = testimonials.length;
                  const anglePerCard = 360 / total;
                  const radius = 420;
                  return (
                    <div
                      key={t.id}
                      className={
                        `absolute left-1/2 top-1/2 rounded-3xl bg-[#1A1A1A]/20 backdrop-blur-sm p-8 md:p-12 w-[90vw] max-w-xl min-h-[260px] flex flex-col justify-center items-start shadow-2xl` +
                        (i === currentIndex ? ' scale-110 opacity-100 z-10' : ' scale-90 opacity-50 z-0')
                      }
                      style={{
                        transform: `translate(-50%, -50%) rotateY(${i * anglePerCard}deg) translateZ(${radius}px)`,
                        transition: 'transform 0.8s cubic-bezier(0.77,0,0.175,1), opacity 0.8s cubic-bezier(0.77,0,0.175,1)',
                        maxHeight: maxHeight,
                        height: '100%',
                        filter: i === currentIndex ? 'none' : 'blur(2px)'
                      }}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={t.image}
                            alt={t.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{t.name}</h4>
                          <p className="text-sm text-[#B68C5A]">{t.role}</p>
                        </div>
                      </div>
                      <p className="text-lg leading-relaxed line-clamp-4">{t.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}