import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Loader2,
  Minus,
  X,
  GripVertical,
  Sparkles,
  RotateCcw,
  Sun,
  Moon,
  Copy,
  Check,
  Plus,
  History,
  Trash2,
  User,
  LogOut,
} from 'lucide-react';
import { localCommandDb } from '../services/localCommandDb';
import { apiClient } from '../services/api';
import { chatSessionDb, ChatSession, ChatMessage, DEFAULT_GREETING_STARTERS } from '../services/chatSessionDb';
import { CommandCard } from './CommandCard';
import { BrandSpark } from './BrandSpark';
import { FormattedMessage } from './CodeBlock';
import { useDesktopDrag } from '../hooks/useDesktopDrag';
import { useTheme } from '../hooks/useTheme';
import { useWindowResize } from '../hooks/useWindowResize';

interface ConversationalChatProps {
  onCollapseToHead: () => void;
  onClose: () => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
  onOpenAuth: () => void;
  onSignOut?: () => void;
}

const GREETING_RESPONSES = [
  "Hey there! 👋 Glint here. What command or system task are we working on today?",
  "Hello! ⚡ Terminal co-pilot ready. Tell me what you're trying to do in plain English!",
  "Hey! Ready to get things done. Need help with Docker, Git, Linux, or debugging an issue?",
  "Hi! 🚀 Glint at your service. Looking for a command, or troubleshooting a server?",
];

const THANK_YOU_RESPONSES = [
  "You're very welcome! Happy hacking 💻🚀",
  "Anytime! Let me know whenever you need another terminal assist ⚡",
  "Glad I could help! I've saved that into your local offline memory for next time.",
  "You got it! Go crush that project 💪",
];

const MessageCopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.writeClipboard) {
      (window as any).glintDesktop.writeClipboard(text);
    } else if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-lg bg-slate-100 dark:bg-glint-space hover:bg-glint-violet hover:text-white dark:hover:bg-glint-violet dark:hover:text-white text-slate-400 hover:text-white transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
      title="Copy message to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-500 dark:text-glint-lime" />
          <span className="text-[9px] font-bold text-emerald-500 dark:text-glint-lime">Copied</span>
        </>
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
};

