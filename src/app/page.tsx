"use client";

import Link from "next/link";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
  useSpring,
  useInView,
  animate,
  useMotionValueEvent,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  ICONS                                                              */
/* ------------------------------------------------------------------ */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className ?? "size-4"}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className ?? "size-4"}
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  ANIMATION PRESETS                                                   */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.2 } },
};

const springTransition = { type: "spring" as const, damping: 20, stiffness: 100 };

/* ------------------------------------------------------------------ */
/*  NAVBAR                                                              */
/* ------------------------------------------------------------------ */

function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
            <span className="text-sm font-bold text-white">AI</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            Devfrend
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-white">
            How it Works
          </a>
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-white">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-white/60 transition-colors hover:text-white md:block"
          >
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-5 text-sm font-medium text-white transition-shadow hover:shadow-lg hover:shadow-purple-500/25"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}

/* ------------------------------------------------------------------ */
/*  SCROLL PROGRESS BAR                                                 */
/* ------------------------------------------------------------------ */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  HERO 3D WIDGET MOCKUP                                               */
/* ------------------------------------------------------------------ */

function Hero3DWidget() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), springTransition);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), springTransition);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const messages = [
    { role: "bot" as const, text: "Hi! How can I help you today?" },
    { role: "user" as const, text: "What plans do you offer?" },
    {
      role: "bot" as const,
      text: "We have Free, Pro ($29/mo), and Enterprise plans. Want details?",
    },
  ];

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
      className="relative hidden lg:block"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="relative w-[340px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-purple-500/10 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-white/10 bg-gradient-to-r from-purple-500/80 to-blue-500/80 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <span className="text-xs font-bold text-white">AI</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Devfrend Support</p>
            <p className="text-xs text-white/60">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-3 p-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.3, ...springTransition }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-md bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : "rounded-bl-md border border-white/10 bg-white/5 text-white/90"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3">
              <span className="block h-1.5 w-1.5 animate-dot-pulse rounded-full bg-white/50" />
              <span className="block h-1.5 w-1.5 animate-dot-pulse rounded-full bg-white/50 [animation-delay:0.2s]" />
              <span className="block h-1.5 w-1.5 animate-dot-pulse rounded-full bg-white/50 [animation-delay:0.4s]" />
            </div>
          </motion.div>
        </div>

        {/* Input */}
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <span className="flex-1 text-sm text-white/30">Type a message...</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-3.5 text-white"
              >
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ANIMATED PRICE COUNTER                                              */
/* ------------------------------------------------------------------ */

function AnimatedPrice({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 1.5, ease: "easeOut" });
    }
  }, [isInView, count, value]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = `$${v}`;
    });
    return unsubscribe;
  }, [rounded]);

  return <span ref={ref}>$0</span>;
}

