export interface IMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  contextChunkCount?: number;
}

export interface IChatState {
  messages: IMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface IChatRequest {
  messages: Pick<IMessage, "role" | "content">[];
}

export interface IStreamChunk {
  content: string;
  done: boolean;
}

export interface IDocument {
  id: string;
  title: string;
  type: "pdf" | "url" | "text";
  source: string | null;
  rawContent: string;
  status: "pending" | "processing" | "completed" | "failed";
  chunkCount: number;
  chatbotId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IChunkData {
  content: string;
  chunkIndex: number;
  tokenCount: number;
}

export interface IChunk {
  id: string;
  documentId: string;
  chatbotId: string | null;
  content: string;
  tokenCount: number;
  chunkIndex: number;
  embedding?: number[];
  createdAt: string;
}

export interface IBranding {
  primaryColor: string;
  title: string;
  welcomeMessage: string;
  position: "left" | "right";
}

export interface IBusiness {
  id: string;
  name: string;
  ownerId: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

export interface IChatbot {
  id: string;
  businessId: string;
  name: string;
  systemPrompt: string;
  branding: IBranding;
  embedKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IConversation {
  id: string;
  chatbotId: string;
  visitorId: string;
  status: "active" | "closed";
  startedAt: string;
  lastMessageAt: string;
}

export interface IDBMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  contextChunks: number;
  createdAt: string;
}