export const ConversationalChat: React.FC<ConversationalChatProps> = ({
  onCollapseToHead,
  isAuthenticated,
  userEmail,
  onOpenAuth,
  onSignOut,
}) => {
  const [activeSession, setActiveSession] = useState<ChatSession>(() => chatSessionDb.getActiveSession());
  const [messages, setMessages] = useState<ChatMessage[]>(() => activeSession.messages);
  const [showSessionsDrawer, setShowSessionsDrawer] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [sessionsList, setSessionsList] = useState<ChatSession[]>(() => chatSessionDb.getSessions());

  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isDark, toggleTheme } = useTheme();
  const { handlePointerDown } = useDesktopDrag();
  const { handleResizePointerDown } = useWindowResize();
  const dbStats = localCommandDb.getStats();

  // Persist messages whenever conversation updates
  useEffect(() => {
    if (activeSession && messages.length > 0) {
      chatSessionDb.saveSessionMessages(activeSession.id, messages);
      setSessionsList(chatSessionDb.getSessions());
    }
  }, [messages, activeSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleNewSession = () => {
    const newSession = chatSessionDb.createSession();
    setActiveSession(newSession);
    setMessages(newSession.messages);
    setSessionsList(chatSessionDb.getSessions());
    setShowSessionsDrawer(false);
  };

  const handleSwitchSession = (sessionId: string) => {
    const s = chatSessionDb.switchSession(sessionId);
    if (s) {
      setActiveSession(s);
      setMessages(s.messages);
      setSessionsList(chatSessionDb.getSessions());
      setShowSessionsDrawer(false);
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSession = chatSessionDb.deleteSession(sessionId);
    setActiveSession(nextSession);
    setMessages(nextSession.messages);
    setSessionsList(chatSessionDb.getSessions());
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = (textToSend || inputValue).trim();
    if (!rawQuery || isThinking) return;

    setInputValue('');
    const queryLower = rawQuery.toLowerCase();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: rawQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    // 1. Detect Conversational Greetings & Casual Banter (no random command cards!)
    const isGreeting = /^(hi|hello|hey|howdy|yo|sup|what'?s up|greetings|good (morning|afternoon|evening))\b/i.test(queryLower);
    if (isGreeting) {
      setTimeout(() => {
        const randomGreeting = GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
        const glintReply: ChatMessage = {
          id: `glint-${Date.now()}`,
          sender: 'glint',
          text: randomGreeting,
          suggestedPrompts: DEFAULT_GREETING_STARTERS,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintReply]);
        setIsThinking(false);
      }, 200);
      return;
    }

    // 2. Detect Gratitude & Goodbyes
    const isGratitude = /^(thanks|thank you|ty|thx|awesome|cool|great|bye|goodbye|cya)\b/i.test(queryLower);
    if (isGratitude) {
      setTimeout(() => {
        const randomThanks = THANK_YOU_RESPONSES[Math.floor(Math.random() * THANK_YOU_RESPONSES.length)];
        const glintReply: ChatMessage = {
          id: `glint-${Date.now()}`,
          sender: 'glint',
          text: randomThanks,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintReply]);
        setIsThinking(false);
      }, 200);
      return;
    }

    // 3. Detect Identity / "Who are you" questions
    const isIdentity = /^(who are you|what are you|what can you do|help)\b/i.test(queryLower);
    if (isIdentity) {
      setTimeout(() => {
        const glintReply: ChatMessage = {
          id: `glint-${Date.now()}`,
          sender: 'glint',
          text: "I'm Glint, your personal terminal co-pilot! ⚡ I turn natural language into exact, safe terminal commands, explain confusing parameters, and remember your commands in your offline database so you never have to memorize them.",
          suggestedPrompts: [
            'How do I check open ports?',
            'Docker prune unused data',
            'Git stash uncommitted work',
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintReply]);
        setIsThinking(false);
      }, 200);
      return;
    }

    // 4. Memory Cache: Check local persistent knowledge first (0 AI cost, <2ms)
    const cachedKnowledge = localCommandDb.searchKnowledge(rawQuery);
    if (cachedKnowledge) {
      setTimeout(() => {
        const glintReply: ChatMessage = {
          id: `glint-${Date.now()}`,
          sender: 'glint',
          text: cachedKnowledge.answer,
          isOffline: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintReply]);
        setIsThinking(false);
      }, 150);
      return;
    }

    // 5. Cheatsheet Search: Search local persistent database (0 AI cost, <2ms)
    // Only trigger offline cheatsheet if there is a high-confidence match (score >= 90)
    // Otherwise, must fall back to AI engine!
    const localMatches = localCommandDb.search(rawQuery);
    const topMatch = localMatches[0];

    if (topMatch && topMatch.score >= 90) {
      setTimeout(() => {
        const glintReply: ChatMessage = {
          id: `glint-${Date.now()}`,
          sender: 'glint',
          text: topMatch.item.id.startsWith('learned-')
            ? "I remember this one from your playbook! Here's the command you used before:"
            : "Got you covered! Here's the command from our offline cheatsheets:",
          commandItem: topMatch.item,
          isOffline: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintReply]);
        setIsThinking(false);
      }, 200);
      return;
    }

    // 6. Dual-Mode AI Query (Groq -> Gemini -> local fallback)
    try {
      let aiResult: any = null;

      // Prefer direct Electron IPC if running as desktop overlay
      if (typeof window !== 'undefined' && (window as any).glintDesktop?.queryAI) {
        aiResult = await (window as any).glintDesktop.queryAI(rawQuery);
      } else {
        // Fallback to apiClient for web environment
        const response = await apiClient.queryAI({
          query: rawQuery,
          context: { shell: 'bash', os: 'Linux (Ubuntu)' },
        });

        if (response.suggestions && response.suggestions.length > 0) {
          const first = response.suggestions[0];
          aiResult = {
            type: 'command',
            text: first.explanation || "Here is the exact command you need:",
            command: first.command,
            template: first.template || first.command,
            description: first.description,
            dangerLevel: first.dangerLevel,
            variables: first.variables,
          };
        }
      }

      if (aiResult) {
        if (aiResult.type === 'answer') {
          // General developer question (e.g. token optimization, concepts, system architecture)
          localCommandDb.learnAnswer(rawQuery, aiResult.text);

          const glintReply: ChatMessage = {
            id: `glint-${Date.now()}`,
            sender: 'glint',
            text: aiResult.text,
            isOffline: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, glintReply]);
        } else {
          // Terminal command recommendation
          const learned = await localCommandDb.learnCommand(rawQuery, {
            command: aiResult.command,
            template: aiResult.template || aiResult.command,
            description: aiResult.description || `Command for "${rawQuery}"`,
            dangerLevel: aiResult.dangerLevel || 'safe',
            variables: aiResult.variables?.map((v: any) => ({ name: v.name, defaultValue: v.defaultValue, label: v.name })) || [],
            category: 'ai-learned',
            platform: 'linux',
          });

          const glintReply: ChatMessage = {
            id: `glint-${Date.now()}`,
            sender: 'glint',
            text: aiResult.text || "Here is the exact command you need. I've saved it to your local offline memory for future use!",
            commandItem: learned,
            isOffline: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, glintReply]);
        }
      } else {
        throw new Error('No response from AI assistant');
      }
    } catch (err: any) {
      // Offline fallback: check if any partial match exists
      if (topMatch) {
        const glintReply: ChatMessage = {
          id: `glint-${Date.now()}`,
          sender: 'glint',
          text: "I couldn't reach the AI cloud right now, but here's the closest match from your offline database:",
          commandItem: topMatch.item,
          isOffline: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintReply]);
      } else {
        const glintReply: ChatMessage = {
          id: `glint-${Date.now()}`,
          sender: 'glint',
          text: `I couldn't find an exact answer or command for "${rawQuery}" right now. Try rephrasing or asking a specific terminal task!`,
          suggestedPrompts: [
            'How to find files in Linux',
            'Kill process by port',
            'Docker container logs',
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintReply]);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    handleNewSession();
  };

  return (
    <div className="relative w-full h-full flex flex-col rounded-3xl border-2 border-slate-300 dark:border-glint-violet/70 bg-slate-50/95 dark:bg-glint-space/95 backdrop-blur-2xl shadow-[0_15px_60px_rgba(125,35,217,0.25)] dark:shadow-[0_15px_60px_rgba(125,35,217,0.45)] overflow-hidden animate-pop select-none transition-colors duration-200">
      {/* Top Messenger Bar (Draggable) */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-glint-border/80 bg-white/95 dark:bg-gradient-to-r dark:from-glint-card dark:to-glint-bubble cursor-grab active:cursor-grabbing transition-colors duration-200 flex-shrink-0"
        title="Glint: Drag anywhere on your desktop screen!"
      >
        <div className="flex items-center gap-2.5">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 hover:text-glint-violet dark:hover:text-glint-lime transition-colors" />
          <div
            onClick={onCollapseToHead}
            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
            title="Click to collapse to floating icon"
          >
            <BrandSpark size="md" className="w-8 h-8" animate={isThinking} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                Glint
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-glint-lime animate-pulse" />
              {isAuthenticated ? (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-glint-violet/15 text-glint-violet dark:text-glint-cyan border border-glint-violet/20 font-mono">
                  PRO
                </span>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-glint-yellow/15 text-amber-700 dark:text-glint-yellow hover:bg-amber-200 transition-colors border border-amber-200 dark:border-transparent cursor-pointer font-mono"
                  title="Guest Mode: Click to sign in or sign up"
                >
                  Guest
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]" title={activeSession?.title}>
              {isThinking ? 'Glint is thinking...' : activeSession?.title || `${dbStats.totalCommands} offline commands`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400" data-no-drag="true">
          {/* Account Profile / Auth Button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                setShowAccountMenu((prev) => !prev);
              } else {
                onOpenAuth();
              }
            }}
            className={`p-1.5 rounded-xl transition-all ${
              showAccountMenu
                ? 'bg-glint-violet text-white'
                : isAuthenticated
                ? 'text-glint-violet dark:text-glint-cyan hover:bg-slate-100 dark:hover:bg-glint-card'
                : 'hover:bg-slate-100 dark:hover:bg-glint-card hover:text-glint-violet dark:hover:text-white'
            }`}
            title={isAuthenticated ? `Account: ${userEmail || 'Developer'} (Click for menu)` : 'Sign in or Create Account'}
          >
            <User className="w-3.5 h-3.5" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleNewSession}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-glint-card hover:text-glint-violet dark:hover:text-glint-lime transition-colors"
            title="Start New Chat Session"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Sessions & History Switcher */}
          <button
            onClick={() => {
              setShowSessionsDrawer((prev) => !prev);
              setShowAccountMenu(false);
            }}
            className={`p-1.5 rounded-xl transition-all ${
              showSessionsDrawer
                ? 'bg-glint-violet text-white'
                : 'hover:bg-slate-100 dark:hover:bg-glint-card hover:text-glint-violet dark:hover:text-white'
            }`}
            title="Chat History & Sessions"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-glint-card hover:text-glint-violet dark:hover:text-glint-yellow transition-all"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-glint-yellow" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>

          {/* Clear / Reset conversation */}
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-glint-border hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Clear and reset chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Minimize to mobile-style Chat Head */}
          <button
            onClick={onCollapseToHead}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-glint-violet/20 hover:text-glint-violet dark:hover:text-glint-cyan transition-colors"
            title="Minimize to Floating Icon"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close Window -> Collapses to Floating Icon in background! */}
          <button
            onClick={onCollapseToHead}
            className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-glint-coral/20 hover:text-rose-600 dark:hover:text-glint-coral transition-colors"
            title="Close to Floating Mascot Icon (Runs in background)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Account Popover Menu */}
      {showAccountMenu && isAuthenticated && (
        <div className="absolute top-[49px] right-3 z-40 w-56 rounded-2xl border border-slate-200 dark:border-glint-border/80 bg-white dark:bg-glint-space shadow-xl p-3 flex flex-col gap-2 animate-pop select-none">
          <div className="flex flex-col border-b border-slate-100 dark:border-glint-border/60 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" title={userEmail || ''}>
              {userEmail || 'developer@glint.dev'}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-glint-lime font-medium mt-0.5">
              ● Active Pro Session (15 AI queries/day)
            </span>
          </div>

          <button
            onClick={() => {
              setShowAccountMenu(false);
              onSignOut?.();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Sessions & History Drawer Overlay */}
      {showSessionsDrawer && (
        <div className="absolute inset-x-0 top-[49px] bottom-[57px] z-30 bg-white/95 dark:bg-glint-space/95 backdrop-blur-xl p-3 flex flex-col gap-2 overflow-y-auto animate-pop border-b border-slate-200 dark:border-glint-border/60">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-glint-border/60">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-glint-violet dark:text-glint-lime" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Chat History & Sessions</span>
            </div>
            <button
              onClick={handleNewSession}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-glint-violet to-glint-magenta text-white text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>New Chat</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
            {sessionsList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No past sessions yet.</p>
            ) : (
              sessionsList.map((session) => {
                const isActive = session.id === activeSession.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSwitchSession(session.id)}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? 'bg-glint-violet/10 dark:bg-glint-violet/20 border-glint-violet dark:border-glint-lime/50'
                        : 'bg-slate-50 dark:bg-glint-card/60 hover:bg-slate-100 dark:hover:bg-glint-card border-slate-200 dark:border-glint-border/60'
                    }`}
                  >
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <span className={`text-xs font-semibold truncate ${isActive ? 'text-glint-violet dark:text-glint-lime' : 'text-slate-800 dark:text-slate-200'}`}>
                        {session.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {session.messages.length} messages • {new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-glint-violet dark:bg-glint-lime mr-1" />
                      )}
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-glint-coral hover:bg-slate-200 dark:hover:bg-glint-space transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Conversational Message Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 max-w-[88%] ${
              msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            {/* Sender Label & Timestamp */}
            <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-500 dark:text-slate-400">
              {msg.sender === 'glint' || msg.sender === 'glinty' ? (
                <>
                  <BrandSpark size="xs" />
                  <span className="font-bold text-glint-violet dark:text-glint-lime">Glint</span>
                </>
              ) : (
                <span className="font-semibold text-slate-600 dark:text-slate-300">You</span>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Speech Bubble */}
            <div
              className={`group/bubble relative p-3 rounded-2xl text-xs leading-relaxed select-text ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-glint-violet to-glint-magenta text-white shadow-md rounded-tr-sm'
                  : 'bg-white dark:bg-glint-card/95 border border-slate-200 dark:border-glint-border/80 text-slate-800 dark:text-slate-100 shadow-sm rounded-tl-sm'
              }`}
            >
              {(msg.sender === 'glint' || msg.sender === 'glinty') && (
                <div className="absolute top-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity z-10">
                  <MessageCopyButton text={msg.text} />
                </div>
              )}

              {msg.sender === 'glint' || msg.sender === 'glinty' ? (
                <FormattedMessage text={msg.text} />
              ) : (
                <p className="whitespace-pre-line">{msg.text}</p>
              )}
            </div>

            {/* Embedded Command Card */}
            {msg.commandItem && (
              <div className="w-full mt-1 animate-pop">
                <CommandCard
                  item={msg.commandItem}
                  isLearned={msg.commandItem.id.startsWith('learned-')}
                />
              </div>
            )}

            {/* Inline Relevant Suggestion Chips */}
            {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
              <div className="flex flex-col gap-1 mt-1.5 w-full">
                {msg.suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-[11px] text-slate-700 dark:text-slate-300 hover:text-glint-violet dark:hover:text-white bg-white dark:bg-glint-card/80 hover:bg-slate-50 dark:hover:bg-glint-bubble border border-slate-200 dark:border-glint-border/70 hover:border-glint-violet/50 dark:hover:border-glint-lime/60 px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between group active:scale-[0.98] shadow-2xs cursor-pointer"
                  >
                    <span>&ldquo;{prompt}&rdquo;</span>
                    <Sparkles className="w-3 h-3 text-amber-500 dark:text-glint-yellow opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Glint Thinking Animation */}
        {isThinking && (
          <div className="self-start flex items-center gap-2 text-xs text-glint-violet dark:text-glint-cyan px-2.5 py-1.5 rounded-xl bg-white dark:bg-glint-card/80 border border-slate-200 dark:border-glint-border/60 shadow-sm animate-pulse">
            <BrandSpark size="xs" animate={true} />
            <span className="font-medium">Glint is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Conversational Input Bar & Ergonomics */}
      <div className="p-2.5 border-t border-slate-200 dark:border-glint-border/80 bg-white/95 dark:bg-glint-card/90 transition-colors duration-200 flex-shrink-0 flex flex-col gap-1.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-slate-100 dark:bg-glint-space/90 border border-slate-300 dark:border-glint-border rounded-2xl px-3 py-1.5 focus-within:border-glint-violet dark:focus-within:border-glint-lime focus-within:ring-2 focus-within:ring-glint-violet/20 dark:focus-within:ring-glint-lime/30 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Glint a command or question (e.g. 'kill port 3000')..."
            disabled={isThinking}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium pr-8 selection:bg-glint-magenta selection:text-white"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="p-1.5 rounded-xl bg-gradient-to-r from-glint-violet to-glint-magenta text-white hover:opacity-90 disabled:opacity-30 transition-all active:scale-95 flex-shrink-0 shadow-sm cursor-pointer"
            title="Send to Glint (Enter)"
          >
            {isThinking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>

        {/* Keyboard ergonomics footer */}
        <div className="flex items-center justify-between px-1 text-[9px] text-slate-400 dark:text-slate-500 font-mono select-none">
          <span>Ctrl+Space: toggle</span>
          <span>Enter: send</span>
        </div>
      </div>

      {/* Corner Resize Grip */}
      <div
        onPointerDown={handleResizePointerDown}
        className="absolute bottom-0.5 right-0.5 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5 text-slate-400 hover:text-glint-violet dark:hover:text-glint-lime transition-colors group select-none z-20"
        title="Drag to resize window"
      >
        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-current opacity-60 group-hover:opacity-100">
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="4" r="1.2" />
          <circle cx="4" cy="8" r="1.2" />
        </svg>
      </div>
    </div>
  );
};
