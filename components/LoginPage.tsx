import React, { useState } from 'react';
import { Player, UserRole } from '../types';
import { ShieldCheck, User, LogIn, Lock } from 'lucide-react';
import { generateAvatar } from '../utils';

interface LoginPageProps {
  players: Player[];
  onLogin: (role: UserRole, playerId?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ players, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'PLAYER' | 'ADMIN'>('PLAYER');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const handlePlayerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) {
      setError('Please select your player profile.');
      return;
    }
    onLogin('PLAYER', selectedPlayerId);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded password for demonstration
    if (adminPassword === 'admin') {
      onLogin('ADMIN');
    } else {
      setError('Invalid administration password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pickle-600 to-pickle-900 flex flex-col items-center justify-center p-4">
      
      <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <img 
            src="/logo.png" 
            alt="PickleBoom" 
            className="h-24 w-auto object-contain mx-auto mb-4 drop-shadow-lg" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        <h1 className="text-4xl font-extrabold text-white tracking-tight">PickleBoom Manager</h1>
        <p className="text-pickle-200 mt-2">Pickleball Tournament & Ranking System</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab('PLAYER'); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'PLAYER' 
                ? 'bg-white text-pickle-600 border-b-2 border-pickle-600' 
                : 'bg-gray-50 text-gray-400 hover:text-gray-600'
            }`}
          >
            <User className="w-4 h-4" />
            Player Access
          </button>
          <button
             onClick={() => { setActiveTab('ADMIN'); setError(''); }}
             className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'ADMIN' 
                ? 'bg-white text-pickle-600 border-b-2 border-pickle-600' 
                : 'bg-gray-50 text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin Portal
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {activeTab === 'PLAYER' ? (
            <form onSubmit={handlePlayerLogin} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Welcome Back!</h2>
                <p className="text-sm text-gray-500">Find your profile to view your stats.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Your Profile</label>
                <div className="relative">
                  <select
                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle-500 outline-none appearance-none"
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                  >
                    <option value="">-- Choose Name --</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {selectedPlayerId && (
                 <div className="flex justify-center py-2">
                    <img 
                      src={players.find(p => p.id === selectedPlayerId)?.avatarUrl || generateAvatar('?')} 
                      className="w-16 h-16 rounded-full border-4 border-pickle-100 shadow-sm"
                      alt="Avatar"
                    />
                 </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-pickle-600 hover:bg-pickle-700 text-white font-bold rounded-xl shadow-lg shadow-pickle-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                View My Profile
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-6">
               <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Administrator Login</h2>
                <p className="text-sm text-gray-500">Manage tournaments and club records.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input 
                    type="password"
                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle-500 outline-none"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-xs text-gray-400 text-right">Hint: admin</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Access Dashboard
              </button>
            </form>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-pickle-200 text-sm opacity-80">
        &copy; 2026 PickleBoom Manager
      </div>
    </div>
  );
};

export default LoginPage;