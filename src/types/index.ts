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
  content: string;
  tokenCount: number;
  chunkIndex: number;
  embedding?: number[];
  createdAt: string;
}
