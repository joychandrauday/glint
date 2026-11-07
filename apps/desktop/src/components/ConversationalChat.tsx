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
  Power,
  Key,
  Stethoscope,
  Terminal,
} from 'lucide-react';
import { localCommandDb } from '../services/localCommandDb';
import { apiClient } from '../services/api';
import { chatSessionDb, ChatSession, ChatMessage, DEFAULT_GREETING_STARTERS } from '../services/chatSessionDb';
import { CommandCard } from './CommandCard';
import { ErrorDoctorCard, RegexTesterCard, CronCalculatorCard, RunbookCard } from './MicroTools';
import { BrandSpark } from './BrandSpark';
import { FormattedMessage } from './CodeBlock';
import { ByokSettingsModal } from './ByokSettingsModal';
import { byokStorage } from '../services/byokStorage';
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
      className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer border border-zinc-700/50"
      title="Copy message to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="text-[9px] font-bold text-emerald-400 font-mono">Copied</span>
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
  const [autoStartEnabled, setAutoStartEnabled] = useState(true);

  // Sync auto-start status with Electron main process
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.getAutoStartStatus) {
      (window as any).glintDesktop.getAutoStartStatus().then((res: any) => {
        if (res && typeof res.enabled === 'boolean') {
          setAutoStartEnabled(res.enabled);
        }
      });
    }
  }, []);

  const handleToggleAutoStart = async () => {
    const nextVal = !autoStartEnabled;
    setAutoStartEnabled(nextVal);
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.setAutoStartStatus) {
      await (window as any).glintDesktop.setAutoStartStatus(nextVal);
    }
  };

  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isByokOpen, setIsByokOpen] = useState(false);
  const [byokConfig, setByokConfig] = useState(() => byokStorage.getSettings());
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

  const handleFixClipboardError = async () => {
    let clip = '';
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.readClipboard) {
      clip = await (window as any).glintDesktop.readClipboard();
    } else {
      try {
        clip = await navigator.clipboard.readText();
      } catch {}
    }

    if (clip && clip.trim().length > 5) {
      handleSendMessage(`Fix and diagnose this error:\n${clip.trim().slice(0, 1500)}`);
    } else {
      handleSendMessage('How do I diagnose and fix recent terminal errors?');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = (textToSend || inputValue).trim();
    if (!rawQuery || isThinking) return;

    setInputValue('');
    const queryLower = rawQuery.toLowerCase();

    // 0. Slash Commands: /byok, /keys, /settings
    if (queryLower === '/byok' || queryLower === '/keys' || queryLower === '/settings') {
      setIsByokOpen(true);
      return;
    }

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
    // Trigger offline cheatsheet if there is a confident match (score >= 75)
    // Otherwise, falls through to AI cascade!
    const localMatches = localCommandDb.search(rawQuery);
    const topMatch = localMatches[0];

    if (topMatch && topMatch.score >= 75) {
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
        aiResult = await (window as any).glintDesktop.queryAI(rawQuery, byokConfig);
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
        if (aiResult.quotaExceeded) {
          const glintReply: ChatMessage = {
            id: `glint-${Date.now()}`,
            sender: 'glint',
            text: aiResult.text,
            quotaExceeded: true,
            isOffline: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, glintReply]);
        } else if (aiResult.type === 'doctor') {
          // Terminal Error Doctor - Automatically save fix to local memory
          await localCommandDb.learnCommand(rawQuery, {
            command: aiResult.fixCommand,
            description: aiResult.rootCause,
            dangerLevel: 'safe',
            category: 'error-doctor',
          });

          const glintReply: ChatMessage = {
            id: `glint-${Date.now()}`,
            sender: 'glint',
            text: aiResult.rootCause,
            doctor: aiResult,
            byokFailed: aiResult.byokFailed,
            byokError: aiResult.byokError,
            provider: aiResult.provider,
            isOffline: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, glintReply]);
        } else if (aiResult.type === 'runbook') {
          // Multi-Step Interactive Runbook - Auto-save to local memory
          localCommandDb.learnAnswer(rawQuery, aiResult.title);

          const glintReply: ChatMessage = {
            id: `glint-${Date.now()}`,
            sender: 'glint',
            text: aiResult.title,
            runbook: aiResult,
            byokFailed: aiResult.byokFailed,
            byokError: aiResult.byokError,
            provider: aiResult.provider,
            isOffline: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, glintReply]);
        } else if (aiResult.type === 'regex_tool') {
          // Regex Tester Tool - Auto-save to local memory
          localCommandDb.learnAnswer(rawQuery, aiResult.explanation);

          const glintReply: ChatMessage = {
            id: `glint-${Date.now()}`,
            sender: 'glint',
            text: `/${aiResult.pattern}/${aiResult.flags || 'g'}`,
            regexTool: aiResult,
            byokFailed: aiResult.byokFailed,
            byokError: aiResult.byokError,
            provider: aiResult.provider,
            isOffline: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, glintReply]);
        } else if (aiResult.type === 'cron_tool') {
          // Cron Schedule Tool - Auto-save to local memory
          localCommandDb.learnAnswer(rawQuery, aiResult.explanation);

          const glintReply: ChatMessage = {
            id: `glint-${Date.now()}`,
            sender: 'glint',
            text: aiResult.expression,
            cronTool: aiResult,
            byokFailed: aiResult.byokFailed,
            byokError: aiResult.byokError,
            provider: aiResult.provider,
            isOffline: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, glintReply]);
        } else if (aiResult.type === 'answer') {
          // General developer / personalized answer - Auto-save to local memory
          localCommandDb.learnAnswer(rawQuery, aiResult.text);

          const glintReply: ChatMessage = {
            id: `glint-${Date.now()}`,
            sender: 'glint',
            text: aiResult.text,
            byokFailed: aiResult.byokFailed,
            byokError: aiResult.byokError,
            provider: aiResult.provider,
            isOffline: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, glintReply]);
        } else {
          // Terminal command recommendation - Auto-save to local memory
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
            text: aiResult.text || "Here is the exact command you need:",
            commandItem: learned,
            byokFailed: aiResult.byokFailed,
            byokError: aiResult.byokError,
            provider: aiResult.provider,
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
    <div className="relative w-full h-full flex flex-col rounded-2xl border border-zinc-700/80 dark:border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl dev-card-shadow overflow-hidden animate-pop select-none transition-colors duration-200">
      {/* Top Messenger Bar (Draggable) */}
      <div
        onPointerDown={handlePointerDown}
        onMouseDown={handlePointerDown}
        onDragStart={(e) => e.preventDefault()}
        className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/90 bg-zinc-900/90 cursor-grab active:cursor-grabbing transition-colors duration-200 flex-shrink-0 touch-none"
        title="Glint: Drag anywhere on your desktop screen!"
      >
        <div className="flex items-center gap-2.5">
          <GripVertical className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 transition-colors" />
          <div
            onClick={onCollapseToHead}
            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
            title="Click to collapse to floating icon"
          >
            <BrandSpark size="md" className="w-7 h-7" animate={isThinking} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-zinc-100">
                Glint
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isAuthenticated ? (
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                  PRO
                </span>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors border border-zinc-700/60 cursor-pointer font-mono"
                  title="Guest Mode: Click to sign in or sign up"
                >
                  Guest
                </button>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 truncate max-w-[150px]" title={activeSession?.title}>
              {isThinking ? 'Thinking...' : activeSession?.title || `${dbStats.totalCommands} offline commands`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-zinc-400" data-no-drag="true">
          {/* BYOK Settings Button */}
          <button
            onClick={() => setIsByokOpen(true)}
            className={`p-1.5 rounded-lg transition-all ${
              byokStorage.hasActiveCustomKey(byokConfig)
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'hover:bg-zinc-800 hover:text-zinc-200'
            }`}
            title={`AI Provider: ${byokStorage.getActiveProviderLabel(byokConfig)} (Click to configure BYOK / Ollama)`}
          >
            <Key className="w-3.5 h-3.5" />
          </button>

          {/* Account Profile / Auth Button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                setShowAccountMenu((prev) => !prev);
              } else {
                onOpenAuth();
              }
            }}
            className={`p-1.5 rounded-lg transition-all ${
              showAccountMenu
                ? 'bg-zinc-800 text-zinc-100'
                : isAuthenticated
                ? 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                : 'hover:bg-zinc-800 hover:text-zinc-200'
            }`}
            title={isAuthenticated ? `Account: ${userEmail || 'Developer'} (Click for menu)` : 'Sign in or Create Account'}
          >
            <User className="w-3.5 h-3.5" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleNewSession}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
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
            className={`p-1.5 rounded-lg transition-all ${
              showSessionsDrawer
                ? 'bg-zinc-800 text-zinc-100'
                : 'hover:bg-zinc-800 hover:text-zinc-200'
            }`}
            title="Chat History & Sessions"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-all"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-200" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-200" />
            )}
          </button>

          {/* Clear / Reset conversation */}
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Clear and reset chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Minimize to mobile-style Chat Head */}
          <button
            onClick={onCollapseToHead}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Collapse into Floating Mascot (or double click title)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close Window -> Collapses to Floating Icon in background! */}
          <button
            onClick={onCollapseToHead}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-rose-400 text-zinc-400 transition-colors cursor-pointer"
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

          {/* Desktop Auto-Start Toggle */}
          <div className="flex items-center justify-between py-1 px-1 border-b border-slate-100 dark:border-glint-border/60">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Start on boot</span>
              <span className="text-[9px] text-slate-400">Launch Glint with system</span>
            </div>
            <button
              onClick={handleToggleAutoStart}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                autoStartEnabled ? 'bg-emerald-500 dark:bg-glint-lime justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
              title={autoStartEnabled ? 'Auto-start enabled' : 'Auto-start disabled'}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
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

          {/* Fully Quit Desktop App */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).glintDesktop?.quitApp) {
                (window as any).glintDesktop.quitApp();
              } else {
                window.close();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-glint-card hover:text-slate-800 dark:hover:text-slate-200 transition-colors w-full cursor-pointer"
          >
            <Power className="w-3.5 h-3.5 text-slate-400" />
            <span>Quit Glint</span>
          </button>
        </div>
      )}

      {/* Sessions & History Drawer Overlay */}
      {showSessionsDrawer && (
        <div className="absolute inset-x-0 top-[49px] bottom-[57px] z-30 bg-zinc-950/95 backdrop-blur-xl p-3 flex flex-col gap-2 overflow-y-auto animate-pop border-b border-zinc-800">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-200">Chat History & Sessions</span>
            </div>
            <button
              onClick={handleNewSession}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] font-semibold transition-all shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>New Chat</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
            {sessionsList.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center font-mono">No past sessions yet.</p>
            ) : (
              sessionsList.map((session) => {
                const isActive = session.id === activeSession.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSwitchSession(session.id)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? 'bg-zinc-800/90 border-zinc-700 text-zinc-100'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <span className={`text-xs font-medium truncate ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>
                        {session.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {session.messages.length} messages • {new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
                      )}
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
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
            <div className="flex items-center gap-1.5 px-1 text-[10px] text-zinc-500 font-mono">
              {msg.sender === 'glint' || msg.sender === 'glinty' ? (
                <>
                  <BrandSpark size="xs" />
                  <span className="font-semibold text-zinc-300">Glint</span>
                </>
              ) : (
                <span className="font-semibold text-zinc-400">You</span>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Speech Bubble */}
            <div
              className={`group/bubble relative p-3 rounded-xl text-xs leading-relaxed select-text ${
                msg.sender === 'user'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/70 shadow-xs rounded-tr-xs'
                  : 'bg-zinc-900/90 border border-zinc-800/80 text-zinc-200 shadow-xs rounded-tl-xs'
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

              {/* BYOK Failure Warning Notification */}
              {msg.byokFailed && (
                <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-sans flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                  <span>Your BYOK key encountered an issue ({msg.byokError || 'Connection error'}). Glint answered via System AI.</span>
                </div>
              )}

              {/* Daily Quota Exceeded BYOK CTA */}
              {msg.quotaExceeded && (
                <button
                  onClick={() => setIsByokOpen(true)}
                  className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Key className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Configure Unlimited Free BYOK Key</span>
                </button>
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

            {/* Embedded Terminal Error Doctor */}
            {msg.doctor && (
              <div className="w-full mt-1">
                <ErrorDoctorCard doctor={msg.doctor} />
              </div>
            )}

            {/* Embedded Interactive Runbook */}
            {msg.runbook && (
              <div className="w-full mt-1">
                <RunbookCard runbook={msg.runbook} />
              </div>
            )}

            {/* Embedded Regex Tester */}
            {msg.regexTool && (
              <div className="w-full mt-1">
                <RegexTesterCard regexTool={msg.regexTool} />
              </div>
            )}

            {/* Embedded Cron Calculator */}
            {msg.cronTool && (
              <div className="w-full mt-1">
                <CronCalculatorCard cronTool={msg.cronTool} />
              </div>
            )}

            {/* Inline Relevant Suggestion Chips */}
            {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
              <div className="flex flex-col gap-1 mt-1.5 w-full">
                {msg.suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-[11px] text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between group active:scale-[0.99] shadow-2xs cursor-pointer font-sans"
                  >
                    <span>&ldquo;{prompt}&rdquo;</span>
                    <Sparkles className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Glint Thinking Animation */}
        {isThinking && (
          <div className="self-start flex items-center gap-2 text-xs text-zinc-300 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-xs animate-pulse font-mono">
            <BrandSpark size="xs" animate={true} />
            <span>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Conversational Input Bar & Ergonomics */}
      <div className="p-2.5 border-t border-zinc-800/90 bg-zinc-900/90 transition-colors duration-200 flex-shrink-0 flex flex-col gap-1.5">
        {/* Quick Developer Action Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar select-none text-[10px]">
          <button
            type="button"
            onClick={handleFixClipboardError}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 text-zinc-300 border border-zinc-700/60 hover:border-zinc-600 transition-all font-medium cursor-pointer whitespace-nowrap active:scale-95 font-sans"
            title="Inspect clipboard for error stack traces and generate instant fix"
          >
            <Stethoscope className="w-3 h-3 text-rose-400" />
            <span>Fix Error</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('Regex for ')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 text-zinc-300 border border-zinc-700/60 hover:border-zinc-600 transition-all font-medium cursor-pointer whitespace-nowrap active:scale-95 font-sans"
          >
            <span>⚡ Regex Tester</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('Cron schedule for ')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 text-zinc-300 border border-zinc-700/60 hover:border-zinc-600 transition-all font-medium cursor-pointer whitespace-nowrap active:scale-95 font-sans"
          >
            <span>⏱️ Cron</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('Step by step guide for ')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 text-zinc-300 border border-zinc-700/60 hover:border-zinc-600 transition-all font-medium cursor-pointer whitespace-nowrap active:scale-95 font-sans"
          >
            <span>📋 Runbook</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-zinc-950/90 border border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600/30 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Glint a command or question (e.g. 'docker init project')..."
            disabled={isThinking}
            className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans pr-8 selection:bg-zinc-700 selection:text-white"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="p-1.5 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-30 transition-all active:scale-95 flex-shrink-0 shadow-xs cursor-pointer font-bold"
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
        <div className="flex items-center justify-between px-1 text-[9px] text-zinc-500 font-mono select-none">
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

      {/* BYOK / Local AI Settings Modal */}
      <ByokSettingsModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
        onSaved={() => setByokConfig(byokStorage.getSettings())}
      />
    </div>
  );
};
