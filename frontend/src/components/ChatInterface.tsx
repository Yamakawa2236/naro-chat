import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '@/services/apiService';
import type { Message } from '@/types/chat';
import axios from 'axios'; 

const LoadingDots: React.FC = () => (
    <div className="flex space-x-1 items-center h-5 px-2">
        <span className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
    </div>
);


const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: trimmedInput,
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendMessage(trimmedInput);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);

      let errorMessageText = '申し訳ありません、エラーが発生しました。もう一度お試しください。';
      if (axios.isAxiosError(error) && error.response) {
        console.error('API Error Status:', error.response.status);
        console.error('API Error Data:', error.response.data);

        if (error.response.status === 503 && error.response.data?.error === 'MODEL_NOT_READY') {
          errorMessageText = 'AIモデルが準備できていません。しばらく待って、再度お試しください。';
        }
      }

      const errorBotMessage: Message = {
        id: Date.now() + 1,
        text: errorMessageText,
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 pt-10">
            <p>Enter a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] break-words shadow-sm ${
                  message.isUser
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-2 py-2 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-sm">
                <LoadingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        className="flex items-center p-3 border-t border-gray-200 bg-white"
        onSubmit={handleSendMessage}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100" // 入力欄のスタイル
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out" // 送信ボタンのスタイル
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;