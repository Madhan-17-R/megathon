'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Bot,
  Leaf,
  Zap,
  Home,
  Sun,
  Flame,
  BarChart3,
} from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { getMockChatResponse } from '@/lib/mockData';
import { useApp } from '@/lib/context';

const QUICK_PROMPTS = [
  { icon: Leaf, text: 'How is my Green Score calculated?' },
  { icon: Flame, text: 'Tell me about heat pump benefits' },
  { icon: Sun, text: 'How much can solar PV save me?' },
  { icon: Home, text: 'What is the best insulation for my home?' },
  { icon: Zap, text: 'How can I reduce my electricity bill?' },
  { icon: BarChart3, text: 'What does a good EPC rating mean?' },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-emerald-400 opacity-60"
          style={{
            animation: 'bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function AssistantPage() {
  const { assessment } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: assessment
          ? `Hi! I'm your AI Green Home Advisor. Your property **${assessment.propertyName}** currently scores **${assessment.greenScore ?? '--'}/100** (${assessment.scoreCategory}). What would you like to know about improving your home's energy efficiency?`
          : `Hi! I'm your AI Green Home Advisor. I can help you understand energy efficiency, retrofit options, your Green Home Score, and how to reduce your energy bills. What would you like to know?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [assessment]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          assessment: assessment
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        };
        setMessages((m) => [...m, aiMsg]);
        setTyping(false);
        return;
      }
    } catch (e) {
      console.warn("API unavailable, falling back to mock");
    }

    // Fallback to mock
    // Simulate thinking delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000));
    const response = getMockChatResponse(text);
    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, aiMsg]);
    setTyping(false);
  }, [messages, assessment]);

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown bold renderer
  function renderContent(text: string) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-semibold text-white">
          {part}
        </strong>
      ) : (
        part
      )
    );
  }

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto flex max-w-3xl flex-col px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">AI Green Home Advisor</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ask me anything about energy efficiency, retrofits, or your Green Score.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/8 px-3 py-1 text-[11px] text-amber-400">
            <Sparkles className="h-3 w-3" />
            Backend integration ready. Set OPENAI_API_KEY for live responses.
          </div>
        </div>

        {/* Quick prompts */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {QUICK_PROMPTS.map(({ icon: Icon, text }) => (
            <button
              key={text}
              onClick={() => sendMessage(text)}
              disabled={typing}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20 disabled:opacity-40 transition-all duration-150"
            >
              <Icon className="h-3 w-3 text-emerald-400" />
              {text}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="glass-card flex flex-col rounded-2xl overflow-hidden" style={{ minHeight: '460px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ maxHeight: '520px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                    ${msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-700'
                    }`}
                >
                  {msg.role === 'assistant' ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-slate-300" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === 'assistant'
                      ? 'bg-white/6 border border-white/8 text-slate-200 rounded-tl-none'
                      : 'bg-emerald-600/20 border border-emerald-500/25 text-slate-100 rounded-tr-none'
                    }`}
                >
                  {renderContent(msg.content)}
                  <p
                    className={`mt-1.5 text-[10px] ${
                      msg.role === 'assistant' ? 'text-slate-600' : 'text-emerald-700'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-white/8 bg-white/6 px-4 py-3">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-white/8 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about insulation, heat pumps, solar, EPC ratings…"
                  disabled={typing}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 transition-all"
                  style={{ maxHeight: '120px' }}
                />
                <p className="mt-1 text-[10px] text-slate-700">Press Enter to send · Shift+Enter for new line</p>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || typing}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
          <MessageSquare className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The AI Assistant provides general educational information about home energy efficiency.
            It does not constitute professional engineering, financial, or legal advice.
            Always consult a qualified energy assessor before undertaking retrofit works.
          </p>
        </div>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
