import { CheatsheetItem } from '@glint/shared';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'glint' | 'glinty';
  text: string;
  commandItem?: CheatsheetItem;
  suggestedPrompts?: string[];
  timestamp: string;
  isOffline?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const SESSIONS_STORAGE_KEY = 'glint_chat_sessions_v1';
const ACTIVE_SESSION_STORAGE_KEY = 'glint_active_session_id_v1';

export const DEFAULT_GREETING_STARTERS = [
  'Kill whatever is on port 3000',
  'Undo last git commit keeping changes',
  'Prune unused Docker images and volumes',
  'Find files larger than 100MB in current dir',
];

export function createInitialGreeting(): ChatMessage {
  return {
    id: `greeting-${Date.now()}`,
    sender: 'glint',
    text: "Hey! ⚡ I'm Glint, your personal terminal co-pilot. What command or system task are we working on?",
    suggestedPrompts: DEFAULT_GREETING_STARTERS,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export class ChatSessionDatabase {
  private sessions: Map<string, ChatSession> = new Map();
  private activeSessionId: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          for (const s of parsed) {
            if (s && s.id && Array.isArray(s.messages)) {
              this.sessions.set(s.id, s);
            }
          }
        }
      }

      const activeId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (activeId && this.sessions.has(activeId)) {
        this.activeSessionId = activeId;
      } else if (this.sessions.size > 0) {
        this.activeSessionId = Array.from(this.sessions.keys())[0];
      }
    } catch (e) {
      console.warn('[ChatSessionDb] Failed to read sessions from storage:', e);
    }
  }

  private saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const sessionList = Array.from(this.sessions.values());
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionList));
      if (this.activeSessionId) {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, this.activeSessionId);
      }
    } catch (e) {
      console.warn('[ChatSessionDb] Failed to persist sessions to storage:', e);
    }
  }

  public getSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getActiveSession(): ChatSession {
    if (this.activeSessionId && this.sessions.has(this.activeSessionId)) {
      return this.sessions.get(this.activeSessionId)!;
    }

    if (this.sessions.size > 0) {
      const first = this.getSessions()[0];
      this.activeSessionId = first.id;
      this.saveToStorage();
      return first;
    }

    return this.createSession();
  }

  public createSession(title = 'New Conversation'): ChatSession {
    const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      id,
      title,
      createdAt: now,
      updatedAt: now,
      messages: [createInitialGreeting()],
    };

    this.sessions.set(id, newSession);
    this.activeSessionId = id;
    this.saveToStorage();
    return newSession;
  }

  public saveSessionMessages(sessionId: string, messages: ChatMessage[]): ChatSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.messages = messages;
    session.updatedAt = new Date().toISOString();

    // Auto-update title if it's the default and user sent their first message
    if (session.title === 'New Conversation' || session.title.startsWith('Session')) {
      const firstUserMsg = messages.find((m) => m.sender === 'user');
      if (firstUserMsg && firstUserMsg.text) {
        session.title = firstUserMsg.text.slice(0, 36) + (firstUserMsg.text.length > 36 ? '...' : '');
      }
    }

    this.sessions.set(sessionId, session);
    this.activeSessionId = sessionId;
    this.saveToStorage();
    return session;
  }

  public switchSession(id: string): ChatSession | null {
    if (this.sessions.has(id)) {
      this.activeSessionId = id;
      this.saveToStorage();
      return this.sessions.get(id)!;
    }
    return null;
  }

  public deleteSession(id: string): ChatSession {
    this.sessions.delete(id);
    if (this.activeSessionId === id) {
      const remaining = this.getSessions();
      if (remaining.length > 0) {
        this.activeSessionId = remaining[0].id;
      } else {
        return this.createSession();
      }
    }
    this.saveToStorage();
    return this.getActiveSession();
  }

  public clearAllSessions(): ChatSession {
    this.sessions.clear();
    this.activeSessionId = null;
    this.saveToStorage();
    return this.createSession();
  }
}

export const chatSessionDb = new ChatSessionDatabase();
