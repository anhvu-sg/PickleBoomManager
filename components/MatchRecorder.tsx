import React, { useState } from 'react';
import { Player, Match } from '../types';
import { Trophy, Save, Loader2, Wand2, User } from 'lucide-react';
import { generateMatchCommentary } from '../services/geminiService';
import { generateAvatar } from '../utils';

interface MatchRecorderProps {
  players: Player[];
  onRecordMatch: (match: Match) => void;
  onCancel: () => void;
  onAddNotification: (message: string, type: 'info' | 'success' | 'warning') => void;
}

const MatchRecorder: React.FC<MatchRecorderProps> = ({ players, onRecordMatch, onCancel, onAddNotification }) => {
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1Id || !player2Id || player1Id === player2Id) {
      alert("Please select two different players.");
      return;
    }

    setIsSubmitting(true);
    setAiAnalysis("Analyzing match performance...");

    const p1 = players.find(p => p.id === player1Id)!;
    const p2 = players.find(p => p.id === player2Id)!;
    const winnerId = score1 > score2 ? player1Id : player2Id;
    const winnerName = winnerId === player1Id ? p1.name : p2.name;

    const newMatch: Match = {
      id: Date.now().toString(),
      player1Id,
      player2Id,
      score1,
      score2,
      winnerId,
      date: new Date().toISOString(),
    };

    // Generate AI Commentary
    const commentary = await generateMatchCommentary(newMatch, p1, p2);
    newMatch.summary = commentary;
    
    // Slight delay to show off the AI loading state purely for UX
    setTimeout(() => {
      onRecordMatch(newMatch);
      onAddNotification(`Match Recorded: ${p1.name} vs ${p2.name} (${score1}-${score2}). Winner: ${winnerName}`, 'success');
      setIsSubmitting(false);
      setAiAnalysis(null);
    }, 1000);
  };

  const getPlayer = (id: string) => players.find(p => p.id === id);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-2 mb-6 text-pickle-800">
        <Trophy className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Record Match Result</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player 1 Side */}
          <div className="bg-pickle-100 p-4 rounded-lg border border-pickle-200">
            <label className="block text-sm font-medium text-pickle-900 mb-2">Player 1</label>
            <div className="flex items-center gap-3 mb-3">
               {player1Id ? (
                 <img 
                   src={getPlayer(player1Id)?.avatarUrl || generateAvatar(getPlayer(player1Id)?.name || 'P1')} 
                   alt="Player 1" 
                   className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-white"
                 />
               ) : (
                 <div className="w-12 h-12 rounded-full bg-white/50 border-2 border-white shadow-sm flex items-center justify-center">
                   <User className="w-6 h-6 text-pickle-300" />
                 </div>
               )}
              <select
                required
                className="flex-1 p-2 rounded border border-gray-300 focus:ring-2 focus:ring-pickle-500 outline-none"
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
              >
                <option value="">Select Player</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.rating.toFixed(3)})</option>
                ))}
              </select>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-pickle-900 mb-1">Score</label>
              <input
                type="number"
                min="0"
                required
                className="w-full text-center text-3xl font-bold p-2 rounded border border-gray-300 focus:ring-2 focus:ring-pickle-500 outline-none"
                value={score1}
                onChange={(e) => setScore1(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">VS</span>
          </div>

          {/* Player 2 Side */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <label className="block text-sm font-medium text-orange-900 mb-2">Player 2</label>
            <div className="flex items-center gap-3 mb-3">
               {player2Id ? (
                 <img 
                   src={getPlayer(player2Id)?.avatarUrl || generateAvatar(getPlayer(player2Id)?.name || 'P2')} 
                   alt="Player 2" 
                   className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-white"
                 />
               ) : (
                 <div className="w-12 h-12 rounded-full bg-white/50 border-2 border-white shadow-sm flex items-center justify-center">
                   <User className="w-6 h-6 text-orange-300" />
                 </div>
               )}
              <select
                required
                className="flex-1 p-2 rounded border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                value={player2Id}
                onChange={(e) => setPlayer2Id(e.target.value)}
              >
                <option value="">Select Player</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.rating.toFixed(3)})</option>
                ))}
              </select>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-orange-900 mb-1">Score</label>
              <input
                type="number"
                min="0"
                required
                className="w-full text-center text-3xl font-bold p-2 rounded border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                value={score2}
                onChange={(e) => setScore2(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="flex items-center space-x-2 text-pickle-600 mb-2">
              <Wand2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold">Gemini AI is analyzing the match...</span>
            </div>
            <p className="text-sm text-gray-500">Generating tactical summary and updating DUPR ratings</p>
          </div>
        ) : (
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-pickle-600 text-white rounded-lg hover:bg-pickle-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Record Final Score</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MatchRecorder;