import React from 'react';
import { useLiff } from '@/hooks/useLiff';
import ChatInterface from '@/components/ChatInterface';

const ChatPage: React.FC = () => {
  const { isLoggedIn, userProfile, liffError, isLoading, isLiffEnvironment } = useLiff();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Loading...</p>
          {/* Tailwind Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (liffError && !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-md border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-3">LIFF Error</h2>
          <p className="text-red-600 mb-4">{liffError}</p>
          {!isLiffEnvironment && (
            <p className="text-sm text-gray-500">
              Tip: If running locally, ensure VITE_LIFF_ID is set in your .env file or check console for details. For deployment, access through LINE.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isLoggedIn || userProfile) {
    return (
      <div className="flex flex-col h-screen antialiased text-gray-800">
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold">NARO Chat</h1>
          {userProfile && (
            <div className="flex items-center space-x-2">
              {userProfile.pictureUrl && (
                <img
                    src={userProfile.pictureUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-white/50" // 白枠追加
                />
              )}
              <span className="text-sm font-medium hidden sm:block">{userProfile.displayName}</span> {/* スマホでは非表示も考慮 */}
            </div>
          )}
        </header>

        <main className="flex-grow overflow-hidden bg-gray-100">
          <ChatInterface />
        </main>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-lg text-gray-600">Initializing or waiting for login...</p>
    </div>
  );
};

export default ChatPage;