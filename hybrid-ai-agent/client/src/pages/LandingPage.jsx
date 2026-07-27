import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Target,
  MessageCircle,
  Globe,
  BarChart3,
  Zap,
  Menu,
  X,
  ArrowRight,
  Play,
  Check,
  ChevronRight,
  Sparkles,
  Shield,
  Clock,
  Users,
  Star,
  Mail,
  Phone,
  Send,
  Calendar,
  CreditCard,
  TrendingUp,
  BotMessageSquare,
  User,
  CircleDot,
  Minimize2,
  Maximize2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
} from "lucide-react";
import {
  FiTarget,
  FiMessageSquare,
  FiGlobe,
  FiBarChart2,
  FiZap,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { SiWhatsapp, SiGmail, SiInstagram, SiFacebook, SiHubspot, SiGooglecalendar } from "react-icons/si";
import { FaLinkedin, FaSlack, FaSalesforce } from "react-icons/fa";
import { MdAutoAwesome, MdBusiness, MdSupportAgent } from "react-icons/md";
import ParticleField from "../components/ParticleField";

function useScrollAnimation(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}

function useCountUp(end, duration = 2000, startOnVisible = false, isVisible = true) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (startOnVisible && !isVisible) return;
    if (hasRun.current) return;
    hasRun.current = true;

    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, startOnVisible, isVisible]);

  return count;
}

