"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import {
  Receipt,
  Calculator,
  TrendingUp,
  CalendarClock,
  ChevronRight,
  Shield,
  Zap,
  Crown,
  Check,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-hero-orange border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════
   LANDING PAGE — FinancialHero (Cinematográfica)
   ═══════════════════════════════════════════════ */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Check if video is already loaded on mount (e.g. cached)
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) setVideoLoaded(true);
  }, []);
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const philosophyRef = useRef<HTMLElement>(null);
  const protocolRef = useRef<HTMLElement>(null);

  /* ── Navbar scroll detection ── */
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Force Dark Mode on Landing Page ── */
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  /* ── GSAP Hero animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-anim]", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.2,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* ── Scroll-controlled video (desktop) / Ping-pong loop (mobile) ── */
  useEffect(() => {
    const video = videoRef.current;
    const wrapper = heroVideoWrapperRef.current;
    if (!video || !wrapper) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (isMobile) {
      // Mobile: forward via native play (hardware-accelerated),
      // reverse via throttled RAF at 20fps (far less seek pressure).
      const SPEED = 1.5;
      const FRAME_MS = 1000 / 30; // 30fps for reverse seeks
      let rafId: number;
      let lastSeek: number | null = null;

      const goForward = () => {
        video.playbackRate = SPEED;
        video.play().catch(() => { });
      };

      const goReverse = () => {
        video.pause();
        lastSeek = null;

        const tick = (ts: number) => {
          if (lastSeek === null) lastSeek = ts;
          const elapsed = ts - lastSeek;

          if (elapsed >= FRAME_MS) {
            lastSeek = ts - (elapsed % FRAME_MS);
            const next = video.currentTime - SPEED * (FRAME_MS / 1000);
            if (next <= 0) {
              video.currentTime = 0;
              cancelAnimationFrame(rafId);
              goForward();
              return;
            }
            video.currentTime = next;
          }

          rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
      };

      const handleEnded = () => { cancelAnimationFrame(rafId); goReverse(); };

      const startPingPong = () => {
        video.currentTime = 0;
        video.addEventListener("ended", handleEnded);
        goForward();
      };

      if (video.readyState >= 1) {
        startPingPong();
      } else {
        video.addEventListener("loadedmetadata", startPingPong, { once: true });
      }

      return () => {
        cancelAnimationFrame(rafId);
        video.pause();
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("loadedmetadata", startPingPong);
      };
    }

    // Desktop: scroll-controlled
    const onLoadedMetadata = () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          pin: heroRef.current,
          scrub: 0.5,
          onUpdate: (self) => {
            if (video.duration) {
              video.currentTime = self.progress * video.duration;
            }
          },
        });
      });

      return () => ctx.revert();
    };

    if (video.readyState >= 1) {
      const cleanup = onLoadedMetadata();
      return () => cleanup?.();
    } else {
      video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
      };
    }
  }, []);

  /* ── GSAP Features animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-feature-card]", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
      });
    }, featuresRef);
    return () => ctx.revert();
  }, []);

  /* ── GSAP Philosophy animation (word-by-word) ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-philosophy-word]", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.04,
        scrollTrigger: {
          trigger: philosophyRef.current,
          start: "top 75%",
        },
      });
    }, philosophyRef);
    return () => ctx.revert();
  }, []);

  /* ── GSAP Protocol sticky stacking ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-protocol-card]");
      cards.forEach((card, i) => {
        if (i < cards.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            start: "top 10%",
            end: "bottom 10%",
            pin: true,
            pinSpacing: false,
            onEnter: () => {
              gsap.to(card, {
                scale: 0.92,
                filter: "blur(8px)",
                opacity: 0.5,
                duration: 0.4,
                ease: "power2.inOut",
              });
            },
            onLeaveBack: () => {
              gsap.to(card, {
                scale: 1,
                filter: "blur(0px)",
                opacity: 1,
                duration: 0.4,
                ease: "power2.inOut",
              });
            },
          });
        }
      });
    }, protocolRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-page relative dark">
      {/* ── Noise Overlay ── */}
      <svg className="noise-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* ═══════════════════════════════════
          A. NAVBAR — "A Ilha Flutuante"
          ═══════════════════════════════════ */}
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-6 py-3 rounded-[30px] ${menuOpen ? "transition-none" : "transition-all duration-500"
          } ${navScrolled || menuOpen
            ? "shadow-lg border"
            : "border border-transparent"
          }`}
        style={{
          backgroundColor: navScrolled || menuOpen
            ? "color-mix(in srgb, var(--bg-surface) 95%, transparent)"
            : "transparent",
          backdropFilter: navScrolled || menuOpen ? "blur(20px)" : "none",
          WebkitBackdropFilter: navScrolled || menuOpen ? "blur(20px)" : "none",
          borderColor: navScrolled || menuOpen ? "var(--border)" : "transparent",
          maxWidth: "min(90vw, 800px)",
          width: "100%",
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xl font-bold transition-all duration-300 hover:opacity-80 cursor-pointer text-left"
            style={{
              fontFamily: "'Sora', sans-serif",
              color: navScrolled ? "var(--text-primary)" : "#fff",
            }}
          >
            Financial<span className="gradient-text">Hero</span>
          </button>

          {/* Desktop nav links */}
          <div
            className="hidden md:flex items-center gap-6 text-sm font-medium transition-colors duration-300"
            style={{
              color: navScrolled ? "var(--text-muted)" : "rgba(255,255,255,0.8)",
            }}
          >
            <a href="#features" className="hover:text-hero-orange transition-colors">
              Recursos
            </a>
            <a href="#protocol" className="hover:text-hero-orange transition-colors">
              Como funciona
            </a>
            <a href="#pricing" className="hover:text-hero-orange transition-colors">
              Preços
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium transition-colors hover:text-hero-orange"
              style={{
                color: navScrolled ? "var(--text-muted)" : "rgba(255,255,255,0.8)",
              }}
            >
              Entrar
            </a>
            <a href="/register" className="btn-hero text-sm py-2 px-5">
              Criar conta
            </a>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl transition-all"
              style={{
                color: navScrolled ? "var(--text-muted)" : "rgba(255,255,255,0.8)",
              }}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-3 pt-4 pb-2 space-y-1" style={{ borderTop: "1px solid var(--border)" }}>
            <a
              href="#features"
              className="block py-3 px-2 text-base text-gray-300 hover:text-hero-orange transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Recursos
            </a>
            <a
              href="#protocol"
              className="block py-3 px-2 text-base text-gray-300 hover:text-hero-orange transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Como funciona
            </a>
            <a
              href="#pricing"
              className="block py-3 px-2 text-base text-gray-300 hover:text-hero-orange transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Preços
            </a>
            <a
              href="/login"
              className="block py-3 px-2 text-base text-gray-300 hover:text-hero-orange transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Entrar
            </a>
            <a
              href="/register"
              className="block w-full py-3 mt-4 text-center btn-hero text-base"
              onClick={() => setMenuOpen(false)}
            >
              Criar conta
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO — Scroll-controlled (mobile + desktop) ── */}
      <div ref={heroVideoWrapperRef} className="h-screen md:h-[300vh]" style={{ position: "relative", backgroundColor: "rgb(2, 2, 2)" }}>
        <section
          ref={heroRef}
          className="relative w-full overflow-hidden"
          style={{ height: "100vh", backgroundColor: "rgb(0, 0, 0)" }}
        >
          {/* Vídeo Container Responsivo */}
          <div className="absolute z-0 pointer-events-none flex items-center justify-center inset-x-0 top-[40%] h-[45%] md:inset-y-0 md:left-1/2 md:w-1/2 md:h-full">
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-hero-orange border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setVideoLoaded(true)}
              className="w-full h-full object-contain max-w-[500px] md:max-w-none transition-opacity duration-500"
              style={{ pointerEvents: "none", opacity: videoLoaded ? 1 : 0 }}
            >
              <source src="/cofre_allkeyframes.mp4" type="video/mp4" />
            </video>
          </div>

          {/* ── MOBILE: texto no topo ── */}
          <div className="md:hidden absolute inset-x-0 top-0 h-[40%] z-10 flex flex-col justify-center px-6 pt-44 sm:pt-24">
            <div
              data-hero-anim
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 w-fit"
              style={{
                background: "rgba(255, 122, 0, 0.15)",
                color: "#ff7a00",
                border: "1px solid rgba(255, 122, 0, 0.25)",
              }}
            >
              <Zap className="w-4 h-4" />
              Seu superpoder financeiro
            </div>

            <h1 data-hero-anim className="mb-3">
              <span
                className="block text-3xl sm:text-4xl font-bold text-white leading-tight"
                style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
              >
                Finanças são o seu
              </span>
              <span
                className="block mt-1 gradient-text"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontSize: "clamp(2.8rem, 13vw, 5rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                Superpoder.
              </span>
            </h1>

            <p
              data-hero-anim
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Organize comprovantes, acompanhe gastos recorrentes e descubra
              quanto do seu tempo de trabalho está sendo investido em cada compra.
            </p>
          </div>

          {/* ── MOBILE: botões sobre o cofre (rodapé) ── */}
          <div className="md:hidden absolute inset-x-0 bottom-8 z-10 px-6 flex flex-col gap-3">
            <a href="/register" className="btn-hero text-base px-8 py-4 justify-center">
              Começar agora
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              Já tenho conta
            </a>
          </div>



          {/* ── DESKTOP & TABLET: conteúdo na metade esquerda, centralizado ── */}
          <div className="hidden md:flex relative z-10 w-1/2 h-full justify-center px-6 lg:px-10">
            <div className="relative w-fit h-full flex flex-col justify-center">
              <div className="max-w-[600px]">
                <div
                  data-hero-anim
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
                  style={{
                    background: "rgba(255, 122, 0, 0.15)",
                    color: "#ff7a00",
                    border: "1px solid rgba(255, 122, 0, 0.25)",
                  }}
                >
                  <Zap className="w-4 h-4" />
                  Seu superpoder financeiro
                </div>

                <h1 data-hero-anim className="mb-6">
                  <span
                    className="block text-3xl md:text-4xl xl:text-5xl font-bold text-white leading-tight"
                    style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
                  >
                    Finanças são o seu
                  </span>
                  <span
                    className="block mt-2 gradient-text"
                    style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontStyle: "italic",
                      fontSize: "clamp(3rem, 7vw, 9rem)",
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Superpoder.
                  </span>
                </h1>

                <p
                  data-hero-anim
                  className="text-lg xl:text-xl max-w-xl leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Organize comprovantes, acompanhe gastos recorrentes e descubra
                  quanto do seu tempo de trabalho está sendo investido em cada
                  compra. Tudo em um só lugar.
                </p>
              </div>

              {/* Botões — ancorados na mesma altura dos cards de stats */}
              <div className="absolute bottom-16 lg:bottom-24 left-0 w-max pointer-events-auto">
                <div data-hero-anim className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-start lg:items-center">
                  <a href="/register" className="btn-hero text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4">
                    Começar agora
                    <ChevronRight className="w-5 h-5 ml-2 lg:ml-2" />
                  </a>
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    Já tenho conta
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de stats — desktop & tablet, sob o cofre */}
          <div
            data-hero-anim
            className="hidden md:flex absolute bottom-16 lg:bottom-24 right-0 w-1/2 justify-center z-10 gap-2 lg:gap-4 flex-wrap px-4 lg:px-[40px]"
          >
            {[
              { label: "Gastos rastreados", value: "R$ 2.4M+", icon: TrendingUp },
              { label: "Comprovantes", value: "18K+", icon: Receipt },
              { label: "Horas economizadas", value: "520+", icon: Calculator },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-2 lg:gap-3 px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <stat.icon className="w-5 h-5 text-hero-orange" />
                <div>
                  <p className="text-white font-bold text-sm">{stat.value}</p>
                  <p className="text-white/50 text-xs">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>


      {/* ═══════════════════════════════════
          C. FEATURES — "Artefatos Interativos"
          ═══════════════════════════════════ */}
      <section
        id="features"
        ref={featuresRef}
        className="py-20 sm:py-32 px-4 sm:px-8 lg:px-16"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <div className="w-full">
          <div className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto">
            <p
              className="text-hero-orange font-semibold text-sm uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              Recursos
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-6"
              style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
            >
              Seus <span className="gradient-text">superpoderes</span> financeiros
            </h2>
            <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
              Ferramentas interativas que transformam o caos financeiro em clareza absoluta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 — Diagnostic Shuffler */}
            <div data-feature-card>
              <DiagnosticShuffler />
            </div>
            {/* Card 2 — Telemetry Typewriter */}
            <div data-feature-card>
              <TelemetryTypewriter />
            </div>
            {/* Card 3 — Cursor Protocol Scheduler */}
            <div data-feature-card className="md:col-span-2 xl:col-span-1">
              <CursorScheduler />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          D. PHILOSOPHY — "O Manifesto"
          ═══════════════════════════════════ */}
      <section
        ref={philosophyRef}
        className="relative w-full min-h-screen flex flex-col items-center justify-center py-20 px-4 sm:px-6 overflow-hidden"
        style={{ backgroundColor: "#0A0A14" }}
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')",
          }}
        />

        {/* 3D Spline Background (Expandido para cortar a logo) */}
        <div className="absolute w-full h-[120%] z-0 cursor-grab active:cursor-grabbing">
          <Spline
            scene="https://prod.spline.design/2W3NBhzT9BXfRndL/scene.splinecode"
          />
        </div>

        {/* Smooth Glass Mask behind text */}
        <div
          className="absolute inset-x-0 inset-y-0 z-0 pointer-events-none"
          style={{
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            maskImage: "radial-gradient(circle at center, black 15%, transparent 40%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 15%, transparent 40%)",
          }}
        />

        {/* Floating Text Container */}
        <div
          className="relative z-10 max-w-5xl mx-auto text-center shrink-0 pointer-events-none"
          style={{ textShadow: "0px 4px 30px rgba(0,0,0,1)" }}
        >
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium mb-6 sm:mb-8 leading-relaxed">
            {"A maioria dos apps de finanças foca em:".split(" ").map((word, i) => (
              <span key={i} data-philosophy-word className="inline-block mr-2">
                {word}
              </span>
            ))}
            <br />
            {"planilhas complicadas e gráficos confusos.".split(" ").map((word, i) => (
              <span key={`b-${i}`} data-philosophy-word className="inline-block mr-2" style={{ color: "rgba(255,255,255,0.7)" }}>
                {word}
              </span>
            ))}
          </p>
          <p className="leading-tight">
            {"Nós focamos em:".split(" ").map((word, i) => (
              <span
                key={`c-${i}`}
                data-philosophy-word
                className="inline-block mr-3 text-2xl sm:text-3xl md:text-4xl text-white font-bold"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {word}
              </span>
            ))}
            <br />
            <span
              data-philosophy-word
              className="inline-block mt-2 sm:mt-4"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontSize: "clamp(3rem, 8vw, 7rem)",
                lineHeight: 1.1,
                background: "linear-gradient(135deg, #ff7a00, #ff9a40)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Clareza.
            </span>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════
          E. PROTOCOL — "Sticky Stacking"
          ═══════════════════════════════════ */}
      <section id="protocol" ref={protocolRef} className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-hero-orange font-semibold text-sm uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              Protocolo
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-6"
              style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
            >
              Como <span className="gradient-text">funciona</span>
            </h2>
          </div>

          {/* Protocol stacking cards */}
          <div className="space-y-8">
            <ProtocolCard
              step="01"
              title="Cadastre"
              description="Registre seus comprovantes, gastos recorrentes e configure seu salário. O setup leva menos de 2 minutos."
              visual="gear"
            />
            <ProtocolCard
              step="02"
              title="Monitore"
              description="Acompanhe em tempo real para onde seu dinheiro está indo. Receba alertas de vencimento e tendências de gastos."
              visual="scan"
            />
            <ProtocolCard
              step="03"
              title="Domine"
              description="Entenda exatamente quantas horas de trabalho cada compra custa. Tome decisões financeiras com consciência total."
              visual="wave"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          F. PRICING — Planos
          ═══════════════════════════════════ */}
      <section
        id="pricing"
        className="py-20 sm:py-32 px-4 sm:px-6"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-hero-orange font-semibold text-sm uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              Preços
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-6"
              style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
            >
              Escolha seu <span className="gradient-text">plano</span>
            </h2>
            <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
              Comece grátis. Evolua quando precisar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name="Essencial"
              price="Grátis"
              description="Para quem está começando a organizar suas finanças"
              features={[
                "Até 50 comprovantes/mês",
                "3 gastos recorrentes",
                "Calculadora de horas",
                "Dashboard básico",
              ]}
              icon={<Shield className="w-6 h-6" />}
              highlighted={false}
            />
            <PricingCard
              name="Performance"
              price="R$ 19,90"
              period="/mês"
              description="Para quem quer controle total das finanças"
              features={[
                "Comprovantes ilimitados",
                "Gastos recorrentes ilimitados",
                "Alertas de vencimento",
                "Relatórios avançados",
                "Exportar dados",
              ]}
              icon={<Zap className="w-6 h-6" />}
              highlighted={true}
            />
            <PricingCard
              name="Enterprise"
              price="R$ 49,90"
              period="/mês"
              description="Para equipes e gestão financeira compartilhada"
              features={[
                "Tudo do Performance",
                "Múltiplos usuários",
                "API de integração",
                "Suporte prioritário",
                "Dashboard personalizado",
              ]}
              icon={<Crown className="w-6 h-6" />}
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          G. FOOTER
          ═══════════════════════════════════ */}
      <div style={{ backgroundColor: "var(--bg-surface)" }}>
        <footer
          className="px-4 sm:px-6 py-12 sm:py-16"
          style={{
            backgroundColor: "#0A0A14",
            borderRadius: "3rem 3rem 0 0",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
              {/* Brand */}
              <div className="md:col-span-1">
                <span
                  className="text-xl font-bold text-white block mb-4"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Financial<span className="gradient-text">Hero</span>
                </span>
                <p className="text-white/40 text-sm leading-relaxed">
                  Transformando a relação das pessoas com o dinheiro, uma decisão consciente de cada vez.
                </p>
              </div>

              {/* Nav columns */}
              <div>
                <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
                  Produto
                </h4>
                <ul className="space-y-3">
                  {["Recursos", "Preços", "Changelog", "Roadmap"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/40 hover:text-hero-orange text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
                  Empresa
                </h4>
                <ul className="space-y-3">
                  {["Sobre", "Blog", "Carreiras", "Contato"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/40 hover:text-hero-orange text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
                  Legal
                </h4>
                <ul className="space-y-3">
                  {["Privacidade", "Termos", "Cookies", "Licenças"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/40 hover:text-hero-orange text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-white/30 text-sm">&copy; 2026 FinancialHero. Todos os direitos reservados.</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-hero-success pulse-dot" />
                <span
                  className="text-white/40 text-xs"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  Sistema Operacional
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FEATURE CARDS (Interactive Components)
   ═══════════════════════════════════════════════ */

/* ── Card 1: Diagnostic Shuffler ── */
const shufflerLabels = [
  { title: "Aluguel", value: "R$ 1.200", category: "Moradia" },
  { title: "Supermercado", value: "R$ 487", category: "Alimentação" },
  { title: "Streaming", value: "R$ 55", category: "Lazer" },
];
const shufflerFilters = ["Todos", "Moradia", "Alimentação", "Lazer"];

function DiagnosticShuffler() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % shufflerLabels.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-4xl p-6 sm:p-8 h-full"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-hero-orange/10 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-hero-orange" />
        </div>
        <h3
          className="text-lg font-bold text-primary"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Comprovantes
        </h3>
      </div>
      <p className="text-muted text-sm mb-4">
        Organize todos os seus recibos em um só lugar. Busque, filtre e nunca perca um comprovante.
      </p>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {shufflerFilters.map((f, i) => (
          <button
            key={f}
            onClick={() => setActiveFilter(i)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              backgroundColor: activeFilter === i ? "#ff7a00" : "var(--bg-hover)",
              color: activeFilter === i ? "white" : "var(--text-muted)",
              border: `1px solid ${activeFilter === i ? "#ff7a00" : "var(--border)"}`,
              fontFamily: "'Fira Code', monospace",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Shuffler stack */}
      <div className="relative h-42">
        {shufflerLabels.map((item, i) => {
          const offset = ((i - activeIndex + shufflerLabels.length) % shufflerLabels.length);
          return (
            <div
              key={item.title}
              className="absolute inset-x-0 rounded-2xl p-4 transition-all"
              style={{
                backgroundColor: offset === 0 ? "var(--bg-surface)" : "var(--bg-hover)",
                border: "1px solid var(--border)",
                transform: `translateY(${offset * 40}px) scale(${1 - offset * 0.04})`,
                opacity: offset === 0 ? 1 : offset === 1 ? 0.5 : 0.3,
                zIndex: shufflerLabels.length - offset,
                transitionDuration: "600ms",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary text-sm">{item.title}</p>
                  <p className="text-xs text-muted mt-1">{item.category}</p>
                </div>
                <span
                  className="text-hero-orange font-bold text-lg"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stat */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted" style={{ fontFamily: "'Fira Code', monospace" }}>
          Este mês
        </span>
        <span className="text-xs font-bold text-hero-orange" style={{ fontFamily: "'Fira Code', monospace" }}>
          3 comprovantes · R$ 1.742
        </span>
      </div>
    </div>
  );
}

/* ── Card 2: Telemetry Typewriter ── */
const recurringBills = [
  { name: "Aluguel", value: "R$ 1.200", daysLeft: 5, paid: false },
  { name: "Energia elétrica", value: "R$ 189", daysLeft: 3, paid: false },
];

function TelemetryTypewriter() {
  const messages = [
    "→ Netflix cobrado: R$ 55,90",
    "→ Aluguel pago ✓ (-R$ 1.200)",
    "→ Economia do mês: +R$ 340",
    "→ Limite de gastos: 78% usado",
  ];
  const [lines, setLines] = useState<string[]>([]);
  const [currentMsg, setCurrentMsg] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [typingLine, setTypingLine] = useState("");

  useEffect(() => {
    if (currentMsg >= messages.length) {
      const timeout = setTimeout(() => {
        setLines([]);
        setCurrentMsg(0);
        setCurrentChar(0);
        setTypingLine("");
      }, 2000);
      return () => clearTimeout(timeout);
    }

    const msg = messages[currentMsg];
    if (currentChar < msg.length) {
      const timeout = setTimeout(() => {
        setTypingLine(msg.slice(0, currentChar + 1));
        setCurrentChar((c) => c + 1);
      }, 35);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev.slice(-3), msg]);
        setTypingLine("");
        setCurrentMsg((m) => m + 1);
        setCurrentChar(0);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [currentMsg, currentChar, messages.length]);

  return (
    <div
      className="rounded-4xl p-6 sm:p-8 h-full"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-hero-purple/10 flex items-center justify-center">
          <CalendarClock className="w-5 h-5 text-hero-purple" />
        </div>
        <h3
          className="text-lg font-bold text-primary"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Gastos Recorrentes
        </h3>
      </div>
      <p className="text-muted text-sm mb-4">
        Acompanhe contas fixas com alertas automáticos. Nunca mais perca um vencimento.
      </p>

      {/* Upcoming bills */}
      <div className="space-y-2 mb-4">
        {recurringBills.map((bill) => (
          <div
            key={bill.name}
            className="flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: bill.paid ? "#22c55e" : bill.daysLeft <= 3 ? "#f59e0b" : "var(--text-muted)" }}
              />
              <span className="text-sm text-primary">{bill.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted" style={{ fontFamily: "'Fira Code', monospace" }}>
                {bill.paid ? "pago ✓" : `vence em ${bill.daysLeft}d`}
              </span>
              <span className="text-sm font-semibold text-hero-orange" style={{ fontFamily: "'Fira Code', monospace" }}>
                {bill.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Live feed indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-hero-success pulse-dot" />
        <span
          className="text-xs font-semibold text-hero-success uppercase tracking-wider"
          style={{ fontFamily: "'Fira Code', monospace" }}
        >
          Live Feed
        </span>
      </div>

      {/* Terminal-style feed */}
      <div
        className="rounded-xl p-4 overflow-hidden flex flex-col justify-end"
        style={{
          backgroundColor: "var(--bg-hover)",
          border: "1px solid var(--border)",
          fontFamily: "'Fira Code', monospace",
          fontSize: "0.7rem",
          height: "7rem",
        }}
      >
        {lines.map((line, i) => (
          <p key={`${i}-${line}`} className="text-muted leading-relaxed opacity-60">
            {line}
          </p>
        ))}
        {typingLine && (
          <p className="text-primary leading-relaxed">
            {typingLine}
            <span className="cursor-blink text-hero-orange ml-0.5">▌</span>
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Card 3: Hours Calculator ── */
const calcExamples = [
  { item: "iPhone 16 Pro", price: 9799, wage: 25 },
  { item: "Nike Air Max", price: 899, wage: 25 },
  { item: "Netflix (mês)", price: 55.9, wage: 25 },
  { item: "Jantar fora", price: 180, wage: 25 },
];

function CursorScheduler() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [displayedHours, setDisplayedHours] = useState(0);

  const current = calcExamples[exampleIndex];
  const targetHours = parseFloat((current.price / current.wage).toFixed(1));

  useEffect(() => {
    setDisplayedHours(0);
    let start: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedHours(parseFloat((eased * targetHours).toFixed(1)));
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [exampleIndex, targetHours]);

  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex((i) => (i + 1) % calcExamples.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-4xl p-6 sm:p-8 h-full"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-hero-orange/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-hero-orange" />
        </div>
        <h3
          className="text-lg font-bold text-primary"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Calculadora de Horas
        </h3>
      </div>
      <p className="text-muted text-sm mb-6">
        Veja exatamente quantas horas de trabalho cada compra custa. Agende e planeje com consciência.
      </p>

      <div className="mt-2 space-y-3">
        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)" }}
        >
          <span className="text-xs text-muted" style={{ fontFamily: "'Fira Code', monospace" }}>compra</span>
          <span className="text-sm font-semibold text-primary">{current.item}</span>
        </div>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)" }}
        >
          <span className="text-xs text-muted" style={{ fontFamily: "'Fira Code', monospace" }}>valor</span>
          <span className="text-sm font-semibold text-hero-orange" style={{ fontFamily: "'Fira Code', monospace" }}>
            R$ {current.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)" }}
        >
          <span className="text-xs text-muted" style={{ fontFamily: "'Fira Code', monospace" }}>seu valor/hora</span>
          <span className="text-sm text-muted" style={{ fontFamily: "'Fira Code', monospace" }}>
            R$ {current.wage},00/h
          </span>
        </div>

        <div
          className="rounded-xl px-5 py-5 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(255,122,0,0.15), rgba(255,122,0,0.05))",
            border: "1px solid rgba(255,122,0,0.3)",
          }}
        >
          <span className="text-xs font-semibold text-hero-orange" style={{ fontFamily: "'Fira Code', monospace" }}>
            horas de trabalho
          </span>
          <span
            className="text-2xl font-bold text-hero-orange"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {displayedHours}h
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROTOCOL CARDS (Stacking)
   ═══════════════════════════════════════════════ */

function ProtocolCard({
  step,
  title,
  description,
  visual,
}: {
  step: string;
  title: string;
  description: string;
  visual: "gear" | "scan" | "wave";
}) {
  return (
    <div
      data-protocol-card
      className="rounded-4xl p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-[350px]"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        position: "relative",
        zIndex: parseInt(step, 10) * 10,
      }}
    >
      {/* Visual side */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center rounded-2xl p-8"
        style={{ backgroundColor: "var(--bg-hover)", minHeight: "200px" }}
      >
        {visual === "gear" && <GearVisual />}
        {visual === "scan" && <ScanVisual />}
        {visual === "wave" && <WaveVisual />}
      </div>

      {/* Content side */}
      <div className="w-full lg:w-1/2">
        <span
          className="text-hero-orange text-sm font-bold mb-4 block"
          style={{ fontFamily: "'Fira Code', monospace" }}
        >
          Passo {step}
        </span>
        <h3
          className="text-2xl sm:text-3xl font-bold text-primary mb-4"
          style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}
        >
          {title}
        </h3>
        <p className="text-muted text-base sm:text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ── Protocol Visuals ── */
function GearVisual() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      className="text-hero-orange"
      style={{ animation: "rotate-slow 12s linear infinite" }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="60" cy="60" r="20" />
        <circle cx="60" cy="60" r="35" strokeDasharray="8 4" />
        <circle cx="60" cy="60" r="50" strokeDasharray="4 8" opacity="0.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="60"
            y1="60"
            x2={60 + Math.cos((angle * Math.PI) / 180) * 55}
            y2={60 + Math.sin((angle * Math.PI) / 180) * 55}
            opacity="0.3"
          />
        ))}
      </g>
    </svg>
  );
}

function ScanVisual() {
  return (
    <div className="relative w-[120px] h-[120px]">
      {/* Grid of dots */}
      <svg width="120" height="120" viewBox="0 0 120 120">
        {Array.from({ length: 36 }, (_, i) => {
          const x = (i % 6) * 20 + 10;
          const y = Math.floor(i / 6) * 20 + 10;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="var(--text-subtle)"
              opacity="0.3"
            />
          );
        })}
      </svg>
      {/* Scan line */}
      <div
        className="absolute left-0 w-full h-0.5 bg-hero-purple"
        style={{
          animation: "scan 2.5s ease-in-out infinite alternate",
          boxShadow: "0 0 12px rgba(120, 3, 212, 0.5)",
          top: "0",
        }}
      />
    </div>
  );
}

function WaveVisual() {
  return (
    <svg width="200" height="80" viewBox="0 0 200 80" className="text-hero-orange">
      <path
        d="M0,40 Q10,10 20,40 Q30,70 40,40 Q50,10 60,40 Q70,70 80,40 Q90,10 100,40 Q110,70 120,40 Q130,10 140,40 Q150,70 160,40 Q170,10 180,40 Q190,70 200,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        style={{ animation: "ekg-wave 3s linear infinite" }}
      />
      <path
        d="M0,40 Q10,10 20,40 Q30,70 40,40 Q50,10 60,40 Q70,70 80,40 Q90,10 100,40 Q110,70 120,40 Q130,10 140,40 Q150,70 160,40 Q170,10 180,40 Q190,70 200,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.2"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   PRICING CARD
   ═══════════════════════════════════════════════ */

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  icon,
  highlighted,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  highlighted: boolean;
}) {
  return (
    <div
      className="rounded-4xl p-6 sm:p-8 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: highlighted ? "#0A0A14" : "var(--bg-surface)",
        border: highlighted
          ? "2px solid #ff7a00"
          : "1px solid var(--border)",
        boxShadow: highlighted
          ? "0 8px 40px rgba(255, 122, 0, 0.15)"
          : "0 4px 24px rgba(0,0,0,0.06)",
        color: highlighted ? "#eaeaea" : "var(--text-primary)",
      }}
    >
      {highlighted && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: "linear-gradient(90deg, #ff7a00, #7803d4)",
          }}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: highlighted
              ? "rgba(255, 122, 0, 0.15)"
              : "var(--bg-hover)",
            color: highlighted ? "#ff7a00" : "var(--text-muted)",
          }}
        >
          {icon}
        </div>
        <span
          className="font-bold text-lg"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {name}
        </span>
      </div>

      <div className="mb-6">
        <span
          className="text-3xl sm:text-4xl font-bold"
          style={{
            fontFamily: "'Sora', sans-serif",
            color: highlighted ? "#ffffff" : "var(--text-primary)",
          }}
        >
          {price}
        </span>
        {period && (
          <span
            className="text-sm ml-1"
            style={{ color: highlighted ? "rgba(255,255,255,0.5)" : "var(--text-subtle)" }}
          >
            {period}
          </span>
        )}
      </div>
      <p
        className="text-sm mb-8"
        style={{ color: highlighted ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}
      >
        {description}
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: "#ff7a00" }}
            />
            <span style={{ color: highlighted ? "rgba(255,255,255,0.8)" : "var(--text-muted)" }}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <a
        href="/register"
        className={`inline-flex items-center justify-center py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${highlighted ? "btn-hero" : ""
          }`}
        style={
          highlighted
            ? {}
            : {
              backgroundColor: "var(--bg-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }
        }
      >
        Começar agora
        <ArrowRight className="w-4 h-4 ml-2" />
      </a>
    </div>
  );
}
