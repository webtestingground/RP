'use client';

import { useEffect, useRef, useState } from 'react';
import { groupChatPersonas, type Persona } from '@/personas';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  personaId?: string;
  personaName?: string;
  personaEmoji?: string;
  image?: {
    context: string;
    url: string;
    number: number;
  };
}

// Helper to get random image number
const getRandomImageNumber = (maxCount: number): number => {
  return Math.floor(Math.random() * maxCount) + 1;
};

export default function GroupChat() {
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonaSelect, setShowPersonaSelect] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const togglePersona = (persona: Persona) => {
    setSelectedPersonas(prev => {
      const exists = prev.find(p => p.id === persona.id);
      if (exists) {
        return prev.filter(p => p.id !== persona.id);
      } else {
        return [...prev, persona];
      }
    });
  };

  const startGroupChat = () => {
    if (selectedPersonas.length < 2) {
      alert('Please select at least 2 personas for group chat!');
      return;
    }
    setMessages([]);
    setShowPersonaSelect(false);
  };

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || isLoading) return;

    setInput('');
    const userMessage: Message = { role: 'user', content: messageText };
    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/group-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.map(m => ({
            role: m.role,
            content: m.personaName ? `${m.personaName}: ${m.content}` : m.content,
          })),
          personaIds: selectedPersonas.map(p => p.id),
        }),
      });

      const data = await response.json();

      if (data.success && data.responses) {
        const newMessages: Message[] = [...updatedMessages];

        for (const res of data.responses) {
          const persona = selectedPersonas.find(p => p.id === res.personaId);
          const assistantMessage: Message = {
            role: 'assistant',
            content: res.message,
            personaId: res.personaId,
            personaName: res.personaName,
            personaEmoji: persona?.emoji,
          };

          // Handle image if present
          if (res.image) {
            const { context, maxCount, personaId, randomize } = res.image;
            const imageNumber = randomize
              ? getRandomImageNumber(maxCount)
              : Math.floor(Math.random() * maxCount) + 1;

            const filename = randomize
              ? `${imageNumber}.jpg`
              : `${context}${imageNumber > 1 ? imageNumber : ''}.jpg`;

            assistantMessage.image = {
              context,
              url: `/personas/${personaId}/${filename}`,
              number: imageNumber,
            };
          }

          newMessages.push(assistantMessage);
        }

        setMessages(newMessages);
      } else {
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: data.error || 'Error occurred' },
        ]);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: 'Network error. Please try again.' },
      ]);
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  // Get messages for a specific persona
  const getPersonaMessages = (personaId: string): Message[] => {
    return messages.filter(m => m.personaId === personaId);
  };

  // Get user messages
  const getUserMessages = (): Message[] => {
    return messages.filter(m => m.role === 'user');
  };

  if (showPersonaSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-amber-900">
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <Link href="/" className="mb-6 inline-block text-pink-300 hover:text-pink-100">
              &larr; Back to Solo Chat
            </Link>
            <h1 className="mb-4 text-5xl font-bold text-white">Group Chat 👯‍♀️</h1>
            <p className="mb-4 text-lg text-pink-200">
              Select 2 or more girls to party with!
            </p>

            {groupChatPersonas.length === 0 ? (
              <p className="text-amber-300 mb-8">No personas available for group chat yet.</p>
            ) : (
              <>
                <p className="mb-8 text-sm text-pink-300">
                  Selected: {selectedPersonas.length} girl{selectedPersonas.length !== 1 ? 's' : ''}
                  {selectedPersonas.length > 0 && ` (${selectedPersonas.map(p => p.name).join(' & ')})`}
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                  {groupChatPersonas.map((persona) => {
                    const isSelected = selectedPersonas.some(p => p.id === persona.id);
                    return (
                      <button
                        key={persona.id}
                        onClick={() => togglePersona(persona)}
                        className={`relative overflow-hidden rounded-xl border-2 p-6 text-left shadow-lg transition hover:scale-105 ${
                          isSelected
                            ? 'border-pink-400 bg-pink-500/30 ring-2 ring-pink-400'
                            : 'border-white/20 bg-white/10 hover:border-white/40'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm">
                            ✓
                          </div>
                        )}
                        <div className="text-4xl mb-3">{persona.emoji}</div>
                        <h3 className="font-bold text-white text-xl">{persona.name}</h3>
                        <p className="text-sm text-pink-200 mt-1">{persona.tagline}</p>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={startGroupChat}
                  disabled={selectedPersonas.length < 2}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 px-8 py-4 font-bold text-white shadow-xl transition hover:from-pink-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  🎉 Start Party Chat ({selectedPersonas.length} selected)
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              {selectedPersonas.map((p) => (
                <span key={p.id} className="text-2xl">
                  {p.emoji}
                </span>
              ))}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Party Chat</h2>
              <p className="text-xs text-pink-300">
                {selectedPersonas.map(p => p.name).join(' & ')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Solo Chat
            </Link>
            <button
              onClick={() => {
                setShowPersonaSelect(true);
                setMessages([]);
                setSelectedPersonas([]);
              }}
              className="rounded-lg border border-pink-400/50 bg-pink-500/20 px-3 py-2 text-sm font-medium text-pink-200 transition hover:bg-pink-500/30"
            >
              Change Girls
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area - Side by Side */}
      <main className="flex-1 container mx-auto px-4 py-4 flex flex-col">
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Each Persona gets their own chat column */}
          {selectedPersonas.map((persona, index) => {
            const personaMessages = getPersonaMessages(persona.id);
            const colors = [
              'from-pink-500/20 to-purple-500/20 border-pink-400/30',
              'from-amber-500/20 to-orange-500/20 border-amber-400/30',
              'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
            ];
            const bgColor = colors[index % colors.length];

            return (
              <div
                key={persona.id}
                className={`flex-1 flex flex-col rounded-2xl border bg-gradient-to-b ${bgColor} overflow-hidden`}
              >
                {/* Persona Header */}
                <div className="p-3 border-b border-white/10 bg-black/20 flex items-center gap-2">
                  <span className="text-2xl">{persona.emoji}</span>
                  <div>
                    <h3 className="font-bold text-white">{persona.name}</h3>
                    <p className="text-xs text-white/60">{persona.tagline}</p>
                  </div>
                </div>

                {/* Persona Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {personaMessages.length === 0 && !isLoading && (
                    <p className="text-white/40 text-sm text-center py-4">
                      Say something to {persona.name}...
                    </p>
                  )}
                  {personaMessages.map((msg, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-3">
                      <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                      {msg.image && (
                        <div className="mt-2">
                          <img
                            src={msg.image.url}
                            alt={msg.image.context}
                            className="rounded-lg max-w-full h-auto shadow-lg"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '-0.3s' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '-0.15s' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" />
                      </div>
                      typing...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Messages & Input Area */}
        <div className="mt-4">
          {/* Recent user message display */}
          {messages.filter(m => m.role === 'user').slice(-1).map((msg, i) => (
            <div key={i} className="mb-3 flex justify-center">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl px-4 py-2 max-w-md text-center shadow-lg">
                <span className="text-xs text-slate-400 block mb-1">You said:</span>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Input */}
          <div className="flex gap-3 bg-black/30 rounded-2xl p-3 border border-white/10">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Say something to ${selectedPersonas.map(p => p.name).join(' & ')}...`}
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white placeholder-white/40 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
              disabled={isLoading}
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 px-6 py-3 font-bold text-white shadow-lg transition hover:from-pink-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
        <div ref={chatEndRef} />
      </main>
    </div>
  );
}
