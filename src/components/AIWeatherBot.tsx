import React, { useState, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const BOT_NAME = 'AI Weather Bot';

export default function AIWeatherBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am your AI Weather Bot. Ask me anything about the weather.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: 'user', text: input }]);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-weather-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      if (!res.ok) throw new Error('AI response failed');
      const data = await res.json();
      setMessages((msgs) => [...msgs, { from: 'bot', text: data.reply || 'Sorry, I could not understand that.' }]);
    } catch (err: any) {
      setMessages((msgs) => [...msgs, { from: 'bot', text: 'Sorry, I could not connect to AI right now.' }]);
      setError('AI error');
    } finally {
      setLoading(false);
      setInput('');
    }
  }

  // For bounce-in on mount
  const [showButton, setShowButton] = useState(false);
  React.useEffect(() => { setShowButton(true); }, []);

  return (
    <>
      {/* Floating Button */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 50 }}>
        {!open && showButton && (
          <Button size="icon" className="rounded-full shadow-lg bg-gradient-to-tr from-blue-500 to-blue-400 text-white hover:from-blue-600 hover:to-blue-500 transition-all duration-200 animate-bounce-in" onClick={() => setOpen(true)} aria-label="Open AI Weather Bot">
            <MessageCircle className="w-7 h-7" />
          </Button>
        )}
      </div>
      {/* Chat Window */}
      {open && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 50 }} className="w-80 max-w-[90vw] bg-white border border-blue-200 rounded-2xl shadow-2xl flex flex-col animate-fade-in animate-slide-up">
          <div className="flex items-center justify-between p-3 border-b border-blue-100 bg-gradient-to-r from-blue-100 to-blue-50 rounded-t-2xl">
            <span className="font-semibold text-blue-700 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-400" /> {BOT_NAME}</span>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close chat"><X className="w-5 h-5 text-blue-400" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 200, maxHeight: 320 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${msg.from === 'user' ? 'bg-gradient-to-tr from-blue-500 to-blue-400 text-white' : 'bg-blue-50 text-blue-900'}`}>{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t border-blue-100 bg-blue-50 rounded-b-2xl">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={loading ? 'Waiting for AI...' : 'Type your weather question...'}
              disabled={loading}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send" className="bg-gradient-to-tr from-blue-500 to-blue-400 text-white">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
} 