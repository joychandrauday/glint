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
} from 'lucide-react';
import { CheatsheetItem } from '@glint/shared';
import { localCommandDb } from '../services/localCommandDb';
import { apiClient } from '../services/api';
import { CommandCard } from './CommandCard';
import { BrandSpark } from './BrandSpark';
import { useDesktopDrag } from '../hooks/useDesktopDrag';
import { useTheme } from '../hooks/useTheme';

interface ChatMessage {
  id: string;
  sender: 'user' | 'glinty';
  text: string;
  commandItem?: CheatsheetItem;
  suggestedPrompts?: string[];
  timestamp: string;
  isOffline?: boolean;
}

interface ConversationalChatProps {
  onCollapseToHead: () => void;
  onClose: () => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

const GREETING_RESPONSES = [
  "Hey there! 👋 Glinty here. What command or system task are we working on today?",
  "Hello! ⚡ Terminal co-pilot ready. Tell me what you're trying to do in plain English!",
  "Hey! Ready to get things done. Need help with Docker, Git, Linux, or debugging an issue?",
  "Hi! 🚀 Glinty at your service. Looking for a command, or troubleshooting a server?",
];

const GREETING_STARTERS = [
  'Kill whatever is on port 3000',
  'Undo last git commit keeping changes',
  'Prune unused Docker images and volumes',
  'Find files larger than 100MB in current dir',
];

const THANK_YOU_RESPONSES = [
  "You're very welcome! Happy hacking 💻🚀",
  "Anytime! Let me know whenever you need another terminal assist ⚡",
  "Glad I could help! I've saved that into your local offline memory for next time.",
  "You got it! Go crush that project 💪",
];

export const ConversationalChat: React.FC<ConversationalChatProps> = ({
  onCollapseToHead,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'greeting',
      sender: 'glinty',
      text: "Hey! ⚡ I'm Glinty, your personal terminal co-pilot. What command or system task are we working on?",
      suggestedPrompts: GREETING_STARTERS,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isDark, toggleTheme } = useTheme();
  const { handlePointerDown } = useDesktopDrag();
  const dbStats = localCommandDb.getStats();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
        const glintyReply: ChatMessage = {
          id: `glinty-${Date.now()}`,
          sender: 'glinty',
          text: randomGreeting,
          suggestedPrompts: GREETING_STARTERS,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintyReply]);
        setIsThinking(false);
      }, 200);
      return;
    }

    // 2. Detect Gratitude & Goodbyes
    const isGratitude = /^(thanks|thank you|ty|thx|awesome|cool|great|bye|goodbye|cya)\b/i.test(queryLower);
    if (isGratitude) {
      setTimeout(() => {
        const randomThanks = THANK_YOU_RESPONSES[Math.floor(Math.random() * THANK_YOU_RESPONSES.length)];
        const glintyReply: ChatMessage = {
          id: `glinty-${Date.now()}`,
          sender: 'glinty',
          text: randomThanks,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintyReply]);
        setIsThinking(false);
      }, 200);
      return;
    }

    // 3. Detect Identity / "Who are you" questions
    const isIdentity = /^(who are you|what are you|what can you do|help)\b/i.test(queryLower);
    if (isIdentity) {
      setTimeout(() => {
        const glintyReply: ChatMessage = {
          id: `glinty-${Date.now()}`,
          sender: 'glinty',
          text: "I'm Glinty, your personal terminal co-pilot! ⚡ I turn natural language into exact, safe terminal commands, explain confusing parameters, and remember your commands in your offline database so you never have to memorize them.",
          suggestedPrompts: [
            'How do I check open ports?',
            'Docker prune unused data',
            'Git stash uncommitted work',
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintyReply]);
        setIsThinking(false);
      }, 200);
      return;
    }

    // 4. Command Search: Search local persistent database first (0 AI cost, 0ms)
    const localMatches = localCommandDb.search(rawQuery);
    const topMatch = localMatches[0];

    if (topMatch && topMatch.score >= 55) {
      setTimeout(() => {
        const glintyReply: ChatMessage = {
          id: `glinty-${Date.now()}`,
          sender: 'glinty',
          text: topMatch.item.id.startsWith('learned-')
            ? "I remember this one from your playbook! Here's the command you used before:"
            : "Got you covered! Here's the command from our offline cheatsheets:",
          commandItem: topMatch.item,
          isOffline: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintyReply]);
        setIsThinking(false);
      }, 250);
      return;
    }

    // 5. Query AI Gateway or fallback to heuristic generator
    try {
      const response = await apiClient.queryAI({
        query: rawQuery,
        context: { shell: 'bash', os: 'Linux (Ubuntu)' },
      });

      if (response.suggestions && response.suggestions.length > 0) {
        const first = response.suggestions[0];
        const learned = await localCommandDb.learnCommand(rawQuery, {
          command: first.command,
          template: first.template || first.command,
          description: first.description,
          dangerLevel: first.dangerLevel,
          variables: first.variables?.map((v) => ({ name: v.name, defaultValue: v.defaultValue, label: v.name })) || [],
          category: 'ai-learned',
          platform: 'linux',
        });

        const glintyReply: ChatMessage = {
          id: `glinty-${Date.now()}`,
          sender: 'glinty',
          text: first.explanation || "Here is the exact command you need. I've also saved it to your local memory for future offline use!",
          commandItem: learned,
          isOffline: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, glintyReply]);
      } else {
        throw new Error('No suggestions returned');
      }
    } catch (err: any) {
      // Offline fallback: check if any partial match exists
      if (topMatch) {
        const glintyReply: ChatMessage = {
          id: `glinty-${Date.now()}`,
          sender: 'glinty',
          text: "I couldn't reach the AI cloud right now, but here's the closest match from your offline database:",
          commandItem: topMatch.item,
          isOffline: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintyReply]);
      } else {
        const glintyReply: ChatMessage = {
          id: `glinty-${Date.now()}`,
          sender: 'glinty',
          text: `I couldn't find an exact command for "${rawQuery}" in your offline memory right now. Try telling me what tool or action you want to perform!`,
          suggestedPrompts: [
            'How to find files in Linux',
            'Kill process by port',
            'Docker container logs',
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, glintyReply]);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'greeting',
        sender: 'glinty',
        text: "Fresh chat started! ⚡ What command are we tackling next?",
        suggestedPrompts: GREETING_STARTERS,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="w-full h-full flex flex-col rounded-3xl border-2 border-slate-300 dark:border-glint-violet/70 bg-slate-50/95 dark:bg-glint-space/95 backdrop-blur-2xl shadow-[0_15px_60px_rgba(125,35,217,0.25)] dark:shadow-[0_15px_60px_rgba(125,35,217,0.45)] overflow-hidden animate-pop select-none transition-colors duration-200">
      {/* Top Messenger Bar (Draggable) */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-glint-border/80 bg-white/95 dark:bg-gradient-to-r dark:from-glint-card dark:to-glint-bubble cursor-grab active:cursor-grabbing transition-colors duration-200"
        title="Glinty: Drag anywhere on your desktop screen!"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 hover:text-glint-violet dark:hover:text-glint-lime transition-colors" />
          <div
            onClick={onCollapseToHead}
            className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            title="Click to collapse to floating chat head"
          >
            <BrandSpark size="sm" animate={isThinking} />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Glinty
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-glint-lime animate-pulse" />
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {isThinking ? 'Thinking...' : `${dbStats.totalCommands} commands in local memory`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400" data-no-drag="true">
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

          {/* Clear conversation */}
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-glint-border hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Minimize to mobile-style Chat Head */}
          <button
            onClick={onCollapseToHead}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-glint-violet/20 hover:text-glint-violet dark:hover:text-glint-cyan transition-colors"
            title="Minimize to Floating Chat Head"
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

      {/* Conversational Message Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 max-w-[88%] ${
              msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            {/* Sender Label & Timestamp */}
            <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-500 dark:text-slate-400">
              {msg.sender === 'glinty' ? (
                <>
                  <BrandSpark size="xs" />
                  <span className="font-bold text-glint-violet dark:text-glint-lime">Glinty</span>
                </>
              ) : (
                <span className="font-semibold text-slate-600 dark:text-slate-300">You</span>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.isOffline && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-glint-lime/15 text-emerald-600 dark:text-glint-lime font-mono border border-emerald-200 dark:border-transparent">
                  Offline DB
                </span>
              )}
            </div>

            {/* Speech Bubble */}
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed select-text ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-glint-violet to-glint-magenta text-white shadow-md rounded-tr-sm'
                  : 'bg-white dark:bg-glint-card/95 border border-slate-200 dark:border-glint-border/80 text-slate-800 dark:text-slate-100 shadow-sm rounded-tl-sm'
              }`}
            >
              <p>{msg.text}</p>
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
                    className="text-left text-[11px] text-slate-700 dark:text-slate-300 hover:text-glint-violet dark:hover:text-white bg-white dark:bg-glint-card/80 hover:bg-slate-50 dark:hover:bg-glint-bubble border border-slate-200 dark:border-glint-border/70 hover:border-glint-violet/50 dark:hover:border-glint-lime/60 px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between group active:scale-[0.98] shadow-2xs"
                  >
                    <span>&ldquo;{prompt}&rdquo;</span>
                    <Sparkles className="w-3 h-3 text-amber-500 dark:text-glint-yellow opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Glinty Thinking Animation */}
        {isThinking && (
          <div className="self-start flex items-center gap-2 text-xs text-glint-violet dark:text-glint-cyan px-2.5 py-1.5 rounded-xl bg-white dark:bg-glint-card/80 border border-slate-200 dark:border-glint-border/60 shadow-sm animate-pulse">
            <BrandSpark size="xs" animate={true} />
            <span className="font-medium">Glinty is finding the best command...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Conversational Input Bar */}
      <div className="p-2.5 border-t border-slate-200 dark:border-glint-border/80 bg-white/95 dark:bg-glint-card/90 transition-colors duration-200">
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
            placeholder="Message Glinty (e.g. 'kill port 3000' or 'how to undo commit')..."
            disabled={isThinking}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium pr-8 selection:bg-glint-magenta selection:text-white"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="p-1.5 rounded-xl bg-gradient-to-r from-glint-violet to-glint-magenta text-white hover:opacity-90 disabled:opacity-30 transition-all active:scale-95 flex-shrink-0 shadow-sm"
            title="Send to Glinty"
          >
            {isThinking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
