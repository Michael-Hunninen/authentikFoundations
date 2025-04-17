"use client"

import { useEffect, useRef, useState } from "react"
import "../styles/hero-gradient.css"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Check,
  ChevronRight,
  Menu,
  Star,
  X,
  ArrowUpRight,
  Clock,
  Users,
  Heart,
  BarChart3,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./components/challenge-dialog"
import { TestimonialSlider } from './components/TestimonialSlider'
import { VideoTestimonialSlider } from './components/VideoTestimonialSlider'


export default function SalesPage() {
  // ...existing state...
  const [flipProgress, setFlipProgress] = useState(0); // 0 (not flipped) to 1 (fully flipped)
  const heroRef = useRef<HTMLElement | null>(null);
  const overviewRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [overviewTranslateY, setOverviewTranslateY] = useState(0);
  const [isReverseFlipping, setIsReverseFlipping] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let progress = Math.min(Math.max(scrollY / window.innerHeight, 0), 1);
      // For reverse animation, start sooner if overview passes viewport center
      if (overviewRef.current) {
        const rect = overviewRef.current.getBoundingClientRect();
        // Use the vertical center of the overview section
        const overviewCenter = rect.top + rect.height / 2;
        const triggerY = window.innerHeight * 0.4; // 40% from the top
        if (overviewCenter < triggerY) {
          // Calculate progress based on how far past the trigger line the center is
          const offset = Math.max(0, Math.min(1, 1 - (overviewCenter / triggerY)));
          progress = Math.max(progress, offset);
        }
      }
      setFlipProgress(progress);

      // Lock translateY at the start of the reverse flip (when crossing below 0.92)
      if (progress < 0.92 && !isReverseFlipping && overviewRef.current) {
        const rect = overviewRef.current.getBoundingClientRect();
        setOverviewTranslateY(rect.top);
        setIsReverseFlipping(true);
      } else if (progress >= 0.92 && isReverseFlipping) {
        setOverviewTranslateY(0);
        setIsReverseFlipping(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ...existing state...
  const [phaseDialogsOpen, setPhaseDialogsOpen] = useState([false, false, false]);

  function handlePhaseDialogOpenChange(open: boolean, index: number) {
    setPhaseDialogsOpen(prev => {
      const arr = [...prev];
      arr[index] = open;
      return arr;
    });
  }

  const [activeSection, setActiveSection] = useState("hero")
  const [activePhase, setActivePhase] = useState("phase-1")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const progressBarRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})
  const benefitsContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const scrollPositionRef = useRef(0)
  const isPausedRef = useRef(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const phasesContainerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const scrollProgressRef = useRef(0)
  const ticking = useRef(false)
  const [mounted, setMounted] = useState(false)

  // Minimum distance for a swipe to be registered
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      const currentPhase = parseInt(activePhase.split("-")[1])
      const targetPhase = currentPhase < 3 ? currentPhase + 1 : 1
      handlePhaseChange(`phase-${targetPhase}`)
    }

    if (isRightSwipe) {
      const currentPhase = parseInt(activePhase.split("-")[1])
      const targetPhase = currentPhase > 1 ? currentPhase - 1 : 3
      handlePhaseChange(`phase-${targetPhase}`)
    }
  }

  // Initialize phase container scroll position
  useEffect(() => {
    const container = document.getElementById("phases-container")
    if (container) {
      const firstPhase = document.getElementById("phase-1")
      if (firstPhase) {
        firstPhase.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" })
      }
    }
  }, [])

  // Track scroll position for progress bar and active section
  useEffect(() => {
    const updateProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = (window.scrollY / totalHeight)
      
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`
      }

      // Update active section
      const sections = Object.entries(sectionsRef.current)
      for (let i = sections.length - 1; i >= 0; i--) {
        const [id, section] = sections[i]
        if (section && section.getBoundingClientRect().top <= 100) {
          setActiveSection(id)
          break
        }
      }
    }

    const onScroll = () => {
      requestAnimationFrame(updateProgress)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const section = sectionsRef.current[id]
    if (section) {
      const yOffset = -80 // Header height offset
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "pain-points", label: "Challenges" },
    { id: "program", label: "Program" },
    { id: "benefits", label: "Benefits" },
    { id: "achievements", label: "Outcomes" },
    { id: "apply", label: "Apply" },
  ]

  const setSectionRef = (sectionName: string) => (el: HTMLElement | null) => {
    sectionsRef.current[sectionName] = el;
  };

  // Remove the old useEffect for animation
  useEffect(() => {
    const container = benefitsContainerRef.current
    if (!container) return

    // Calculate the total width of the first set of items
    const calculateWidth = () => {
      const items = container.children
      const itemWidth = items[0].getBoundingClientRect().width
      const gap = 24 // gap-6 = 1.5rem = 24px
      return (itemWidth + gap) * (items.length / 2)
    }

    // Set initial width
    const totalWidth = calculateWidth()
    container.style.setProperty('--slide-width', `${totalWidth}px`)

    // Add resize handler
    const handleResize = () => {
      const newWidth = calculateWidth()
      container.style.setProperty('--slide-width', `${newWidth}px`)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle phase navigation
  const handlePhaseChange = (targetPhase: string) => {
    if (isScrolling) return
    setIsScrolling(true)
    setActivePhase(targetPhase)
    
    const container = phasesContainerRef.current
    const element = document.getElementById(targetPhase)
    
    if (container && element) {
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const scrollLeft = container.scrollLeft
      const targetScroll = scrollLeft + (elementRect.left - containerRect.left) - (containerRect.width - elementRect.width) / 2
      
      container.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      })
    }

    // Reset scrolling state after animation
    setTimeout(() => {
      setIsScrolling(false)
    }, 500)
  }

  // Handle scroll events
  useEffect(() => {
    const container = phasesContainerRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      if (isScrolling) return

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const containerRect = container.getBoundingClientRect()
        const containerCenter = containerRect.left + containerRect.width / 2

        const phases = Array.from(container.children) as HTMLDivElement[]
        const visiblePhases = phases.filter(phase => {
          const rect = phase.getBoundingClientRect()
          const phaseCenter = rect.left + rect.width / 2
          return Math.abs(phaseCenter - containerCenter) < rect.width / 2
        })

        if (visiblePhases.length > 0) {
          const centerPhase = visiblePhases[0]
          const phaseId = centerPhase.id
          if (phaseId && activePhase !== phaseId) {
            setActivePhase(phaseId)
          }
        }
      }, 150)
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [activePhase, isScrolling])

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // or a loading state
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

   const testimonials = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Senior Software Engineer",
      company: "Google",
      image: "https://i.pravatar.cc/300?img=1",
      content: "The program helped me overcome my self-doubt and recognize my true potential. I'm now leading major projects with confidence and mentoring other engineers."
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Product Manager",
      company: "Microsoft",
      image: "https://i.pravatar.cc/300?img=3",
      content: "This program was a game-changer for my career. I learned to trust my instincts and make decisions with conviction. The results have been incredible."
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: "UX Designer",
      company: "Apple",
      image: "https://i.pravatar.cc/300?img=5",
      content: "The strategies I learned helped me find my voice in design meetings and present my ideas with confidence. I've since been promoted twice!"
    },
    // Duplicates for demo
    {
      id: "4",
      name: "David Kim",
      role: "Technical Lead",
      company: "Amazon",
      image: "https://i.pravatar.cc/300?img=8",
      content: "The program gave me the tools to overcome imposter syndrome and step into leadership. I'm now managing a team of 12 engineers successfully."
    },
    {
      id: "5",
      name: "Lisa Patel",
      role: "Data Scientist",
      company: "Netflix",
      image: "https://i.pravatar.cc/300?img=9",
      content: "I used to question my abilities constantly. Now, I approach challenges with confidence and have become a respected voice in my field."
    },
    {
      id: "6",
      name: "Emily Rodriguez",
      role: "UX Designer",
      company: "Apple",
      image: "https://i.pravatar.cc/300?img=5",
      content: "The strategies I learned helped me find my voice in design meetings and present my ideas with confidence. I've since been promoted twice!"
    }
  ];

  const phases = [
    {
      id: "1",
      title: "Foundation Phase",
      // ... existing code ...
    },
    {
      id: "2",
      title: "Building Phase",
      // ... existing code ...
    },
    {
      id: "3",
      title: "Advanced Phase",
      // ... existing code ...
    },
    {
      id: "4",
      title: "Expert Phase",
      // ... existing code ...
    },
    {
      id: "5",
      title: "Master Phase",
      // ... existing code ...
    }
  ];

  // Define the texture overlay component
  const TextureOverlay = () => {
    return (
      <>
        <div className="absolute inset-0 z-20"
          style={{
            backgroundColor: "#3d2e25",
            opacity: 0.05,
            pointerEvents: "none"
          }}
        />
        <div className="absolute inset-0 z-20"
          style={{
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise1'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.24 0 0 0 0, 0 0.18 0 0 0, 0 0 0.15 0 0, 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise1)'/%3E%3C/svg%3E"),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.7' numOctaves='4' seed='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.24 0 0 0 0, 0 0.18 0 0 0, 0 0 0.15 0 0, 0 0 0 0.25 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise2)'/%3E%3C/svg%3E"),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' seed='10' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.24 0 0 0 0, 0 0.18 0 0 0, 0 0 0.15 0 0, 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise3)'/%3E%3C/svg%3E"),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise4'%3E%3CfeTurbulence type='turbulence' baseFrequency='1.2' numOctaves='2' seed='15' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.24 0 0 0 0, 0 0.18 0 0 0, 0 0 0.15 0 0, 0 0 0 0.2 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise4)'/%3E%3C/svg%3E"),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise5'%3E%3CfeTurbulence type='turbulence' baseFrequency='1.5' numOctaves='6' seed='20' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.24 0 0 0 0, 0 0.18 0 0 0, 0 0 0.15 0 0, 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise5)'/%3E%3C/svg%3E")
            `,
            backgroundSize: "100px 100px, 200px 200px, 300px 300px, 150px 150px, 50px 50px",
            opacity: 0.85,
            mixBlendMode: "multiply" as const,
            filter: "contrast(1.1) brightness(1.05)",
            pointerEvents: "none"
          }}
        />
      </>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] relative">
      <TextureOverlay />
      {/* Progress bar */}
      <div className="fixed top-0 left-0 z-50 w-full h-1 bg-[var(--background)]">
      <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-reddishBrown via-mediumBrown to-beige origin-left transition-transform duration-75 ease-out will-change-transform"
          style={{ transform: 'scaleX(0)' }}
      />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg border-b border-[var(--border)] bg-[var(--background)]/70">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 z-50">
            <span className="text-xl font-serif font-bold tracking-tight bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
              Authentik
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  activeSection === item.id 
                    ? "bg-[var(--card-hover)] text-[var(--foreground)]" 
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-[var(--foreground)] hover:bg-[var(--card)]"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              onClick={() => scrollToSection("apply")}
              className="hidden md:flex bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0"
            >
              Apply Now
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[var(--foreground)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-deepBrown/95 pt-20 px-4 flex flex-col">
          <nav className="flex flex-col space-y-2 mt-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "px-4 py-4 text-lg font-medium rounded-md transition-all duration-300 flex items-center justify-between",
                  activeSection === item.id ? "bg-tan/20 text-[var(--foreground)]" : "text-[var(--muted)]",
                )}
              >
                {item.label}
                <ChevronRight className="h-5 w-5" />
              </button>
            ))}
          </nav>
          <div className="mt-8">
            <Button
              onClick={() => {
                scrollToSection("apply")
                setMobileMenuOpen(false)
              }}
              className="w-full bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0]"
            >
              Apply Now
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <main className="flex-1 pt-20">
  {/* Hero Section */}
  <section
    ref={(el) => {
      setSectionRef("hero")(el);
      heroRef.current = el;
    }}
    className={flipProgress < 0.92 ? "fixed top-0 left-0 w-full h-screen min-h-screen flex flex-col justify-center items-center z-20 bg-[var(--background)]" : "relative w-full min-h-screen flex flex-col justify-center items-center bg-[var(--background)] py-20 md:py-32"}
    style={{
      pointerEvents: flipProgress >= 0.92 ? 'none' : 'auto',
      opacity: 1,
      willChange: flipProgress < 0.92 ? 'opacity' : undefined,
      backfaceVisibility: 'hidden',
    }}
  >

          <div
  className="absolute inset-0 z-0 bg-[url('https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67dd81d3b55406dca34e59fd.jpeg')] bg-cover bg-center opacity-20"
