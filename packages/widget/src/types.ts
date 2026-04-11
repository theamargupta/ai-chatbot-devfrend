export interface IWidgetConfig {
  chatbotId: string;
  apiUrl: string;
  primaryColor: string;
  title: string;
  welcomeMessage: string;
  position: 'left' | 'right';
}

export interface IMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
