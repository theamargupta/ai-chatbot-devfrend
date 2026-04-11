"use client";

import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense } from "react";

function TestWidgetContent() {
  const searchParams = useSearchParams();
  const embedKey = searchParams.get("embed_key") ?? "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      <div
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "12px 24px",
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        This is a test page for your chatbot widget. The chat bubble should
        appear in the corner.
      </div>

      <header
        style={{
          background: "#111827",
          color: "#fff",
          padding: "24px 32px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
          Acme Corp
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "4px" }}>
          Building the future, one widget at a time.
        </p>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>About Us</h2>
          <p style={{ color: "#374151", lineHeight: 1.6 }}>
            Acme Corp has been a leader in innovative solutions since 2020. We
            specialize in providing cutting-edge tools and services to businesses
            worldwide. Our mission is to simplify complex workflows and empower
            teams to do their best work.
          </p>
          <p style={{ color: "#374151", lineHeight: 1.6 }}>
            With over 10,000 customers in 50+ countries, we&apos;re proud to be
            trusted by startups and enterprises alike. Our platform processes
            millions of requests daily, ensuring reliability and performance at
            scale.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Our Products</h2>
          {[
            {
              title: "Acme Analytics",
              desc: "Real-time dashboards and insights for your business. Track key metrics, monitor trends, and make data-driven decisions with ease.",
            },
            {
              title: "Acme Automate",
              desc: "Workflow automation that saves hours every week. Connect your tools, set up triggers, and let Acme handle the rest.",
            },
            {
              title: "Acme Connect",
              desc: "Seamless integrations with 200+ popular services. Sync data across your entire tech stack without writing a single line of code.",
            },
          ].map((product) => (
            <div
              key={product.title}
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                {product.title}
              </h3>
              <p style={{ color: "#374151", margin: 0, lineHeight: 1.6 }}>
                {product.desc}
              </p>
            </div>
          ))}
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Pricing</h2>
          <p style={{ color: "#374151", lineHeight: 1.6 }}>
            We offer flexible plans starting at $29/month for small teams.
            Enterprise plans include dedicated support, custom integrations, and
            SLA guarantees. Contact our sales team for a personalized quote.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Contact</h2>
          <p style={{ color: "#374151", lineHeight: 1.6 }}>
            Have questions? Reach out to us at support@acmecorp.example or call
            us at (555) 123-4567. Our support team is available Monday through
            Friday, 9am to 6pm EST.
          </p>
          <p style={{ color: "#374151", lineHeight: 1.6 }}>
            Or just use the chat widget in the corner to get instant answers!
          </p>
        </section>
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "32px",
          color: "#9ca3af",
          fontSize: "13px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        &copy; 2026 Acme Corp. All rights reserved. This is a test page for
        widget development.
      </footer>

      {embedKey && origin && (
        <Script
          src={`${origin}/widget.js`}
          data-embed-key={embedKey}
          data-api-url={origin}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}

export default function TestWidgetPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      }
    >
      <TestWidgetContent />
    </Suspense>
  );
}
