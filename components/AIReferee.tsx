import React, { useState, useRef, useEffect } from 'react';
import { askReferee } from '../services/geminiService';
import { MessageSquare, Send, User, Bot, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

const AIReferee: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your AI Pickleball Referee. Ask me anything about rules, scoring, or court positioning!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Prepare history for API (excluding the very latest user message as we pass it as 'message' param)
    // Actually, geminiService helper handles the history array construction logic separately, 
    // but typically we pass previous conversation.
    const responseText = await askReferee(
      messages.map(m => ({ role: m.role, text: m.text })), // history
      userMsg.text // new question
    );

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[600px] flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-pickle-600 p-4 text-white flex items-center space-x-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">CourtSide Assistant</h2>
          <p className="text-pickle-100 text-xs">Powered by Gemini AI</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-pickle-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
            }`}>
              <div className="flex items-center space-x-2 mb-1 opacity-70 text-xs">
                 {msg.role === 'user' ? <User className="w-3 h-3"/> : <Bot className="w-3 h-3"/>}
                 <span>{msg.role === 'user' ? 'You' : 'Ref'}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-pickle-600" />
              <span className="text-xs text-gray-500">Checking the rulebook...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about kitchen rules, serving..."
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pickle-500 focus:border-transparent outline-none transition-all"
        />
        <button 
          type="submit" 
          disabled={isLoading || !inputValue.trim()}
          className="bg-pickle-600 hover:bg-pickle-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default AIReferee;