function AnimatedSection({ children, className = "", delay = 0 }) {
  const [ref, isVisible] = useScrollAnimation(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#how-it-works" },
    { label: "Docs", href: "#integrations" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-base-100/70 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-base-300/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Lmina AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-base-content/70 hover:text-base-content rounded-lg hover:bg-base-200/50 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-base-content/70 hover:text-base-content rounded-lg hover:bg-base-200/50 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-base-200/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-base-100/95 backdrop-blur-xl border-t border-base-300/30">
          <div className="px-4 py-4 space-y-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium text-base-content/70 hover:text-base-content rounded-lg hover:bg-base-200/50 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                className="px-4 py-3 text-sm font-medium text-center text-base-content/70 rounded-lg border border-base-300/50 hover:bg-base-200/50 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-3 text-sm font-semibold text-center text-white rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const [ref, isVisible] = useScrollAnimation(0.1);

  const stats = [
    { label: "Leads Generated", value: 10, suffix: "K+" },
    { label: "Messages Sent", value: 50, suffix: "K+" },
    { label: "Uptime", value: 99.9, suffix: "%", isFloat: true },
    { label: "Businesses", value: 500, suffix: "+" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" ref={ref}>
      <style>{`
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(80px, -60px) scale(1.1); }
          50% { transform: translate(-40px, -120px) scale(0.95); }
          75% { transform: translate(-80px, -40px) scale(1.05); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-100px, 50px) scale(0.9); }
          50% { transform: translate(60px, 100px) scale(1.1); }
          75% { transform: translate(100px, -30px) scale(1); }
        }
        @keyframes float-orb-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, 80px) scale(1.15); }
          66% { transform: translate(-80px, -60px) scale(0.9); }
        }
        @keyframes float-orb-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(-60px, -80px) scale(1.05); }
          40% { transform: translate(40px, 40px) scale(0.95); }
          60% { transform: translate(80px, -40px) scale(1.1); }
          80% { transform: translate(-40px, 60px) scale(1); }
        }
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.2; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
        @keyframes message-appear {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.3); }
          50% { box-shadow: 0 0 40px rgba(168,85,247,0.6), 0 0 60px rgba(34,211,238,0.3); }
        }
        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes gradient-text-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          style={{ animation: "float-orb-1 18s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
          style={{ animation: "float-orb-2 22s ease-in-out infinite" }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl"
          style={{ animation: "float-orb-3 16s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl"
          style={{ animation: "float-orb-4 20s ease-in-out infinite" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          animation: "grid-move 4s linear infinite",
        }}
      />

      <ParticleField count={40} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(40px)",
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Powered by Advanced AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="block text-base-content">The Future of</span>
              <span
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
                style={{
                  backgroundSize: "200% auto",
                  animation: "gradient-text-flow 4s ease infinite",
                }}
              >
                AI-Powered Business
              </span>
              <span className="block text-base-content">Communication</span>
            </h1>

            <p className="text-lg text-base-content/60 mb-8 max-w-xl leading-relaxed">
              Generate leads, engage clients across WhatsApp, Email & Web — all with one intelligent AI agent that works like a human.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-base-content rounded-2xl border-2 border-base-300/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <StatCounter key={stat.label} {...stat} isVisible={isVisible} delay={i * 0.1} />
              ))}
            </div>
          </div>

          {/* Right: Chat mockup card */}
          <div
            className="relative"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
              transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
            }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-base-300/30 bg-base-200/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10" style={{ animation: "pulse-glow 4s ease-in-out infinite" }}>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-base-300/30 bg-base-100/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <BotMessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-base-content">Lmina AI Agent</p>
                    <p className="text-[10px] text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-5 space-y-4 min-h-[300px]">
                <ChatMessage
                  type="user"
                  message="Hi! I'm interested in your enterprise plan. Can you tell me more?"
                  delay={0.5}
                  isVisible={isVisible}
                />
                <ChatMessage
                  type="ai"
                  message="Hello! I'd be happy to help you with our Enterprise plan. It includes unlimited messaging, up to 50 AI agents, priority support, and custom integrations. What specific features are most important for your business?"
                  delay={2}
                  isVisible={isVisible}
                />
                <ChatMessage
                  type="user"
                  message="We need WhatsApp integration and lead scoring. Do you support that?"
                  delay={4}
                  isVisible={isVisible}
                />
                <ChatMessage
                  type="ai"
                  message="Absolutely! Our AI agent integrates natively with WhatsApp, and includes intelligent lead scoring that automatically qualifies and prioritizes your leads. Would you like me to schedule a demo call?"
                  delay={5.5}
                  isVisible={isVisible}
                />
                <TypingIndicator delay={7} isVisible={isVisible} />
              </div>
            </div>

            {/* Floating decorative elements */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl border border-purple-500/20 backdrop-blur-sm flex items-center justify-center hidden lg:flex"
              style={{ animation: "float-orb-2 8s ease-in-out infinite" }}
            >
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
            <div
              className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-xl border border-cyan-500/20 backdrop-blur-sm flex items-center justify-center hidden lg:flex"
              style={{ animation: "float-orb-3 10s ease-in-out infinite" }}
            >
              <Target className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCounter({ label, value, suffix, isFloat, isVisible, delay }) {
  const count = useCountUp(isFloat ? 999 : value, 2000, true, isVisible);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.5 + delay}s`,
      }}
    >
      <div className="text-2xl font-bold text-base-content">
        {isFloat ? "99.9" : count.toLocaleString()}
        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{suffix}</span>
      </div>
      <div className="text-xs text-base-content/50 mt-1">{label}</div>
    </div>
  );
}

function ChatMessage({ type, message, delay, isVisible }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setShow(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay, isVisible]);

  if (!show) return null;

  return (
    <div
      className={`flex ${type === "user" ? "justify-end" : "justify-start"}`}
      style={{ animation: "message-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          type === "user"
            ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white rounded-br-md"
            : "bg-base-300/50 text-base-content rounded-bl-md"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

function TypingIndicator({ delay, isVisible }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setShow(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay, isVisible]);

  if (!show) return null;

  return (
    <div className="flex justify-start" style={{ animation: "message-appear 0.4s ease forwards" }}>
      <div className="bg-base-300/50 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-base-content/40"
            style={{ animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI Chat Agent",
      description: "Human-like conversations across multiple channels with context-aware AI that understands your business.",
      gradient: "from-purple-500 to-indigo-500",
      delay: 0,
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Lead Generation",
      description: "Automatically scrape and qualify leads from Google, LinkedIn, and websites with intelligent scoring.",
      gradient: "from-cyan-500 to-blue-500",
      delay: 0.1,
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Real-Time Chat",
      description: "Instant messaging with typing indicators, read receipts, and rich media sharing built-in.",
      gradient: "from-pink-500 to-rose-500",
      delay: 0.2,
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Channel",
      description: "WhatsApp, Email, LinkedIn, Instagram, Facebook — all unified in one intelligent inbox.",
      gradient: "from-emerald-500 to-teal-500",
      delay: 0.3,
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Market Intelligence",
      description: "Track competitors, monitor trends, and get AI-powered market insights in real-time.",
      gradient: "from-amber-500 to-orange-500",
      delay: 0.4,
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Smart Automation",
      description: "Automated workflows for outreach, follow-ups, and lead nurturing that never sleeps.",
      gradient: "from-violet-500 to-purple-500",
      delay: 0.5,
    },
  ];

  return (
    <section id="features" className="relative py-24 lg:py-32">
      <style>{`
        @keyframes feature-icon-bounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(5deg); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Scale
            </span>
          </h2>
          <p className="text-base-content/60 max-w-2xl mx-auto text-lg">
            A complete AI-powered platform to manage leads, automate conversations, and grow your business.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={feature.delay}>
              <FeatureCard {...feature} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, gradient }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative p-6 rounded-2xl bg-base-200/50 border border-base-300/30 backdrop-blur-sm transition-all duration-500 hover:bg-base-200/80 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-lg transition-transform duration-500 ${
          hovered ? "scale-110 rotate-3" : ""
        }`}
        style={hovered ? { animation: "feature-icon-bounce 0.6s ease" } : {}}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold text-base-content mb-2">{title}</h3>
      <p className="text-sm text-base-content/60 leading-relaxed">{description}</p>
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 pointer-events-none`}
        style={{ opacity: hovered ? 0.03 : 0 }}
      />
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: <Globe className="w-7 h-7" />,
      title: "Connect",
      description: "Link your business tools, CRM, and communication channels in minutes.",
    },
    {
      number: "02",
      icon: <Bot className="w-7 h-7" />,
      title: "Configure",
      description: "Train your AI agent with your business knowledge, policies, and brand voice.",
    },
    {
      number: "03",
      icon: <Zap className="w-7 h-7" />,
      title: "Automate",
      description: "Let your AI agent handle leads, support, and sales 24/7 on autopilot.",
    },
  ];

  const [lineRef, lineVisible] = useScrollAnimation(0.3);

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 bg-base-200/30">
      <style>{`
        @keyframes draw-line {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes step-number-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content mb-4">
            Three Steps to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Growth
            </span>
          </h2>
          <p className="text-base-content/60 max-w-2xl mx-auto text-lg">
            Get up and running in minutes, not months. Our simple setup process gets your AI agent working instantly.
          </p>
        </AnimatedSection>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2" ref={lineRef}>
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500"
              style={{
                width: lineVisible ? "100%" : "0%",
                transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <AnimatedSection key={step.number} delay={i * 0.2}>
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center mb-6 group"
                    style={
                      lineVisible
                        ? { animation: `step-number-pulse 2s ease-in-out ${i * 0.3}s` }
                        : {}
                    }
                  >
                    <span className="text-3xl font-black bg-gradient-to-br from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white mb-4 shadow-lg">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-base-content mb-3">{step.title}</h3>
                  <p className="text-sm text-base-content/60 max-w-xs leading-relaxed">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  const [activeMessage, setActiveMessage] = useState(0);
  const [ref, isVisible] = useScrollAnimation(0.2);

  const messages = [
    { type: "customer", name: "Sarah M.", text: "Hi, I need help choosing a plan for my startup.", time: "2:31 PM" },
    { type: "ai", text: "Welcome, Sarah! I'd love to help you find the perfect plan. How large is your team and what channels do you need?", time: "2:31 PM" },
    { type: "customer", text: "We're a team of 8, need WhatsApp and email. Budget is around $100/mo.", time: "2:32 PM" },
    { type: "ai", text: "For your needs, I recommend our Professional plan at $79/mo — it includes unlimited messaging, 5 AI agents, and all channels you need. Shall I set up a demo?", time: "2:32 PM" },
    { type: "customer", text: "That sounds great! Can you book a demo for tomorrow?", time: "2:33 PM" },
    { type: "ai", text: "I've scheduled a demo for tomorrow at 10:00 AM. You'll receive a calendar invite at sarah@startup.com. Is there anything else I can help with?", time: "2:33 PM" },
  ];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  return (
    <section className="relative py-24 lg:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
            <BotMessageSquare className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-400">Live Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content mb-4">
            See Your AI Agent{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          <p className="text-base-content/60 max-w-2xl mx-auto text-lg">
            Watch how Lmina AI handles customer inquiries, qualifies leads, and books meetings — all automatically.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-base-300/30 bg-base-200/80 backdrop-blur-xl shadow-2xl">
              {/* Demo header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-base-300/30 bg-base-100/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <BotMessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-base-content text-sm">Lmina AI Demo</p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      AI Agent Active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-base-300/50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-base-content/50" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-base-300/50 flex items-center justify-center">
                    <MoreHorizontal className="w-4 h-4 text-base-content/50" />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-4 min-h-[350px] max-h-[400px] overflow-y-auto">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      opacity: i <= activeMessage ? 1 : 0,
                      transform: i <= activeMessage ? "translateY(0)" : "translateY(10px)",
                      transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {msg.type === "customer" ? (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-base-content">{msg.name}</span>
                            <span className="text-[10px] text-base-content/40">{msg.time}</span>
                          </div>
                          <div className="bg-base-300/50 text-base-content px-4 py-3 rounded-2xl rounded-tl-md text-sm max-w-md">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1 justify-end">
                            <span className="text-[10px] text-base-content/40">{msg.time}</span>
                            <span className="text-xs font-semibold text-base-content">AI Agent</span>
                          </div>
                          <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/10 text-base-content px-4 py-3 rounded-2xl rounded-tr-md text-sm max-w-md text-left">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating UI elements */}
            <div className="hidden lg:block absolute -right-8 top-12 w-48">
              <FloatingCard
                title="Lead Score"
                value="92/100"
                icon={<Target className="w-4 h-4 text-green-400" />}
                color="green"
                delay={1}
                isVisible={isVisible}
              />
            </div>
            <div className="hidden lg:block absolute -left-8 top-1/3 w-48">
              <FloatingCard
                title="Email Draft"
                value="Meeting Confirmed"
                icon={<Mail className="w-4 h-4 text-blue-400" />}
                color="blue"
                delay={2}
                isVisible={isVisible}
              />
            </div>
            <div className="hidden lg:block absolute -right-8 bottom-12 w-48">
              <FloatingCard
                title="Calendar"
                value="Tomorrow, 10 AM"
                icon={<Calendar className="w-4 h-4 text-purple-400" />}
                color="purple"
                delay={3}
                isVisible={isVisible}
              />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function FloatingCard({ title, value, icon, color, delay, isVisible }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(() => setShow(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay, isVisible]);

  const colorClasses = {
    green: "border-green-500/20 bg-green-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
  };

  return (
    <div
      className={`rounded-xl border ${colorClasses[color]} backdrop-blur-sm p-3 shadow-lg`}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateX(0) scale(1)" : "translateX(20px) scale(0.9)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        animation: show ? `float-orb-2 6s ease-in-out ${delay}s infinite` : "none",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] font-medium text-base-content/60 uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-sm font-bold text-base-content">{value}</p>
    </div>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: 29,
      description: "Perfect for small businesses getting started with AI.",
      features: ["1,000 messages/mo", "500 leads", "1 AI agent", "Email support", "Basic analytics", "WhatsApp integration"],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: 79,
      description: "For growing businesses that need more power.",
      features: ["Unlimited messages", "5,000 leads", "5 AI agents", "Priority support", "Advanced analytics", "All channels", "Custom workflows", "Lead scoring"],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      price: null,
      description: "For large organizations with custom needs.",
      features: ["Everything in Pro", "Unlimited leads", "Unlimited agents", "Dedicated support", "Custom integrations", "SLA guarantee", "On-premise option", "API access", "White-label"],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24 lg:py-32 bg-base-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-base-content/60 max-w-2xl mx-auto text-lg">
            No hidden fees. No surprises. Start free and scale as you grow.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <AnimatedSection key={plan.name} delay={i * 0.15}>
              <div
                className={`relative h-full flex flex-col p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? "bg-base-100 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/10 scale-[1.02]"
                    : "bg-base-200/50 border border-base-300/30 hover:border-purple-500/20 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-base-content mb-2">{plan.name}</h3>
                  <p className="text-sm text-base-content/50">{plan.description}</p>
                </div>

                <div className="mb-8">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-base-content">${plan.price}</span>
                      <span className="text-base-content/50">/mo</span>
                    </div>
                  ) : (
                    <div className="text-5xl font-extrabold text-base-content">Custom</div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.popular
                          ? "bg-gradient-to-br from-purple-500 to-cyan-500"
                          : "bg-base-300/50"
                      }`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-base-content/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block w-full py-3.5 rounded-xl text-center font-semibold transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]"
                      : "bg-base-300/50 text-base-content hover:bg-base-300 border border-base-300/50 hover:border-purple-500/30"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Head of Growth",
      company: "TechFlow Inc.",
      avatar: "SJ",
      gradient: "from-purple-500 to-pink-500",
      quote: "Lmina AI transformed our lead generation completely. We went from manually qualifying leads to having our AI agent handle everything. Our conversion rate increased by 340% in just 2 months.",
      stars: 5,
    },
    {
      name: "Marcus Chen",
      role: "CEO",
      company: "GrowthScale",
      avatar: "MC",
      gradient: "from-cyan-500 to-blue-500",
      quote: "The multi-channel capability is a game-changer. We manage WhatsApp, Email, and LinkedIn conversations from one place, and the AI handles 80% of them autonomously. Incredible technology.",
      stars: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "NovaBrand",
      avatar: "ER",
      gradient: "from-emerald-500 to-teal-500",
      quote: "We replaced three different tools with Lmina AI. The real-time chat, lead scoring, and automated follow-ups work flawlessly. Our team saved 30+ hours per week on customer communication.",
      stars: 5,
    },
  ];

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Star className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              500+ Businesses
            </span>
          </h2>
          <p className="text-base-content/60 max-w-2xl mx-auto text-lg">
            See what our customers have to say about transforming their business with Lmina AI.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 0.15}>
              <div className="h-full p-6 rounded-2xl bg-base-200/50 border border-base-300/30 hover:border-purple-500/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-base-content/70 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-base-300/30">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-base-content">{t.name}</p>
                    <p className="text-xs text-base-content/50">
                      {t.role} at {t.company}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  const [ref, isVisible] = useScrollAnimation(0.1);

  const integrations = [
    { icon: <SiWhatsapp className="w-8 h-8" />, name: "WhatsApp", color: "text-green-400" },
    { icon: <SiGmail className="w-8 h-8" />, name: "Gmail", color: "text-red-400" },
    { icon: <FaLinkedin className="w-8 h-8" />, name: "LinkedIn", color: "text-blue-400" },
    { icon: <SiInstagram className="w-8 h-8" />, name: "Instagram", color: "text-pink-400" },
    { icon: <SiFacebook className="w-8 h-8" />, name: "Facebook", color: "text-blue-500" },
    { icon: <FaSlack className="w-8 h-8" />, name: "Slack", color: "text-purple-400" },
    { icon: <SiHubspot className="w-8 h-8" />, name: "HubSpot", color: "text-orange-400" },
    { icon: <FaSalesforce className="w-8 h-8" />, name: "Salesforce", color: "text-blue-300" },
    { icon: <SiGooglecalendar className="w-8 h-8" />, name: "Calendar", color: "text-cyan-400" },
  ];

  return (
    <section id="integrations" className="relative py-24 lg:py-32 bg-base-200/30" ref={ref}>
      <style>{`
        @keyframes slide-in-left-item {
          0% { opacity: 0; transform: translateX(-40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right-item {
          0% { opacity: 0; transform: translateX(40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Integrations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content mb-4">
            Connect Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Favorite Tools
            </span>
          </h2>
          <p className="text-base-content/60 max-w-2xl mx-auto text-lg">
            Seamlessly integrate with the tools you already use. Set up in minutes, not weeks.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 max-w-4xl mx-auto" ref={ref}>
          {integrations.map((integration, i) => {
            const fromLeft = i < Math.ceil(integrations.length / 2);
            return (
              <div
                key={integration.name}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-base-200/50 border border-base-300/30 hover:border-purple-500/20 hover:bg-base-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group cursor-default"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : fromLeft ? "translateX(-40px)" : "translateX(40px)",
                  transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s`,
                }}
              >
                <div className={`${integration.color} group-hover:scale-110 transition-transform duration-300`}>
                  {integration.icon}
                </div>
                <span className="text-[10px] font-medium text-base-content/50 text-center">{integration.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-cyan-600/10 pointer-events-none" />
      <ParticleField count={20} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <AnimatedSection>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content mb-6">
            Ready to Transform{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Your Business?
            </span>
          </h2>
          <p className="text-lg text-base-content/60 mb-10 max-w-2xl mx-auto">
            Join 500+ businesses already using Lmina AI to automate their customer communication and generate more leads.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold text-white rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 group"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm text-base-content/40 mt-4">No credit card required. Free 14-day trial.</p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Footer() {
  const footerLinks = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#integrations" },
      { label: "Changelog", href: "#" },
    ],
    Company: [
      { label: "About", href: "#how-it-works" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
    Resources: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Status", href: "#" },
      { label: "Community", href: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "GDPR", href: "#" },
      { label: "Security", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-base-300/30 bg-base-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Lmina AI
              </span>
            </Link>
            <p className="text-sm text-base-content/50 mb-6 max-w-xs leading-relaxed">
              The future of AI-powered business communication. Generate leads, engage clients, and automate workflows.
            </p>
            <div className="flex items-center gap-3">
              {["twitter", "github", "linkedin", "youtube"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-base-300/50 flex items-center justify-center text-base-content/50 hover:text-base-content hover:bg-base-300 transition-all duration-200"
                >
                  <span className="text-xs font-bold uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-base-content mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-base-content/50 hover:text-base-content transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-base-300/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-base-content/40">
            © {new Date().getFullYear()} Lmina AI. All rights reserved.
          </p>
          <p className="text-sm text-base-content/40">
            Made with <span className="text-red-400">♥</span> for businesses worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DemoSection />
      <PricingSection />
      <TestimonialsSection />
      <IntegrationsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
