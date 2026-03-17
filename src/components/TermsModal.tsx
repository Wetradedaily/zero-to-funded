import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: "By registering for the Zero to Funded competition, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree, please do not register.",
  },
  {
    title: "About Zero to Funded",
    body: "Zero to Funded is a trading competition and educational platform created by Chiranjivi Anand, in partnership with Funded Friday (Official Prop Firm Partner), and powered by the Bullrush trading platform.",
  },
  {
    title: "Eligibility",
    body: "Participants must be at least 18 years of age, legally permitted to engage in simulated trading activities, and must hold an active Bullrush account to participate in the competition.",
  },
  {
    title: "Registration Rules",
    body: "Your Bullrush username must exactly match the full name provided in the registration form. Any mismatch between your Bullrush username and the registration form name will result in immediate disqualification. This is a critical and non-negotiable rule.",
    warning: true,
  },
  {
    title: "Competition Rules",
    body: "The use of bots, automated trading systems, copy trading, or any form of collusion is strictly prohibited. All trades must be executed manually within the official competition window. Any violation will result in disqualification.",
  },
  {
    title: "Prize & Funded Account",
    body: "The top 30 traders on the final leaderboard will each receive a $5,000 funded trading account. Prizes are non-transferable and non-exchangeable for cash. Winners must respond and claim their prize within 7 days of announcement.",
  },
  {
    title: "Masterclass Terms",
    body: "The masterclass is provided for educational purposes only. Recording, redistribution, or commercial use of the masterclass content is strictly prohibited without prior written consent from Chiranjivi Anand.",
  },
  {
    title: "Bullrush Platform",
    body: "Zero to Funded is not responsible for any technical outages, errors, or disruptions on the Bullrush platform. Any issues related to the Bullrush platform should be directed to Bullrush support.",
  },
  {
    title: "Disqualification",
    body: "Providing false information, username mismatch, use of bots or automated systems, market manipulation, abusive behavior, or any form of cheating will result in immediate and permanent disqualification from the competition.",
  },
  {
    title: "Intellectual Property",
    body: "All content, branding, materials, and educational resources associated with Zero to Funded are the intellectual property of Chiranjivi Anand and Zero to Funded. Unauthorized reproduction or distribution is prohibited.",
  },
  {
    title: "Limitation of Liability",
    body: "Trading involves significant risk and is not suitable for all individuals. Zero to Funded does not provide financial advice. Participation in the competition is at your own risk, and Zero to Funded shall not be liable for any financial losses.",
  },
  {
    title: "Privacy & Data",
    body: "We collect your name, email address, phone number, and Bullrush username for competition purposes only. Your data will not be sold to third parties. Winners' names and rankings may be publicly displayed on our website and social media channels.",
  },
  {
    title: "Community Conduct",
    body: "Participants must maintain respectful behavior in all community channels. Harassment, spam, hate speech, or promotion of competing services in our Telegram or other community platforms will result in removal.",
  },
  {
    title: "Changes to Terms",
    body: "Zero to Funded reserves the right to update or modify these Terms & Conditions at any time. Any changes will be communicated via our official Telegram channel and website.",
  },
  {
    title: "Contact Us",
    body: "For questions or concerns, reach out to us via our official Telegram channel, Instagram (@thechiruanand), or through the Zero to Funded website.",
  },
];

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function TermsModal({ open, onClose, onAgree }: TermsModalProps) {
  const [checked, setChecked] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setChecked(false);
      setScrolledToBottom(false);
      setScrollProgress(0);
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const progress = scrollHeight - clientHeight > 0 ? scrollTop / (scrollHeight - clientHeight) : 1;
    setScrollProgress(Math.min(progress, 1));
    if (progress >= 0.95) setScrolledToBottom(true);
  }, []);

  const canAgree = checked && scrolledToBottom;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-[680px] max-h-[85vh] md:max-h-[85vh] h-full md:h-auto flex flex-col rounded-none md:rounded-[20px] overflow-hidden border border-[rgba(245,166,35,0.3)] shadow-[0_0_40px_rgba(245,166,35,0.1)]"
            style={{ background: "#0A0A0A" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER - sticky */}
            <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-primary/20" style={{ background: "#0A0A0A" }}>
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary" size={20} />
                <span className="text-lg font-bold text-white">
                  Zero to <span className="text-primary">Funded</span>
                </span>
              </div>
              <div className="text-center flex-1 hidden sm:block">
                <p className="text-white font-semibold text-sm">Terms & Conditions</p>
                <p className="text-[#888888] text-xs">Please read before registering</p>
              </div>
              <button
                onClick={onClose}
                className="text-[#888888] hover:text-primary transition-colors p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scroll progress bar */}
            <div className="shrink-0 h-[2px] bg-white/5">
              <div
                className="h-full bg-primary transition-all duration-150 ease-out"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>

            {/* CONTENT - scrollable */}
            <div
              ref={contentRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(245,166,35,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.03) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            >
              {SECTIONS.map((section, i) => (
                <div
                  key={i}
                  className={`border-l-2 pl-4 ${
                    section.warning
                      ? "border-amber-500 bg-amber-500/[0.06] rounded-r-lg p-4 pl-4"
                      : "border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-primary font-bold text-xs bg-primary/10 rounded-md px-2 py-0.5 font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-white font-bold text-sm">{section.title}</h3>
                  </div>
                  {section.warning && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                      ⚠️ Critical Rule — Name mismatch = disqualification
                    </div>
                  )}
                  <p className="text-[#BBBBBB] text-sm leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>

            {/* FOOTER - sticky */}
            <div className="shrink-0 px-6 py-4 border-t border-primary/20 space-y-3" style={{ background: "#0A0A0A" }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded border-2 border-white/20 peer-checked:border-primary peer-checked:bg-primary transition-all duration-200 flex items-center justify-center">
                      {checked && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path d="M2 6L5 9L10 3" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[#E8E8E8] text-xs sm:text-sm">
                    I have read and agree to the Terms & Conditions
                  </span>
                </label>

                {/* Buttons */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="rounded-lg border-white/10 text-[#888888] hover:text-white hover:bg-white/5 flex-1 sm:flex-initial"
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    disabled={!canAgree}
                    onClick={onAgree}
                    className={`rounded-lg font-bold flex-1 sm:flex-initial transition-all duration-300 ${
                      canAgree
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(245,166,35,0.3)] animate-pulse"
                        : "bg-white/10 text-white/30 cursor-not-allowed"
                    }`}
                  >
                    I Agree & Continue
                  </Button>
                </div>
              </div>

              <p className="text-center text-[#888888] text-xs flex items-center justify-center gap-1.5">
                <Lock size={12} /> Your data is safe. We never sell your information.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