></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/80 via-[var(--background)]/50 to-[var(--background)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-reddishBrown/20 via-transparent to-transparent"></div>

          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-sm backdrop-blur mb-6">
                <span className="font-medium text-[var(--foreground)]">12-Week Transformational Program</span>
              </div>
              <h1 className="mt-6 text-4xl font-serif font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
                Rise Your Authentik Potential
              </h1>
              <p className="mt-6 text-xl text-[var(--muted)] md:text-2xl">
                A 12-Week Transformational Program for Coaches and Leaders
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("apply")}
                  className="w-full sm:w-auto bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0"
                >
                  Begin Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("program")}
                  className="w-full sm:w-auto bg-[#fffff0] text-[#3d2e25] hover:bg-gradient-to-r hover:from-reddishBrown hover:to-mediumBrown hover:text-[#fffff0] border-[var(--border)] backdrop-blur-sm font-medium transition-all duration-300"
                >
                  Explore Program
                </Button>
              </div>
            </div>
          </div>

          <div className="hero-gradient-transition"></div>

          {/* Animated scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="text-xs text-[var(--muted)] mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-[var(--border)] rounded-full flex justify-center">
              <div className="w-1.5 h-1.5 bg-[var(--foreground)] rounded-full animate-bounce mt-2"></div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section
          id="overview"
          ref={(el) => {
            setSectionRef("overview")(el);
            overviewRef.current = el;
          }}
          className={flipProgress < 0.92 ? "fixed left-0 w-full bg-[var(--background)] z-30" : "relative w-full bg-[var(--background)] py-20 z-10"}
          style={{
            top: flipProgress < 0.92 ? 0 : undefined,
            minHeight: flipProgress < 0.92 ? '100vh' : 'auto',
            height: 'auto',
            willChange: flipProgress < 0.92 ? 'transform, filter' : undefined,
            pointerEvents: flipProgress > 0 ? 'auto' : 'none',
            transform: flipProgress < 0.92
              ? `perspective(1200px) rotateX(${90 - flipProgress * 90}deg)`
              : overviewTranslateY !== 0 ? `translateY(${overviewTranslateY}px)` : 'none',
            transition:
              flipProgress < 0.92
                ? 'box-shadow 0.3s, filter 0.2s'
                : overviewTranslateY !== 0 ? 'transform 0.4s cubic-bezier(0.77,0,0.175,1)' : 'none',
            transformOrigin: 'bottom center',
            boxShadow: flipProgress > 0.05 && flipProgress < 0.92
              ? '0 30px 80px 0 rgba(60,40,20,0.18)'
              : 'none',
            filter: flipProgress > 0 && flipProgress < 0.92
              ? `blur(${Math.max(0, 16 * (1 - flipProgress))}px)`
              : 'none',
            transition: flipProgress < 0.92 ? 'box-shadow 0.3s, filter 0.2s' : undefined,
          }}
        >
          <div className="container mx-auto px-4 md:px-6 flex items-center min-h-screen">
            <div className="mx-auto max-w-3xl">
              <p className="text-lg leading-relaxed text-[var(--muted)] md:text-xl">
                As a coach you may often feel overwhelmed by the complexities of balancing your practice with the
                demands of family. Traditional coaching programs usually focus on skill acquisition—be it in fitness,
                business, or personal development—but rarely address the deeper emotional and mental frameworks
                necessary for sustainable success.
              </p>
              <p className="mt-6 text-lg leading-relaxed text-[var(--muted)] md:text-xl">
                Welcome to Authentik Foundations, a transformative 12-week program designed to empower you to become the
                person capable of navigating the emotional roller coaster of entrepreneurship while serving others.
                Here, we don't just teach skills; we cultivate the mind and holistic well-being that enables you to
                thrive.
              </p>
            </div>
          </div>
        </section>
        {/* Spacer for smooth scroll during animation */}
      {flipProgress < 0.92 && !isReverseFlipping && (
        <div style={{ height: '100vh' }} />
      )}    {/* Content container for the rest of the site */}
        <div 
          ref={contentRef}
          className="relative z-10 transition-opacity duration-500"
          style={{ 
            opacity: flipProgress >= 0.92 ? 1 : 0,
            pointerEvents: flipProgress >= 0.92 ? 'auto' : 'none'
          }}
        >

        {/* Pain Points */}
        <section
          id="pain-points"
          ref={setSectionRef("pain-points")}
          className="py-20 bg-[var(--background)]"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <div className="inline-flex items-center rounded-full bg-[var(--card)] px-3 py-1 text-sm mb-4">
                <span className="font-medium text-[var(--foreground)]">The Challenges</span>
              </div>
              <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
                Are You Struggling With:
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="bg-[var(--card)]/5 backdrop-blur-sm rounded-lg p-6 border border-[var(--border)] hover:border-[var(--border)] transition-all cursor-pointer luxury-card">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-6 w-6 text-[var(--foreground)]" />
                      <h3 className="text-2xl font-bold text-[var(--foreground)]">Overwhelm and Fatigue</h3>
                    </div>
                    <p className="text-[var(--muted)] mb-4">
                      The constant juggling of responsibilities can leave you drained, questioning whether you have the energy to show up for your clients and your family.
                    </p>
                    <div className="flex items-center text-[var(--muted)]">
                      <span className="text-sm">Click to learn more</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl overflow-y-auto max-h-[90vh] sm:max-h-[calc(100vh-4rem)]">
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-2xl sm:text-3xl font-serif">Managing Energy and Balance</DialogTitle>
                    <DialogDescription className="text-base sm:text-lg mt-2">Phase 1: Foundation Building</DialogDescription>
                  </DialogHeader>
                  <div className="px-6 py-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="h-32 sm:h-40 w-full rounded-2xl bg-[var(--card)] flex items-center justify-center">
                          <Clock className="h-16 w-16 sm:h-20 sm:w-20 text-[var(--foreground)] animate-pulse" />
                        </div>
                        <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
                          Learn essential techniques for managing your energy levels and creating sustainable daily routines that support both your practice and family life.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-[var(--card)] p-5">
                          <h4 className="font-bold text-lg mb-4">Key Components</h4>
                          <div className="space-y-3">
                            {[
                              "Energy management strategies",
                              "Sustainable daily routines",
                              "Boundary setting techniques",
                              "Self-care integration"
                            ].map((feature, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-reddishBrown to-mediumBrown"></div>
                                <p className="text-base text-[var(--muted)]">{feature}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="px-6 py-4 border-t border-[var(--border)]">
                    <div className="flex flex-col sm:flex-row w-full gap-3">
                      <DialogClose asChild>
  <Button
    onClick={() => {
      setTimeout(() => {
        scrollToSection("apply");
      }, 300);
    }}
    className="w-full sm:w-auto bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0"
  >
    Join Program
    <ArrowUpRight className="ml-2 h-4 w-4" />
  </Button>
</DialogClose>
                      <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                      </DialogClose>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="bg-[var(--card)]/5 backdrop-blur-sm rounded-lg p-6 border border-[var(--border)] hover:border-[var(--border)] transition-all cursor-pointer luxury-card">
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="h-6 w-6 text-[var(--foreground)]" />
                      <h3 className="text-2xl font-bold text-[var(--foreground)]">Emotional Exhaustion</h3>
                    </div>
                    <p className="text-[var(--muted)] mb-4">
                      The pressures of entrepreneurship can take a toll on your emotional well-being, leaving you unsure how to maintain patience and love as a conscious parent and partner.
                    </p>
                    <div className="flex items-center text-[var(--muted)]">
                      <span className="text-sm">Click to learn more</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl overflow-y-auto max-h-[90vh] sm:max-h-[calc(100vh-4rem)]">
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-2xl sm:text-3xl font-serif">Emotional Resilience Building</DialogTitle>
                    <DialogDescription className="text-base sm:text-lg mt-2">Phase 2: Integration & Practice</DialogDescription>
                  </DialogHeader>
                  <div className="px-6 py-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="h-32 sm:h-40 w-full rounded-2xl bg-[var(--card)] flex items-center justify-center">
                          <Heart className="h-16 w-16 sm:h-20 sm:w-20 text-[var(--foreground)] animate-pulse" />
                        </div>
                        <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
                          Develop emotional resilience and learn techniques to maintain presence and patience in both your professional and personal life.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-[var(--card)] p-5">
                          <h4 className="font-bold text-lg mb-4">Key Components</h4>
                          <div className="space-y-3">
                            {[
                              "Emotional regulation tools",
                              "Mindfulness practices",
                              "Stress management techniques",
                              "Relationship nurturing skills"
                            ].map((feature, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-mediumBrown to-tan"></div>
                                <p className="text-base text-[var(--muted)]">{feature}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="px-6 py-4 border-t border-[var(--border)]">
                    <div className="flex flex-col sm:flex-row w-full gap-3">
                      <DialogClose asChild>
  <Button
    onClick={() => {
      setTimeout(() => {
        scrollToSection("apply");
      }, 300);
    }}
    className="w-full sm:w-auto bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0"
  >
    Join Program
    <ArrowUpRight className="ml-2 h-4 w-4" />
  </Button>
</DialogClose>
                      <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                      </DialogClose>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="bg-[var(--card)]/5 backdrop-blur-sm rounded-lg p-6 border border-[var(--border)] hover:border-[var(--border)] transition-all cursor-pointer luxury-card">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-6 w-6 text-[var(--foreground)]" />
                      <h3 className="text-2xl font-bold text-[var(--foreground)]">Imposter Syndrome</h3>
                    </div>
                    <p className="text-[var(--muted)] mb-4">
                      Do you sometimes struggle with feelings of inadequacy, doubting your ability to provide genuine guidance to your clients while managing your own uncertainties?
                    </p>
                    <div className="flex items-center text-[var(--muted)]">
                      <span className="text-sm">Click to learn more</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl overflow-y-auto max-h-[90vh] sm:max-h-[calc(100vh-4rem)]">
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-2xl sm:text-3xl font-serif">Building Authentic Confidence</DialogTitle>
                    <DialogDescription className="text-base sm:text-lg mt-2">Phase 2: Integration & Practice</DialogDescription>
                  </DialogHeader>
                  <div className="px-6 py-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="h-32 sm:h-40 w-full rounded-2xl bg-[var(--card)] flex items-center justify-center">
                          <Users className="h-16 w-16 sm:h-20 sm:w-20 text-[var(--foreground)] animate-pulse" />
                        </div>
                        <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
                          Transform self-doubt into authentic confidence through proven techniques and deep inner work that allows you to show up fully for your clients.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-[var(--card)] p-5">
                          <h4 className="font-bold text-lg mb-4">Key Components</h4>
                          <div className="space-y-3">
                            {[
                              "Confidence building exercises",
                              "Authentic leadership development",
                              "Self-trust cultivation",
                              "Professional identity strengthening"
                            ].map((feature, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-tan to-beige"></div>
                                <p className="text-base text-[var(--muted)]">{feature}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="px-6 py-4 border-t border-[var(--border)]">
                    <div className="flex flex-col sm:flex-row w-full gap-3">
                      <DialogClose asChild>
  <Button
    onClick={() => {
      setTimeout(() => {
        scrollToSection("apply");
      }, 300);
    }}
    className="w-full sm:w-auto bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0"
  >
    Join Program
    <ArrowUpRight className="ml-2 h-4 w-4" />
  </Button>
</DialogClose>
                      <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                      </DialogClose>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="bg-[var(--card)]/5 backdrop-blur-sm rounded-lg p-6 border border-[var(--border)] hover:border-[var(--border)] transition-all cursor-pointer luxury-card">
                    <div className="flex items-center gap-3 mb-4">
                      <BarChart3 className="h-6 w-6 text-[var(--foreground)]" />
                      <h3 className="text-2xl font-bold text-[var(--foreground)]">Lack of Clarity and Focus</h3>
                    </div>
                    <p className="text-[var(--muted)] mb-4">
                      Do you seek not only skills but also a deeper understanding of your unique strengths and the areas where you need support?
                    </p>
                    <div className="flex items-center text-[var(--muted)]">
                      <span className="text-sm">Click to learn more</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl overflow-y-auto max-h-[90vh] sm:max-h-[calc(100vh-4rem)]">
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-2xl sm:text-3xl font-serif">Finding Your Path</DialogTitle>
                    <DialogDescription className="text-base sm:text-lg mt-2">Phase 3: Embodiment & Transformation</DialogDescription>
                  </DialogHeader>
                  <div className="px-6 py-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="h-32 sm:h-40 w-full rounded-2xl bg-[var(--card)] flex items-center justify-center">
                          <BarChart3 className="h-16 w-16 sm:h-20 sm:w-20 text-[var(--foreground)] animate-pulse" />
                        </div>
                        <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
                          Discover your unique strengths and develop a clear vision for your practice while creating actionable steps toward your goals.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-[var(--card)] p-5">
                          <h4 className="font-bold text-lg mb-4">Key Components</h4>
                          <div className="space-y-3">
                            {[
                              "Vision development",
                              "Goal setting framework",
                              "Action planning",
                              "Progress tracking systems"
                            ].map((feature, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-reddishBrown to-mediumBrown"></div>
                                <p className="text-base text-[var(--muted)]">{feature}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="px-6 py-4 border-t border-[var(--border)]">
                    <div className="flex flex-col sm:flex-row w-full gap-3">
                      <DialogClose asChild>
  <Button
    onClick={() => {
      setTimeout(() => {
        scrollToSection("apply");
      }, 300);
    }}
    className="w-full sm:w-auto bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0"
  >
    Join Program
    <ArrowUpRight className="ml-2 h-4 w-4" />
  </Button>
</DialogClose>
                      <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                      </DialogClose>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-16 mx-auto max-w-3xl text-center">
              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-sm">
                <h3 className="text-xl font-serif font-bold mb-4">
                  What if you could turn these pain points into growth opportunities?
                </h3>
                <p className="text-[var(--muted)]">
                  Authentik Foundations is a unique program that combines self-discovery tools, holistic living
                  practices, and heart-centered approach to coaching that goes beyond traditional methods.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Program Section */}
        <section
          id="program"
          ref={setSectionRef("program")}
          className="py-20 bg-[var(--background)]"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <div className="inline-flex items-center rounded-full bg-[var(--card)] px-3 py-1 text-sm mb-4">
                <span className="font-medium text-[var(--foreground)]">The Solution</span>
              </div>
              <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
                Program Highlights
              </h2>
              <p className="mt-4 text-[var(--muted)] text-lg">
                A comprehensive 12-week journey to transform your coaching practice and life
              </p>
            </div>

            {/* Interactive Program Timeline */}
            <div className="relative mb-20">
              <div className="flex justify-center mb-10">
                <div className="inline-flex bg-[var(--card)]/5 backdrop-blur-sm rounded-full p-1">
                  {["Phase 1", "Phase 2", "Phase 3"].map((phase, index) => (
                    <button
                      key={index}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activePhase === `phase-${index + 1}`
                          ? "bg-gradient-to-r from-reddishBrown to-mediumBrown text-[#fffff0]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
                      }`}
                      onClick={() => handlePhaseChange(`phase-${index + 1}`)}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden">
              <div
                  ref={phasesContainerRef}
                id="phases-container"
                  className="flex snap-x snap-mandatory overflow-x-auto hide-scrollbar scroll-smooth pb-10 transition-transform duration-500 ease-in-out w-full"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
              >
                {[
                  {
                    id: "phase-1",
                    week: "Weeks 1-4",
                    title: "Foundation Building",
                    description:
                      "Kick off your journey with a deep dive into your core values, strengths, and personal vision. You'll establish the essential habits and mindset required for sustainable growth, including a personalized morning routine, foundational nutrition, and stress reduction techniques. This phase is about laying the groundwork for a resilient, purpose-driven coaching practice.",
                    features: [
                      "Core values discovery & personal vision mapping",
                      "Foundational nutrition and energy rituals",
                      "Stress reduction and mindfulness practices",
                      "Designing your personalized morning routine",
                      "Building the mindset for sustainable growth",
                    ],
                    color: "from-reddishBrown to-mediumBrown",
                      icon: <Sparkles className="h-6 w-6 text-[var(--foreground)]" />,
                  },
                  {
                    id: "phase-2",
                    week: "Weeks 5-8",
                    title: "Integration & Practice",
                    description:
                      "Apply your new habits and mindset to real-world coaching scenarios. This phase focuses on emotional resilience, handling setbacks, and supporting both yourself and your clients through periods of change. You'll learn advanced boundary-setting, emotional regulation, and how to create supportive accountability structures for your clients.",
                    features: [
                      "Advanced boundary-setting for work/life harmony",
                      "Emotional regulation and resilience training",
                      "Navigating setbacks and maintaining momentum",
                      "Creating accountability structures for clients",
                      "Integrating feedback and continuous improvement",
                    ],
                    color: "from-mediumBrown to-tan",
                      icon: <Heart className="h-6 w-6 text-[var(--foreground)]" />,
                  },
                  {
                    id: "phase-3",
                    week: "Weeks 9-12",
                    title: "Embodiment & Transformation",
                    description:
                      "Step into your role as an empowered, heart-centered coach. In this final phase, you'll master the art of transformational coaching, celebrate your growth, and build connections with a community of like-minded coaches. You'll also design a long-term plan for continued personal and professional development, ensuring your transformation lasts well beyond the program.",
                    features: [
                      "Mastering transformational coaching techniques",
                      "Celebrating progress and transformation",
                      "Community connection and peer masterminds",
                      "Designing your long-term growth plan",
                      "Sustaining your new identity as a coach and leader",
                    ],
                    color: "from-tan to-beige",
                      icon: <Users className="h-6 w-6 text-[var(--foreground)]" />,
                  },
                ].map((phase, index) => (
                  <div
                    id={phase.id}
                    key={index}
                      className="w-full flex-none snap-center px-4"
                    >
                      <div className="max-w-2xl mx-auto">
                        <Dialog
  open={phaseDialogsOpen[index]}
  onOpenChange={(open) => handlePhaseDialogOpenChange(open, index)}
>
  <DialogTrigger asChild>
                            <button className="w-full text-left">
                              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md overflow-hidden transition-all duration-500 transform hover:scale-[1.02] origin-center hover:shadow-[0_0_30px_-5px_rgba(202,172,142,0.4)]">
                      <div className={`h-2 w-full bg-gradient-to-r ${phase.color}`}></div>
                                <div className="p-4 sm:p-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 sm:mb-6">
                                    <div className="flex h-12 sm:h-14 w-12 sm:w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--card)]/10">
  {phase.icon}
</div>
                          <div>
                                      <span className="inline-block px-3 py-1 rounded-full bg-[var(--card)]/10 text-[var(--foreground)]/70 text-sm font-medium mb-2">
                              {phase.week}
                            </span>
                                      <h3 className="text-lg sm:text-2xl font-serif font-bold">{phase.title}</h3>
                          </div>
                        </div>

                                  <p className="text-sm sm:text-base text-[var(--muted)] mb-6 sm:mb-8">{phase.description}</p>

                                  <div className="grid gap-2 sm:gap-3">
                          {phase.features.map((feature, i) => (
                            <div
                              key={i}
                                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-[var(--card)]/10 backdrop-blur-sm border border-[var(--border)]"
                            >
                                        <Check className="h-4 sm:h-5 w-4 sm:w-5 shrink-0 text-[var(--foreground)]" />
                                        <span className="text-sm sm:text-base">{feature}</span>
                            </div>
                          ))}
                        </div>
                            </div>
                          </div>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-2xl overflow-y-auto max-h-[90vh] sm:max-h-[calc(100vh-4rem)] p-4 sm:p-6">
                            <DialogHeader>
                              <DialogTitle className="text-lg sm:text-2xl font-serif">{phase.title}</DialogTitle>
                              <DialogDescription className="text-sm sm:text-base">{phase.week}</DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 grid gap-4 sm:gap-6 md:grid-cols-2">
                              <div className="space-y-3 sm:space-y-4">
                                <div className="h-28 sm:h-40 w-full rounded-lg bg-[var(--card)] flex items-center justify-center">
                                  {React.cloneElement(phase.icon as React.ReactElement<any>, {
                                    className: "h-16 w-16 sm:h-24 sm:w-24 text-[var(--foreground)] animate-pulse"
                                  })}
                                </div>
                                <p className="text-sm sm:text-base text-[var(--muted)]">{phase.description}</p>
                                {phase.id === "phase-1" && (
                                  <div className="rounded-lg bg-[var(--card)] p-3 sm:p-4">
                                    <h4 className="font-bold text-[var(--foreground)] mb-2 text-sm sm:text-base">Progress Tracking</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--muted)]">
                                      <li>Complete your Core Values & Vision worksheet</li>
                                      <li>Submit your personalized morning routine plan</li>
                                      <li>Track daily nutrition and mindfulness habits</li>
                                      <li>Weekly check-in on stress reduction progress</li>
                                    </ul>
                                    <h4 className="font-bold text-[var(--foreground)] mt-3 mb-2 text-sm sm:text-base">Implementation Timeline</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--muted)]">
                                      <li>Week 1: Core values & vision mapping</li>
                                      <li>Week 2: Nutrition & energy rituals</li>
                                      <li>Week 3: Mindfulness & stress reduction</li>
                                      <li>Week 4: Morning routine design & review</li>
                                    </ul>
                                  </div>
                                )}
                                {phase.id === "phase-2" && (
                                  <div className="rounded-lg bg-[var(--card)] p-3 sm:p-4">
                                    <h4 className="font-bold text-[var(--foreground)] mb-2 text-sm sm:text-base">Progress Tracking</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--muted)]">
                                      <li>Boundary-setting self-assessment</li>
                                      <li>Weekly emotional resilience journal</li>
                                      <li>Client accountability structure submission</li>
                                      <li>Peer feedback and improvement log</li>
                                    </ul>
                                    <h4 className="font-bold text-[var(--foreground)] mt-3 mb-2 text-sm sm:text-base">Implementation Timeline</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--muted)]">
                                      <li>Week 5: Advanced boundary-setting</li>
                                      <li>Week 6: Emotional regulation practice</li>
                                      <li>Week 7: Accountability structure creation</li>
                                      <li>Week 8: Peer review & feedback integration</li>
                                    </ul>
                                  </div>
                                )}
                                {phase.id === "phase-3" && (
                                  <div className="rounded-lg bg-[var(--card)] p-3 sm:p-4">
                                    <h4 className="font-bold text-[var(--foreground)] mb-2 text-sm sm:text-base">Progress Tracking</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--muted)]">
                                      <li>Transformation celebration submission</li>
                                      <li>Community mastermind participation log</li>
                                      <li>Long-term growth plan outline</li>
                                      <li>Final self-assessment as a coach/leader</li>
                                    </ul>
                                    <h4 className="font-bold text-[var(--foreground)] mt-3 mb-2 text-sm sm:text-base">Implementation Timeline</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[var(--muted)]">
                                      <li>Week 9: Mastering transformational coaching</li>
                                      <li>Week 10: Community and peer masterminds</li>
                                      <li>Week 11: Long-term growth plan design</li>
                                      <li>Week 12: Celebration & next steps</li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-3 sm:space-y-4">
                                <div className="rounded-lg bg-[var(--card)] p-3 sm:p-4">
                                  <h4 className="font-bold text-[var(--foreground)] mb-2 text-sm sm:text-base">Key Components</h4>
                                  <div className="space-y-2 sm:space-y-3">
                                    {phase.features.map((feature: string, i: number) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${phase.color}`}></div>
                                        <p className="text-xs sm:text-sm text-[var(--muted)]">{feature}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
                          <DialogClose asChild>
  <Button
    onClick={() => {
      setTimeout(() => {
        scrollToSection("apply");
      }, 300);
    }}
    className="w-full sm:w-auto bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0"
  >
    Join Program
    <ArrowUpRight className="ml-2 h-4 w-4" />
  </Button>
</DialogClose>
                              <DialogClose asChild>
                                <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  size="icon"
                    className="rounded-full border-[var(--border)] bg-[var(--card)]/5 backdrop-blur-sm hover:bg-[var(--card)] transition-all duration-300"
                  onClick={() => {
                      const currentPhase = parseInt(activePhase.split("-")[1])
                      const targetPhase = currentPhase > 1 ? currentPhase - 1 : 3
                      handlePhaseChange(`phase-${targetPhase}`)
                  }}
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>

                <div className="flex gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          activePhase === `phase-${num}` ? "bg-[var(--foreground)]" : "bg-[var(--muted)] hover:bg-[var(--muted-hover)]"
                        }`}
                        onClick={() => handlePhaseChange(`phase-${num}`)}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                    className="rounded-full border-[var(--border)] bg-[var(--card)]/5 backdrop-blur-sm hover:bg-[var(--card)] transition-all duration-300"
                  onClick={() => {
                      const currentPhase = parseInt(activePhase.split("-")[1])
                      const targetPhase = currentPhase < 3 ? currentPhase + 1 : 1
                      handlePhaseChange(`phase-${targetPhase}`)
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                </div>
              </div>
            </div>

            {/* Program Features 3D Cards */}
            <div className="mx-auto max-w-4xl mt-24">
              <h3 className="text-2xl font-serif font-bold text-center mb-10 bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
                Explore Program Features
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Personalized Assessments",
                    description: "Understand your unique strengths and areas for growth with customized evaluations.",
                    icon: <Sparkles className="h-6 w-6 text-[var(--foreground)]" />,
                    color: "from-reddishBrown to-mediumBrown",
                    dialogContent: {
                      title: "Personalized Assessments",
                      subtitle: "Your Journey to Self-Discovery",
                      details: [
                        "Emotional Intelligence Profile",
                        "Leadership Style Assessment",
                        "Energy Management Patterns",
                        "Communication Preferences",
                        "Core Values Alignment"
                      ]
                    }
                  },
                  {
                    title: "Holistic Lifestyle",
                    description: "Support your mind, body, and spirit with comprehensive lifestyle practices.",
                    icon: <Heart className="h-6 w-6 text-[var(--foreground)]" />,
                    color: "from-mediumBrown to-tan",
                    dialogContent: {
                      title: "Holistic Lifestyle Integration",
                      subtitle: "Balancing Mind, Body, and Spirit",
                      details: [
                        "Morning Ritual Design",
                        "Nutrition & Movement",
                        "Sleep Optimization",
                        "Stress Management",
                        "Energy Renewal Practices"
                      ]
                    }
                  },
                  {
                    title: "Natural Rhythms",
                    description: "Learn to harness the seasons of life for optimal balance and growth.",
                    icon: <Clock className="h-6 w-6 text-[var(--foreground)]" />,
                    color: "from-tan to-beige",
                    dialogContent: {
                      title: "Natural Rhythms Integration",
                      subtitle: "Aligning with Life's Seasons",
                      details: [
                        "Daily Energy Cycles",
                        "Weekly Planning Rhythms",
                        "Monthly Reflection Practice",
                        "Seasonal Transitions",
                        "Life-Work Harmony"
                      ]
                    }
                  },
                  {
                    title: "Heart-Centered Work",
                    description: "Develop the power of alignment rather than desperation in your approach.",
                    icon: <Sparkles className="h-6 w-6 text-[var(--foreground)]" />,
                    color: "from-reddishBrown to-mediumBrown",
                    dialogContent: {
                      title: "Heart-Centered Approach",
                      subtitle: "Leading from Authenticity",
                      details: [
                        "Authentic Leadership",
                        "Emotional Presence",
                        "Intuitive Decision Making",
                        "Value-Based Actions",
                        "Conscious Communication"
                      ]
                    }
                  },
                  {
                    title: "Community Support",
                    description: "Join a private group of like-minded coaches on the same journey.",
                    icon: <Users className="h-6 w-6 text-[var(--foreground)]" />,
                    color: "from-mediumBrown to-tan",
                    dialogContent: {
                      title: "Community Connection",
                      subtitle: "Growing Together",
                      details: [
                        "Peer Support Network",
                        "Group Coaching Sessions",
                        "Knowledge Sharing",
                        "Collaboration Opportunities",
                        "Lifelong Relationships"
                      ]
                    }
                  },
                  {
                    title: "Nutrition Support",
                    description: "Receive premium supplements to support your physical vitality.",
                    icon: <Sparkles className="h-6 w-6 text-[var(--foreground)]" />,
                    color: "from-tan to-beige",
                    dialogContent: {
                      title: "Nutrition & Vitality",
                      subtitle: "Nourishing Your Potential",
                      details: [
                        "Premium Supplements",
                        "Personalized Nutrition",
                        "Energy Optimization",
                        "Lifestyle Integration",
                        "Sustainable Habits"
                      ]
                    }
                  },
                ].map((feature, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="group relative h-[280px] perspective-1000 cursor-pointer">
                        <div className="absolute inset-0 rounded-xl border border-[var(--border)] bg-[var(--card)]/5 backdrop-blur-sm p-6 transition-all duration-500 transform preserve-3d group-hover:rotate-y-10 group-hover:scale-105 group-hover:shadow-[0_0_30px_-5px_rgba(202,172,142,0.3)]">
                          <div className={`h-1 w-16 bg-gradient-to-r ${feature.color} rounded-full mb-6`}></div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--card)]/10 mb-4">
                            {feature.icon}
                          </div>
                          <h3 className="text-xl font-serif font-bold mb-2">{feature.title}</h3>
                          <p className="text-[var(--muted)]">{feature.description}</p>

                          <div className="absolute bottom-6 right-6 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                            <div className="flex items-center gap-1 text-sm text-[#fffff0] bg-gradient-to-r from-reddishBrown to-mediumBrown px-3 py-1 rounded-full">
                              <span>Learn more</span>
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{feature.dialogContent.title}</DialogTitle>
                        <DialogDescription>{feature.dialogContent.subtitle}</DialogDescription>
                      </DialogHeader>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="h-40 w-full rounded-lg bg-[var(--card)] flex items-center justify-center">
                              {React.cloneElement(feature.icon as React.ReactElement<any>, {
                              className: "h-16 w-16 sm:h-24 sm:w-24 text-[var(--foreground)] animate-pulse"
                                })}
                              </div>
                          <div className="rounded-lg bg-[var(--card)] p-4">
                            <h4 className="font-bold text-[var(--foreground)] mb-2">Key Components</h4>
                            <div className="space-y-3">
                              {feature.dialogContent.details.map((detail, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                                  <p className="text-sm text-[var(--muted)]">{detail}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg bg-[var(--card)] p-4">
                            <h4 className="font-bold text-[var(--foreground)] mb-2">Progress Tracking</h4>
                            <div className="space-y-4">
                              {feature.dialogContent.details.map((detail, i) => (
                                <div key={i} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--muted)]">{detail}</span>
                                    <span className="text-sm text-[var(--muted)]">Week {i + 1}</span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-[var(--card)]/10">
                                    <div 
                                      className={`h-2 rounded-full bg-gradient-to-r ${feature.color}`}
                                      style={{ width: `${(i + 1) * 20}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-lg bg-[var(--card)] p-4">
                            <h4 className="font-bold text-[var(--foreground)] mb-2">Implementation Timeline</h4>
                            <div className="relative pt-2">
                              <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--card)]/10"></div>
                              <div className="space-y-4">
                                {['Foundation', 'Integration', 'Mastery'].map((phase, i) => (
                                  <div key={i} className="relative pl-6">
                                    <div className={`absolute left-0 top-2 w-4 h-4 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                                    <p className="text-sm font-medium text-[var(--foreground)]">{phase}</p>
                                    <p className="text-xs text-[var(--muted)]">Week {i * 4 + 1}-{i * 4 + 4}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => handlePhaseDialogOpenChange(false, index)}
                          className="w-full sm:w-auto bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0"
                        >
                          Join Program
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                        <DialogClose asChild>
                          <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="mx-auto max-w-4xl mt-24">
              <h3 className="text-2xl font-serif font-bold text-center mb-10 bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
                Weekly Program Structure
              </h3>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-reddishBrown via-mediumBrown to-tan hidden md:block"></div>

                <div className="space-y-4">
                  {[
                    {
                      day: "Monday",
                      activity: "Group Coaching Session",
                      time: "7:00 PM - 8:30 PM EST",
                      description: "Interactive group coaching with personalized feedback and community support.",
                      details: {
                        format: "Live Video Session",
                        duration: "90 minutes",
                        includes: [
                          "Deep dive into weekly themes",
                          "Interactive Q&A sessions",
                          "Group discussions and sharing",
                          "Practical implementation strategies"
                        ],
                        preparation: "Pre-session reflection questions will be provided",
                        outcomes: "Clear action steps and accountability"
                      }
                    },
                    {
                      day: "Wednesday",
                      activity: "Implementation Workshop",
                      time: "12:00 PM - 1:00 PM EST",
                      description: "Hands-on workshop to implement the concepts and strategies from the group session.",
                      details: {
                        format: "Interactive Workshop",
                        duration: "60 minutes",
                        includes: [
                          "Practical exercises",
                          "Tool implementation training",
                          "Real-world scenario practice",
                          "Peer feedback sessions"
                        ],
                        preparation: "Bring specific challenges to workshop",
                        outcomes: "Concrete implementation plan"
                      }
                    },
                    {
                      day: "Friday",
                      activity: "Reflection & Integration",
                      time: "Self-paced",
                      description: "Guided reflection exercises to integrate the week's learnings into your practice.",
                      details: {
                        format: "Self-Guided Practice",
                        duration: "Flexible",
                        includes: [
                          "Journaling prompts",
                          "Integration exercises",
                          "Progress tracking",
                          "Weekly reflection template"
                        ],
                        preparation: "Set aside dedicated reflection time",
                        outcomes: "Deeper integration of learnings"
                      }
                    },
                    {
                      day: "Weekends",
                      activity: "Community Connection",
                      time: "Anytime",
                      description: "Optional community activities and peer support in our private online group.",
                      details: {
                        format: "Online Community",
                        duration: "24/7 Access",
                        includes: [
                          "Peer discussions",
                          "Resource sharing",
                          "Celebration of wins",
                          "Support network"
                        ],
                        preparation: "None required",
                        outcomes: "Strong community bonds"
                      }
                    },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="relative pl-8 md:pl-12"
                    >
                      <div className={`absolute left-0 top-6 w-3 h-3 rounded-full transition-colors duration-300 ${
                        expandedDay === item.day ? "bg-reddishBrown" : "bg-[var(--muted)]"
                      } hidden md:block`}></div>
                      
                      <div 
                        className={`rounded-xl border border-[var(--border)] backdrop-blur-sm transition-all duration-500 ${
                          expandedDay === item.day 
                            ? "bg-[var(--card)] border-[var(--border)]" 
                            : "bg-[var(--card)] hover:bg-[var(--card-hover)]"
                        }`}
                      >
                        <button
                          onClick={() => setExpandedDay(expandedDay === item.day ? null : item.day)}
                          className="w-full text-left p-6 focus:outline-none"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                              <span className="inline-block px-3 py-1 rounded-full bg-[var(--card)]/10 text-[var(--foreground)]/70 text-sm font-medium mb-2">
                              {item.day}
                            </span>
                            <h4 className="text-xl font-serif font-bold">{item.activity}</h4>
                          </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-[var(--muted)] bg-[var(--card)]/5 px-3 py-1 rounded-full">
                                {item.time}
                              </span>
                              <ChevronRight 
                                className={`h-4 w-4 transition-transform duration-300 ${
                                  expandedDay === item.day ? "rotate-90" : ""
                                }`} 
                              />
                        </div>
                      </div>
                          <p className="text-[var(--muted)] mt-2">{item.description}</p>
                        </button>

                        {/* Expanded Content */}
                        <div 
                          className={`overflow-hidden transition-all duration-500 ${
                            expandedDay === item.day ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="p-6 pt-0 border-t border-[var(--border)] mt-4 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-[var(--muted)]" />
                                  <span className="text-sm font-medium">{item.details.format}</span>
                                </div>
                                <div className="rounded-lg bg-[var(--card)]/5 p-4">
                                  <h5 className="font-medium mb-3">Session Includes:</h5>
                                  <div className="space-y-2">
                                    {item.details.includes.map((detail, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-reddishBrown"></div>
                                        <span className="text-sm text-[var(--muted)]">{detail}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="rounded-lg bg-[var(--card)]/5 p-4">
                                  <h5 className="font-medium mb-2">Preparation</h5>
                                  <p className="text-sm text-[var(--muted)]">{item.details.preparation}</p>
                                </div>
                                <div className="rounded-lg bg-[var(--card)]/5 p-4">
                                  <h5 className="font-medium mb-2">Outcomes</h5>
                                  <p className="text-sm text-[var(--muted)]">{item.details.outcomes}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating CTA */}
          <div className="fixed bottom-8 right-8 z-30 transform transition-all duration-500 hover:scale-105">
            <Button
              onClick={() => scrollToSection("apply")}
              className="bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0 rounded-full px-6 shadow-[0_0_20px_-5px_rgba(202,172,142,0.5)]"
            >
              Join Program
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" ref={setSectionRef("benefits")} className="py-20 bg-[var(--background)]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <div className="inline-flex items-center rounded-full bg-[var(--card)] px-3 py-1 text-sm mb-4">
                <span className="font-medium text-[var(--foreground)]">The Transformation</span>
              </div>
              <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
                Benefits of Joining Authentik Foundations
              </h2>
            </div>

            <div className="relative">
              <ul id="stacking-cards" className="list-none p-0 grid grid-cols-1 gap-[4vw] pb-[calc(4*1.5em)] mb-[4vw]" style={{ gridTemplateRows: 'repeat(5, 87vh)' }}>
                {[
                  {
                    id: "card1",
                    title: "Shift from Doing to Being",
                    description: "Understand that success comes from embodying your role rather than just acquiring skills. Cultivate the presence needed to truly connect with your clients and loved ones.",
                    icon: <Sparkles className="h-6 w-6 text-[var(--foreground)]" />,
                    gradient: "from-reddishBrown to-mediumBrown",
                  },
                  {
                    id: "card2",
                    title: "Enhance Emotional Resilience",
                    description: "Gain tools to support your mental and emotional well-being, allowing you to give without becoming depleted.",
                    icon: <Heart className="h-6 w-6 text-[var(--foreground)]" />,
                    gradient: "from-mediumBrown to-tan",
                  },
                  {
                    id: "card3",
                    title: "Build Authentik Connections",
                    description: "Develop deeper relationships with your clients and family through increased emotional intelligence and holistic awareness.",
                    icon: <Users className="h-6 w-6 text-[var(--foreground)]" />,
                    gradient: "from-tan to-beige",
                  },
                  {
                    id: "card4",
                    title: "Cultivate Confidence and Patience",
                    description: "Overcome self-doubt and emerge as a grounded leader, confident in your ability to offer impactful guidance.",
                    icon: <BarChart3 className="h-6 w-6 text-[var(--foreground)]" />,
                    gradient: "from-reddishBrown to-mediumBrown",
                  },
                  {
                    id: "card5",
                    title: "Establish Work-Life Harmony",
                    description: "Discover how to harmonize your coaching responsibilities and parenting while being deeply connected to your personal values and goals.",
                    icon: <Sparkles className="h-6 w-6 text-[var(--foreground)]" />,
                    gradient: "from-mediumBrown to-tan",
                  },
                ].map((item, index) => (
                  <li 
                    key={item.id}
                    id={item.id}
                    className="card sticky top-0"
                    style={{ 
                      paddingTop: `calc(${index + 1} * 1.5em)`,
                      zIndex: index // Initially set increasing z-index
                    }}
                  >
                    <div className="card-body h-[87vh] rounded-[50px] shadow-[0_0_30px_0_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden relative">
  {/* Full card background image */}
  {/* Blur layer behind the image */}
  <div className="absolute inset-0 z-0 backdrop-blur-xl" />
  {/* Lower opacity image on top of blur */}
  <img
    src="https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67e1e9039643c138485e902c.png"
    alt="Benefit background"
    className="absolute inset-0 w-full h-full object-cover opacity-30 z-10"
    draggable="false"
  />
  {/* Very subtle overlay for readability */}
  <div className="absolute inset-0 bg-[var(--card)]/10 z-20" />
  {/* Card Content */}
  <div className="relative z-20 h-full group bg-gradient-to-br from-[var(--background)]/95 to-[var(--background)]/90 border border-[var(--border)] flex flex-col justify-center items-center">
    <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-reddishBrown/5 blur-3xl group-hover:bg-reddishBrown/10 transition-all duration-700"></div>
    <div className={`absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r ${item.gradient} opacity-20`}></div>
    <div className={`absolute bottom-0 right-0 h-[1px] w-full bg-gradient-to-r ${item.gradient} opacity-20`}></div>
    <div className="relative text-center max-w-3xl mx-auto px-8 sm:px-12 flex flex-col justify-center h-full">
      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6 bg-gradient-to-r from-[var(--foreground)] to-beige bg-clip-text text-transparent">
        {item.title}
      </h3>
      <p className="text-xl sm:text-2xl text-[var(--muted)] leading-relaxed max-w-2xl mx-auto">
        {item.description}
      </p>
    </div>
  </div>
</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section
          id="achievements"
          ref={setSectionRef("achievements")}
          className="py-20 bg-[var(--background)]"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <div className="inline-flex items-center rounded-full bg-[var(--card)] px-3 py-1 text-sm mb-4">
                <span className="font-medium text-[var(--foreground)]">The Results</span>
              </div>
              <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
                What Will You Achieve?
              </h2>
              <p className="mt-4 text-[var(--muted)] text-lg">By the end of this transformational program, you will:</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  title: "Embody High Performance",
                  description:
                    "Evolve from a state of burnout to one of fulfillment and energy, enhancing your ability to serve both professionally and personally.",
                  number: "01",
                },
                {
                  title: "Transform Your Coaching Practice",
                  description:
                    "Master the art of supporting clients effectively, ensuring their well-being and growth, while also maintaining your own.",
                  number: "02",
                },
                {
                  title: "Become a Conscious Leader",
                  description:
                    "Lead with authenticity and love, fostering stronger connections and more meaningful impacts.",
                  number: "03",
                },
                {
                  title: "Join a Supportive Community",
                  description:
                    "Be part of a collective journey with other coaches committed to heart-centered growth and mutual support.",
                  number: "04",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/5 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-[var(--card)] hover:shadow-[0_0_25px_-5px_rgba(202,172,142,0.3)]"
                >
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-reddishBrown/10 blur-3xl group-hover:bg-reddishBrown/20 transition-all duration-700"></div>
                  <div className="flex items-start gap-6 mb-4">
                    <span className="text-4xl font-serif font-bold text-[var(--foreground)]/20">{item.number}</span>
                    <div>
                      <h3 className="text-xl font-serif font-bold mb-4">{item.title}</h3>
                      <p className="text-[var(--muted)]">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative py-24 md:py-32">
          <div className="container max-w-6xl">
            <div className="flex flex-col gap-12 md:gap-16 lg:gap-20">
              <TestimonialSlider testimonials={testimonials} />
              <div className="mt-10 md:mt-14 lg:mt-16">
                <VideoTestimonialSlider
      videos={[
                {
                  id: "real-1",
                  videoUrl: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/68002969768a58a6d768141b.mp4",
                  poster: undefined,
                  alt: "Testimonial Video 1"
                },
                {
                  id: "placeholder-2",
                  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                  poster: undefined,
                  alt: "Placeholder Testimonial 2"
                },
                {
                  id: "placeholder-3",
                  videoUrl: "https://www.w3schools.com/html/movie.mp4",
                  poster: undefined,
                  alt: "Placeholder Testimonial 3"
                }
              ]}
              className="mt-10"
            />
              </div>
            </div>
          </div>
        </section>

        {/* Application Section */}
        <section
          id="apply"
          ref={setSectionRef("apply")}
          className="py-20 bg-[var(--background)] relative overflow-hidden"
        >
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-reddishBrown/30 via-transparent to-transparent"></div>

          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <div className="inline-flex items-center rounded-full bg-[var(--card)] px-3 py-1 text-sm mb-4">
                <span className="font-medium text-[var(--foreground)]">Join Us</span>
              </div>
              <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
                Ready to Transform Your Coaching Journey?
              </h2>
              <p className="mt-6 text-xl text-[var(--muted)]">
                It's time to elevate your experience as a coach and parent, creating a life filled with love, abundance,
                and joy. Join us for Authentik Foundations and discover the transformational power of being!
              </p>
              <p className="mt-4 text-lg text-[var(--muted)]">
                Turn your struggles into strengths and reclaim your passion for coaching and family life. Are you ready
                for a profound transformation?
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/5 p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-serif font-bold mb-6 text-center">Apply for Authentik Foundations</h3>
                <form className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="text-sm font-medium text-[var(--foreground)]/80">
                        First Name
                      </label>
                      <Input
                        id="first-name"
                        placeholder="Enter your first name"
                        className="bg-[var(--card)]/5 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-reddishBrown"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="text-sm font-medium text-[var(--foreground)]/80">
                        Last Name
                      </label>
                      <Input
                        id="last-name"
                        placeholder="Enter your last name"
                        className="bg-[var(--card)]/5 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-reddishBrown"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]/80">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-[var(--card)]/5 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-reddishBrown"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-[var(--foreground)]/80">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      className="bg-[var(--card)]/5 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-reddishBrown"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-[var(--foreground)]/80">
                      What are you hoping to achieve through this program?
                    </label>
                    <textarea
                      id="message"
                      className="flex min-h-[120px] w-full rounded-md border border-[var(--border)] bg-[var(--card)]/5 px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-reddishBrown focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-reddishBrown"
                      placeholder="Share your goals and challenges..."
                    ></textarea>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-reddishBrown to-mediumBrown hover:opacity-90 text-[#fffff0] border-0"
                  >
                    Submit Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-center text-sm text-[var(--muted)]">
                    By submitting this form, you agree to our{" "}
                    <Link href="#" className="text-[var(--foreground)] underline hover:text-[var(--foreground)]">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-[var(--foreground)] underline hover:text-[var(--foreground)]">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Seen On Section */}
        <section className="relative py-12 sm:py-16 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl sm:text-3xl font-serif font-bold bg-gradient-to-r from-[var(--foreground)] to-beige bg-clip-text text-transparent mb-8 sm:mb-12">
              Seen On
            </h2>
            <div className="relative overflow-hidden before:absolute before:left-0 before:top-0 before:z-[2] before:h-full before:w-[100px] before:bg-[linear-gradient(to_right,var(--background)_0%,transparent_100%)] before:content-[''] after:absolute after:right-0 after:top-0 after:z-[2] after:h-full after:w-[100px] after:-scale-x-100 after:bg-[linear-gradient(to_right,var(--background)_0%,transparent_100%)] after:content-['']">
              <div className="animate-infinite-slider flex w-[calc(250px*16)]">
                {[
                  { name: "Ohio State", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f71384bf591b91d78.svg" },
                  { name: "Berklee College of Music", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f266b6f6e45973619.svg" },
                  { name: "ESPN", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f80d564d83df6caf3.png" },
                  { name: "Nationwide Insurance", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f8a36784d1fd20173.svg" },
                  { name: "VH1", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37fc7a015469adc410a.jpeg" },
                  { name: "ABC", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f266b6f6e45973619.svg" },
                  { name: "Whole Foods", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f266b6fec89973618.png" },
                  { name: "SVB Tennis Foundation", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f80d564e292f6caf4.webp" },
                ].map((brand, index) => (
                  <div
                    key={`first-${index}`}
                    className="slide flex w-[250px] items-center justify-center px-8"
                  >
                    <div className="relative h-16 w-full opacity-60 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {[
                  { name: "Ohio State", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f71384bf591b91d78.svg" },
                  { name: "Berklee College of Music", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f266b6f6e45973619.svg" },
                  { name: "ESPN", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f80d564d83df6caf3.png" },
                  { name: "Nationwide Insurance", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f8a36784d1fd20173.svg" },
                  { name: "VH1", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37fc7a015469adc410a.jpeg" },
                  { name: "ABC", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67ff02308a36784970d21593.png" },
                  { name: "Whole Foods", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f266b6fec89973618.png" },
                  { name: "SVB Tennis Foundation", logo: "https://storage.googleapis.com/msgsndr/5aAlQ1qN7UqHLdGzV8gr/media/67fef37f80d564e292f6caf4.webp" },
                ].map((brand, index) => (
                  <div
                    key={`second-${index}`}
                    className="slide flex w-[250px] items-center justify-center px-8"
                  >
                    <div className="relative h-16 w-full opacity-60 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Add keyframes for the infinite slider */}
        <style jsx global>{`
          @keyframes infiniteSlider {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-250px * 8));
            }
          }
          .animate-infinite-slider {
            animation: infiniteSlider 25s linear infinite;
          }
          
          .benefits-slider {
            animation: infiniteSlider 20s linear infinite;
            width: calc(320px * 10);
            display: flex;
            gap: 1.5rem;
          }
          @media (max-width: 640px) {
            .benefits-slider {
              animation: infiniteSlider 15s linear infinite;
              width: calc(280px * 10);
            }
            @keyframes infiniteSlider {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(calc(-280px * 5));
              }
            }
          }
        `}</style>

        {/* Add the stacking cards effect styles and script */}
        <style jsx global>{`
          // ... existing styles ...

          /* Stacking Cards Effect */
          #stacking-cards {
            --cards: 5;
            --cardHeight: 87vh;
            --cardTopPadding: 1.5em;
            --cardMargin: 4vw;
          }

          @media (max-width: 768px) {
            #stacking-cards {
              --cardHeight: 80vh;
            }
          }
        `}</style>

        {/* Add the script for handling scroll animations */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const cards = document.querySelectorAll('.card');
              const numCards = cards.length;
              
              function handleScroll() {
                const scrollPosition = window.scrollY;
                const windowHeight = window.innerHeight;
                const documentHeight = document.body.scrollHeight;
                const scrollProgress = scrollPosition / (documentHeight - windowHeight);
                
                cards.forEach((card, index) => {
                  const cardBody = card.querySelector('.card-body');
                  const cardIndex = parseInt(card.id.replace('card', ''));
                  
                  // Adjust scale based on scroll position
                  const scaleValue = 1 - (0.05 * (numCards - cardIndex) * scrollProgress);
                  cardBody.style.transform = \`scale(\${Math.max(0.8, scaleValue)})\`;
                  
                  // Update z-index based on scroll progress
                  if (scrollProgress > 0.1) {
                    // As we scroll down, later cards should come to the front
                    card.style.zIndex = numCards + index;
                  } else {
                    // Near the top, keep original stacking (first card visible)
                    card.style.zIndex = index;
                  }
                });
              }
              
              // Set initial z-indices
              cards.forEach((card, index) => {
                card.style.zIndex = index;
              });
              
              handleScroll();
              window.addEventListener('scroll', handleScroll);
              window.addEventListener('resize', handleScroll);
            });
          `
        }} />
        </div> {/* Close the content container div */}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--background)] py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-serif font-bold tracking-tight bg-gradient-to-r from-[var(--foreground)] via-beige to-[var(--foreground)] bg-clip-text text-transparent">
                Authentik
              </span>
            </Link>
            <p className="max-w-md text-sm text-[var(--muted)]">
              Empowering coaches and leaders to balance practice with family demands through deeper emotional and mental
              frameworks.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-[var(--muted)] hover:text-[var(--foreground)]">
                Privacy Policy
              </Link>
              <Link href="#" className="text-[var(--muted)] hover:text-[var(--foreground)]">
                Terms of Service
              </Link>
              <Link href="#" className="text-[var(--muted)] hover:text-[var(--foreground)]">
                Contact
              </Link>
            </div>
            <p className="text-sm text-[var(--muted)]">
              &copy; {new Date().getFullYear()} Authentik Foundations. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
