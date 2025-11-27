import React, { useState } from 'react';
import { Player, Match } from '../types';
import { generateAvatar } from '../utils';
import { ArrowLeft, Trophy, Activity, Swords, Calendar, Medal, Trash2, Edit2, Check, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface PlayerProfileProps {
  player: Player;
  allPlayers: Player[];
  matches: Match[];
  onBack: () => void;
  onNavigateToPlayer: (id: string) => void;
  onDelete?: () => void;
  onUpdateRating?: (rating: number) => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, allPlayers, matches, onBack, onNavigateToPlayer, onDelete, onUpdateRating }) => {
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [editRatingValue, setEditRatingValue] = useState(player.rating.toString());

  // --- Data Processing ---

  // 1. Filter matches involving this player
  const playerMatches = matches
    .filter(m => (m.player1Id === player.id || m.player2Id === player.id) && m.winnerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 2. Head-to-Head Stats
  const headToHeadMap = new Map<string, { wins: number; losses: number; name: string; avatar?: string }>();

  playerMatches.forEach(m => {
    const isP1 = m.player1Id === player.id;
    const opponentId = isP1 ? m.player2Id : m.player1Id;
    const opponent = allPlayers.find(p => p.id === opponentId);
    
    if (opponent) {
      const current = headToHeadMap.get(opponentId) || { wins: 0, losses: 0, name: opponent.name, avatar: opponent.avatarUrl };
      if (m.winnerId === player.id) {
        current.wins++;
      } else {
        current.losses++;
      }
      headToHeadMap.set(opponentId, current);
    }
  });

  const headToHeadList = Array.from(headToHeadMap.entries())
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses)); // Sort by most matches played

  // 3. Current Streak
  let currentStreak = 0;
  let streakType: 'Win' | 'Loss' = 'Win';
  
  if (playerMatches.length > 0) {
    const lastWin = playerMatches[0].winnerId === player.id;
    streakType = lastWin ? 'Win' : 'Loss';
    for (const m of playerMatches) {
      const isWin = m.winnerId === player.id;
      if ((isWin && streakType === 'Win') || (!isWin && streakType === 'Loss')) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // 4. Chart Data
  const pieData = [
    { name: 'Wins', value: player.wins },
    { name: 'Losses', value: player.losses }
  ];
  const COLORS = ['#16a34a', '#ef4444'];

  // Global Rank
  const sortedPlayers = [...allPlayers].sort((a, b) => b.rating - a.rating);
  const globalRank = sortedPlayers.findIndex(p => p.id === player.id) + 1;

  const handleSaveRating = () => {
    const val = parseFloat(editRatingValue);
    if (isNaN(val) || val < 2.0 || val > 8.0) {
      alert("Please enter a valid DUPR rating between 2.000 and 8.000");
      return;
    }
    if (onUpdateRating) {
      onUpdateRating(val);
      setIsEditingRating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header / Nav */}
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-pickle-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Rankings
        </button>
        {onDelete && (
          <button 
            onClick={onDelete}
            className="flex items-center text-red-500 hover:text-red-700 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Player
          </button>
        )}
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-pickle-600 to-pickle-800 opacity-90"></div>
        <div className="absolute top-4 right-4 text-white/20">
           <Trophy className="w-32 h-32" />
        </div>
        
        <div className="relative pt-12 px-6 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative">
             <img 
               src={player.avatarUrl || generateAvatar(player.name)}
               alt={player.name}
               className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white"
             />
             <div className="absolute -bottom-3 -right-3 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full border-2 border-white shadow-md flex items-center gap-1">
               <Medal className="w-4 h-4" />
               #{globalRank}
             </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900">{player.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              {isEditingRating ? (
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-pickle-200">
                  <span className="text-sm font-bold text-gray-500 ml-2">DUPR:</span>
                  <input
                    type="number"
                    step="0.001"
                    min="2.000"
                    max="8.000"
                    className="w-24 px-2 py-1 rounded text-black font-mono font-bold text-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pickle-500"
                    value={editRatingValue}
                    onChange={(e) => setEditRatingValue(e.target.value)}
                    autoFocus
                  />
                  <button onClick={handleSaveRating} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                    <Check size={16} strokeWidth={3}/>
                  </button>
                  <button onClick={() => { setIsEditingRating(false); setEditRatingValue(player.rating.toString()); }} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                    <X size={16} strokeWidth={3}/>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                   <span className="px-3 py-1 rounded-lg bg-pickle-100 text-pickle-800 font-mono font-bold text-lg border border-pickle-200">
                     DUPR: {player.rating.toFixed(3)}
                   </span>
                   {onUpdateRating && (
                     <button 
                       onClick={() => { setEditRatingValue(player.rating.toString()); setIsEditingRating(true); }} 
                       className="p-1.5 text-gray-400 hover:text-pickle-600 hover:bg-gray-100 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                       title="Edit Rating"
                     >
                       <Edit2 size={16} />
                     </button>
                   )}
                </div>
              )}

              <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                {player.matchesPlayed} Matches
              </span>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 min-w-[100px]">
                <div className="text-xs text-gray-500 uppercase font-bold">Win Rate</div>
                <div className="text-2xl font-black text-pickle-600">
                   {player.matchesPlayed > 0 ? Math.round((player.wins / player.matchesPlayed) * 100) : 0}%
                </div>
             </div>
             <div className="text-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 min-w-[100px]">
                <div className="text-xs text-gray-500 uppercase font-bold">Streak</div>
                <div className={`text-2xl font-black ${streakType === 'Win' ? 'text-green-600' : 'text-red-500'}`}>
                   {currentStreak > 0 ? `${streakType[0]}${currentStreak}` : '-'}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Head-to-Head */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Matches */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-gray-500" />
               <h3 className="font-bold text-gray-800">Match History</h3>
             </div>
             {playerMatches.length > 0 ? (
               <div className="divide-y divide-gray-100">
                 {playerMatches.map((match) => {
                   const isP1 = match.player1Id === player.id;
                   const opponentId = isP1 ? match.player2Id : match.player1Id;
                   const opponent = allPlayers.find(p => p.id === opponentId);
                   const isWin = match.winnerId === player.id;

                   return (
                     <div key={match.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                         <div className={`w-1 h-12 rounded-full ${isWin ? 'bg-green-500' : 'bg-red-400'}`}></div>
                         <div>
                            <div className="text-xs text-gray-400 font-mono mb-1">{new Date(match.date).toLocaleDateString()}</div>
                            <div className="flex items-center gap-2">
                               <span className="text-sm text-gray-500">vs</span>
                               <button 
                                 onClick={() => opponent && onNavigateToPlayer(opponent.id)}
                                 className="flex items-center gap-2 font-semibold text-gray-900 hover:text-pickle-600 hover:underline"
                               >
                                  <img src={opponent?.avatarUrl || generateAvatar(opponent?.name || 'Op')} className="w-5 h-5 rounded-full border border-gray-200" />
                                  {opponent?.name || 'Unknown'}
                               </button>
                            </div>
                         </div>
                       </div>
                       
                       <div className="text-right">
                          <div className={`text-lg font-bold font-mono ${isWin ? 'text-green-600' : 'text-gray-600'}`}>
                            {isWin ? 'W' : 'L'} {match.score1} - {match.score2}
                          </div>
                          {match.tournamentId && (
                             <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">Tournament</span>
                          )}
                       </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="p-8 text-center text-gray-400">No match history available.</div>
             )}
          </div>

        </div>

        {/* Right Column: Visuals & Rivals */}
        <div className="space-y-6">
           
           {/* Win/Loss Chart */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Performance</h3>
              {player.matchesPlayed > 0 ? (
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm italic">
                  Not enough data
                </div>
              )}
           </div>

           {/* Head to Head Rivals */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
               <Swords className="w-5 h-5 text-gray-500" />
               <h3 className="font-bold text-gray-800">Head-to-Head</h3>
             </div>
             <div className="max-h-80 overflow-y-auto">
               {headToHeadList.length > 0 ? (
                 headToHeadList.map(rival => (
                   <div key={rival.id} className="p-3 border-b border-gray-50 last:border-0 flex items-center justify-between hover:bg-gray-50">
                      <button 
                        onClick={() => onNavigateToPlayer(rival.id)}
                        className="flex items-center gap-2 group text-left flex-1 mr-4 hover:bg-gray-100 p-1 rounded-lg transition-colors -ml-1"
                      >
                        <img 
                          src={rival.avatar || generateAvatar(rival.name)} 
                          className="w-8 h-8 rounded-full bg-gray-100 border border-transparent group-hover:border-pickle-300 transition-colors" 
                        />
                        <span className="text-sm font-medium text-gray-900 group-hover:text-pickle-600 group-hover:underline truncate">
                          {rival.name}
                        </span>
                      </button>
                      <div className="text-xs font-mono">
                        <span className="text-green-600 font-bold">{rival.wins}W</span>
                        <span className="text-gray-300 mx-1">|</span>
                        <span className="text-red-500 font-bold">{rival.losses}L</span>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="p-4 text-center text-xs text-gray-400">No opponents faced yet.</div>
               )}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;