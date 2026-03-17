import { useEffect, useState, useRef, useMemo, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Swords, Trophy, Check, ChevronRight, MessageCircle, Users, GraduationCap, AlertTriangle, ExternalLink, X, Instagram, Send, Menu, TrendingUp, Phone, Quote, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import fundedFridayLogo from "@/assets/funded-friday-logo.png";
import wetradedailyLogo from "@/assets/wetradedaily-logo.png";
import chiruPhoto from "@/assets/chiranjivi-anand.png";
import TermsModal from "@/components/TermsModal";

// Detect mobile/in-app browser for reduced animations
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
const isInAppBrowser = typeof navigator !== "undefined" && /FBAN|FBAV|Instagram|Line|Snapchat|Twitter|MicroMessenger|WeChat/i.test(navigator.userAgent);
const isLowEndDevice = isMobile || isInAppBrowser;
const GOOGLE_FORM_URL = "https://forms.gle/T9mhUNn4URdkUaqk8";
// Google Calendar "Add event" URLs (IST 8:00 PM = 14:30 UTC for 2hr block)
const CALENDAR_DAY1 = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Zero+to+Funded+Masterclass+%28Day+1%29&dates=20260321T143000Z/20260321T163000Z&details=Live+on+Telegram.+Register+free+and+get+the+link+in+our+community.&location=Telegram";
const CALENDAR_DAY2 = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Zero+to+Funded+Masterclass+%28Day+2%29&dates=20260322T143000Z/20260322T163000Z&details=Live+on+Telegram.+Register+free+and+get+the+link+in+our+community.&location=Telegram";

// --- Reduced motion (respect prefers-reduced-motion) ---
const ReduceMotionContext = createContext(false);

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const handler = () => setReduce(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduce;
}

const instantTransition = { duration: 0 };
const noAnimation = { opacity: 1, y: 0, scale: 1 };

// --- Countdown Logic ---
function getTargetDate() {
  // March 21, 2026 at 8:00 PM IST
  return new Date(2026, 2, 21, 20, 0, 0);
}

function useCountdown() {
  const target = useRef(getTargetDate());
  const [diff, setDiff] = useState(() => Math.max(0, target.current.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(Math.max(0, target.current.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

// --- useInView hook for counter/card animations ---
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// --- ANIMATION 2: Gold Particles ---
function GoldParticles() {
  const particles = useMemo(() =>
    isInAppBrowser ? [] : Array.from({ length: isMobile ? 8 : 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 2,
      duration: 5 + Math.random() * 4,
      delay: Math.random() * 8,
    })), []);

  if (isInAppBrowser) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-0 rounded-full animate-particle-float"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: "#F5A623",
            "--float-duration": `${p.duration}s`,
            "--float-delay": `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// --- ANIMATION 3: Candlestick Chart SVG ---
function CandlestickChart() {
  const candles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => {
      const bull = i % 3 !== 0;
      const bodyH = 20 + Math.random() * 60;
      const wickH = bodyH + 10 + Math.random() * 30;
      const y = 40 + Math.random() * 80;
      return { i, bull, bodyH, wickH, y, x: 10 + i * 22 };
    }), []);

  if (isLowEndDevice) return null;

  return (
    <div className="absolute bottom-0 right-0 w-[45%] h-[80%] opacity-[0.08] pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 370 300" width="100%" height="100%" preserveAspectRatio="none">
        {candles.map((c) => (
          <g key={c.i}>
            <line x1={c.x + 5} x2={c.x + 5} y1={c.y} y2={c.y + c.wickH} stroke={c.bull ? "#22C55E" : "#EF4444"} strokeWidth="1.5" />
            <rect x={c.x} y={c.y + (c.wickH - c.bodyH) / 2} width="10" height={c.bodyH} fill={c.bull ? "#22C55E" : "#EF4444"} rx="1" />
          </g>
        ))}
        <rect className="animate-scan-line" x="0" y="0" width="100%" height="1" fill="rgba(245,166,35,0.3)" />
      </svg>
    </div>
  );
}

// --- ANIMATION 4: Animated Counter ---
function AnimatedNumber({ value, prefix = "", suffix = "", inView }: { value: number; prefix?: string; suffix?: string; inView: boolean }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOut
      setDisplay(Math.round(eased * value));
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [inView, value]);

  return <>{prefix}{inView ? display.toLocaleString() : 0}{suffix}</>;
}

// --- ANIMATION 6: Glassmorphism Card wrapper ---
function GlassFloatCard({ children, index, className = "" }: { children: React.ReactNode; index: number; className?: string }) {
  const { ref, inView } = useInView(0.15);
  const blurClass = isInAppBrowser ? "" : "backdrop-blur-[12px]";
  const floatClass = isInAppBrowser ? "" : "animate-card-float";
  return (
    <div
      ref={ref}
      className={`${floatClass} rounded-xl bg-white/[0.04] border border-white/[0.08] ${blurClass} transition-[border-color] duration-300 hover:border-[rgba(245,166,35,0.4)] ${className}`}
      style={{
        "--float-delay": `${index * 0.5}s`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// --- Navbar ---
const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Masterclass", href: "#masterclass" },
  { label: "Rules", href: "#rules" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

function Navbar() {
  const reduceMotion = useContext(ReduceMotionContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href === "#") return window.scrollTo({ top: 0, behavior: "smooth" });
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? `bg-[#0D0D0D]/95 ${isInAppBrowser ? "" : "backdrop-blur-md"} shadow-[0_1px_20px_rgba(0,0,0,0.5)] py-2`
          : `bg-[#0D0D0D] ${isInAppBrowser ? "" : "bg-[#0D0D0D]/80 backdrop-blur-sm"} py-3 md:py-4`
      }`}
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
        {/* Logo - touch target on mobile */}
        <button onClick={() => scrollTo("#")} className="flex items-center gap-2 group min-h-[44px] min-w-[44px] -ml-2 pl-2 md:min-w-0 md:min-h-0 md:ml-0 md:pl-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]">
          <TrendingUp className="text-primary shrink-0" size={24} />
          <span className="text-lg sm:text-xl font-bold text-white">
            Zero to <span className="text-primary">Funded</span>
          </span>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-3/4" />
            </button>
          ))}
        </div>

        {/* Right side - touch-friendly on mobile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            className="hidden md:inline-flex rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(245,166,35,0.4)] hover:scale-105 transition-all duration-300"
            onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })}
          >
            Register Now
          </Button>
          <button
            className="md:hidden text-white p-3 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu - full-width tap targets */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            transition={reduceMotion ? instantTransition : undefined}
            className={`md:hidden overflow-hidden bg-[#0D0D0D]/98 ${isInAppBrowser ? "" : "backdrop-blur-md"} border-t border-white/[0.06]`}
          >
            <div className="flex flex-col px-4 py-3 gap-0">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="text-left py-4 min-h-[48px] text-base font-medium text-muted-foreground hover:text-primary active:bg-white/5 transition-colors border-b border-white/[0.06] last:border-0"
                >
                  {link.label}
                </button>
              ))}
              <Button
                className="mt-3 w-full rounded-lg bg-primary text-primary-foreground font-semibold py-6 text-base min-h-[48px]"
                onClick={() => { setMobileOpen(false); document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" }); }}
              >
                Register Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// --- Hero ---
function Hero() {
  const reduceMotion = useContext(ReduceMotionContext);
  const countdown = useCountdown();
  const timeUnits = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Minutes", value: countdown.minutes },
    { label: "Seconds", value: countdown.seconds },
  ];

  return (
    <section className="min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20 sm:pt-24 pb-10 sm:pb-14 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-[-40px] pointer-events-none" aria-hidden="true">
        <div
          className="w-full h-full animate-grid-scroll"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,166,35,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Orbs */}
      <div className="absolute top-[-50px] left-[-50px] w-[280px] h-[280px] rounded-full bg-[rgba(245,166,35,0.3)] blur-[80px] animate-orb-pulse pointer-events-none" aria-hidden="true" />
      <div className="absolute top-[-30px] right-[-30px] w-[220px] h-[220px] rounded-full bg-[rgba(34,197,94,0.2)] blur-[80px] animate-orb-pulse pointer-events-none" style={{ animationDelay: "2s" }} aria-hidden="true" />
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full bg-[rgba(245,166,35,0.2)] blur-[60px] animate-orb-pulse pointer-events-none" style={{ animationDelay: "4s" }} aria-hidden="true" />

      {/* Gold gradient glow from bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[rgba(245,166,35,0.08)] to-transparent pointer-events-none" aria-hidden="true" />

      {/* Gold Particles */}
      <GoldParticles />

      {/* Candlestick Chart */}
      <CandlestickChart />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto">
        {/* Trust Badge Pill */}
        <motion.div
          initial={reduceMotion ? noAnimation : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? instantTransition : { duration: 0.5 }}
          className="mb-4 px-4 py-2 rounded-full border border-primary/40 bg-primary/[0.08] text-xs sm:text-sm text-muted-foreground text-center"
        >
          🚀 Karnataka&apos;s Fastest Growing Trader Community
        </motion.div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-3 leading-tight">
          Zero to <span className="text-primary">Funded</span>
        </h1>
        <motion.h2
          initial={reduceMotion ? noAnimation : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? instantTransition : { duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-4 px-1"
        >
          Learn Trading. Compete Live. Win a{" "}
          <span className="text-primary font-bold">$5,000 Funded Account.</span>
        </motion.h2>

        {/* Event Dates */}
        <motion.div
          initial={reduceMotion ? noAnimation : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? instantTransition : { duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 w-full max-w-md sm:max-w-lg mx-auto"
        >
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-primary/30 bg-primary/[0.06]">
            <span className="text-primary font-bold text-xs sm:text-sm">📚 Masterclass:</span>
            <span className="text-white text-xs sm:text-sm font-medium">21st & 22nd — 8:00 PM</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-primary/30 bg-primary/[0.06]">
            <span className="text-primary font-bold text-xs sm:text-sm">⚔️ Competition:</span>
            <span className="text-white text-xs sm:text-sm font-medium">23rd (Mon) — 11:00 AM</span>
          </div>
        </motion.div>

        {/* CTA Buttons - full width on mobile for easy tap */}
        <motion.div
          initial={reduceMotion ? noAnimation : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? instantTransition : { duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mb-6 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto"
        >
          <Button
            size="lg"
            className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground font-semibold text-base px-6 py-6 min-h-[48px] hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)] transition-all duration-300"
            onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })}
          >
            Register for Free Masterclass <ChevronRight className="ml-1" size={18} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto rounded-xl border-2 border-white/20 text-white font-semibold text-base px-6 py-6 min-h-[48px] hover:bg-white/10"
            onClick={() => window.open("https://t.me/CHIRUFUNDS", "_blank")}
          >
            <Send size={18} className="mr-2" /> Join Telegram Community
          </Button>
        </motion.div>

        {/* Trust Bar */}
        <motion.div
          initial={reduceMotion ? noAnimation : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduceMotion ? instantTransition : { delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-3 text-xs sm:text-sm"
        >
          {[
            { emoji: "👥", text: "10,000+ Community" },
            { emoji: "🎓", text: "100+ Funded" },
            { emoji: "🧑‍🏫", text: "Live Mentorship" },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-muted-foreground">
              <span>{b.emoji}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={reduceMotion ? noAnimation : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduceMotion ? instantTransition : { delay: 0.55, duration: 0.5 }}
          className="mb-5 text-xs sm:text-sm text-muted-foreground"
        >
          🔥 <span className="text-primary font-bold">855+</span> Traders Already Registered
        </motion.div>

        {/* Countdown - smaller gaps on mobile */}
        <motion.div
          initial={reduceMotion ? noAnimation : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? instantTransition : { delay: 0.65, duration: 0.5 }}
          className="flex gap-2 sm:gap-3 flex-wrap justify-center"
        >
          {timeUnits.map((u) => (
            <div
              key={u.label}
              className="flex flex-col items-center justify-center min-w-[64px] w-16 sm:min-w-[72px] sm:w-20 h-20 sm:h-24 rounded-xl border border-primary/50 bg-white/5 shadow-[0_0_12px_rgba(245,166,35,0.15)]"
            >
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary tabular-nums">{String(u.value).padStart(2, "0")}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">{u.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// --- What Is Zero to Funded ---
function WhatIsSection() {
  const cards = [
    { icon: BookOpen, emoji: "📚", title: "1-Day Masterclass", text: "Learn prop firm trading from scratch — free" },
    { icon: Swords, emoji: "⚔️", title: "7-Day Competition", text: "Trade live on Bullrush platform and get ranked" },
    { icon: Trophy, emoji: "🏆", title: "Win Funded Accounts", text: "Top 30 traders each win a $5,000 funded account" },
  ];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 w-full">
            What Is <span className="text-primary">Zero to Funded?</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((c, i) => (
            <GlassFloatCard key={c.title} index={i} className="p-6 text-center">
              <span className="text-4xl mb-4 block">{c.emoji}</span>
              <h3 className="text-xl font-bold text-white mb-2">{c.title}</h3>
              <p className="text-muted-foreground">{c.text}</p>
            </GlassFloatCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Dedicated Masterclass block ---
function MasterclassSection() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6" id="masterclass">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 w-full">
            Free <span className="text-primary">Masterclass</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base w-full">
          Join live. Learn from Chiru sir. No recording needed — be there.
          </p>
        </div>
        <GlassFloatCard index={0} className="p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calendar className="text-primary" size={24} />
            </div>
            <div>
              <p className="font-bold text-white text-lg">21st & 22nd March 2026</p>
              <p className="text-muted-foreground">8:00 PM IST both days</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-lg">
              📺
            </div>
            <div>
              <p className="font-bold text-white">Live on Telegram</p>
              <p className="text-muted-foreground text-sm">Link shared in community after you register.</p>
            </div>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              className="rounded-xl bg-primary text-primary-foreground font-semibold min-h-[48px]"
              onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })}
            >
              Register for free
            </Button>
            <div className="flex flex-wrap gap-2">
              <a
                href={CALENDAR_DAY1}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/50 bg-white/[0.04] px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors min-h-[48px]"
              >
                <Calendar size={18} /> Add Day 1 to calendar
              </a>
              <a
                href={CALENDAR_DAY2}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/50 bg-white/[0.04] px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors min-h-[48px]"
              >
                <Calendar size={18} /> Add Day 2 to calendar
              </a>
            </div>
          </div>
        </GlassFloatCard>
      </div>
    </section>
  );
}

// --- What You'll Learn ---
function LearnSection() {
  const items = [
    "How prop firm funding works",
    "Why most traders fail challenges",
    "Risk management for funded accounts",
    "Execution mistakes beginners make",
    "Real strategy breakdown with live examples",
    "Trading psychology and discipline",
    "Full competition rules walkthrough",
  ];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white w-full">
            What You'll <span className="text-primary">Learn</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {items.map((item, i) => (
            <GlassFloatCard key={i} index={i} className="flex items-start gap-3 p-4">
              <Check className="text-primary mt-0.5 shrink-0" size={20} />
              <span className="text-white">{item}</span>
            </GlassFloatCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Competition Details ---
function CompetitionSection() {
  const details = [
    { label: "Platform", value: "Bullrush" },
    { label: "Masterclass", value: "21st & 22nd at 8:00 PM IST" },
    { label: "Competition Start", value: "23rd (Monday) at 11:00 AM IST" },
    { label: "Duration", value: "7 Days" },
    { label: "Ranking", value: "Based on trading performance" },
  ];
  const rules = [
    "Follow risk management guidelines",
    "Use the SAME username on Bullrush and registration form",
    "Rankings are updated daily",
  ];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white w-full">
            Competition <span className="text-primary">Details</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4">
            {details.map((d, i) => (
              <GlassFloatCard key={d.label} index={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-muted-foreground font-medium text-sm sm:text-base">{d.label}</span>
                <span className="text-white font-semibold text-sm sm:text-base break-words">{d.value}</span>
              </GlassFloatCard>
            ))}
          </div>
          <GlassFloatCard index={0} className="p-6 sm:p-8">
            <h3 className="text-xl font-bold text-primary mb-6">Important Rules</h3>
            <ul className="space-y-4">
              {rules.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </GlassFloatCard>
        </div>
      </div>
    </section>
  );
}

// --- Hall of Winners ---
function HallOfWinners() {
  const reduceMotion = useContext(ReduceMotionContext);
  // Podium order: 2nd (left), 1st (center, tallest), 3rd (right) for classic podium look
  const podium = [
    { rank: 2, medal: "🥈", label: "2nd", sub: "Silver", cardClass: "border-slate-400/50 bg-gradient-to-b from-slate-500/10 to-transparent shadow-[0_0_24px_rgba(148,163,184,0.15)]", badgeClass: "bg-slate-500/20 text-slate-300" },
    { rank: 1, medal: "🥇", label: "1st", sub: "Gold", cardClass: "border-primary/70 bg-gradient-to-b from-primary/20 to-transparent shadow-[0_0_32px_rgba(245,166,35,0.25)] sm:scale-105 z-10", badgeClass: "bg-primary/25 text-primary" },
    { rank: 3, medal: "🥉", label: "3rd", sub: "Bronze", cardClass: "border-amber-700/50 bg-gradient-to-b from-amber-900/20 to-transparent shadow-[0_0_24px_rgba(180,83,9,0.15)]", badgeClass: "bg-amber-700/20 text-amber-400" },
  ];
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };
  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6" id="leaderboard">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header - force center on mobile */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Trophy size={14} /> Top 30
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 w-full">
            Hall of <span className="text-primary">Funded Traders</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg w-full text-center px-0">
            Win the competition and secure your place on the official Zero to Funded Winners Wall.
          </p>
        </div>

        {/* Top 3 Podium - centered on mobile, 2-1-3 on desktop */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 sm:gap-4 mb-12 sm:mb-14 max-w-3xl mx-auto w-full">
          {podium.map((p) => (
            <div
              key={p.rank}
              className={`w-full sm:flex-1 sm:max-w-[200px] rounded-2xl border-2 ${p.cardClass} p-5 sm:p-6 flex flex-col items-center text-center min-h-[200px] sm:min-h-[220px] justify-between backdrop-blur-sm transition-transform hover:scale-[1.02]`}
            >
              <span className="text-4xl sm:text-5xl block mb-2" aria-hidden>{p.medal}</span>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${p.badgeClass}`}>
                {p.sub}
              </span>
              <p className="text-white font-bold text-lg sm:text-xl mt-2 mb-0.5">Your Name Here</p>
              <p className="text-muted-foreground text-xs mb-3">Future Funded Trader</p>
              <div className="w-full pt-3 border-t border-white/10">
                <p className="text-primary font-bold text-sm">$5,000 Funded Account</p>
                <p className="text-white/80 text-xs font-semibold mt-0.5">Rank #{p.rank}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ranks 4–30 section label - centered */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 w-full">
          <div className="h-px flex-1 max-w-[60px] sm:max-w-none bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">Ranks 4 – 30</span>
          <div className="h-px flex-1 max-w-[60px] sm:max-w-none bg-gradient-to-l from-transparent via-white/20 to-transparent" />
        </div>

        {/* Ranks 4-30 Grid */}
        <motion.div
          variants={container}
          initial={reduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          transition={reduceMotion ? { duration: 0, staggerChildren: 0, delayChildren: 0 } : undefined}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3"
        >
          {Array.from({ length: 27 }, (_, i) => i + 4).map((rank) => (
            <motion.div
              key={rank}
              variants={item}
              transition={reduceMotion ? instantTransition : undefined}
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 bg-white/[0.06] border border-white/[0.08] hover:border-primary/30 hover:bg-white/[0.08] transition-all duration-300 min-h-[88px] sm:min-h-[100px]"
              style={{ "--float-delay": `${(rank % 6) * 0.5}s` } as React.CSSProperties}
            >
              <span className="text-primary font-bold text-sm tabular-nums">#{rank}</span>
              <span className="text-xl" aria-hidden>🏆</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground/90 font-medium px-2 py-0.5 rounded-full bg-white/5">
                Reserved
              </span>
              <span className="text-primary font-bold text-xs">$5,000</span>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-muted-foreground text-sm w-full">
          Your name could be on this wall <span className="text-primary font-semibold">next.</span>
        </p>
      </div>
    </section>
  );
}

// --- Countdown Display Component ---
function CountdownDisplay() {
  const countdown = useCountdown();
  const timeUnits = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Minutes", value: countdown.minutes },
    { label: "Seconds", value: countdown.seconds },
  ];
  return (
    <div className="flex gap-3 justify-center">
      {timeUnits.map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center justify-center w-16 h-20 rounded-xl border border-primary/50 bg-white/5"
        >
          <span className="text-2xl font-bold text-primary">{String(u.value).padStart(2, "0")}</span>
          <span className="text-[10px] text-muted-foreground mt-1">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

// --- SECTION: How to Register ---
function HowToRegister() {
  const steps = [
    {
      num: 1,
      emoji: "👤",
      title: "Create a Bullrush Account",
      desc: "Sign up for a free account on the Bullrush trading platform.",
      button: { label: "Open Bullrush", action: () => window.open("https://bullrush.tech/affiliate/thechiranjeevi", "_blank") },
    },
    {
      num: 2,
      emoji: "📋",
      title: "Fill the Registration Form",
      desc: "Enter your details in the competition registration form.",
      button: { label: "Go to Form", action: () => window.open(GOOGLE_FORM_URL, "_blank") },
    },
    {
      num: 3,
      emoji: "⚠️",
      title: "Use the SAME Name on Both Platforms",
      desc: "Your Bullrush username must exactly match the name in this form.",
      warning: true,
    },
    {
      num: 4,
      emoji: "✈️",
      title: "Join Telegram for Updates",
      desc: "Get masterclass link, competition updates and results.",
      button: { label: "Join Telegram", action: () => window.open("https://t.me/CHIRUFUNDS", "_blank") },
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6" id="rules">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 w-full">
            How to <span className="text-primary">Register</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl w-full px-1">
            Follow these simple steps to join the Zero to Funded competition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((step, i) => (
            <div key={step.num} className="flex flex-col w-full">
              <GlassFloatCard
                index={i}
                className={`flex-1 flex flex-col p-5 sm:p-6 rounded-2xl ${
                  step.warning
                    ? "border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/15 to-amber-500/5 shadow-[0_0_24px_rgba(245,158,11,0.12)]"
                    : "border border-white/[0.08]"
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex shrink-0 w-11 h-11 rounded-xl items-center justify-center font-bold text-lg ${
                    step.warning ? "bg-amber-500 text-black" : "bg-primary/20 text-primary"
                  }`}>
                    {step.num}
                  </div>
                  <span className="text-2xl sm:text-3xl leading-none" aria-hidden>{step.emoji}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 flex-1 leading-relaxed">
                  {step.desc}
                </p>
                {step.warning && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-semibold mb-4 w-fit">
                    <AlertTriangle size={14} />
                    Critical Step
                  </div>
                )}
                {step.button && (
                  <Button
                    size="sm"
                    className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 min-h-[44px] px-4 mt-auto"
                    onClick={step.button.action}
                  >
                    {step.button.label}
                    <ExternalLink size={14} className="ml-2 shrink-0" />
                  </Button>
                )}
              </GlassFloatCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- SECTION 8: Scarcity Bar ---
function ScarcityBar() {
  return (
    <div className="w-full bg-primary py-4 px-4 sm:px-6">
      <p className="text-center text-black font-bold text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-snug">
        <span className="inline-block animate-pulse">⚡</span> Only 200 Competition Slots Available — Register Before They&apos;re Gone
      </p>
    </div>
  );
}

// --- SECTION 10: FAQ ---
function FAQSection() {
  const faqs = [
    { q: "Is this really free?", a: "Yes. The masterclass and competition are 100% free to join." },
    { q: "Is the masterclass recorded?", a: "The masterclass is live on Telegram. We recommend attending live so you can ask questions. If a recording is shared later, it will be announced in the Telegram community." },
    { q: "Who can participate?", a: "Any trader in India, from beginner to advanced level." },
    { q: "Do I need trading experience?", a: "No. The masterclass starts from the basics." },
    { q: "What is Bullrush?", a: "Bullrush is the trading competition platform used to rank all participants." },
    { q: "How are winners selected?", a: "Based on trading performance over the 7-day competition on Bullrush." },
    { q: "Why must my username match?", a: "To verify your identity and ensure correct prize distribution." },
  ];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-6 sm:mb-8">
          Frequently Asked <span className="text-primary">Questions</span>
        </h2>
        <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass-card rounded-xl border border-white/10 px-4 sm:px-6 overflow-hidden"
            >
              <AccordionTrigger className="text-white font-semibold text-left hover:no-underline py-4 sm:py-5 text-sm sm:text-base min-h-[48px]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// --- About Chiranjivi Anand ---
function AboutSection() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-6 sm:mb-8">
          <span className="text-primary">Chiranjivi Anand</span>
        </h2>
        <div className="flex flex-col items-center text-center gap-5 sm:gap-6">
          {/* Photo */}
          <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[160px] md:h-[160px] rounded-full border-4 border-primary shadow-[0_0_30px_rgba(245,166,35,0.25)] overflow-hidden shrink-0">
            <img src={chiruPhoto} alt="Chiranjivi Anand" width={160} height={160} loading="lazy" className="w-full h-full object-cover object-top" />
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-lg">
            {[
              { emoji: "🎓", text: "100+ Traders Funded" },
              { emoji: "👥", text: "10,000+ Community" },
              { emoji: "📊", text: "Live Mentorship" },
            ].map((b) => (
              <div key={b.text} className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-2 sm:p-3 text-center">
                <span className="text-lg sm:text-xl block mb-1">{b.emoji}</span>
                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Social Links - touch-friendly */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
            <a href="https://t.me/CHIRUFUNDS" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 active:scale-95 transition-all min-h-[44px] min-w-[44px] justify-center rounded-lg px-4 py-2 -m-2 sm:m-0 sm:px-0 sm:py-0 sm:min-w-0">
              <Send size={20} /> <span className="text-sm font-medium">Telegram</span>
            </a>
            <a href="https://www.instagram.com/thechiruanand/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 active:scale-95 transition-all min-h-[44px] min-w-[44px] justify-center rounded-lg px-4 py-2 -m-2 sm:m-0 sm:px-0 sm:py-0 sm:min-w-0">
              <Instagram size={20} /> <span className="text-sm font-medium">Instagram</span>
            </a>
            <a href="https://wa.me/917090000679" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 active:scale-95 transition-all min-h-[44px] min-w-[44px] justify-center rounded-lg px-4 py-2 -m-2 sm:m-0 sm:px-0 sm:py-0 sm:min-w-0">
              <Phone size={20} /> <span className="text-sm font-medium">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Testimonials (about Chiranjivi Anand) ---
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Chiru sir's knowledge in trading is just insane. Every session I learn something new that actually works in the market.",
      name: "Community Member",
      badge: "Funded Trader",
    },
    {
      quote: "He explains complex topics in a very simple way. Finally someone who doesn't confuse you with jargon — everything just clicks.",
      name: "Community Member",
      badge: "Masterclass Attendee",
    },
    {
      quote: "The way he breaks down risk management and trading psychology is a game changer. My approach to the markets completely changed.",
      name: "Community Member",
      badge: "Funded Trader",
    },
    {
      quote: "I've followed many mentors. Chiru sir's clarity and honesty stand out. No fluff, only what actually works in real trading.",
      name: "Community Member",
      badge: "Student",
    },
    {
      quote: "His content on Telegram and live sessions are so clear. You can tell he actually trades — no theory without practice.",
      name: "Community Member",
      badge: "Telegram Community",
    },
    {
      quote: "Chiru sir doesn't sell dreams. He gives straight, actionable stuff. That's rare in the trading space.",
      name: "Community Member",
      badge: "Community Member",
    },
  ];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6" id="testimonials">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-2 sm:mb-3">
          What People Say About <span className="text-primary">Chiranjivi Anand</span>
        </h2>
        <p className="text-center text-muted-foreground text-sm sm:text-base mb-6 sm:mb-10 max-w-xl mx-auto">
          Real feedback from our community about Chiru sir&apos;s teaching and mentorship.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <GlassFloatCard key={i} index={i} className="p-6 flex flex-col h-full">
              <Quote className="text-primary/60 mb-3 shrink-0" size={28} />
              <p className="text-white font-medium leading-relaxed mb-4 flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
                <span className="text-sm text-muted-foreground">{t.name}</span>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {t.badge}
                </span>
              </div>
            </GlassFloatCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Partners Section ---
function PartnersSection() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 relative">
      {/* Subtle gold gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" aria-hidden="true" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">
          In Partnership <span className="text-primary">With</span>
        </h2>

        {/* Gold divider */}
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-6 sm:mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          {/* Card 1: Chiranjivi Anand */}
          <div className="rounded-xl bg-white/[0.03] border-2 border-primary/30 backdrop-blur-[12px] p-8 flex flex-col items-center gap-4 shadow-[0_0_20px_rgba(245,166,35,0.1)] hover:shadow-[0_0_30px_rgba(245,166,35,0.2)] hover:-translate-y-1 transition-all duration-300">
            <img src={wetradedailyLogo} alt="WeTradDaily logo" width={80} height={80} loading="lazy" className="w-20 h-20 rounded-full object-contain bg-white/5 p-1" />
            <span className="text-xl font-bold text-white">Chiranjivi Anand</span>
            <span className="text-sm text-muted-foreground">Official Trading Mentor</span>
          </div>

          {/* Card 2: Funded Friday */}
          <div className="rounded-xl bg-white/[0.03] border-2 border-primary/30 backdrop-blur-[12px] p-8 flex flex-col items-center gap-4 shadow-[0_0_20px_rgba(245,166,35,0.1)] hover:shadow-[0_0_30px_rgba(245,166,35,0.2)] hover:-translate-y-1 transition-all duration-300">
            <img src={fundedFridayLogo} alt="Funded Friday logo" width={160} height={64} loading="lazy" className="h-16 object-contain" />
            <span className="text-xl font-bold text-white">Funded Friday</span>
            <span className="text-sm text-muted-foreground">Official Prop Firm Partner</span>
          </div>
        </div>

        {/* Gold divider */}
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-8" />
      </div>
    </section>
  );
}

// --- SECTION 13: Final CTA ---
function FinalCTA() {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 bg-white/[0.02]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          Don&apos;t Miss Your Shot at a <span className="text-primary">$5,000 Funded Account</span>
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-5 sm:mb-6">
          Free masterclass. Live competition. Real prizes. Limited slots.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground font-semibold text-base px-8 min-h-[48px] hover:bg-primary/90"
            onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })}
          >
            Register Now — It&apos;s Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto rounded-xl border-2 border-white/20 text-white font-semibold text-base px-8 min-h-[48px] hover:bg-white/10"
            onClick={() => window.open("https://t.me/CHIRUFUNDS", "_blank")}
          >
            <MessageCircle size={18} className="mr-2" /> Join Telegram
          </Button>
        </div>
      </div>
    </section>
  );
}

// --- SECTION 14: Footer ---
function Footer() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-white/5 pb-[env(safe-area-inset-bottom,0)]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            <a href="https://t.me/CHIRUFUNDS" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors min-h-[44px] inline-flex items-center justify-center py-2">Telegram</a>
            <a href="https://www.instagram.com/thechiruanand/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors min-h-[44px] inline-flex items-center justify-center py-2">Instagram</a>
            <button onClick={() => setShowTerms(true)} className="text-muted-foreground hover:text-primary transition-colors min-h-[44px] inline-flex items-center justify-center py-2">Disclaimer</button>
            <button onClick={() => setShowTerms(true)} className="text-muted-foreground hover:text-primary transition-colors min-h-[44px] inline-flex items-center justify-center py-2">Terms</button>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">© 2026 Zero to Funded by Chiranjivi Anand</p>
          <p className="text-muted-foreground/80 text-[10px] sm:text-xs max-w-lg mx-auto px-2">
            Trading involves risk. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} onAgree={() => setShowTerms(false)} />
    </>
  );
}

// --- FEATURE A: Floating Button ---
// --- FEATURE B: Live Counter ---
function LiveCounter() {
  const [count, setCount] = useState(1734);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 30000); // Every 30s instead of 10s to reduce re-renders
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="mb-12 text-muted-foreground text-sm"
    >
      🔥{" "}
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-primary font-bold inline-block"
        >
          {count.toLocaleString()}
        </motion.span>
      </AnimatePresence>{" "}
      Traders Already Registered
    </motion.div>
  );
}

// --- FEATURE C: Exit Intent Popup ---
function ExitIntentPopup() {
  const reduceMotion = useContext(ReduceMotionContext);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 768 || isInAppBrowser) return;
    try {
      if (sessionStorage.getItem("exit_shown")) return;
    } catch { return; }

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        setShow(true);
        try { sessionStorage.setItem("exit_shown", "1"); } catch {}
        document.removeEventListener("mouseout", handler);
      }
    };
    document.addEventListener("mouseout", handler);
    return () => document.removeEventListener("mouseout", handler);
  }, []);

  const close = () => setShow(false);
  const register = () => {
    close();
    setTimeout(() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduceMotion ? noAnimation : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? noAnimation : { opacity: 0 }}
          transition={reduceMotion ? instantTransition : undefined}
          className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/80 ${isInAppBrowser ? "" : "backdrop-blur-sm"} px-6`}
          onClick={close}
        >
          <motion.div
            initial={reduceMotion ? noAnimation : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduceMotion ? noAnimation : { scale: 0.9, opacity: 0 }}
            transition={reduceMotion ? instantTransition : undefined}
            className="glass-card rounded-xl border-2 border-primary/50 p-10 max-w-md w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={close} className="absolute top-4 right-4 text-muted-foreground hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-white mb-3">Wait! You Could Win $5,000</h3>
            <p className="text-muted-foreground mb-6">
              Register for the free masterclass before slots run out.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                onClick={register}
              >
                Register Now
              </Button>
              <button onClick={close} className="text-muted-foreground text-sm hover:text-white transition-colors">
                No thanks
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Page ---
const Index = () => {
  const reduceMotion = useReducedMotion();
  return (
    <ReduceMotionContext.Provider value={reduceMotion}>
      <div className="min-h-screen bg-background">
        {/* Skip link: visible on focus for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:w-auto focus:h-auto focus:m-0 focus:overflow-visible focus:[clip:auto]"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
        <Hero />
        <WhatIsSection />
        <MasterclassSection />
        <LearnSection />
        <CompetitionSection />
        <HallOfWinners />
        <HowToRegister />
        <ScarcityBar />
        
        <FAQSection />
        <AboutSection />
        <TestimonialsSection />
        <PartnersSection />
        <FinalCTA />
      </main>
      <Footer />
      <ExitIntentPopup />
      </div>
    </ReduceMotionContext.Provider>
  );
};

export default Index;
