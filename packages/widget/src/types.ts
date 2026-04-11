export interface IWidgetConfig {
  embedKey: string;
  apiUrl: string;
  primaryColor: string;
  title: string;
  welcomeMessage: string;
  position: 'left' | 'right';
  collectLead: boolean;
  showEscalation: boolean;
}

export interface ILeadData {
  name: string;
  email: string;
}

export interface IMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
