import type { IWidgetConfig, IMessage } from './types';

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
  document.querySelector<HTMLScriptElement>('script[data-api-url]');

function getConfig(): IWidgetConfig {
  const script = _widgetScript;
  console.log('DevfrendChat config:', {
    primaryColor: script?.getAttribute('data-primary-color'),
    position: script?.getAttribute('data-position'),
    title: script?.getAttribute('data-title'),
    welcomeMessage: script?.getAttribute('data-welcome-message'),
  });

  return {
    chatbotId: script?.getAttribute('data-chatbot-id') ?? '',
    apiUrl: script?.getAttribute('data-api-url') ?? '',
    primaryColor: script?.getAttribute('data-primary-color') ?? '#2563eb',
    title: script?.getAttribute('data-title') ?? 'Chat with us',
    welcomeMessage:
      script?.getAttribute('data-welcome-message') ??
      'Hi! How can I help you today?',
    position:
      (script?.getAttribute('data-position') as 'left' | 'right') ?? 'right',
  };
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

function svgIcon(paths: string[], viewBox = '0 0 24 24'): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  for (const d of paths) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }
  return svg;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function buildStyles(config: IWidgetConfig): string {
  const pos = config.position === 'left' ? 'left' : 'right';
  const pc = config.primaryColor;

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
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${pc};
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18);
      z-index: 999998;
      transition: transform 0.2s ease;
      padding: 0;
    }
    .df-bubble:hover { transform: scale(1.1); }
    .df-bubble svg {
      width: 24px;
      height: 24px;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    .df-bubble .df-icon-chat,
    .df-bubble .df-icon-close {
      position: absolute;
      transition: transform 0.25s ease, opacity 0.25s ease;
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
      bottom: 88px;
      ${pos}: 20px;
      width: 380px;
      height: 520px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(12px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.2s ease-out, transform 0.2s ease-out;
    }
    .df-window.df-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* ---- Header ---- */
    .df-header {
      background: ${pc};
      color: #fff;
      height: 56px;
      min-height: 56px;
      padding: 0 16px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 16px 16px 0 0;
    }
    .df-header-close {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .df-header-close:hover { background: rgba(255,255,255,0.2); }
    .df-header-close svg { width: 20px; height: 20px; }

    /* ---- Messages ---- */
    .df-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .df-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .df-msg-user {
      align-self: flex-end;
      background: ${pc};
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .df-msg-assistant {
      align-self: flex-start;
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }

    /* ---- Typing indicator ---- */
    .df-typing {
      align-self: flex-start;
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: #f3f4f6;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
    }
    .df-typing-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #9ca3af;
      animation: df-bounce 1.4s infinite ease-in-out both;
    }
    .df-typing-dot:nth-child(1) { animation-delay: 0s; }
    .df-typing-dot:nth-child(2) { animation-delay: 0.16s; }
    .df-typing-dot:nth-child(3) { animation-delay: 0.32s; }
    @keyframes df-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* ---- Input ---- */
    .df-input-bar {
      display: flex;
      align-items: center;
      border-top: 1px solid #e5e7eb;
      padding: 12px 16px;
      gap: 8px;
      border-radius: 0 0 16px 16px;
      background: #ffffff;
    }
    .df-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      font-family: inherit;
      background: transparent;
      color: #1f2937;
      padding: 0;
    }
    .df-input::placeholder { color: #9ca3af; }
    .df-send {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${pc};
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      flex-shrink: 0;
      transition: opacity 0.15s;
    }
    .df-send:disabled { opacity: 0.4; cursor: not-allowed; }
    .df-send svg { width: 16px; height: 16px; }

    /* ---- Dark mode ---- */
    @media (prefers-color-scheme: dark) {
      .df-window { background: #1f2937; }
      .df-messages { background: #1f2937; }
      .df-msg-assistant { background: #374151; color: #f3f4f6; }
      .df-input-bar { background: #1f2937; border-top-color: #374151; }
      .df-input { color: #f3f4f6; }
      .df-input::placeholder { color: #6b7280; }
      .df-typing { background: #374151; }
      .df-typing-dot { background: #6b7280; }
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
      }
      .df-header { border-radius: 0; }
      .df-input-bar { border-radius: 0; }
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

  // ---- Create bubble ----
  const chatIcon = svgIcon(ICON_CHAT);
  chatIcon.classList.add('df-icon-chat');
  const closeIconBubble = svgIcon(ICON_CLOSE);
  closeIconBubble.classList.add('df-icon-close');

  const bubble = el('button', undefined, {
    class: 'df-bubble',
    'aria-label': 'Open chat',
  }, [chatIcon, closeIconBubble]);

  // ---- Create window ----
  // Header
  const headerTitle = el('span', undefined, undefined, [config.title]);
  const headerCloseIcon = svgIcon(ICON_CLOSE);
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

  // Assemble window
  const chatWindow = el('div', undefined, { class: 'df-window' }, [
    header,
    messagesContainer,
    inputBar,
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
      const welcome = el('div', undefined, { class: 'df-msg df-msg-assistant' }, [
        config.welcomeMessage,
      ]);
      messagesContainer.appendChild(welcome);
    }

    for (const msg of state.messages) {
      const msgEl = el(
        'div',
        undefined,
        { class: `df-msg df-msg-${msg.role}` },
        [msg.content],
      );
      messagesContainer.appendChild(msgEl);
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
      input.focus();
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
        body: JSON.stringify({ messages: messagesPayload }),
      });

      if (!response.ok) {
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

function init(): void {
  const config = getConfig();
  createWidget(config);
  console.log('Devfrend Chat Widget initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { init };
export type { IWidgetConfig, IMessage } from './types';
