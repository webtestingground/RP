'use client';

import { useEffect, useRef, useState } from 'react';
import { personas, type Persona } from '@/personas';
import { UltravoxSession } from 'ultravox-client';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: {
    context: string;
    url: string;
    number: number;
  };
  userImage?: string; // Base64 image sent by user
}

// LocalStorage key prefix for saving chat history (per persona)
const STORAGE_KEY_PREFIX = 'roleplay-chat-';
const LAST_PERSONA_KEY = 'roleplay-last-persona';
const IMAGE_COUNTERS_KEY = 'roleplay-image-counters';

// Image counter helper functions
const loadImageCounters = (): Record<string, Record<string, number>> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(IMAGE_COUNTERS_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveImageCounters = (counters: Record<string, Record<string, number>>) => {
  localStorage.setItem(IMAGE_COUNTERS_KEY, JSON.stringify(counters));
};

const getNextImageNumber = (personaId: string, context: string, maxCount: number, randomize: boolean = false): number => {
  if (randomize) {
    // Pick a random number between 1 and maxCount
    return Math.floor(Math.random() * maxCount) + 1;
  }

  const counters = loadImageCounters();
  const current = counters[personaId]?.[context] || 0;
  const next = current + 1;
  // Cycle back to 1 if exceeds max
  return next > maxCount ? 1 : next;
};

const updateImageCounter = (personaId: string, context: string, number: number) => {
  const counters = loadImageCounters();
  if (!counters[personaId]) counters[personaId] = {};
  counters[personaId][context] = number;
  saveImageCounters(counters);
};

export default function RoleplayChat() {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonaSelect, setShowPersonaSelect] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ultravoxSessionRef = useRef<UltravoxSession | null>(null);
  const ULTRAVOX_VOICE_ID = '1769b283-36c6-4883-9c52-17bf75a29bc5'; // US English Female

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper function to get storage key for a persona
  const getStorageKey = (personaId: string) => `${STORAGE_KEY_PREFIX}${personaId}`;

  // Load last used persona and their chat on mount
  useEffect(() => {
    try {
      const lastPersonaId = localStorage.getItem(LAST_PERSONA_KEY);
      if (lastPersonaId) {
        const persona = personas.find(p => p.id === lastPersonaId);
        if (persona) {
          const saved = localStorage.getItem(getStorageKey(lastPersonaId));
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
              setSelectedPersona(persona);
              setMessages(parsed.messages);
              setShowPersonaSelect(false);
              console.log('✅ Loaded saved chat for', persona.name);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
    }
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0 && !showPersonaSelect) {
      try {
        const dataToSave = {
          messages: messages,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(getStorageKey(selectedPersona.id), JSON.stringify(dataToSave));
        localStorage.setItem(LAST_PERSONA_KEY, selectedPersona.id);
        console.log('💾 Saved chat for', selectedPersona.name);
      } catch (error) {
        console.error('❌ Error saving chat:', error);
      }
    }
  }, [messages, selectedPersona.id, showPersonaSelect]);

  const startChat = (persona: Persona) => {
    // Check if this persona has saved chat
    try {
      const saved = localStorage.getItem(getStorageKey(persona.id));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          // Load existing chat
          setSelectedPersona(persona);
          setMessages(parsed.messages);
          setShowPersonaSelect(false);
          console.log('📖 Loaded existing chat for', persona.name);
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error loading persona chat:', error);
    }

    // No saved chat, start fresh
    setSelectedPersona(persona);
    setMessages([{ role: 'assistant' as const, content: persona.greeting }]);
    setShowPersonaSelect(false);
    console.log('🆕 Started new chat with', persona.name);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history for ALL personas? This cannot be undone.')) {
      try {
        // Clear all persona chats
        personas.forEach(persona => {
          localStorage.removeItem(getStorageKey(persona.id));
        });
        localStorage.removeItem(LAST_PERSONA_KEY);
        setMessages([]);
        setShowPersonaSelect(true);
        console.log('🗑️ Cleared all chat history');
      } catch (error) {
        console.error('❌ Error clearing history:', error);
      }
    }
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Max 5MB allowed.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPendingImage(base64);
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    const messageText = input.trim();
    const imageToSend = pendingImage;

    // Allow sending with just image (no text required)
    if ((!messageText && !imageToSend) || isLoading || isInCall) return;

    setInput('');
    setPendingImage(null);

    const userMessage: Message = {
      role: 'user' as const,
      content: messageText || (imageToSend ? 'Sent an image' : ''),
      userImage: imageToSend || undefined,
    };
    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText || 'What do you think of this?',
          history: messages,
          personaId: selectedPersona.id,
          image: imageToSend,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant' as const,
          content: data.message,
        };

        // Handle image if present
        if (data.image) {
          const { context, maxCount, personaId, randomize } = data.image;
          console.log(`🖼️ Frontend received image data:`, data.image);

          const imageNumber = getNextImageNumber(personaId, context, maxCount, randomize);
          console.log(`🔢 ${randomize ? 'Random' : 'Next'} image number for ${context}: ${imageNumber}`);

          // For randomized personas, use simple numbered files (1.jpg, 2.jpg)
          // For cycling personas, use context-based names (bikini.jpg, bikini2.jpg)
          const filename = randomize
            ? `${imageNumber}.jpg`
            : `${context}${imageNumber > 1 ? imageNumber : ''}.jpg`;
          const imageUrl = `/personas/${personaId}/${filename}`;
          console.log(`📁 Built image URL: ${imageUrl}`);

          assistantMessage.image = {
            context,
            url: imageUrl,
            number: imageNumber,
          };

          // Update counter in localStorage
          updateImageCounter(personaId, context, imageNumber);
          console.log(`✅ Updated counter for ${personaId}/${context} to ${imageNumber}`);
        }

        setMessages([...updatedMessages, assistantMessage]);
      } else {
        setMessages([
          ...updatedMessages,
          { role: 'assistant' as const, content: data.error || 'Error occurred' },
        ]);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        { role: 'assistant' as const, content: 'Network error. Please try again.' },
      ]);
    }

    setIsLoading(false);

    // Auto-focus input after sending message
    inputRef.current?.focus();
  };

  // Start Ultravox voice call
  const startCall = async () => {
    if (typeof window === 'undefined') return;

    try {
      setIsInCall(true);
      console.log('📞 Starting Ultravox call with', selectedPersona.name);

      // Check for microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('✅ Microphone permission granted');
      } catch (micError) {
        console.error('❌ Microphone permission denied:', micError);
        throw new Error('Microphone access denied. Please allow microphone access and try again.');
      }

      // Configure session with persona's system prompt
      const systemPrompt = `${selectedPersona.systemPrompt}\n\nYou are having a voice conversation. Keep responses concise and natural for voice chat.`;

      console.log('📤 Creating Ultravox session...');

      // Create Ultravox session via backend API
      const response = await fetch('/api/ultravox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona.id,
          systemPrompt: systemPrompt,
        }),
      });

      console.log('📥 Backend response status:', response.status);

      const data = await response.json();
      console.log('📦 Backend response data:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to create session');
      }

      console.log('✅ Ultravox session created:', data.callId);
      console.log('📞 Join URL:', data.joinUrl);

      // Create Ultravox client session
      console.log('🔌 Creating UltravoxSession instance...');
      const session = new UltravoxSession();
      ultravoxSessionRef.current = session;

      console.log('📞 Joining call with URL:', data.joinUrl);
      // Join the call using the join URL
      await session.joinCall(data.joinUrl);
      console.log('✅ Successfully joined call');

      // Handle state changes
      session.addEventListener('status', (event: any) => {
        const status = event.state;
        console.log('📞 Ultravox status:', status);

        if (status === 'listening') {
          setIsListening(true);
          setIsSpeaking(false);
        } else if (status === 'thinking' || status === 'speaking') {
          setIsListening(false);
          setIsSpeaking(status === 'speaking');
        }
      });

      // Handle transcripts (user speech)
      session.addEventListener('transcripts', (event: any) => {
        const transcripts = event.transcripts || [];
        const lastTranscript = transcripts[transcripts.length - 1];
        if (lastTranscript?.text && lastTranscript?.isFinal) {
          const userMessage = lastTranscript.text;
          console.log('📝 You said:', userMessage);

          // Add user message to chat
          setMessages(prev => [...prev, { role: 'user' as const, content: userMessage }]);
        }
      });

      // Handle AI responses
      session.addEventListener('utterances', (event: any) => {
        const utterances = event.utterances || [];
        const lastUtterance = utterances[utterances.length - 1];
        if (lastUtterance?.text) {
          const aiMessage = lastUtterance.text;
          console.log('🤖 AI said:', aiMessage);

          // Add AI response to chat
          setMessages(prev => {
            // Check if this message already exists to avoid duplicates
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.content === aiMessage) return prev;
            return [...prev, { role: 'assistant' as const, content: aiMessage }];
          });
        }
      });

      console.log('✅ Ultravox call connected and ready');

    } catch (error: any) {
      console.error('❌ Ultravox error:', error);
      alert(`Failed to start voice call: ${error.message || 'Please check your internet connection.'}`);
      setIsInCall(false);
    }
  };

  // End Ultravox voice call
  const endCall = async () => {
    console.log('📞 Ending Ultravox call');

    if (ultravoxSessionRef.current) {
      try {
        await ultravoxSessionRef.current.leaveCall();
      } catch (error) {
        console.error('❌ Error ending call:', error);
      }
      ultravoxSessionRef.current = null;
    }

    setIsInCall(false);
    setIsListening(false);
    setIsSpeaking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ultravoxSessionRef.current) {
        ultravoxSessionRef.current.leaveCall().catch(console.error);
      }
    };
  }, []);

  if (showPersonaSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-5xl font-bold text-slate-900">Choose Your Companion 🎭</h1>
            <p className="mb-6 text-lg text-slate-600">
              Select a persona to start your roleplay conversation
            </p>
            <Link
              href="/group-chat"
              className="mb-8 inline-block rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 font-bold text-white shadow-lg transition hover:from-pink-600 hover:to-purple-600"
            >
              👯‍♀️ Try Group Chat (Multiple Personas)
            </Link>

            <div className="grid gap-6 md:grid-cols-2">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => startChat(persona)}
                  className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 text-left shadow-lg transition hover:scale-105 hover:border-slate-300 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-0 transition group-hover:opacity-30" />
                  <div className="relative">
                    {persona.avatar ? (
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="mb-4 h-16 w-16 rounded-full object-cover border-2 border-slate-200 shadow-md"
                      />
                    ) : (
                      <div className="mb-4 text-5xl">{persona.emoji}</div>
                    )}
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
            {selectedPersona.avatar ? (
              <img
                src={selectedPersona.avatar}
                alt={selectedPersona.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-slate-200 shadow-sm"
              />
            ) : (
              <span className="text-3xl">{selectedPersona.emoji}</span>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedPersona.name}</h2>
              <p className="text-sm text-slate-600">
                {isInCall ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                    {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : '📞 In Call'}
                  </span>
                ) : (
                  selectedPersona.tagline
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isInCall ? (
              <>
                <Link
                  href="/recordings"
                  className="rounded-lg border border-purple-500 bg-purple-50 px-3 md:px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-100"
                  title="View call recordings"
                >
                  🎙️<span className="hidden md:inline ml-1">Recordings</span>
                </Link>
                <button
                  onClick={startCall}
                  className="rounded-lg border border-green-500 bg-green-50 px-3 md:px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
                  title="Start voice call"
                >
                  📞<span className="hidden md:inline ml-1">Call</span>
                </button>
                <button
                  onClick={clearHistory}
                  className="rounded-lg border border-red-300 bg-white px-3 md:px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  title="Clear all chat history"
                >
                  🗑️<span className="hidden md:inline ml-1">Clear</span>
                </button>
                <button
                  onClick={() => {
                    setShowPersonaSelect(true);
                    setMessages([]);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 md:px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="hidden md:inline">Change Persona</span>
                  <span className="md:hidden">👤</span>
                </button>
              </>
            ) : (
              <button
                onClick={endCall}
                className="animate-pulse rounded-lg border-2 border-red-500 bg-red-500 px-4 md:px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-red-600"
                title="End voice call"
              >
                📞<span className="hidden md:inline ml-1">End Call</span>
              </button>
            )}
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
                    <div
                      className={'rounded-2xl px-4 py-3 shadow-md ' + (
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-slate-900'
                          : 'bg-white border-2 border-slate-300 text-slate-900'
                      )}
                    >
                      {/* User sent image */}
                      {msg.userImage && (
                        <div className="mb-2">
                          <img
                            src={msg.userImage}
                            alt="Sent image"
                            className="rounded-lg max-w-full max-h-64 h-auto shadow-lg"
                          />
                        </div>
                      )}

                      <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.content}</p>

                      {/* Persona image display */}
                      {msg.image && (
                        <div className="mt-3">
                          <img
                            src={msg.image.url}
                            alt={`${msg.image.context} ${msg.image.number}`}
                            className="rounded-lg max-w-full h-auto shadow-lg"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              console.error(`Failed to load image: ${msg.image?.url}`);
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
                    <span className="text-sm text-slate-600">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-slate-100 p-4">
              {isInCall ? (
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 shadow-lg">
                    {isListening && (
                      <div className="flex gap-1">
                        <span className="h-8 w-1 animate-pulse rounded-full bg-green-500" style={{ animationDelay: '0s' }} />
                        <span className="h-10 w-1 animate-pulse rounded-full bg-green-500" style={{ animationDelay: '0.1s' }} />
                        <span className="h-12 w-1 animate-pulse rounded-full bg-green-500" style={{ animationDelay: '0.2s' }} />
                        <span className="h-10 w-1 animate-pulse rounded-full bg-green-500" style={{ animationDelay: '0.3s' }} />
                        <span className="h-8 w-1 animate-pulse rounded-full bg-green-500" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                    <span className="text-lg font-semibold text-slate-700">
                      {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : isLoading ? '💭 Thinking...' : '📞 In Call'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Pending image preview */}
                  {pendingImage && (
                    <div className="relative inline-block">
                      <img
                        src={pendingImage}
                        alt="Pending"
                        className="h-20 w-20 rounded-lg object-cover border-2 border-slate-300"
                      />
                      <button
                        onClick={() => setPendingImage(null)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-sm font-bold hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    {/* Image upload button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Send image"
                    >
                      📷
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={pendingImage ? 'Add a message (optional)...' : selectedPersona.placeholderText}
                      className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
                      disabled={isLoading}
                      autoFocus
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={isLoading || (!input.trim() && !pendingImage)}
                      className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-3 font-bold text-white shadow-xl transition hover:from-slate-600 hover:to-slate-800 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
