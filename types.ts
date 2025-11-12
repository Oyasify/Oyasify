
export type Screen = 'home' | 'vocal' | 'ai-script' | 'profile' | 'academy' | 'apoio' | 'oyasify-ai' | 'suporte';

export interface User {
  id: number;
  name: string;
  avatarUrl: string;
}

export interface AppUser extends User {
  email: string;
  bio: string;
  role: 'user' | 'owner';
  theme: string;
  isSupporter?: boolean;
}

export interface Friend extends User {
  online: boolean;
}

export interface Message {
  id: number;
  type: 'text' | 'image' | 'video' | 'audio' | 'system';
  content?: string;
  mediaUrl?: string;
  imageAttachments?: string[];
  senderId: number | 'me' | 'ai';
  timestamp: string;
  duration?: number;
}

export interface Theme {
  key: string;
  name: string;
  properties: {
    [key: string]: string;
  };
  font: string;
}

export interface Chat {
  friendId: number;
  messages: Message[];
  isAiActive?: boolean;
}

export interface AcademyLesson {
  id: number;
  title: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
}