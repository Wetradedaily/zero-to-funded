import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Swords, Trophy, Check, ChevronRight, MessageCircle, Users, Award, GraduationCap, AlertTriangle, ExternalLink, X, Instagram, Send, Menu, TrendingUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import fundedFridayLogo from "@/assets/funded-friday-logo.png";
import wetradedailyLogo from "@/assets/wetradedaily-logo.png";
import chiruPhoto from "@/assets/chiranjivi-anand.jpg";
import TermsModal from "@/components/TermsModal";

// Detect mobile/in-app browser for reduced animations
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
const isInAppBrowser = typeof navigator !== "undefined" && /FBAN|FBAV|Instagram|Line|Snapchat|Twitter|MicroMessenger|WeChat/i.test(navigator.userAgent);
const isLowEndDevice = isMobile || isInAppBrowser;
const GOOGLE_FORM_URL = "https://forms.gle/T9mhUNn4URdkUaqk8";

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
  { label: "Competition", href: "#competition" },
  { label: "Masterclass", href: "#masterclass" },
  { label: "Rules", href: "#rules" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "FAQ", href: "#faq" },
];

function Navbar() {
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
          : `bg-[#0D0D0D] ${isInAppBrowser ? "" : "bg-[#0D0D0D]/80 backdrop-blur-sm"} py-4`
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <button onClick={() => scrollTo("#")} className="flex items-center gap-2 group">
          <TrendingUp className="text-primary" size={24} />
          <span className="text-xl font-bold text-white">
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

        {/* Right side */}
        <div className="flex items-center gap-3">
            <Button
            className="rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(245,166,35,0.4)] hover:scale-105 transition-all duration-300"
            onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })}
          >
            Register Now
          </Button>
          {/* Hamburger */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden overflow-hidden bg-[#0D0D0D]/95 ${isInAppBrowser ? "" : "backdrop-blur-md"} border-t border-white/[0.06]`}
          >
            <div className="flex flex-col px-6 py-4 gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="text-left py-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors border-b border-white/[0.06] last:border-0"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// --- Hero ---
function Hero() {
  const countdown = useCountdown();
  const timeUnits = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Minutes", value: countdown.minutes },
    { label: "Seconds", value: countdown.seconds },
  ];

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20 pb-10 relative overflow-hidden">
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
      <div className="relative z-10 flex flex-col items-center">
        {/* Trust Badge Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 px-5 py-1.5 rounded-full border border-primary/40 bg-primary/[0.08] text-sm text-muted-foreground"
        >
          🚀 Karnataka's Fastest Growing Trader Community
        </motion.div>

        <h1
          className="text-4xl md:text-6xl font-black text-white mb-3"
        >
          Zero to <span className="text-primary">Funded</span>
        </h1>
         <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4"
        >
          Learn Trading. Compete Live. Win a{" "}
          <span className="text-primary font-bold">$5,000 Funded Account.</span>
        </motion.h2>

        {/* Event Dates */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-5"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/[0.06]">
            <span className="text-primary font-bold text-sm">📚 Masterclass:</span>
            <span className="text-white text-sm font-medium">21st & 22nd — 8:00 PM</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/[0.06]">
            <span className="text-primary font-bold text-sm">⚔️ Competition:</span>
            <span className="text-white text-sm font-medium">23rd (Mon) — 11:00 AM</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <Button
            size="lg"
            className="rounded-lg bg-primary text-primary-foreground font-semibold text-base px-8 hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)] transition-all duration-300"
            onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })}
          >
            Register for Free Masterclass <ChevronRight className="ml-1" size={18} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-lg border-white/20 text-white font-semibold text-base px-8 hover:bg-white/10"
            onClick={() => window.open("https://t.me/CHIRUFUNDS", "_blank")}
          >
            <Send size={18} className="mr-2" /> Join Telegram Community
          </Button>
        </motion.div>

        {/* Trust Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mb-3"
        >
          {[
            { emoji: "👥", text: "10,000+ Traders Community" },
            { emoji: "🎓", text: "100+ Students Funded" },
            { emoji: "🧑‍🏫", text: "Live Mentorship" },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{b.emoji}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mb-5 text-sm text-muted-foreground"
        >
          🔥 <span className="text-primary font-bold">855+</span> Traders Already Registered
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          {timeUnits.map((u) => (
            <div
              key={u.label}
              className="flex flex-col items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-xl border border-primary/50 bg-white/5 shadow-[0_0_12px_rgba(245,166,35,0.15)]"
            >
              <span className="text-2xl sm:text-3xl font-bold text-primary animate-pulse">{String(u.value).padStart(2, "0")}</span>
              <span className="text-xs text-muted-foreground mt-1">{u.label}</span>
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
    <section className="py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          What Is <span className="text-primary">Zero to Funded?</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
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
    <section className="py-14 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          What You'll <span className="text-primary">Learn</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
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
    <section className="py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          Competition <span className="text-primary">Details</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {details.map((d, i) => (
              <GlassFloatCard key={d.label} index={i} className="p-5 flex justify-between items-center">
                <span className="text-muted-foreground font-medium">{d.label}</span>
                <span className="text-white font-semibold">{d.value}</span>
              </GlassFloatCard>
            ))}
          </div>
          <GlassFloatCard index={0} className="p-8">
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
  const podium = [
    { rank: 1, medal: "🥇", glow: "shadow-[0_0_30px_rgba(245,166,35,0.3)] border-primary/60" },
    { rank: 2, medal: "🥈", glow: "shadow-[0_0_20px_rgba(192,192,192,0.2)] border-gray-400/40" },
    { rank: 3, medal: "🥉", glow: "shadow-[0_0_20px_rgba(205,127,50,0.2)] border-amber-700/40" },
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
    <section className="py-14 px-6" id="leaderboard">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Hall of <span className="text-primary">Funded Traders</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-2">Top 30 Traders Will Be Featured Here</p>
        <p className="text-sm text-muted-foreground/80 mb-8">
          Win the competition and secure your place on the official Zero to Funded Winners Wall.
        </p>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
          {podium.map((p, i) => (
            <GlassFloatCard key={p.rank} index={i} className={`p-8 border-2 ${p.glow}`}>
              <span className="text-5xl block mb-3">{p.medal}</span>
              <Trophy className="mx-auto text-primary mb-2" size={28} />
              <p className="text-primary font-bold text-sm mb-1">Rank #{p.rank}</p>
              <p className="text-white font-bold text-lg mb-1">Your Name Here</p>
              <p className="text-primary font-semibold text-sm mb-1">$5,000 Funded Account</p>
              <p className="text-muted-foreground text-xs italic">Future Funded Trader</p>
            </GlassFloatCard>
          ))}
        </div>

        {/* Ranks 4-30 */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3"
        >
          {Array.from({ length: 27 }, (_, i) => i + 4).map((rank) => (
            <motion.div
              key={rank}
              variants={item}
              className="animate-card-float rounded-xl p-4 flex flex-col items-center gap-1 bg-white/[0.04] border border-primary/10 backdrop-blur-[12px] transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_12px_rgba(245,166,35,0.15)]"
              style={{ "--float-delay": `${(rank % 6) * 0.5}s` } as React.CSSProperties}
            >
              <span className="text-primary font-bold text-xs">#{rank}</span>
              <span className="text-lg">🏆</span>
              <span className="text-muted-foreground text-[10px]">Reserved</span>
              <span className="text-primary font-bold text-xs">$5,000</span>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-10 text-muted-foreground italic text-sm">
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
    <section className="py-14 px-6" id="rules">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
          How to <span className="text-primary">Register</span>
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
          Follow these simple steps to join the Zero to Funded competition.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-stretch">
              <GlassFloatCard
                index={i}
                className={`flex-1 p-6 relative ${
                  step.warning
                    ? "!border-2 !border-amber-500/50 !bg-amber-500/[0.08] shadow-[0_0_20px_rgba(245,166,35,0.15)]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                    step.warning ? "bg-amber-500 text-black" : "bg-primary text-primary-foreground"
                  }`}>
                    {step.num}
                  </div>
                  <span className="text-2xl">{step.emoji}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{step.desc}</p>
                {step.warning && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                    <AlertTriangle size={12} />
                    Critical Step
                  </div>
                )}
                {step.button && (
                  <Button
                    size="sm"
                    className="rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                    onClick={step.button.action}
                  >
                    {step.button.label} <ExternalLink size={14} className="ml-1" />
                  </Button>
                )}
              </GlassFloatCard>
              {/* Arrow connectors removed for cleaner grid layout */}
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
    <div className="w-full bg-primary py-4 px-6">
      <p className="text-center text-black font-bold text-base md:text-lg">
        <span className="inline-block animate-pulse">⚡</span> Only 200 Competition Slots Available — Register Before They're Gone
      </p>
    </div>
  );
}

// --- SECTION 10: FAQ ---
function FAQSection() {
  const faqs = [
    { q: "Is this really free?", a: "Yes. The masterclass and competition are 100% free to join." },
    { q: "Who can participate?", a: "Any trader in India, from beginner to advanced level." },
    { q: "Do I need trading experience?", a: "No. The masterclass starts from the basics." },
    { q: "What is Bullrush?", a: "Bullrush is the trading competition platform used to rank all participants." },
    { q: "How are winners selected?", a: "Based on trading performance over the 7-day competition on Bullrush." },
    { q: "Why must my username match?", a: "To verify your identity and ensure correct prize distribution." },
  ];

  return (
    <section className="py-14 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          Frequently Asked <span className="text-primary">Questions</span>
        </h2>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass-card rounded-xl border border-white/10 px-6 overflow-hidden"
            >
              <AccordionTrigger className="text-white font-semibold text-left hover:no-underline py-5">
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
    <section className="py-14 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          <span className="text-primary">Chiranjivi Anand</span>
        </h2>
        <div className="flex flex-col items-center text-center gap-6">
          {/* Photo */}
          <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full border-4 border-primary shadow-[0_0_30px_rgba(245,166,35,0.25)] overflow-hidden shrink-0">
            <img src={chiruPhoto} alt="Chiranjivi Anand" width={160} height={160} className="w-full h-full object-cover object-top" />
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
            {[
              { emoji: "🎓", text: "100+ Traders Funded" },
              { emoji: "👥", text: "10,000+ Community" },
              { emoji: "📊", text: "Live Mentorship" },
            ].map((b) => (
              <div key={b.text} className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 text-center">
                <span className="text-xl block mb-1">{b.emoji}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex gap-5">
            <a href="https://t.me/CHIRUFUNDS" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 hover:scale-105 transition-all duration-200">
              <Send size={20} /> <span className="text-sm font-medium">Telegram</span>
            </a>
            <a href="https://www.instagram.com/thechiruanand/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 hover:scale-105 transition-all duration-200">
              <Instagram size={20} /> <span className="text-sm font-medium">Instagram</span>
            </a>
            <a href="https://wa.me/917090000679" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 hover:scale-105 transition-all duration-200">
              <Phone size={20} /> <span className="text-sm font-medium">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Partners Section ---
function PartnersSection() {
  return (
    <section className="py-14 px-6 relative">
      {/* Subtle gold gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" aria-hidden="true" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          In Partnership <span className="text-primary">With</span>
        </h2>

        {/* Gold divider */}
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-8" />

        <div className="grid sm:grid-cols-2 gap-8">
          {/* Card 1: Chiranjivi Anand */}
          <div className="rounded-xl bg-white/[0.03] border-2 border-primary/30 backdrop-blur-[12px] p-8 flex flex-col items-center gap-4 shadow-[0_0_20px_rgba(245,166,35,0.1)] hover:shadow-[0_0_30px_rgba(245,166,35,0.2)] hover:-translate-y-1 transition-all duration-300">
            <img src={wetradedailyLogo} alt="WeTradDaily logo" width={80} height={80} className="w-20 h-20 rounded-full object-contain bg-white/5 p-1" />
            <span className="text-xl font-bold text-white">Chiranjivi Anand</span>
            <span className="text-sm text-muted-foreground">Official Trading Mentor</span>
          </div>

          {/* Card 2: Funded Friday */}
          <div className="rounded-xl bg-white/[0.03] border-2 border-primary/30 backdrop-blur-[12px] p-8 flex flex-col items-center gap-4 shadow-[0_0_20px_rgba(245,166,35,0.1)] hover:shadow-[0_0_30px_rgba(245,166,35,0.2)] hover:-translate-y-1 transition-all duration-300">
            <img src={fundedFridayLogo} alt="Funded Friday logo" width={160} height={64} className="h-16 object-contain" />
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
    <section className="py-14 px-6 bg-white/[0.02]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Don't Miss Your Shot at a <span className="text-primary">$5,000 Funded Account</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-6">
          Free masterclass. Live competition. Real prizes. Limited slots.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="rounded-lg bg-primary text-primary-foreground font-semibold text-base px-8 hover:bg-primary/90"
            onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })}
          >
            Register Now — It's Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-lg border-white/20 text-white font-semibold text-base px-8 hover:bg-white/10"
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
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="https://t.me/CHIRUFUNDS" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Telegram</a>
            <a href="https://www.instagram.com/thechiruanand/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Instagram</a>
            <button onClick={() => setShowTerms(true)} className="text-muted-foreground hover:text-primary transition-colors">Disclaimer</button>
            <button onClick={() => setShowTerms(true)} className="text-muted-foreground hover:text-primary transition-colors">Terms</button>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 Zero to Funded by Chiranjivi Anand</p>
          <p className="text-muted-foreground/80 text-xs max-w-lg mx-auto">
            Trading involves risk. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} onAgree={() => setShowTerms(false)} />
    </>
  );
}

// --- FEATURE A: Floating Button ---
function FloatingRegisterButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > window.innerHeight);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[90] bg-primary text-primary-foreground font-bold px-6 py-3 rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
          onClick={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })}
        >
          Register Free →
        </motion.button>
      )}
    </AnimatePresence>
  );
}

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/80 ${isInAppBrowser ? "" : "backdrop-blur-sm"} px-6`}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <WhatIsSection />
        <LearnSection />
        <CompetitionSection />
        <HallOfWinners />
        <HowToRegister />
        <ScarcityBar />
        
        <FAQSection />
        <AboutSection />
        <PartnersSection />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingRegisterButton />
      <ExitIntentPopup />
      
    </div>
  );
};

export default Index;
