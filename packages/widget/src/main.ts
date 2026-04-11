import type { IWidgetConfig, IMessage, ILeadData } from './types';

// ---------------------------------------------------------------------------
// SSE event types (must match server: src/app/api/chat/route.ts)
// ---------------------------------------------------------------------------

interface ISSEEvent {
  type: 'message_start' | 'content_delta' | 'message_end' | 'error' | 'context_used';
  content?: string;
  chunkCount?: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Capture at parse time — document.currentScript is null after deferred execution
const _widgetScript: HTMLScriptElement | null =
  (document.currentScript as HTMLScriptElement | null) ??
  document.querySelector<HTMLScriptElement>('script[data-embed-key]');

function getLocalConfig(): IWidgetConfig {
  const script = _widgetScript;

  return {
    embedKey: script?.getAttribute('data-embed-key') ?? '',
    apiUrl: script?.getAttribute('data-api-url') ?? '',
    primaryColor: script?.getAttribute('data-primary-color') ?? '#2563eb',
    title: script?.getAttribute('data-title') ?? 'Chat with us',
    welcomeMessage:
      script?.getAttribute('data-welcome-message') ??
      'Hi! How can I help you today?',
    position:
      (script?.getAttribute('data-position') as 'left' | 'right') ?? 'right',
    collectLead: script?.getAttribute('data-collect-lead') !== 'false',
    showEscalation: script?.getAttribute('data-show-escalation') !== 'false',
  };
}

async function fetchRemoteConfig(local: IWidgetConfig): Promise<IWidgetConfig> {
  if (!local.embedKey || !local.apiUrl) return local;

  try {
    const res = await fetch(
      `${local.apiUrl}/api/widget/config?embed_key=${encodeURIComponent(local.embedKey)}`,
    );
    if (!res.ok) return local;

    const json = await res.json() as {
      success: boolean;
      config?: {
        primaryColor?: string;
        title?: string;
        welcomeMessage?: string;
        position?: 'left' | 'right';
        collectLead?: boolean;
        showEscalation?: boolean;
      };
    };

    if (!json.success || !json.config) return local;

    const c = json.config;
    return {
      ...local,
      primaryColor: c.primaryColor ?? local.primaryColor,
      title: c.title ?? local.title,
      welcomeMessage: c.welcomeMessage ?? local.welcomeMessage,
      position: c.position ?? local.position,
      collectLead: c.collectLead ?? local.collectLead,
      showEscalation: c.showEscalation ?? local.showEscalation,
    };
  } catch {
    // Network error — fall back to data-* attributes
    return local;
  }
}

// ---------------------------------------------------------------------------
// Visitor ID (persisted in localStorage)
// ---------------------------------------------------------------------------

const VISITOR_KEY = 'devfrend-chat-visitor-id';

function getVisitorId(): string {
  try {
    const stored = localStorage.getItem(VISITOR_KEY);
    if (stored) return stored;
  } catch {
    // localStorage may be blocked
  }

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    localStorage.setItem(VISITOR_KEY, id);
  } catch {
    // best-effort
  }
  return id;
}

// ---------------------------------------------------------------------------
// Lead data (persisted in localStorage)
// ---------------------------------------------------------------------------

const LEAD_KEY = 'devfrend-chat-lead';

function getSavedLead(): ILeadData | null {
  try {
    const stored = localStorage.getItem(LEAD_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ILeadData;
      if (parsed.email) return parsed;
    }
  } catch {
    // localStorage may be blocked
  }
  return null;
}

function saveLead(lead: ILeadData): void {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify(lead));
  } catch {
    // best-effort
  }
}

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3
    ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    : h;
  return [
    parseInt(full.substring(0, 2), 16),
    parseInt(full.substring(2, 4), 16),
    parseInt(full.substring(4, 6), 16),
  ];
}

function rgbStr(c: [number, number, number]): string {
  return `${c[0]}, ${c[1]}, ${c[2]}`;
}

