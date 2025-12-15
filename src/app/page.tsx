'use client';

import { useEffect, useRef, useState } from 'react';
import { personas, type Persona } from '@/personas';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function RoleplayChat() {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonaSelect, setShowPersonaSelect] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = (persona: Persona) => {
    setSelectedPersona(persona);
    setMessages([{ role: 'assistant', content: persona.greeting }]);
    setShowPersonaSelect(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages, // Send current messages before adding user's new message
          personaId: selectedPersona.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.message }]);
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
  };

  if (showPersonaSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-5xl font-bold text-slate-900">Choose Your Companion 🎭</h1>
            <p className="mb-12 text-lg text-slate-600">
              Select a persona to start your roleplay conversation
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => startChat(persona)}
                  className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 text-left shadow-lg transition hover:scale-105 hover:border-slate-300 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-0 transition group-hover:opacity-30" />
                  <div className="relative">
                    <div className="mb-4 text-5xl">{persona.emoji}</div>
                    <h3 className="mb-2 text-2xl font-bold text-slate-900">{persona.name}</h3>
                    <p className="mb-3 text-sm font-medium text-slate-600">{persona.tagline}</p>
                    <p className="text-sm text-slate-500">{persona.description}</p>
                  </div>
                </button>
              ))}
            </div>
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
            <span className="text-3xl">{selectedPersona.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedPersona.name}</h2>
              <p className="text-sm text-slate-600">{selectedPersona.tagline}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowPersonaSelect(true);
              setMessages([]);
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Change Persona
          </button>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col px-4 py-6">
        <div className="mx-auto w-full max-w-4xl flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex h-[calc(100vh-220px)] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white">
              {messages.map((msg, i) => (
                <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={'max-w-[80%] rounded-2xl px-4 py-3 shadow-md ' + (
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-slate-900'
                        : 'bg-white border-2 border-slate-300 text-slate-900'
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.content}</p>
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
                    <span className="text-sm text-slate-600">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-slate-100 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={selectedPersona.placeholderText}
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-3 font-bold text-white shadow-xl transition hover:from-slate-600 hover:to-slate-800 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
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
