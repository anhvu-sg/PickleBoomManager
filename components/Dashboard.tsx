import React from 'react';
import { Player, Match } from '../types';
import { Activity, Calendar, Trophy, Zap, ShieldAlert, Trash2 } from 'lucide-react';
import { generateAvatar } from '../utils';

interface DashboardProps {
  players: Player[];
  matches: Match[];
  onNavigate: (view: any) => void;
  onNavigateToPlayer?: (id: string) => void;
  onDeleteAllData?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ players, matches, onNavigate, onNavigateToPlayer, onDeleteAllData }) => {
  const recentMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const totalMatches = matches.length;
  const activePlayers = players.filter(p => p.matchesPlayed > 0).length;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-blue-50 p-2 rounded-full mb-2">
            <Trophy className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{matches.length}</div>
          <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Matches Played</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-green-50 p-2 rounded-full mb-2">
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{players.length}</div>
          <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Registered Players</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-purple-50 p-2 rounded-full mb-2">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{activePlayers}</div>
          <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Active Players</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-orange-50 p-2 rounded-full mb-2">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">2</div>
          <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Active Events</div>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentMatches.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No matches recorded yet.</div>
          ) : (
            recentMatches.map(match => {
              const p1 = players.find(p => p.id === match.player1Id);
              const p2 = players.find(p => p.id === match.player2Id);
              return (
                <div key={match.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-gray-400 font-mono">
                       {new Date(match.date).toLocaleDateString()}
                     </span>
                     <span className="text-xs font-bold px-2 py-0.5 rounded bg-pickle-100 text-pickle-700">Finished</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center gap-2">
                       {p1 && (
                         <img src={p1.avatarUrl || generateAvatar(p1.name)} className="w-6 h-6 rounded-full" />
                       )}
                       <button 
                         onClick={() => p1 && onNavigateToPlayer && onNavigateToPlayer(p1.id)}
                         className={`font-semibold hover:text-pickle-600 hover:underline ${match.winnerId === match.player1Id ? 'text-gray-900' : 'text-gray-500'}`}
                       >
                         {p1?.name || 'Unknown'}
                       </button>
                    </div>
                    <div className="px-4 font-mono text-xl font-bold text-gray-800">
                      {match.score1} - {match.score2}
                    </div>
                    <div className="flex-1 text-right flex items-center justify-end gap-2">
                       <button 
                         onClick={() => p2 && onNavigateToPlayer && onNavigateToPlayer(p2.id)}
                         className={`font-semibold hover:text-pickle-600 hover:underline ${match.winnerId === match.player2Id ? 'text-gray-900' : 'text-gray-500'}`}
                       >
                         {p2?.name || 'Unknown'}
                       </button>
                       {p2 && (
                         <img src={p2.avatarUrl || generateAvatar(p2.name)} className="w-6 h-6 rounded-full" />
                       )}
                    </div>
                  </div>
                  {match.summary && (
                    <div className="mt-2 text-sm text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100">
                      "{match.summary}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-pickle-600 to-pickle-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Upcoming Tournament</h2>
          <p className="mb-4 text-pickle-100">Summer Slam 2026 starts in 5 days. Ensure all seeds are finalized.</p>
          <button onClick={() => onNavigate('TOURNAMENTS')} className="bg-white text-pickle-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-pickle-50 transition-colors">
            Manage Brackets
          </button>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 transform skew-x-12 bg-white pointer-events-none"></div>
      </div>

      {/* Danger Zone */}
      {onDeleteAllData && (
        <div className="mt-8 border border-red-200 bg-red-50 rounded-xl p-6">
           <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
             <ShieldAlert className="w-5 h-5" />
             <h3>Danger Zone</h3>
           </div>
           <p className="text-sm text-red-600 mb-4">
             These actions are destructive and cannot be undone. Please proceed with caution.
           </p>
           <button 
             onClick={onDeleteAllData}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium text-sm shadow-sm"
           >
             <Trash2 className="w-4 h-4" />
             Delete All Players & Reset Data
           </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;