function purpleShift(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  // Blend toward purple — boost blue, reduce green, keep red warm
  const nr = Math.min(255, Math.round(r * 0.75 + 140 * 0.25));
  const ng = Math.min(255, Math.round(g * 0.5));
  const nb = Math.min(255, Math.round(b * 0.55 + 220 * 0.45));
  return `${nr}, ${ng}, ${nb}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let messageIdCounter = 0;

function uid(): string {
  messageIdCounter += 1;
  return `msg-${Date.now()}-${messageIdCounter}`;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  styles?: Partial<CSSStyleDeclaration>,
  attrs?: Record<string, string>,
  children?: (Node | string)[],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (styles) Object.assign(node.style, styles);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      node.setAttribute(k, v);
    }
  }
  if (children) {
    for (const child of children) {
      node.appendChild(
        typeof child === 'string' ? document.createTextNode(child) : child,
      );
    }
  }
  return node;
}

function svgIcon(paths: string[], viewBox = '0 0 24 24', size = '24'): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  for (const d of paths) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }
  return svg;
}

// ---------------------------------------------------------------------------
// Simple markdown for assistant messages
// ---------------------------------------------------------------------------

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function buildStyles(config: IWidgetConfig): string {
  const pos = config.position === 'left' ? 'left' : 'right';
  const pc = config.primaryColor;
  const rgb = rgbStr(hexToRgb(pc));
  const ps = purpleShift(pc);

  return `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* ---- Bubble ---- */
    .df-bubble {
      position: fixed;
      bottom: 20px;
      ${pos}: 20px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgb(${rgb}), rgb(${ps}));
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(${rgb}, 0.4);
      z-index: 999998;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.3s ease;
      padding: 0;
    }
    .df-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 40px rgba(${rgb}, 0.55);
    }
    .df-bubble svg {
      width: 26px;
      height: 26px;
    }
    .df-bubble .df-icon-chat,
    .df-bubble .df-icon-close {
      position: absolute;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                  opacity 0.25s ease;
    }
    .df-bubble .df-icon-close {
      opacity: 0;
      transform: rotate(-90deg) scale(0.5);
    }
    .df-bubble.df-active .df-icon-chat {
      opacity: 0;
      transform: rotate(90deg) scale(0.5);
    }
    .df-bubble.df-active .df-icon-close {
      opacity: 1;
      transform: rotate(0) scale(1);
    }

    /* ---- Window ---- */
    .df-window {
      position: fixed;
      bottom: 92px;
      ${pos}: 20px;
      width: 380px;
      height: 540px;
      background: rgba(10, 10, 15, 0.85);
      backdrop-filter: blur(24px) saturate(1.2);
      -webkit-backdrop-filter: blur(24px) saturate(1.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5),
                  0 0 1px rgba(255, 255, 255, 0.1) inset;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.9);
      pointer-events: none;
      transition: opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                  transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .df-window.df-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* ---- Header ---- */
    .df-header {
      background: linear-gradient(135deg, rgb(${rgb}), rgb(${ps}));
      color: #fff;
      height: 56px;
      min-height: 56px;
      padding: 0 16px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 20px 20px 0 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .df-header-title {
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }
    .df-header-close {
      width: 28px;
      height: 28px;
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;
    }
    .df-header-close:hover { background: rgba(255, 255, 255, 0.25); }
    .df-header-close svg { width: 16px; height: 16px; }

    /* ---- Messages ---- */
    .df-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: transparent;
    }
    .df-messages::-webkit-scrollbar { width: 4px; }
    .df-messages::-webkit-scrollbar-track { background: transparent; }
    .df-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 2px;
    }

    .df-msg-wrap {
      display: flex;
      flex-direction: column;
      animation: df-msg-in 0.2s ease-out both;
    }
    .df-msg-wrap-user { align-items: flex-end; }
    .df-msg-wrap-assistant { align-items: flex-start; }

    @keyframes df-msg-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .df-msg {
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.6;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .df-msg-user {
      max-width: 80%;
      background: linear-gradient(135deg, rgb(${rgb}), rgb(${ps}));
      color: #fff;
      border-radius: 20px 20px 4px 20px;
      box-shadow: 0 4px 16px rgba(${rgb}, 0.3);
    }
    .df-msg-assistant {
      max-width: 85%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.9);
      border-radius: 20px 20px 20px 4px;
    }
    .df-msg-welcome {
      font-size: 15px;
    }

    .df-msg-time {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
      margin-top: 4px;
      padding: 0 4px;
    }

    /* ---- Typing indicator ---- */
    .df-typing {
      align-self: flex-start;
      display: flex;
      gap: 5px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px 20px 20px 4px;
    }
    .df-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      animation: df-dot-bounce 1.4s infinite ease-in-out both;
    }
    .df-typing-dot:nth-child(1) { animation-delay: 0s; }
    .df-typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .df-typing-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes df-dot-bounce {
      0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
      40% { transform: scale(1.4); opacity: 1; }
    }

    /* ---- Input ---- */
    .df-input-bar {
      display: flex;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 12px 16px;
      gap: 8px;
      border-radius: 0 0 20px 20px;
      background: rgba(255, 255, 255, 0.06);
      transition: box-shadow 0.2s ease;
    }
    .df-input-bar.df-focused {
      box-shadow: 0 0 0 1px rgba(${rgb}, 0.3) inset;
    }
    .df-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      font-family: inherit;
      background: transparent;
      color: #fff;
      padding: 0;
    }
    .df-input::placeholder { color: rgba(255, 255, 255, 0.3); }
    .df-send {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgb(${rgb}), rgb(${ps}));
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
      opacity: 0;
      transform: scale(0.8);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease,
                  box-shadow 0.2s ease;
    }
    .df-send.df-send-visible {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }
    .df-send:hover {
      box-shadow: 0 4px 16px rgba(${rgb}, 0.4);
    }
    .df-send:active {
      transform: scale(0.9);
    }
    .df-send:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }
    .df-send svg { width: 16px; height: 16px; }

    /* ---- Toast notification ---- */
    .df-toast {
      position: absolute;
      bottom: 70px;
      left: 16px;
      right: 16px;
      background: rgba(220, 38, 38, 0.15);
      color: #fca5a5;
      border: 1px solid rgba(220, 38, 38, 0.2);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 13px;
      text-align: center;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      opacity: 1;
      transition: opacity 0.3s ease;
      z-index: 10;
    }
    .df-toast.df-toast-hidden { opacity: 0; pointer-events: none; }

    /* ---- Escalation link ---- */
    .df-escalate {
      text-align: center;
      padding: 4px 16px 8px;
      background: transparent;
    }
    .df-escalate-link {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.3);
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s ease;
      text-decoration: none;
    }
    .df-escalate-link:hover {
      color: rgba(255, 255, 255, 0.6);
      text-decoration: underline;
    }
    .df-escalate-link svg {
      width: 12px;
      height: 12px;
      vertical-align: middle;
      margin-left: 2px;
    }

    /* ---- Lead form ---- */
    .df-lead-form {
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: df-fade-in 0.3s ease-out both;
    }
    @keyframes df-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .df-lead-card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .df-lead-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: -8px;
    }
    .df-lead-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }
    .df-lead-input:focus {
      border-color: rgba(${rgb}, 0.5);
    }
    .df-lead-input::placeholder { color: rgba(255, 255, 255, 0.3); }
    .df-lead-btn {
      width: 100%;
      padding: 12px 16px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, rgb(${rgb}), rgb(${ps}));
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: opacity 0.2s ease, box-shadow 0.2s ease;
    }
    .df-lead-btn:hover {
      opacity: 0.95;
      box-shadow: 0 4px 16px rgba(${rgb}, 0.3);
    }
    .df-lead-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .df-lead-error {
      color: #fca5a5;
      font-size: 12px;
      margin-top: -8px;
    }

    /* ---- Light mode ---- */
    @media (prefers-color-scheme: light) {
      .df-window {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(24px) saturate(1.2);
        -webkit-backdrop-filter: blur(24px) saturate(1.2);
        border-color: rgba(0, 0, 0, 0.08);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18),
                    0 0 1px rgba(0, 0, 0, 0.05) inset;
      }
      .df-msg-assistant {
        background: rgba(0, 0, 0, 0.05);
        border-color: rgba(0, 0, 0, 0.06);
        color: #1f2937;
      }
      .df-msg-time { color: rgba(0, 0, 0, 0.35); }
      .df-input-bar {
        background: rgba(0, 0, 0, 0.03);
        border-top-color: rgba(0, 0, 0, 0.08);
      }
      .df-input-bar.df-focused {
        box-shadow: 0 0 0 1px rgba(${rgb}, 0.2) inset;
      }
      .df-input { color: #1f2937; }
      .df-input::placeholder { color: rgba(0, 0, 0, 0.35); }
      .df-typing {
        background: rgba(0, 0, 0, 0.05);
        border-color: rgba(0, 0, 0, 0.06);
      }
      .df-typing-dot { background: rgba(0, 0, 0, 0.35); }
      .df-escalate-link { color: rgba(0, 0, 0, 0.35); }
      .df-escalate-link:hover { color: rgba(0, 0, 0, 0.6); }
      .df-lead-card {
        background: rgba(0, 0, 0, 0.03);
        border-color: rgba(0, 0, 0, 0.08);
      }
      .df-lead-label { color: rgba(0, 0, 0, 0.5); }
      .df-lead-input {
        background: rgba(0, 0, 0, 0.04);
        border-color: rgba(0, 0, 0, 0.1);
        color: #1f2937;
      }
      .df-lead-input::placeholder { color: rgba(0, 0, 0, 0.35); }
      .df-lead-error { color: #dc2626; }
      .df-toast {
        background: rgba(220, 38, 38, 0.08);
        color: #dc2626;
        border-color: rgba(220, 38, 38, 0.15);
      }
      .df-messages::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.12);
      }
    }

    /* ---- Mobile fullscreen ---- */
    @media (max-width: 480px) {
      .df-window {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        right: 0;
        left: 0;
        border-radius: 0;
        border: none;
      }
      .df-header { border-radius: 0; }
      .df-input-bar {
        border-radius: 0;
        padding: 14px 16px;
      }
    }
  `;
}

// ---------------------------------------------------------------------------
// SVG icon paths
// ---------------------------------------------------------------------------

const ICON_CHAT = [
  'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z',
];

const ICON_CLOSE = [
  'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
];

const ICON_SEND = [
  'M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94l18.243-8.498a.75.75 0 0 0 0-1.394L3.478 2.404z',
];

const ICON_ARROW_RIGHT = [
  'M10 6l-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6z',
];

// ---------------------------------------------------------------------------
// Widget state
// ---------------------------------------------------------------------------

interface IWidgetState {
  isOpen: boolean;
  messages: IMessage[];
  isStreaming: boolean;
}

// ---------------------------------------------------------------------------
// Widget builder
// ---------------------------------------------------------------------------

function createWidget(config: IWidgetConfig): void {
  const host = document.createElement('div');
  host.id = 'devfrend-chat-widget';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = buildStyles(config);
  shadow.appendChild(styleEl);

  // Visitor ID for tracking conversations
  const visitorId = getVisitorId();

  // State
  const state: IWidgetState = {
    isOpen: false,
    messages: [],
    isStreaming: false,
  };

  // Lead capture state
  let leadData: ILeadData | null = config.collectLead ? getSavedLead() : null;
  const needsLeadForm = config.collectLead && !leadData;

  // ---- Create bubble ----
  const chatIcon = svgIcon(ICON_CHAT, '0 0 24 24', '26');
  chatIcon.classList.add('df-icon-chat');
  const closeIconBubble = svgIcon(ICON_CLOSE, '0 0 24 24', '26');
  closeIconBubble.classList.add('df-icon-close');

  const bubble = el('button', undefined, {
    class: 'df-bubble',
    'aria-label': 'Open chat',
  }, [chatIcon, closeIconBubble]);

  // ---- Create window ----
  // Header
  const headerTitle = el('span', undefined, { class: 'df-header-title' }, [config.title]);
  const headerCloseIcon = svgIcon(ICON_CLOSE, '0 0 24 24', '16');
  const headerClose = el('button', undefined, {
    class: 'df-header-close',
    'aria-label': 'Close chat',
  }, [headerCloseIcon]);
  const header = el('div', undefined, { class: 'df-header' }, [
    headerTitle,
    headerClose,
  ]);

  // Messages area
  const messagesContainer = el('div', undefined, { class: 'df-messages' });

  // Typing indicator (hidden by default)
  const typingDot1 = el('div', undefined, { class: 'df-typing-dot' });
  const typingDot2 = el('div', undefined, { class: 'df-typing-dot' });
  const typingDot3 = el('div', undefined, { class: 'df-typing-dot' });
  const typingIndicator = el('div', undefined, { class: 'df-typing' }, [
    typingDot1, typingDot2, typingDot3,
  ]);
  typingIndicator.style.display = 'none';

  // Input bar
  const input = el('input', undefined, {
    class: 'df-input',
    type: 'text',
    placeholder: 'Type a message...',
  });

  const sendIcon = svgIcon(ICON_SEND);
  const sendBtn = el('button', undefined, {
    class: 'df-send',
    'aria-label': 'Send message',
  }, [sendIcon]);

  const inputBar = el('div', undefined, { class: 'df-input-bar' }, [
    input,
    sendBtn,
  ]);

  // Send button visibility — only show when text is entered
  input.addEventListener('input', () => {
    if (input.value.trim()) {
      sendBtn.classList.add('df-send-visible');
    } else {
      sendBtn.classList.remove('df-send-visible');
    }
  });

  // Focus glow on input bar
  input.addEventListener('focus', () => inputBar.classList.add('df-focused'));
  input.addEventListener('blur', () => inputBar.classList.remove('df-focused'));

  // ---- Escalation link ----
  const arrowIcon = svgIcon(ICON_ARROW_RIGHT, '0 0 24 24', '12');
  const escalateLink = el('button', undefined, {
    class: 'df-escalate-link',
    type: 'button',
  }, ['Talk to a human ']);
  escalateLink.appendChild(arrowIcon);

  const escalateBar = el('div', undefined, { class: 'df-escalate' }, [
    escalateLink,
  ]);

  if (!config.showEscalation) {
    escalateBar.style.display = 'none';
  }

  async function handleEscalate(): Promise<void> {
    addMessage('assistant', "I'll connect you with a human. The team will reach out to you shortly via email.");

    try {
      await fetch(`${config.apiUrl}/api/chat/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Visitor-ID': visitorId,
        },
        body: JSON.stringify({
          embedKey: config.embedKey,
          visitorId,
          ...(leadData ? { lead: leadData } : {}),
        }),
      });
    } catch {
      // Non-fatal — message already shown
    }
  }

  escalateLink.addEventListener('click', handleEscalate);

  // ---- Toast notification ----
  const toast = el('div', undefined, { class: 'df-toast df-toast-hidden' });
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  function showToast(message: string, durationMs: number = 4000): void {
    toast.textContent = message;
    toast.classList.remove('df-toast-hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('df-toast-hidden');
    }, durationMs);
  }

  // ---- Lead capture form ----
  const leadNameLabel = el('div', undefined, { class: 'df-lead-label' }, ['Name']);
  const leadNameInput = el('input', undefined, {
    class: 'df-lead-input',
    type: 'text',
    placeholder: 'Your name (optional)',
  });
  const leadEmailLabel = el('div', undefined, { class: 'df-lead-label' }, ['Email']);
  const leadEmailInput = el('input', undefined, {
    class: 'df-lead-input',
    type: 'email',
    placeholder: 'you@company.com',
  });
  const leadError = el('div', undefined, { class: 'df-lead-error' });
  leadError.style.display = 'none';
  const leadSubmitBtn = el('button', undefined, {
    class: 'df-lead-btn',
    type: 'button',
  }, ['Start Chat']);

  const leadCard = el('div', undefined, { class: 'df-lead-card' }, [
    leadNameLabel,
    leadNameInput,
    leadEmailLabel,
    leadEmailInput,
    leadError,
    leadSubmitBtn,
  ]);

  const leadForm = el('div', undefined, { class: 'df-lead-form' }, [leadCard]);

  // Hide lead form if not needed, hide input bar if form is shown
  if (!needsLeadForm) {
    leadForm.style.display = 'none';
  } else {
    inputBar.style.display = 'none';
  }

  function submitLeadForm(): void {
    const email = leadEmailInput.value.trim();
    if (!email || !email.includes('@')) {
      leadError.textContent = 'Please enter a valid email address.';
      leadError.style.display = 'block';
      return;
    }
    leadError.style.display = 'none';
    leadData = { name: leadNameInput.value.trim(), email };
    saveLead(leadData);
    leadForm.style.display = 'none';
    inputBar.style.display = 'flex';
    input.focus();
  }

  leadSubmitBtn.addEventListener('click', submitLeadForm);
  leadEmailInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitLeadForm();
    }
  });

  // Assemble window
  const chatWindow = el('div', undefined, { class: 'df-window' }, [
    header,
    messagesContainer,
    leadForm,
    inputBar,
    escalateBar,
    toast,
  ]);

  // Root container
  const container = el('div', undefined, undefined, [bubble, chatWindow]);
  shadow.appendChild(container);

  // ---- Rendering helpers ----

  function scrollToBottom(): void {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function renderMessages(): void {
    // Clear existing message nodes (keep typing indicator separate)
    while (messagesContainer.firstChild) {
      messagesContainer.removeChild(messagesContainer.firstChild);
    }

    // Show welcome message when there are no messages
    if (state.messages.length === 0) {
      const wrap = el('div', undefined, { class: 'df-msg-wrap df-msg-wrap-assistant' });
      const welcome = el('div', undefined, {
        class: 'df-msg df-msg-assistant df-msg-welcome',
      }, [config.welcomeMessage]);
      wrap.appendChild(welcome);
      messagesContainer.appendChild(wrap);
    }

    for (const msg of state.messages) {
      const wrap = el('div', undefined, {
        class: `df-msg-wrap df-msg-wrap-${msg.role}`,
      });

      const msgEl = el('div', undefined, {
        class: `df-msg df-msg-${msg.role}`,
      });

      if (msg.role === 'assistant') {
        msgEl.innerHTML = renderMarkdown(msg.content);
      } else {
        msgEl.textContent = msg.content;
      }

      const timeEl = el('div', undefined, { class: 'df-msg-time' }, [
        formatTime(msg.timestamp),
      ]);

      wrap.appendChild(msgEl);
      wrap.appendChild(timeEl);
      messagesContainer.appendChild(wrap);
    }

    // Append typing indicator at the end
    messagesContainer.appendChild(typingIndicator);
    scrollToBottom();
  }

  function showTyping(show: boolean): void {
    typingIndicator.style.display = show ? 'flex' : 'none';
    if (show) scrollToBottom();
  }

  function addMessage(role: 'user' | 'assistant', content: string): IMessage {
    const msg: IMessage = {
      id: uid(),
      role,
      content,
      timestamp: Date.now(),
    };
    state.messages.push(msg);
    renderMessages();
    return msg;
  }

  function updateLastAssistantMessage(content: string): void {
    for (let i = state.messages.length - 1; i >= 0; i--) {
      if (state.messages[i].role === 'assistant') {
        state.messages[i].content = content;
        break;
      }
    }
    renderMessages();
  }

  // ---- Toggle ----

  function toggleChat(): void {
    state.isOpen = !state.isOpen;
    bubble.classList.toggle('df-active', state.isOpen);
    bubble.setAttribute('aria-label', state.isOpen ? 'Close chat' : 'Open chat');

    if (state.isOpen) {
      chatWindow.classList.add('df-visible');
      if (leadForm.style.display !== 'none') {
        leadEmailInput.focus();
      } else {
        input.focus();
      }
      scrollToBottom();
    } else {
      chatWindow.classList.remove('df-visible');
    }
  }

  bubble.addEventListener('click', toggleChat);
  headerClose.addEventListener('click', toggleChat);

  // ---- Send message ----

  async function sendMessage(): Promise<void> {
    const text = input.value.trim();
    if (!text || state.isStreaming) return;

    input.value = '';
    sendBtn.classList.remove('df-send-visible');
    addMessage('user', text);
    state.isStreaming = true;
    sendBtn.disabled = true;
    input.disabled = true;
    showTyping(true);

    try {
      // Build messages payload (only role + content, matching server schema)
      const messagesPayload = state.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${config.apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Visitor-ID': visitorId,
        },
        body: JSON.stringify({
          messages: messagesPayload,
          ...(config.embedKey ? { embedKey: config.embedKey } : {}),
          ...(leadData ? { lead: leadData } : {}),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          showToast("You're sending messages too quickly. Please wait a moment.");
          // Remove the user message we just added
          state.messages.pop();
          renderMessages();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let assistantMsgCreated = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          const json = trimmed.slice(6);
          let event: ISSEEvent;
          try {
            event = JSON.parse(json) as ISSEEvent;
          } catch {
            continue; // skip non-JSON lines
          }

          switch (event.type) {
            case 'message_start':
              // Streaming has begun — hide typing, create assistant placeholder
              showTyping(false);
              if (!assistantMsgCreated) {
                addMessage('assistant', '');
                assistantMsgCreated = true;
              }
              break;

            case 'content_delta':
              if (event.content) {
                accumulated += event.content;
                updateLastAssistantMessage(accumulated);
              }
              break;

            case 'context_used':
              // Could display "Answered from knowledge base" — stored for future use
              break;

            case 'message_end':
              state.isStreaming = false;
              break;

            case 'error':
              showTyping(false);
              if (!assistantMsgCreated) {
                addMessage('assistant', event.content ?? 'An error occurred.');
                assistantMsgCreated = true;
              } else {
                updateLastAssistantMessage(
                  accumulated || event.content || 'An error occurred.',
                );
              }
              state.isStreaming = false;
              break;
          }
        }
      }

      // If stream ended without message_start (edge case), ensure we clean up
      if (!assistantMsgCreated) {
        showTyping(false);
        addMessage('assistant', accumulated || 'No response received.');
      }
    } catch {
      showTyping(false);
      addMessage('assistant', 'Unable to connect. Please try again.');
    } finally {
      state.isStreaming = false;
      sendBtn.disabled = false;
      input.disabled = false;
      showTyping(false);
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Initial render (shows welcome message)
  renderMessages();
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

async function init(): Promise<void> {
  const local = getLocalConfig();
  const config = await fetchRemoteConfig(local);
  createWidget(config);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { void init(); });
} else {
  void init();
}

export { init };
export type { IWidgetConfig, IMessage, ILeadData } from './types';