/* ------------------------------------------------------------------ */
/*  SECTION: HERO                                                       */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, 80, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute bottom-1/4 left-1/3 h-[450px] w-[450px] rounded-full bg-pink-500/15 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl items-center gap-16 px-6">
        {/* Left: Text */}
        <div className="max-w-2xl">
          {/* Pill badge */}
          <div className="animate-hero-fade-in-up">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Now in public beta
            </motion.span>
          </div>

          {/* Hero heading */}
          <h1
            className="animate-hero-fade-in-up mt-8 text-5xl leading-[1.05] font-bold tracking-[-0.02em] text-white md:text-7xl"
            style={{ animationDelay: "0.1s" }}
          >
            AI Customer Support
          </h1>
          <h1
            className="animate-hero-fade-in-up text-5xl leading-[1.05] font-bold tracking-[-0.02em] md:text-7xl"
            style={{ animationDelay: "0.25s" }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              That Actually Knows
            </span>
          </h1>
          <h1
            className="animate-hero-fade-in-up text-5xl leading-[1.05] font-bold tracking-[-0.02em] text-white md:text-7xl"
            style={{ animationDelay: "0.4s" }}
          >
            Your Business
          </h1>

          {/* Subtitle */}
          <p
            className="animate-hero-fade-in-up mt-6 max-w-lg text-lg leading-relaxed text-white/50"
            style={{ animationDelay: "0.55s" }}
          >
            Add an intelligent chatbot to your website in 2 minutes. Trained on
            your content. Answers customers 24/7. No coding required.
          </p>

          {/* CTAs */}
          <div
            className="animate-hero-fade-in-up mt-10 flex flex-col gap-4 sm:flex-row"
            style={{ animationDelay: "0.7s" }}
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 text-base font-medium text-white shadow-lg shadow-purple-500/25 transition-shadow hover:shadow-xl hover:shadow-purple-500/30"
              >
                Start Building Free
                <ArrowRightIcon className="size-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/demo"
                className="inline-flex h-12 items-center rounded-full border border-white/10 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                See Demo
              </Link>
            </motion.div>
          </div>

          {/* Trust badges */}
          <div
            className="animate-hero-fade-in-up mt-12 flex flex-wrap gap-8 text-sm text-white/30"
            style={{ animationDelay: "0.85s" }}
          >
            <span>500+ businesses powered</span>
            <span>Answers from YOUR content</span>
            <span>Setup in 2 minutes</span>
          </div>
        </div>

        {/* Right: 3D Widget */}
        <Hero3DWidget />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: HOW IT WORKS                                               */
/* ------------------------------------------------------------------ */

const steps = [
  {
    step: "01",
    title: "Upload your content",
    description:
      "PDFs, website pages, FAQs — your chatbot learns from your business content.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Customize & embed",
    description:
      "Match your brand colors. Copy one line of code to your website.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Customers get instant answers",
    description:
      "24/7 support powered by AI. Grounded in YOUR content, not generic responses.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 1, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={springTransition}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
            Three steps to smarter support
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3" style={{ perspective: "1000px" }}>
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 1, y: 50, rotateY: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ ...springTransition, delay: i * 0.2 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 ring-1 ring-white/10">
                {item.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/20">
                Step {item.step}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: FEATURES (Bento Grid)                                      */
/* ------------------------------------------------------------------ */

const features = [
  {
    title: "RAG-Powered Answers",
    description:
      "Retrieval-augmented generation ensures accurate, grounded answers from your documents — not hallucinated responses.",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    title: "One-Line Embed",
    description:
      "Single script tag. Works on any website — React, WordPress, Shopify, static HTML. Under 4KB gzipped.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Custom Branding",
    description:
      "Colors, logo, welcome message — the widget looks and feels like part of your site.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Lead Capture",
    description:
      "Collect customer emails before or during chat. Pipe leads to your CRM automatically.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Human Escalation",
    description:
      "Seamless handoff to your team when the AI can't help. Customers never feel stuck.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Conversation Analytics",
    description:
      "View all chats, track popular questions, and find gaps in your knowledge base.",
    gradient: "from-indigo-500 to-purple-500",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 1, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={springTransition}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
            Everything you need for AI support
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3" style={{ perspective: "1000px" }}>
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 1, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ ...springTransition, delay: i * 0.1 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg transition-shadow hover:shadow-xl hover:shadow-purple-500/5"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} opacity-80`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: WIDGET DEMO                                                */
/* ------------------------------------------------------------------ */

function WidgetDemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [8, -8]);
  const rotateXSpring = useSpring(rotateX, springTransition);

  const demoMessages = [
    { role: "bot" as const, text: "Hi! I'm your AI assistant. How can I help?" },
    { role: "user" as const, text: "Do you offer a free trial?" },
    {
      role: "bot" as const,
      text: "Yes! Our Free plan includes 50 messages/day and 10 documents. No credit card required to start.",
    },
  ];

  return (
    <section className="relative py-24 md:py-32" ref={ref}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left: text */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p
            variants={fadeInUp}
            transition={springTransition}
            className="text-sm font-semibold uppercase tracking-widest text-purple-400"
          >
            See it in action
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            transition={{ ...springTransition, delay: 0.1 }}
            className="mt-3 text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl"
          >
            Your customers will love it
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ ...springTransition, delay: 0.2 }}
            className="mt-4 text-lg leading-relaxed text-white/50"
          >
            A beautiful, intelligent chat widget that feels native to your site.
            Powered by your content, it answers questions accurately and
            instantly.
          </motion.p>
          <motion.ul
            variants={fadeInUp}
            transition={{ ...springTransition, delay: 0.3 }}
            className="mt-6 space-y-3 text-sm text-white/50"
          >
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-purple-400" />
              Trained on your documents and FAQs
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-purple-400" />
              Customizable to match your brand
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-purple-400" />
              Embed with a single line of code
            </li>
          </motion.ul>
        </motion.div>

        {/* Right: 3D widget */}
        <div style={{ perspective: "1000px" }} className="flex justify-center">
          <motion.div
            style={{ rotateX: rotateXSpring }}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-purple-500/10 backdrop-blur-xl"
          >
            {/* Widget header */}
            <div className="flex items-center gap-2.5 border-b border-white/10 bg-gradient-to-r from-purple-500/80 to-blue-500/80 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Devfrend Support</p>
                <p className="text-xs text-white/60">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-3 p-4">
              {demoMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.3, ...springTransition }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        : "rounded-bl-md border border-white/10 bg-white/5 text-white/90"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: 1 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3">
                  <span className="block h-1.5 w-1.5 animate-dot-pulse rounded-full bg-white/50" />
                  <span className="block h-1.5 w-1.5 animate-dot-pulse rounded-full bg-white/50 [animation-delay:0.2s]" />
                  <span className="block h-1.5 w-1.5 animate-dot-pulse rounded-full bg-white/50 [animation-delay:0.4s]" />
                </div>
              </motion.div>
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="flex-1 text-sm text-white/30">Type a message...</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-3.5 text-white"
                  >
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: PRICING                                                    */
/* ------------------------------------------------------------------ */

interface IPricingTier {
  name: string;
  description: string;
  price: number | null;
  priceLabel?: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

const pricingTiers: IPricingTier[] = [
  {
    name: "Free",
    description: "Get started with the basics",
    price: 0,
    features: [
      "1 chatbot",
      "50 messages / day",
      "10 documents",
      "Community support",
    ],
    cta: "Get Started",
    href: "/login",
  },
  {
    name: "Pro",
    description: "For growing businesses",
    price: 29,
    features: [
      "5 chatbots",
      "Unlimited messages",
      "100 documents",
      "Custom branding",
      "Lead capture",
      "Priority support",
    ],
    cta: "Get Started",
    href: "/login",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale operations",
    price: null,
    priceLabel: "Custom",
    features: [
      "Unlimited chatbots",
      "Unlimited messages",
      "Unlimited documents",
      "SSO / SAML",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "Contact Us",
    href: "mailto:hello@devfrend.com",
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 1, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={springTransition}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 1, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ ...springTransition, delay: i * 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative rounded-2xl border p-8 backdrop-blur-lg ${
                tier.highlighted
                  ? "scale-[1.02] border-purple-500/50 bg-white/[0.08] shadow-xl shadow-purple-500/10 sm:scale-105"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Rotating gradient border for highlighted */}
              {tier.highlighted && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl">
                  <div className="absolute inset-[-1px] animate-[spin_8s_linear_infinite] rounded-2xl bg-[conic-gradient(from_0deg,transparent,rgba(168,85,247,0.4),transparent,rgba(59,130,246,0.4),transparent)] opacity-50" />
                  <div className="absolute inset-[1px] rounded-[14px] bg-[#0d0d0d]" />
                </div>
              )}

              <div className="relative">
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <p className="mt-1 text-sm text-white/40">{tier.description}</p>

                <div className="mt-6 mb-8">
                  <span className="text-4xl font-bold text-white">
                    {tier.price !== null ? (
                      <AnimatedPrice value={tier.price} />
                    ) : (
                      tier.priceLabel
                    )}
                  </span>
                  {tier.price !== null && (
                    <span className="text-sm text-white/40">/month</span>
                  )}
                </div>

                <ul className="space-y-3 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <CheckIcon className="size-4 shrink-0 text-purple-400" />
                      <span className="text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-8"
                >
                  <Link
                    href={tier.href}
                    className={`flex h-11 w-full items-center justify-center rounded-full text-sm font-medium transition-shadow ${
                      tier.highlighted
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: FINAL CTA                                                  */
/* ------------------------------------------------------------------ */

function FinalCTASection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 1, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springTransition}
          className="text-3xl font-bold tracking-[-0.02em] sm:text-5xl"
        >
          <span
            className="animate-gradient-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-[length:200%_auto] bg-clip-text text-transparent"
          >
            Ready to transform your customer support?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...springTransition, delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-lg text-white/50"
        >
          Join businesses using Devfrend to deliver instant, accurate answers
          to their customers around the clock.
        </motion.p>

        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...springTransition, delay: 0.3 }}
          className="mt-10"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Link
              href="/login"
              className="inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-10 text-base font-medium text-white shadow-lg shadow-purple-500/25 animate-glow-pulse"
            >
              Start Building Free
              <ArrowRightIcon className="size-4" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 }}
          className="mt-4 text-sm text-white/30"
        >
          No credit card required
        </motion.p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-white/30">
          &copy; 2026 Devfrend. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-white/30">
          <Link href="/demo" className="transition-colors hover:text-white">
            Demo
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-white">
            Dashboard
          </Link>
          <a
            href="https://github.com/theamargupta"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <WidgetDemoSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
