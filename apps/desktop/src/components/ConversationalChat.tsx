import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Loader2,
  Minus,
  X,
  GripVertical,
  Sparkles,
  Database,
  RotateCcw,
  Bot,
  User,
} from 'lucide-react';
import { CheatsheetItem } from '@glint/shared';
import { localCommandDb } from '../services/localCommandDb';
import { apiClient } from '../services/api';
import { CommandCard } from './CommandCard';
import { BrandSpark } from './BrandSpark';
import { useDesktopDrag } from '../hooks/useDesktopDrag';

interface ChatMessage {
  id: string;
  sender: 'user' | 'glinty';
  text: string;
  commandItem?: CheatsheetItem;
  timestamp: string;
  isOffline?: boolean;
}

interface ConversationalChatProps {
  onCollapseToHead: () => void;
  onClose: () => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

const STARTER_PROMPTS = [
  'Kill whatever is on port 3000',
  'Undo last git commit keeping changes',
  'Prune unused Docker images and volumes',
  'Find files larger than 100MB in current dir',
];

export const ConversationalChat: React.FC<ConversationalChatProps> = ({
  onCollapseToHead,
  onClose,
  isAuthenticated,
  onOpenAuth,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'greeting',
      sender: 'glinty',
      text: "Hey! ⚡ I'm Glinty, your personal terminal co-pilot. What command or system task are we working on?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const query = (textToSend || inputValue).trim();
    if (!query || isThinking) return;

    setInputValue('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    // 1. Search local persistent database first (0 AI cost, 0ms)
    const localMatches = localCommandDb.search(query);
    const topMatch = localMatches[0];

    if (topMatch && topMatch.score >= 50) {
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

    // 2. Query AI Gateway or fallback to heuristic generator
    try {
      const response = await apiClient.queryAI({
        query,
        context: { shell: 'bash', os: 'Linux (Ubuntu)' },
      });

      if (response.suggestions && response.suggestions.length > 0) {
        const first = response.suggestions[0];
        const learned = await localCommandDb.learnCommand(query, {
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
          text: "I couldn't find an exact command for that in your offline memory, and couldn't connect to the AI gateway. Try asking in different words!",
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="w-full h-full flex flex-col rounded-3xl border-2 border-glint-violet/70 bg-glint-space/95 backdrop-blur-2xl shadow-[0_15px_60px_rgba(125,35,217,0.45)] overflow-hidden animate-pop select-none">
      {/* Top Messenger Bar (Draggable) */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center justify-between px-3.5 py-2.5 border-b border-glint-border/80 bg-gradient-to-r from-glint-card to-glint-bubble cursor-grab active:cursor-grabbing"
        title="Glinty: Drag anywhere on your desktop screen!"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-glint-lime transition-colors" />
          <div
            onClick={onCollapseToHead}
            className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            title="Click to collapse to floating chat head"
          >
            <BrandSpark size="sm" animate={isThinking} />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              Glinty
              <span className="w-2 h-2 rounded-full bg-glint-lime animate-pulse" />
            </span>
            <span className="text-[10px] text-slate-400">
              {isThinking ? 'Thinking...' : `${dbStats.totalCommands} commands in local memory`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-slate-400" data-no-drag="true">
          {/* Clear conversation */}
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-xl hover:bg-glint-border hover:text-slate-200 transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Minimize to mobile-style Chat Head */}
          <button
            onClick={onCollapseToHead}
            className="p-1.5 rounded-xl hover:bg-glint-violet/20 hover:text-glint-cyan transition-colors"
            title="Minimize to Floating Chat Head"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close Window */}
          <button
            onClick={() => {
              const desktop = (window as any).glintDesktop;
              if (desktop?.closeWindow) {
                desktop.closeWindow();
              } else {
                onClose();
              }
            }}
            className="p-1.5 rounded-xl hover:bg-glint-coral/20 hover:text-glint-coral transition-colors"
            title="Close Glint"
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
            <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
              {msg.sender === 'glinty' ? (
                <>
                  <BrandSpark size="xs" />
                  <span className="font-bold text-glint-lime">Glinty</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-300">You</span>
                </>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.isOffline && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-glint-lime/15 text-glint-lime font-mono">
                  Offline DB
                </span>
              )}
            </div>

            {/* Speech Bubble */}
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed select-text ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-glint-violet to-glint-magenta text-white shadow-md rounded-tr-sm'
                  : 'bg-glint-card/95 border border-glint-border/80 text-slate-100 shadow-sm rounded-tl-sm'
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
          </div>
        ))}

        {/* Glinty Thinking Animation */}
        {isThinking && (
          <div className="self-start flex items-center gap-2 text-xs text-glint-cyan px-2 py-1.5 rounded-xl bg-glint-card/80 border border-glint-border/60 animate-pulse">
            <BrandSpark size="xs" animate={true} />
            <span className="font-medium">Glinty is finding the best command...</span>
          </div>
        )}

        {/* Conversation Starter Chips (when conversation is fresh) */}
        {messages.length <= 1 && (
          <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-glint-border/40">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Try asking:
            </span>
            <div className="flex flex-col gap-1.5">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left text-xs text-slate-300 hover:text-white bg-glint-card/80 hover:bg-glint-bubble border border-glint-border/80 hover:border-glint-lime/50 p-2 rounded-xl transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <span>&ldquo;{prompt}&rdquo;</span>
                  <Sparkles className="w-3 h-3 text-glint-yellow opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Conversational Input Bar */}
      <div className="p-2.5 border-t border-glint-border/80 bg-glint-card/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-glint-space/90 border border-glint-border rounded-2xl px-3 py-1.5 focus-within:border-glint-lime focus-within:ring-2 focus-within:ring-glint-lime/30 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message Glinty (e.g. 'how to undo last commit')..."
            disabled={isThinking}
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-medium pr-8 selection:bg-glint-magenta selection:text-white"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="p-1.5 rounded-xl bg-gradient-to-r from-glint-violet to-glint-magenta text-white hover:opacity-90 disabled:opacity-30 transition-all active:scale-95 flex-shrink-0"
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
