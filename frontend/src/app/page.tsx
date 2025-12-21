"use client";

import React, { useEffect } from "react";

type Slide = {
  title: string;
  summary: string;
  image: string;
  tag?: string;
};

const fallbackVideoId =
  process.env.NEXT_PUBLIC_FALLBACK_VIDEO_ID ?? "dQw4w9WgXcQ";

const HomePage: React.FC = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // --------------------------------------------------
    // LIVE PLAYER: try latest YouTube video, else fallback
    // --------------------------------------------------
    const iframe = document.getElementById(
      "tv-main-player"
    ) as HTMLIFrameElement | null;
    const placeholder = document.getElementById("tv-main-placeholder");

    const setVideoSrc = (videoId: string | null | undefined) => {
      if (!iframe || !videoId) return;
      iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
      if (placeholder) placeholder.classList.add("hidden");
    };

    (async () => {
      try {
        const res = await fetch("/output/youtube_info.json");
        if (!res.ok) throw new Error("not found");
        const info = await res.json();
        // support { video_id } or { id }
        const vid = info.video_id || info.id || null;
        if (vid) setVideoSrc(vid);
        else setVideoSrc(fallbackVideoId);
      } catch {
        setVideoSrc(fallbackVideoId);
      }
    })();

    // --------------------------------------------------
    // AI SLIDES: rotating synthetic host cards
    // --------------------------------------------------
    const titleEl = document.getElementById("ai-slide-title");
    const summaryEl = document.getElementById("ai-slide-summary");
    const imageEl = document.getElementById(
      "ai-slide-image"
    ) as HTMLImageElement | null;
    const tagEl = document.getElementById("ai-slide-tag");

    let slideInterval: number | undefined;

    if (titleEl && summaryEl && imageEl && tagEl) {
      const fallbackSlides: Slide[] = [
        {
          title: "AI Transforms Global Newsrooms",
          summary:
            "Autonomous agents curate, verify, and narrate stories in real-time.",
          image: "https://source.unsplash.com/featured/400x240/?newsroom,ai",
          tag: "TOP STORY • AI MEDIA",
        },
        {
          title: "Neural Networks Monitor Space Missions",
          summary:
            "Deep learning systems track every metric of interplanetary launches.",
          image: "https://source.unsplash.com/featured/400x240/?space,rocket,ai",
          tag: "LIVE • SPACE & AI",
        },
        {
          title: "Quantum-Safe Security Arrives",
          summary:
            "Post-quantum cryptography moves from labs to enterprise networks.",
          image:
            "https://source.unsplash.com/featured/400x240/?cybersecurity,quantum",
          tag: "ALERT • CYBERSECURITY",
        },
      ];

      const applySlide = (slide: Slide) => {
        titleEl.textContent = slide.title;
        summaryEl.textContent = slide.summary;
        imageEl.src = slide.image;
        tagEl.textContent = slide.tag || "AI • TECH BRIEFING";
      };

      const startRotation = (slides: Slide[]) => {
        let idx = 0;
        applySlide(slides[idx]);
        slideInterval = window.setInterval(() => {
          idx = (idx + 1) % slides.length;
          applySlide(slides[idx]);
        }, 8000);
      };

      (async () => {
        try {
          const res = await fetch("/slides.json");
          if (!res.ok) throw new Error("not found");
          const data = await res.json();
          const slides: Slide[] = Array.isArray(data) ? data : data.slides;
          if (slides && slides.length) startRotation(slides);
          else startRotation(fallbackSlides);
        } catch {
          startRotation(fallbackSlides);
        }
      })();
    }

    // --------------------------------------------------
    // WATCH LIVE button scroll
    // --------------------------------------------------
    const liveButton = Array.from(
      document.querySelectorAll("button")
    ).find((btn) => btn.textContent?.includes("WATCH LIVE"));

    const onLiveClick = () => {
      const liveSection = document.querySelector(
        "section.bg-gradient-to-r.from-dark.to-secondary"
      );
      if (liveSection) {
        liveSection.scrollIntoView({ behavior: "smooth" });
      }
    };

    liveButton?.addEventListener("click", onLiveClick);

    // --------------------------------------------------
    // Fake viewer counter updates (demo)
    // --------------------------------------------------
    const viewerInterval = window.setInterval(() => {
      document
        .querySelectorAll<HTMLElement>(".viewer-counter")
        .forEach((el) => {
          const current = parseInt(el.innerText.replace(/[^0-9]/g, ""), 10);
          if (!isNaN(current)) {
            const next = current + Math.floor(Math.random() * 10);
            el.innerHTML =
              '<i class="fas fa-eye mr-1"></i>' +
              next.toLocaleString("en-US");
          }
        });
    }, 5000);

    // Cleanup on unmount
    return () => {
      liveButton?.removeEventListener("click", onLiveClick);
      if (viewerInterval) window.clearInterval(viewerInterval);
      if (slideInterval) window.clearInterval(slideInterval);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-secondary text-gray-900 font-inter">
      {/* Breaking News Ticker */}
      <div className="bg-red-600 text-white py-2 overflow-hidden news-ticker">
        <div className="flex animate-marquee whitespace-nowrap text-xs sm:text-sm">
          <span className="mx-4 font-bold">
            BREAKING: Global Tech Summit Announces Revolutionary AI
            Breakthrough
          </span>
          <span className="mx-4 font-bold">
            LIVE: Space Mission Launch Coverage
          </span>
          <span className="mx-4 font-bold">
            URGENT: Cybersecurity Alert - Major Infrastructure Protection
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-pink rounded-full animate-pulse-glow" />
              <div>
                <h1 className="font-orbitron text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent">
                  TV.RUSLANMV
                </h1>
                <p className="text-xs text-gray-500">ENTERPRISE NEWS NETWORK</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
              <a
                href="#home"
                className="text-gray-800 hover:text-primary transition-colors duration-300"
              >
                HOME
              </a>
              <a
                href="#live"
                className="text-gray-800 hover:text-primary transition-colors duration-300"
              >
                LIVE
              </a>
              <a
                href="#news"
                className="text-gray-800 hover:text-primary transition-colors duration-300"
              >
                NEWS
              </a>
              <a
                href="#tech"
                className="text-gray-800 hover:text-primary transition-colors duration-300"
              >
                TECH
              </a>
              <a
                href="#business"
                className="text-gray-800 hover:text-primary transition-colors duration-300"
              >
                BUSINESS
              </a>
              <a
                href="#about"
                className="text-gray-800 hover:text-primary transition-colors duration-300"
              >
                ABOUT
              </a>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-accent transition-all duration-300 animate-glow">
                WATCH LIVE
              </button>
              <button className="lg:hidden text-gray-800">
                <i className="fas fa-bars text-xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="gradient-bg" id="home">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-2 bg-primary text-white rounded-full text-sm font-bold">
                    LIVE BROADCAST
                  </span>
                  <h2 className="font-orbitron text-4xl lg:text-6xl font-bold leading-tight text-gray-900">
                    THE FUTURE OF{" "}
                    <span className="bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent">
                      NEWS
                    </span>{" "}
                    IS HERE
                  </h2>
                  <p className="text-xl text-gray-700 max-w-2xl">
                    Experience cutting-edge news coverage with AI-powered
                    analytics, real-time data visualization, and
                    enterprise-grade broadcasting technology.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="#live"
                    className="bg-primary text-white px-8 py-4 rounded-lg font-bold hover:bg-accent transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                  >
                    <i className="fas fa-play mr-2" />
                    WATCH LIVE STREAM
                  </a>
                  <a
                    href="#about"
                    className="border border-primary text-primary px-8 py-4 rounded-lg font-bold hover:bg-primary hover:text-white transition-all duration-300 inline-flex items-center justify-center"
                  >
                    <i className="fas fa-info-circle mr-2" />
                    CHANNEL INFO
                  </a>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="relative">
                <div className="glass-effect rounded-2xl p-8 animate-[float_6s_ease-in-out_infinite]">
                  <div className="aspect-video bg-gradient-to-br from-dark to-secondary rounded-lg flex items-center justify-center relative">
                    <div className="text-center" id="hero-live-placeholder">
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <i className="fas fa-play text-white text-2xl" />
                      </div>
                      <p className="text-primary font-bold">
                        LIVE STREAM ACTIVE
                      </p>
                      <p className="text-gray-500 text-sm">
                        24/7 Global Coverage
                      </p>
                    </div>
                  </div>
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full animate-ping" />
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="py-16" id="news">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-orbitron text-3xl font-bold text-gray-900">
                LATEST NEWS
              </h3>
              <div className="flex items-center space-x-2 text-primary">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
                <span className="font-bold text-gray-800">LIVE UPDATES</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* News Card 1 */}
              <div className="glass-effect rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <img
                    src="https://picsum.photos/400/250?random=1"
                    alt="AI Technology Breakthrough"
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                    TECH
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-xl mb-2 text-gray-900">
                    Revolutionary AI System Transforms News Industry
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Groundbreaking artificial intelligence now powers
                    real-time news analysis and predictive reporting.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary font-semibold">
                      2 HOURS AGO
                    </span>
                    <span className="flex items-center text-gray-500 viewer-counter">
                      <i className="fas fa-eye mr-1" />
                      15,200
                    </span>
                  </div>
                </div>
              </div>

              {/* News Card 2 */}
              <div className="glass-effect rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <img
                    src="https://picsum.photos/400/250?random=2"
                    alt="Space Mission Launch"
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                    SPACE
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-xl mb-2 text-gray-900">
                    Mars Colonization Mission Enters Final Phase
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Historic space mission prepares for launch with advanced
                    life support systems and sustainable habitat technology.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary font-semibold">
                      4 HOURS AGO
                    </span>
                    <span className="flex items-center text-gray-500 viewer-counter">
                      <i className="fas fa-eye mr-1" />
                      23,700
                    </span>
                  </div>
                </div>
              </div>

              {/* News Card 3 */}
              <div className="glass-effect rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <img
                    src="https://picsum.photos/400/250?random=3"
                    alt="Cybersecurity Conference"
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                    SECURITY
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-xl mb-2 text-gray-900">
                    Global Cybersecurity Summit Addresses Quantum Threats
                  </h4>
                  <p className="text-gray-600 mb-4">
                    World leaders and tech experts collaborate on
                    next-generation security protocols for the quantum
                    computing era.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary font-semibold">
                      6 HOURS AGO
                    </span>
                    <span className="flex items-center text-gray-500 viewer-counter">
                      <i className="fas fa-eye mr-1" />
                      18,900
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stream Section */}
        <section
          className="py-16 bg-gradient-to-r from-dark to-secondary"
          id="live"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="font-orbitron text-3xl font-bold text-white mb-4">
                24/7 LIVE BROADCAST
              </h3>
              <p className="text-gray-200 max-w-2xl mx-auto">
                Experience our state-of-the-art broadcasting studio with
                augmented reality overlays, real-time data feeds, and
                interactive viewer engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Stream */}
              <div className="lg:col-span-2 glass-effect rounded-2xl p-6 bg-white/5">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative mb-4 overflow-hidden">
                  <div
                    id="tv-main-player-wrapper"
                    className="w-full h-full relative"
                  >
                    <iframe
                      id="tv-main-player"
                      className="w-full h-full"
                      src=""
                      title="TV.RuslanMV Live Broadcast"
                      frameBorder={0}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <div
                      id="tv-main-placeholder"
                      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800"
                    >
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <i className="fas fa-play text-white text-xl" />
                      </div>
                      <p className="text-primary font-bold">
                        LIVE STREAM INITIALIZING
                      </p>
                      <p className="text-gray-400 text-sm">
                        Connecting to latest AI-generated episode...
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    LIVE
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="font-bold text-xl mb-1 text-gray-100">
                    PRIMARY BROADCAST
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Global News Coverage with Advanced Analytics
                  </p>
                </div>

                {/* Side Streams */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="glass-effect rounded-xl p-4 bg-white/5">
                    <div className="aspect-video bg-gray-800 rounded-lg mb-2" />
                    <p className="font-bold text-gray-100">TECH NEWS FEED</p>
                    <p className="text-gray-400 text-sm">
                      Real-time technology updates
                    </p>
                  </div>
                  <div className="glass-effect rounded-xl p-4 bg-white/5">
                    <div className="aspect-video bg-gray-800 rounded-lg mb-2" />
                    <p className="font-bold text-gray-100">MARKET UPDATES</p>
                    <p className="text-gray-400 text-sm">
                      Financial markets and business news
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar Stats / Info */}
              <div className="space-y-4">
                {/* AI Anchor Slides */}
                <div
                  className="glass-effect rounded-xl p-6 relative overflow-hidden bg-white"
                  id="ai-slides-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">
                        AI ANCHOR
                      </p>
                      <h4 className="font-orbitron text-lg font-bold text-gray-900">
                        AURORA · Synthetic Host
                      </h4>
                    </div>
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-neon-blue to-neon-pink flex items-center justify-center">
                      <div className="flex items-end space-x-1 h-5">
                        <span className="w-1 ai-eq-bar" />
                        <span className="w-1 ai-eq-bar" />
                        <span className="w-1 ai-eq-bar" />
                        <span className="w-1 ai-eq-bar" />
                      </div>
                    </div>
                  </div>

                  <div id="ai-slide-content" className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                      LIVE SEGMENT
                    </p>
                    <p
                      className="text-base font-bold text-gray-900"
                      id="ai-slide-title"
                    >
                      Initializing AI briefing...
                    </p>
                    <p
                      className="text-sm text-gray-600"
                      id="ai-slide-summary"
                    >
                      Connecting to real-time technology headlines.
                    </p>
                  </div>

                  <div
                    className="mt-4 relative overflow-hidden rounded-lg h-32 bg-gray-100"
                    id="ai-slide-image-wrapper"
                  >
                    <img
                      id="ai-slide-image"
                      src="https://source.unsplash.com/featured/400x240/?ai,technology"
                      alt="AI slide"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p
                      className="absolute bottom-2 left-3 text-[10px] font-mono text-gray-200 uppercase tracking-[0.2em]"
                      id="ai-slide-tag"
                    >
                      AI • GLOBAL BRIEFING
                    </p>
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-6 bg-white">
                  <p className="text-sm font-semibold text-primary mb-1">
                    PRIMARY CHANNEL
                  </p>
                  <p className="text-3xl font-orbitron font-bold text-gray-900">
                    15.2K
                  </p>
                  <p className="text-gray-600 text-sm">Current viewers</p>
                </div>
                <div className="glass-effect rounded-xl p-6 bg-white">
                  <p className="text-sm font-semibold text-primary mb-1">
                    TECH FEED
                  </p>
                  <p className="text-3xl font-orbitron font-bold text-gray-900">
                    8.7K
                  </p>
                  <p className="text-gray-600 text-sm">Current viewers</p>
                </div>
                <div className="glass-effect rounded-xl p-6 bg-white">
                  <p className="text-sm font-semibold text-primary mb-1">
                    BUSINESS FEED
                  </p>
                  <p className="text-3xl font-orbitron font-bold text-gray-900">
                    12.4K
                  </p>
                  <p className="text-gray-600 text-sm">Current viewers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16" id="business">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="glass-effect rounded-xl p-6">
                <div className="text-3xl font-orbitron font-bold text-primary mb-2">
                  24/7
                </div>
                <p className="text-gray-600">Live Coverage</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="text-3xl font-orbitron font-bold text-accent mb-2">
                  150+
                </div>
                <p className="text-gray-600">Countries Reached</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="text-3xl font-orbitron font-bold text-primary mb-2">
                  5M+
                </div>
                <p className="text-gray-600">Daily Viewers</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="text-3xl font-orbitron font-bold text-accent mb-2">
                  99.9%
                </div>
                <p className="text-gray-600">Uptime</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200" id="about">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-neon-blue to-neon-pink rounded-full" />
                <h4 className="font-orbitron text-xl font-bold text-gray-900">
                  TV.RUSLANMV
                </h4>
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                Enterprise-grade news broadcasting with cutting-edge
                technology. Delivering reliable, real-time news coverage to a
                global audience.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 glass-effect rounded-full flex items-center justify-center hover:text-primary transition-colors duration-300"
                >
                  <i className="fab fa-facebook-f" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 glass-effect rounded-full flex items-center justify-center hover:text-primary transition-colors duration-300"
                >
                  <i className="fab fa-twitter" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 glass-effect rounded-full flex items-center justify-center hover:text-primary transition-colors duration-300"
                >
                  <i className="fab fa-youtube" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 glass-effect rounded-full flex items-center justify-center hover:text-primary transition-colors duration-300"
                >
                  <i className="fab fa-linkedin-in" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-bold mb-4 text-gray-900">QUICK LINKS</h5>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <a
                    href="#home"
                    className="hover:text-primary transition-colors duration-300"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#live"
                    className="hover:text-primary transition-colors duration-300"
                  >
                    Live Stream
                  </a>
                </li>
                <li>
                  <a
                    href="#news"
                    className="hover:text-primary transition-colors duration-300"
                  >
                    News
                  </a>
                </li>
                <li>
                  <a
                    href="#tech"
                    className="hover:text-primary transition-colors duration-300"
                  >
                    Technology
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="font-bold mb-4 text-gray-900">CONTACT</h5>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-2 text-primary" />
                  contact@tv.ruslanmv.com
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone mr-2 text-primary" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2 text-primary" />
                  Global Broadcasting Center
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>
              &copy; 2024 TV.RuslanMV. All rights reserved. | Enterprise News
              Network
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
