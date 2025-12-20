'use client';

import { useEffect, useRef, useState } from 'react';
import { personas, type Persona } from '@/personas';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  personaId?: string;
  personaName?: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    const greeting = `*${selectedPersonas.map(p => p.name).join(' and ')} join the chat*\n\n${selectedPersonas.map(p => `${p.emoji} ${p.name}: Hey! Nice to meet you!`).join('\n')}`;

    setMessages([{ role: 'assistant', content: greeting }]);
    setShowPersonaSelect(false);
  };

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || isLoading) return;

    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', content: messageText }];
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
          const assistantMessage: Message = {
            role: 'assistant',
            content: res.message,
            personaId: res.personaId,
            personaName: res.personaName,
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

  const getPersonaColor = (personaId?: string): string => {
    const colors = [
      'border-pink-400 bg-pink-50',
      'border-purple-400 bg-purple-50',
      'border-blue-400 bg-blue-50',
      'border-green-400 bg-green-50',
      'border-amber-400 bg-amber-50',
      'border-red-400 bg-red-50',
    ];
    if (!personaId) return 'border-slate-300 bg-white';
    const index = selectedPersonas.findIndex(p => p.id === personaId);
    return colors[index % colors.length];
  };

  const getPersonaEmoji = (personaId?: string): string => {
    if (!personaId) return '';
    const persona = selectedPersonas.find(p => p.id === personaId);
    return persona?.emoji || '';
  };

  if (showPersonaSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <Link href="/" className="mb-6 inline-block text-slate-600 hover:text-slate-800">
              &larr; Back to Solo Chat
            </Link>
            <h1 className="mb-4 text-5xl font-bold text-slate-900">Group Chat 👯‍♀️</h1>
            <p className="mb-4 text-lg text-slate-600">
              Select 2 or more personas to chat with together!
            </p>
            <p className="mb-8 text-sm text-slate-500">
              Selected: {selectedPersonas.length} persona{selectedPersonas.length !== 1 ? 's' : ''}
              {selectedPersonas.length > 0 && ` (${selectedPersonas.map(p => p.name).join(', ')})`}
            </p>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8">
              {personas.map((persona) => {
                const isSelected = selectedPersonas.some(p => p.id === persona.id);
                return (
                  <button
                    key={persona.id}
                    onClick={() => togglePersona(persona)}
                    className={`relative overflow-hidden rounded-xl border-2 p-4 text-left shadow-md transition hover:scale-105 ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-300'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm">
                        ✓
                      </div>
                    )}
                    <div className="text-3xl mb-2">{persona.emoji}</div>
                    <h3 className="font-bold text-slate-900">{persona.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{persona.tagline}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={startGroupChat}
              disabled={selectedPersonas.length < 2}
              className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-4 font-bold text-white shadow-xl transition hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Group Chat ({selectedPersonas.length} selected)
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {selectedPersonas.map((p, i) => (
                <span key={p.id} className="text-2xl" style={{ zIndex: selectedPersonas.length - i }}>
                  {p.emoji}
                </span>
              ))}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Group Chat</h2>
              <p className="text-sm text-slate-600">
                {selectedPersonas.map(p => p.name).join(', ')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Solo Chat
            </Link>
            <button
              onClick={() => {
                setShowPersonaSelect(true);
                setMessages([]);
                setSelectedPersonas([]);
              }}
              className="rounded-lg border border-pink-300 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 transition hover:bg-pink-100"
            >
              Change Group
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col px-4 py-6">
        <div className="mx-auto w-full max-w-4xl flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex h-[calc(100vh-220px)] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white">
              {messages.map((msg, i) => (
                <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className="max-w-[80%]">
                    {msg.role === 'assistant' && msg.personaName && (
                      <div className="flex items-center gap-1 mb-1 ml-1">
                        <span className="text-lg">{getPersonaEmoji(msg.personaId)}</span>
                        <span className="text-sm font-semibold text-slate-600">{msg.personaName}</span>
                      </div>
                    )}
                    <div
                      className={'rounded-2xl px-4 py-3 shadow-md border-2 ' + (
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border-slate-900'
                          : getPersonaColor(msg.personaId)
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.content}</p>

                      {msg.image && (
                        <div className="mt-3">
                          <img
                            src={msg.image.url}
                            alt={`${msg.image.context}`}
                            className="rounded-lg max-w-full h-auto shadow-lg"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '-0.3s' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '-0.15s' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    </div>
                    <span className="text-sm text-slate-600">Everyone is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-slate-100 p-4">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Message the group..."
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-200"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 font-bold text-white shadow-xl transition hover:from-pink-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
