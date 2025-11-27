import React, { useState } from 'react';
import { Player, Match } from '../types';
import { TrendingUp, Medal, Award, User, Search, X, Calendar, Activity, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateAvatar } from '../utils';

interface LeaderboardProps {
  players: Player[];
  matches: Match[];
  onNavigateToPlayer?: (id: string) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, matches, onNavigateToPlayer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Sort players by rating descending (Global Rank)
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);

  // Filter based on search
  const filteredPlayers = sortedPlayers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = filteredPlayers.slice(0, 5).map(p => ({
    name: p.name,
    wins: p.wins,
    losses: p.losses,
    rating: p.rating
  }));

  const getGlobalRank = (id: string) => {
    return sortedPlayers.findIndex(p => p.id === id) + 1;
  };

  // Helper to get selected player stats
  const getPlayerStats = (player: Player) => {
    // Get finished matches involving this player, sorted newest first
    const history = matches
      .filter(m => (m.player1Id === player.id || m.player2Id === player.id) && m.winnerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate Streaks
    let currentStreakType = 'None';
    let currentStreakCount = 0;
    let longestWinStreak = 0;
    
    if (history.length > 0) {
      // Current Streak
      const lastMatch = history[0];
      const isWin = lastMatch.winnerId === player.id;
      currentStreakType = isWin ? 'Win' : 'Loss';
      
      for (const match of history) {
        const matchResult = match.winnerId === player.id ? 'Win' : 'Loss';
        if (matchResult === currentStreakType) {
          currentStreakCount++;
        } else {
          break;
        }
      }

      // Longest Win Streak
      let tempWinStreak = 0;
      // Iterate chronologically (oldest first)
      for (const match of [...history].reverse()) {
        if (match.winnerId === player.id) {
          tempWinStreak++;
          if (tempWinStreak > longestWinStreak) longestWinStreak = tempWinStreak;
        } else {
          tempWinStreak = 0;
        }
      }
    }

    return { history, currentStreakType, currentStreakCount, longestWinStreak };
  };

  const selectedStats = selectedPlayer ? getPlayerStats(selectedPlayer) : null;

  const getOpponent = (match: Match, playerId: string) => {
    const oppId = match.player1Id === playerId ? match.player2Id : match.player1Id;
    return players.find(p => p.id === oppId);
  };

  return (
    <div className="space-y-8 relative">
      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search players by name..." 
          className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Top 3 Cards (of the filtered result) */}
      {filteredPlayers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {filteredPlayers.slice(0, 3).map((player, index) => {
            const globalRank = getGlobalRank(player.id);
            return (
              <div 
                key={player.id} 
                onClick={() => setSelectedPlayer(player)}
                className={`cursor-pointer hover:scale-105 transition-transform duration-200 relative overflow-hidden rounded-xl p-6 shadow-lg border-2 ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400' :
                  index === 1 ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' :
                  'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
                }`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Medal className="w-24 h-24" />
                </div>
                <div className="flex items-center space-x-4 relative z-10 mb-4">
                  <div className="relative">
                    <img 
                      src={player.avatarUrl || generateAvatar(player.name)} 
                      alt={player.name} 
                      className="w-16 h-16 rounded-full border-2 border-white shadow-md bg-white" 
                    />
                    <div className={`absolute -bottom-2 -right-1 w-8 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      #{globalRank}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{player.name}</h3>
                    <div className="text-sm font-medium opacity-60">DUPR: {player.rating.toFixed(3)}</div>
                  </div>
                </div>
                <div className="relative z-10 border-t border-black/5 pt-3 flex justify-between items-center">
                  <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide">Win Rate</div>
                      <div className="font-bold text-lg">
                        {player.matchesPlayed > 0 ? Math.round((player.wins / player.matchesPlayed) * 100) : 0}%
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="text-xs text-gray-600 uppercase tracking-wide">Record</div>
                      <div className="font-bold text-lg">{player.wins}W - {player.losses}L</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Detailed Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 bg-pickle-600 text-white flex items-center justify-between">
            <h3 className="font-bold flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Full Rankings</span>
            </h3>
            {searchTerm && <span className="text-xs bg-white/20 px-2 py-1 rounded">Filtered: {filteredPlayers.length}</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="p-4 font-medium">Rank</th>
                  <th className="p-4 font-medium">Player</th>
                  <th className="p-4 font-medium text-center">Matches</th>
                  <th className="p-4 font-medium text-center">Win %</th>
                  <th className="p-4 font-medium text-right">DUPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => (
                    <tr 
                      key={player.id} 
                      onClick={() => setSelectedPlayer(player)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-bold text-gray-400">#{getGlobalRank(player.id)}</td>
                      <td className="p-4 font-medium text-gray-900 flex items-center space-x-3">
                        <img 
                          src={player.avatarUrl || generateAvatar(player.name)} 
                          alt="" 
                          className="w-8 h-8 rounded-full bg-gray-100" 
                        />
                        <span>{player.name}</span>
                      </td>
                      <td className="p-4 text-center text-gray-600">{player.matchesPlayed}</td>
                      <td className="p-4 text-center text-gray-600">
                        {player.matchesPlayed > 0 ? Math.round((player.wins / player.matchesPlayed) * 100) : 0}%
                      </td>
                      <td className="p-4 text-right font-bold text-pickle-600 font-mono">
                        {player.rating.toFixed(3)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No players found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-pickle-600" />
            <span>Performance Overview</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f0fdf4'}} />
                <Bar dataKey="wins" name="Wins" stackId="a" fill="#16a34a" radius={[0, 4, 4, 0]} />
                <Bar dataKey="losses" name="Losses" stackId="a" fill="#fee2e2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && selectedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedPlayer.avatarUrl || generateAvatar(selectedPlayer.name)} 
                  alt="" 
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md" 
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPlayer.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-pickle-100 text-pickle-700 text-xs font-bold border border-pickle-200 font-mono">
                      DUPR: {selectedPlayer.rating.toFixed(3)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                      Rank #{getGlobalRank(selectedPlayer.id)}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Actions */}
              {onNavigateToPlayer && (
                 <button 
                   onClick={() => {
                     setSelectedPlayer(null);
                     onNavigateToPlayer(selectedPlayer.id);
                   }}
                   className="w-full flex items-center justify-center gap-2 py-2 bg-pickle-600 text-white font-bold rounded-lg hover:bg-pickle-700 transition-colors"
                 >
                   <span>View Full Profile</span>
                   <ChevronRight className="w-4 h-4" />
                 </button>
              )}

              {/* Streak Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2 text-blue-700">
                    <Activity className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wide">Current Streak</span>
                  </div>
                  <div className="text-3xl font-extrabold text-blue-900">
                    {selectedStats.currentStreakCount > 0 
                      ? `${selectedStats.currentStreakCount} ${selectedStats.currentStreakType}${selectedStats.currentStreakCount > 1 ? 's' : ''}`
                      : 'None'
                    }
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                   <div className="flex items-center gap-2 mb-2 text-green-700">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wide">Longest Win Streak</span>
                  </div>
                  <div className="text-3xl font-extrabold text-green-900">
                    {selectedStats.longestWinStreak}
                  </div>
                </div>
              </div>

              {/* Match History */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>Recent Matches</span>
                </h3>
                
                {selectedStats.history.length > 0 ? (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="p-3 font-medium">Date</th>
                          <th className="p-3 font-medium">Opponent</th>
                          <th className="p-3 font-medium text-center">Result</th>
                          <th className="p-3 font-medium text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedStats.history.slice(0, 5).map(match => {
                          const opponent = getOpponent(match, selectedPlayer.id);
                          const isWin = match.winnerId === selectedPlayer.id;
                          return (
                            <tr key={match.id} className="hover:bg-gray-50">
                              <td className="p-3 text-gray-600 font-mono text-xs">
                                {new Date(match.date).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={opponent?.avatarUrl || generateAvatar(opponent?.name || 'Unknown')} 
                                    className="w-5 h-5 rounded-full" 
                                  />
                                  <span className="font-medium text-gray-900">{opponent?.name || 'Unknown'}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  isWin ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                  {isWin ? 'WIN' : 'LOSS'}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-gray-700">
                                {match.score1} - {match.score2}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No matches recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;