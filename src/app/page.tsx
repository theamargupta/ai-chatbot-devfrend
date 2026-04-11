import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">AI</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Devfrend</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/demo">Demo</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient orb */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-28 text-center sm:pb-32 sm:pt-36">
          <Badge variant="secondary" className="mb-6">
            Now in public beta
          </Badge>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            AI Customer Support That
            <br />
            <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Actually Knows Your Business
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Add an AI chatbot to your website in 2 minutes. Trained on your content.
            Answers customers 24/7.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-11 px-6 text-base" asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRightIcon className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-11 px-6 text-base" asChild>
              <Link href="/demo">See Demo</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground/70">No credit card required</p>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to smarter support
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Upload your content",
                description:
                  "PDFs, website pages, FAQs — your chatbot learns from your business content.",
              },
              {
                step: "02",
                title: "Customize & embed",
                description:
                  "Match your brand colors. Copy one line of code to your website.",
              },
              {
                step: "03",
                title: "Customers get instant answers",
                description:
                  "24/7 support powered by AI. Grounded in YOUR content, not generic responses.",
              },
            ].map((item) => (
              <div key={item.step} className="group relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card text-lg font-bold text-muted-foreground transition-colors group-hover:border-primary/50 group-hover:text-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for AI support
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Trained on your content",
                description:
                  "RAG pipeline ensures accurate, grounded answers from your documents — not hallucinated responses.",
              },
              {
                title: "One-line embed",
                description:
                  "Single script tag. Works on any website — React, WordPress, Shopify, static HTML. Under 4KB gzipped.",
              },
              {
                title: "Custom branding",
                description:
                  "Colors, logo, welcome message — the widget looks and feels like part of your site.",
              },
              {
                title: "Lead capture",
                description:
                  "Collect customer emails before or during chat. Pipe leads to your CRM automatically.",
              },
              {
                title: "Human escalation",
                description:
                  "Seamless handoff to your team when the AI can't help. Customers never feel stuck.",
              },
              {
                title: "Conversation analytics",
                description:
                  "View all chats, track popular questions, and find gaps in your knowledge base.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 bg-muted/30 ring-border/50 transition-colors hover:ring-border">
                <CardHeader>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WIDGET DEMO ===== */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              See it in action
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Your customers will love it
            </h2>
          </div>

          <div className="mx-auto mt-16 max-w-sm">
            <WidgetMockup />
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {/* Free */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Free</CardTitle>
                <CardDescription>Get started with the basics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <PricingFeature>1 chatbot</PricingFeature>
                  <PricingFeature>50 messages / day</PricingFeature>
                  <PricingFeature>10 documents</PricingFeature>
                  <PricingFeature>Community support</PricingFeature>
                </ul>
              </CardContent>
              <CardFooter className="border-0 bg-transparent px-4 pb-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Pro — highlighted */}
            <Card className="relative ring-2 ring-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Pro</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <PricingFeature>5 chatbots</PricingFeature>
                  <PricingFeature>Unlimited messages</PricingFeature>
                  <PricingFeature>100 documents</PricingFeature>
                  <PricingFeature>Custom branding</PricingFeature>
                  <PricingFeature>Lead capture</PricingFeature>
                  <PricingFeature>Priority support</PricingFeature>
                </ul>
              </CardContent>
              <CardFooter className="border-0 bg-transparent px-4 pb-4">
                <Button className="w-full" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enterprise</CardTitle>
                <CardDescription>For large-scale operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <PricingFeature>Unlimited chatbots</PricingFeature>
                  <PricingFeature>Unlimited messages</PricingFeature>
                  <PricingFeature>Unlimited documents</PricingFeature>
                  <PricingFeature>SSO / SAML</PricingFeature>
                  <PricingFeature>Dedicated support</PricingFeature>
                  <PricingFeature>SLA guarantee</PricingFeature>
                </ul>
              </CardContent>
              <CardFooter className="border-0 bg-transparent px-4 pb-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="mailto:hello@devfrend.com">Contact Us</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your customer support?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join businesses using Devfrend to deliver instant, accurate answers to their customers around the clock.
          </p>
          <div className="mt-10">
            <Button size="lg" className="h-11 px-8 text-base" asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRightIcon className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground/70">No credit card required</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Devfrend. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/demo" className="transition-colors hover:text-foreground">
              Demo
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <a
              href="https://github.com/theamargupta"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ===== Sub-components ===== */

function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <CheckIcon className="size-4 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  );
}

function WidgetMockup() {
  const messages = [
    {
      role: "bot" as const,
      text: "Hi! I'm your AI assistant. How can I help you today?",
    },
    {
      role: "user" as const,
      text: "What pricing plans do you offer?",
    },
    {
      role: "bot" as const,
      text: "We offer three plans: Free ($0/mo) for small projects, Pro ($29/mo) with unlimited messages and custom branding, and Enterprise with custom pricing for large teams. Would you like more details on any plan?",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
      {/* Widget header */}
      <div className="flex items-center gap-2.5 border-b border-border bg-primary px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
          <span className="text-xs font-bold text-primary-foreground">AI</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-foreground">Devfrend Support</p>
          <p className="text-xs text-primary-foreground/70">Typically replies instantly</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md bg-muted text-foreground"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
            <span className="block h-1.5 w-1.5 animate-dot-pulse rounded-full bg-muted-foreground" />
            <span className="block h-1.5 w-1.5 animate-dot-pulse rounded-full bg-muted-foreground [animation-delay:0.2s]" />
            <span className="block h-1.5 w-1.5 animate-dot-pulse rounded-full bg-muted-foreground [animation-delay:0.4s]" />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <span className="flex-1 text-sm text-muted-foreground">Type a message...</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-3.5 text-primary-foreground"
            >
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
