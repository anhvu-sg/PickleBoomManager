import React, { useState, useEffect, useMemo } from 'react';
import { Player, Tournament, Match, TournamentTeam, TournamentSettings } from '../types';
import { Trophy, Play, CheckCircle, AlertCircle, Sparkles, User, Minus, Plus, X, Edit2, List, GitBranch, Ban, Shuffle, ArrowDown, Users, Trash2, Settings, Clock, Hash, CheckSquare, RefreshCw } from 'lucide-react';
import { predictTournamentWinner } from '../services/geminiService';
import { generateAvatar } from '../utils';

interface TournamentManagerProps {
  players: Player[];
  activeTournament: Tournament | null;
  onStartTournament: (tournament: Tournament) => void;
  onUpdateTournament: (tournament: Tournament) => void;
  onTournamentMatchComplete: (match: Match) => void;
  onAddNotification: (message: string, type: 'info' | 'success' | 'warning') => void;
}

const MatchEditModal: React.FC<{
  match: Match;
  p1?: Player;
  p2?: Player;
  partner1?: Player;
  partner2?: Player;
  onSave: (m: Match, s1: number, s2: number) => void;
  onClose: () => void;
}> = ({ match, p1, p2, partner1, partner2, onSave, onClose }) => {
  const [s1, setS1] = useState(match.score1 || 0);
  const [s2, setS2] = useState(match.score2 || 0);

  const TeamAvatar = ({ player, size = "w-12 h-12" }: { player?: Player, size?: string }) => (
    <img 
      src={player?.avatarUrl || generateAvatar(player?.name || 'TBD')} 
      className={`${size} rounded-full border-2 border-white shadow-sm bg-white`} 
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-pickle-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Update Score
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-pickle-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center text-sm text-gray-500 uppercase tracking-wide font-semibold">
            {match.round === 1 ? 'Round 1' : `Round ${match.round}`} • Match #{match.matchIndex! + 1}
          </div>

          {/* Team 1 Row */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                 <TeamAvatar player={p1} />
                 {partner1 && <TeamAvatar player={partner1} />}
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900 text-sm leading-tight">
                    <div>{p1?.name || 'TBD'}</div>
                    {partner1 && <div>{partner1.name}</div>}
                </div>
                <div className="text-xs text-gray-500 mt-1">Team 1</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setS1(Math.max(0, s1 - 1))} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-2xl text-gray-900">{s1}</span>
              <button onClick={() => setS1(s1 + 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* VS Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-300 font-bold text-xs">VS</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Team 2 Row */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
             <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                 <TeamAvatar player={p2} />
                 {partner2 && <TeamAvatar player={partner2} />}
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900 text-sm leading-tight">
                    <div>{p2?.name || 'TBD'}</div>
                    {partner2 && <div>{partner2.name}</div>}
                </div>
                <div className="text-xs text-gray-500 mt-1">Team 2</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setS2(Math.max(0, s2 - 1))} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-2xl text-gray-900">{s2}</span>
              <button onClick={() => setS2(s2 + 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="pt-2">
             <button 
               onClick={() => onSave(match, s1, s2)}
               disabled={s1 === s2}
               className="w-full py-3 bg-pickle-600 hover:bg-pickle-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
             >
               {s1 === s2 ? 'No Draws Allowed' : 'Confirm Result'}
             </button>
             <p className="text-center text-xs text-gray-400 mt-3">
               Winning team will automatically advance to the next round.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TournamentManager: React.FC<TournamentManagerProps> = ({
  players,
  activeTournament,
  onStartTournament,
  onUpdateTournament,
  onTournamentMatchComplete,
  onAddNotification
}) => {
  const [setupName, setSetupName] = useState('');
  const [format, setFormat] = useState<'singles' | 'doubles'>('singles');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [createdTeams, setCreatedTeams] = useState<TournamentTeam[]>([]);
  const [prediction, setPrediction] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [viewMode, setViewMode] = useState<'bracket' | 'standings'>('bracket');
  const [seedMode, setSeedMode] = useState<'dupr' | 'random'>('dupr');
  
  // Settings State
  const [settings, setSettings] = useState<TournamentSettings>({
    matchFormat: 'game_11',
    winByTwo: true,
    timeLimitMinutes: 0
  });

  // Doubles Staging State
  const [doublesStaging, setDoublesStaging] = useState<string[]>([]);
  const [customTeamName, setCustomTeamName] = useState('');

  const togglePlayerSelect = (id: string) => {
    if (format === 'singles') {
      setSelectedPlayerIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    } else {
      // In doubles, we select players to form a team
      setDoublesStaging(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : prev.length < 2 ? [...prev, id] : prev);
    }
  };

  const createTeam = () => {
    if (doublesStaging.length !== 2) return;
    const p1 = players.find(p => p.id === doublesStaging[0])!;
    const p2 = players.find(p => p.id === doublesStaging[1])!;
    
    const name = customTeamName.trim() || `${p1.name} & ${p2.name}`;

    const newTeam: TournamentTeam = {
      id: `team_${Date.now()}_${Math.random()}`,
      name: name,
      player1Id: p1.id,
      player2Id: p2.id,
      combinedRating: (p1.rating + p2.rating) / 2
    };
    
    setCreatedTeams([...createdTeams, newTeam]);
    setDoublesStaging([]);
    setCustomTeamName('');
  };

  const autoGenerateTeams = () => {
     // Randomly pair up remaining players
     const usedIds = createdTeams.flatMap(t => [t.player1Id, t.player2Id]);
     const available = players.filter(p => !usedIds.includes(p.id));
     
     if (available.length < 2) return;
     
     const shuffled = [...available].sort(() => Math.random() - 0.5);
     const newTeams: TournamentTeam[] = [];
     
     for (let i = 0; i < shuffled.length - 1; i += 2) {
        const p1 = shuffled[i];
        const p2 = shuffled[i+1];
        newTeams.push({
          id: `team_${Date.now()}_${i}`,
          name: `${p1.name} & ${p2.name}`,
          player1Id: p1.id,
          player2Id: p2.id,
          combinedRating: (p1.rating + p2.rating) / 2
        });
     }
     setCreatedTeams([...createdTeams, ...newTeams]);
  };

  const deleteTeam = (teamId: string) => {
    setCreatedTeams(prev => prev.filter(t => t.id !== teamId));
  };

  const availablePlayersForDoubles = useMemo(() => {
     const usedIds = createdTeams.flatMap(t => [t.player1Id, t.player2Id]);
     return players.filter(p => !usedIds.includes(p.id));
  }, [players, createdTeams]);

  // Helper to generate bracket seed order (e.g. 1,8,4,5,2,7,3,6)
  const getSeedingOrder = (totalItems: number) => {
    let seeds = [1, 2];
    while(seeds.length < totalItems) {
      const nextSeeds: number[] = [];
      const nextSize = seeds.length * 2;
      for(const seed of seeds) {
        nextSeeds.push(seed);
        nextSeeds.push(nextSize + 1 - seed);
      }
      seeds = nextSeeds;
    }
    return seeds;
  };

  const handleStart = async () => {
    const minEntities = format === 'singles' ? 2 : 2; // Min 2 players OR 2 teams
    const entities = format === 'singles' 
       ? players.filter(p => selectedPlayerIds.includes(p.id)) 
       : createdTeams;
       
    if (!setupName.trim() || entities.length < minEntities) return;

    // 1. Determine size (Power of 2)
    const powerOfTwo = Math.pow(2, Math.floor(Math.log2(entities.length)));
    
    // 2. Prepare Sorting
    let tournamentEntities = [...entities];
    
    // 3. Sort based on Mode
    if (seedMode === 'dupr') {
      if (format === 'singles') {
        (tournamentEntities as Player[]).sort((a, b) => b.rating - a.rating);
      } else {
        (tournamentEntities as TournamentTeam[]).sort((a, b) => b.combinedRating - a.combinedRating);
      }
    } else {
      tournamentEntities.sort(() => Math.random() - 0.5);
    }
    
    // Slice to valid size
    const participants = tournamentEntities.slice(0, powerOfTwo);
    
    setIsGenerating(true);
    
    // In Doubles, we can't easily use the generic single player prediction yet, skip for now or mock it
    if (format === 'singles') {
        const aiPrediction = await predictTournamentWinner(participants as Player[]);
        setPrediction(aiPrediction);
    } else {
        setPrediction("Predictions unavailable for doubles teams.");
    }

    // 4. Arrange Bracket Order
    let orderedEntities: any[] = [];
    
    if (seedMode === 'dupr') {
        const seedOrder = getSeedingOrder(powerOfTwo);
        orderedEntities = seedOrder.map(seedIndex => participants[seedIndex - 1]);
    } else {
        orderedEntities = participants;
    }

    const roundsCount = Math.log2(powerOfTwo);
    const matches: Match[] = [];
    const tournamentId = Date.now().toString();

    for (let r = 1; r <= roundsCount; r++) {
      const isFirstRound = r === 1;
      const matchCount = powerOfTwo / Math.pow(2, r);
      
      for (let m = 0; m < matchCount; m++) {
        const id = `${tournamentId}_r${r}_m${m}`;
        const nextMatchId = r < roundsCount 
          ? `${tournamentId}_r${r + 1}_m${Math.floor(m / 2)}` 
          : undefined;

        // Determine participants for first round
        let p1Id = '', p2Id = '', part1Id = undefined, part2Id = undefined;

        if (isFirstRound) {
            const ent1 = orderedEntities[m * 2];
            const ent2 = orderedEntities[m * 2 + 1];

            if (format === 'singles') {
                p1Id = (ent1 as Player).id;
                p2Id = (ent2 as Player).id;
            } else {
                const t1 = ent1 as TournamentTeam;
                const t2 = ent2 as TournamentTeam;
                p1Id = t1.player1Id;
                part1Id = t1.player2Id;
                p2Id = t2.player1Id;
                part2Id = t2.player2Id;
            }
        }

        matches.push({
          id,
          tournamentId,
          player1Id: p1Id,
          player2Id: p2Id,
          partner1Id: part1Id,
          partner2Id: part2Id,
          score1: 0,
          score2: 0,
          date: new Date().toISOString(),
          winnerId: '',
          round: r,
          matchIndex: m,
          nextMatchId
        });
      }
    }

    // Participants array is just IDs. For doubles, we track ALL individual IDs.
    const allParticipantIds = format === 'singles' 
       ? (participants as Player[]).map(p => p.id)
       : (participants as TournamentTeam[]).flatMap(t => [t.player1Id, t.player2Id]);

    const newTournament: Tournament = {
      id: tournamentId,
      name: setupName,
      date: new Date().toISOString(),
      status: 'active',
      format,
      settings,
      participants: allParticipantIds,
      teams: format === 'doubles' ? (participants as TournamentTeam[]) : undefined,
      matches,
      totalRounds: roundsCount
    };

    onStartTournament(newTournament);
    const modeText = seedMode === 'dupr' ? 'Seeded' : 'Randomized';
    onAddNotification(`Tournament "${setupName}" started! (${format.toUpperCase()} - ${modeText})`, 'success');
    setIsGenerating(false);
  };

  const handleSaveScore = (match: Match, score1: number, score2: number) => {
    // Determine winner based on score
    // In Doubles, the 'winnerId' is typically the player1Id of the winning team (Team Captain ID concept)
    const winnerId = score1 > score2 ? match.player1Id : match.player2Id;
    
    // For notification naming
    const p1 = players.find(p => p.id === match.player1Id);
    const p2 = players.find(p => p.id === match.player2Id);
    const part1 = players.find(p => p.id === match.partner1Id);
    const part2 = players.find(p => p.id === match.partner2Id);

    const team1Name = part1 ? `${p1?.name} & ${part1.name}` : p1?.name;
    const team2Name = part2 ? `${p2?.name} & ${part2.name}` : p2?.name;
    const winnerName = score1 > score2 ? team1Name : team2Name;

    if (!window.confirm(`Confirm Result?\n${team1Name}: ${score1}\n${team2Name}: ${score2}`)) {
      return;
    }

    const updatedMatch = { ...match, score1, score2, winnerId };
    
    onTournamentMatchComplete(updatedMatch);
    onAddNotification(`Match Complete: ${winnerName} won (${score1}-${score2})`, 'info');

    const updatedMatches = activeTournament!.matches.map(m => 
      m.id === match.id ? updatedMatch : m
    );

    if (match.nextMatchId) {
      const nextMatchIndex = updatedMatches.findIndex(m => m.id === match.nextMatchId);
      if (nextMatchIndex !== -1) {
        const nextMatch = { ...updatedMatches[nextMatchIndex] };
        
        // Pass the winning team forward
        // If Doubles, we must pass both player1Id and partner1Id
        const isTeam1Winner = winnerId === match.player1Id;
        const winnerP1 = isTeam1Winner ? match.player1Id : match.player2Id;
        const winnerPart = isTeam1Winner ? match.partner1Id : match.partner2Id;

        if (match.matchIndex! % 2 === 0) {
          nextMatch.player1Id = winnerP1;
          nextMatch.partner1Id = winnerPart;
        } else {
          nextMatch.player2Id = winnerP1;
          nextMatch.partner2Id = winnerPart;
        }
        updatedMatches[nextMatchIndex] = nextMatch;
      }
    } else {
      onUpdateTournament({ ...activeTournament!, matches: updatedMatches, status: 'completed', championId: winnerId });
      onAddNotification(`🏆 Tournament Champion: ${winnerName}!`, 'success');
      setEditingMatch(null);
      return;
    }

    onUpdateTournament({ ...activeTournament!, matches: updatedMatches });
    setEditingMatch(null);
  };

  const getTournamentStandings = () => {
    if (!activeTournament) return [];

    const participants = activeTournament.participants
      .map(id => players.find(p => p.id === id))
      .filter((p): p is Player => !!p);

    const stats = participants.map(player => {
      // Find matches in this tournament involving this player
      const playerMatches = activeTournament.matches.filter(m => 
        (m.player1Id === player.id || m.player2Id === player.id) && m.winnerId // Only count completed matches
      );

      const wins = playerMatches.filter(m => m.winnerId === player.id).length;
      const losses = playerMatches.filter(m => m.winnerId && m.winnerId !== player.id).length;
      const matchesPlayed = wins + losses;

      const isChampion = activeTournament.championId === player.id;
      const isEliminated = losses > 0;
      
      // Calculate max round based on match presence
      const allScheduledMatches = activeTournament.matches.filter(m => 
         m.player1Id === player.id || m.player2Id === player.id
      );
      const maxRound = Math.max(0, ...allScheduledMatches.map(m => m.round || 0));

      return {
        player,
        wins,
        losses,
        matchesPlayed,
        maxRound,
        isChampion,
        isEliminated
      };
    });

    return stats.sort((a, b) => {
      if (a.isChampion) return -1;
      if (b.isChampion) return 1;
      if (b.maxRound !== a.maxRound) return b.maxRound - a.maxRound;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return 0;
    });
  };

  if (!activeTournament) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-pickle-100 p-2 rounded-lg">
            <Trophy className="w-6 h-6 text-pickle-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Tournament</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pickle-500 outline-none"
                placeholder="e.g., Summer Slam 2026"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                 <button 
                   onClick={() => { setFormat('singles'); setCreatedTeams([]); setSelectedPlayerIds([]); }}
                   className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${format === 'singles' ? 'bg-white shadow-sm text-pickle-700' : 'text-gray-500'}`}
                 >
                   Singles (1v1)
                 </button>
                 <button 
                   onClick={() => { setFormat('doubles'); setSelectedPlayerIds([]); }}
                   className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${format === 'doubles' ? 'bg-white shadow-sm text-pickle-700' : 'text-gray-500'}`}
                 >
                   Doubles (2v2)
                 </button>
              </div>
            </div>
          </div>

          {/* Tournament Settings Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm">
             <div className="flex items-center gap-2 text-gray-700 font-bold border-b border-gray-100 pb-2">
               <Settings className="w-4 h-4" />
               <h3>Tournament Settings</h3>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Match Format</label>
                  <select 
                    value={settings.matchFormat}
                    onChange={(e) => setSettings({...settings, matchFormat: e.target.value as any})}
                    className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-pickle-500"
                  >
                    <option value="game_11">1 Game to 11</option>
                    <option value="game_15">1 Game to 15</option>
                    <option value="best_of_3">Best of 3 (to 11)</option>
                  </select>
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time Limit</label>
                 <div className="relative">
                   <input
                     type="number"
                     min="0"
                     value={settings.timeLimitMinutes === 0 ? '' : settings.timeLimitMinutes}
                     onChange={(e) => setSettings({...settings, timeLimitMinutes: parseInt(e.target.value) || 0})}
                     placeholder="No Limit"
                     className="w-full p-2 pl-8 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-pickle-500"
                   />
                   <Clock className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                   <span className="absolute right-2 top-2.5 text-xs text-gray-400">mins</span>
                 </div>
               </div>

               <div className="flex items-center">
                 <button 
                   type="button"
                   onClick={() => setSettings({...settings, winByTwo: !settings.winByTwo})}
                   className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      settings.winByTwo 
                      ? 'bg-pickle-50 border-pickle-300 text-pickle-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                   }`}
                 >
                   {settings.winByTwo ? <CheckSquare className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-gray-300 rounded" />}
                   <span className="text-sm font-bold">Win By 2</span>
                 </button>
               </div>
             </div>
          </div>

          {/* Seeding Mode Toggle */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <label className="block text-sm font-medium text-gray-700 mb-2">Bracket Seeding Strategy</label>
             <div className="flex space-x-4">
               <button
                 type="button"
                 onClick={() => setSeedMode('dupr')}
                 className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                   seedMode === 'dupr' 
                     ? 'bg-white border-pickle-500 ring-1 ring-pickle-500 text-pickle-700 shadow-sm' 
                     : 'bg-transparent border-gray-200 text-gray-500 hover:bg-white'
                 }`}
               >
                 <ArrowDown className="w-5 h-5" />
                 <div className="text-left">
                   <div className="font-bold text-sm">Ranked Seeding</div>
                   <div className="text-[10px] opacity-70">Best play Worst</div>
                 </div>
               </button>
               <button
                 type="button"
                 onClick={() => setSeedMode('random')}
                 className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                   seedMode === 'random' 
                     ? 'bg-white border-blue-500 ring-1 ring-blue-500 text-blue-700 shadow-sm' 
                     : 'bg-transparent border-gray-200 text-gray-500 hover:bg-white'
                 }`}
               >
                 <Shuffle className="w-5 h-5" />
                 <div className="text-left">
                   <div className="font-bold text-sm">Random Shuffle</div>
                   <div className="text-[10px] opacity-70">Pure Luck</div>
                 </div>
               </button>
             </div>
          </div>

          {format === 'singles' ? (
             /* SINGLES SELECTION */
             <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <label className="block text-sm font-medium text-gray-700">Select Players</label>
                    <button 
                      type="button"
                      onClick={() => setSelectedPlayerIds(selectedPlayerIds.length === players.length ? [] : players.map(p => p.id))}
                      className="text-xs font-bold text-pickle-600 hover:text-pickle-800"
                    >
                      {selectedPlayerIds.length === players.length ? '(Deselect All)' : '(Select All)'}
                    </button>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {selectedPlayerIds.length} Selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {players.map(player => (
                    <div 
                      key={player.id} 
                      onClick={() => togglePlayerSelect(player.id)}
                      className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                        selectedPlayerIds.includes(player.id) ? 'bg-pickle-50 border border-pickle-200' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        selectedPlayerIds.includes(player.id) ? 'bg-pickle-500 border-pickle-500' : 'border-gray-300'
                      }`}>
                        {selectedPlayerIds.includes(player.id) && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={player.avatarUrl || generateAvatar(player.name)} 
                          className="w-8 h-8 rounded-full bg-gray-100" 
                        />
                        <div>
                          <div className="font-medium text-sm text-gray-900">{player.name}</div>
                          <div className="text-xs text-gray-500">DUPR: {player.rating.toFixed(3)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          ) : (
             /* DOUBLES SELECTION */
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="font-bold text-gray-700">Build Teams</h3>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => { setDoublesStaging([]); setCustomTeamName(''); }}
                       className="text-xs bg-white text-gray-600 px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-semibold flex items-center gap-1"
                       disabled={doublesStaging.length === 0}
                     >
                       <RefreshCw className="w-3 h-3" />
                       Reset Pair
                     </button>
                     <button 
                       onClick={autoGenerateTeams}
                       className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors font-semibold"
                     >
                       Auto-Pair Remaining
                     </button>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* Left: Available Players */}
                   <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 h-96 flex flex-col">
                      <div className="text-xs font-bold text-gray-500 uppercase mb-2">Available Players</div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                         {availablePlayersForDoubles.map(player => (
                            <div 
                              key={player.id}
                              onClick={() => togglePlayerSelect(player.id)}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                                doublesStaging.includes(player.id) ? 'bg-pickle-100 border-pickle-300 shadow-sm' : 'bg-white border-gray-100 hover:border-pickle-200'
                              }`}
                            >
                               <div className="flex items-center gap-2">
                                  <img src={player.avatarUrl || generateAvatar(player.name)} className="w-6 h-6 rounded-full" />
                                  <span className="text-sm">{player.name}</span>
                               </div>
                               {doublesStaging.includes(player.id) && <CheckCircle className="w-4 h-4 text-pickle-600" />}
                            </div>
                         ))}
                         {availablePlayersForDoubles.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-10">All players assigned.</div>
                         )}
                      </div>
                      
                      {doublesStaging.length === 2 && (
                         <div className="mt-2 animate-in slide-in-from-bottom-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Team Name (Optional)</label>
                            <input 
                              type="text"
                              value={customTeamName}
                              onChange={(e) => setCustomTeamName(e.target.value)}
                              placeholder="e.g. The Pickle Ballers"
                              className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-pickle-500 mb-2"
                            />
                         </div>
                      )}

                      <button 
                        onClick={createTeam}
                        disabled={doublesStaging.length !== 2}
                        className="mt-2 w-full py-2 bg-pickle-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      >
                         <Users className="w-4 h-4" />
                         Create Team
                      </button>
                   </div>

                   {/* Right: Created Teams */}
                   <div className="border border-gray-200 rounded-xl p-4 bg-white h-96 flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                         <div className="text-xs font-bold text-gray-500 uppercase">Registered Teams ({createdTeams.length})</div>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                         {createdTeams.map(team => (
                            <div key={team.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between group hover:border-pickle-200 transition-colors">
                               <div>
                                  <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="w-3 h-3 text-pickle-500" />
                                    {team.name}
                                  </div>
                                  <div className="text-xs text-gray-500 ml-5">Avg DUPR: {team.combinedRating.toFixed(3)}</div>
                               </div>
                               <button 
                                 onClick={() => deleteTeam(team.id)}
                                 className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         ))}
                         {createdTeams.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-10">No teams created yet.</div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          )}

          <button
            onClick={handleStart}
            disabled={
              !setupName || 
              isGenerating || 
              (format === 'singles' && selectedPlayerIds.length < 2) ||
              (format === 'doubles' && createdTeams.length < 2)
            }
            className="w-full py-3 bg-pickle-600 text-white rounded-lg font-bold hover:bg-pickle-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Generating Bracket...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Tournament</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Bracket View
  const rounds = Array.from({ length: activeTournament.totalRounds }, (_, i) => i + 1);
  const totalBracketHeight = Math.max(600, (activeTournament.matches.filter(m => m.round === 1).length) * 140);
  const standings = getTournamentStandings();
  const currentSettings = activeTournament.settings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-pickle-600" />
            {activeTournament.name}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
             <span className="font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                {activeTournament.format === 'doubles' ? 'Doubles' : 'Singles'}
             </span>
             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
             <span className="flex items-center gap-1">
               <Hash className="w-3 h-3" />
               {currentSettings?.matchFormat === 'best_of_3' ? 'Best of 3' : currentSettings?.matchFormat === 'game_15' ? 'Game to 15' : 'Game to 11'}
             </span>
             {currentSettings?.winByTwo && (
               <>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Win by 2
                </span>
               </>
             )}
             {currentSettings?.timeLimitMinutes ? (
               <>
                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                 <span className="flex items-center gap-1 text-orange-600 font-medium">
                   <Clock className="w-3 h-3" />
                   {currentSettings.timeLimitMinutes}m Limit
                 </span>
               </>
             ) : null}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTournament.status === 'active' && format === 'singles' && (
             <div className="bg-gradient-to-r from-pickle-50 to-blue-50 px-4 py-2 rounded-lg border border-pickle-100 flex items-center gap-2 max-w-xs md:max-w-md">
               <Sparkles className="w-4 h-4 text-pickle-600 flex-shrink-0" />
               <span className="text-sm text-gray-700 italic truncate">{prediction || "AI Prediction Loading..."}</span>
             </div>
          )}
          
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button 
              onClick={() => setViewMode('bracket')}
              className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
                viewMode === 'bracket' ? 'bg-white text-pickle-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span className="hidden sm:inline">Bracket</span>
            </button>
            <button 
              onClick={() => setViewMode('standings')}
              className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
                viewMode === 'standings' ? 'bg-white text-pickle-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Standings</span>
            </button>
          </div>
        </div>
      </div>

      {activeTournament.status === 'completed' && activeTournament.championId && viewMode === 'bracket' && (
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-8 rounded-xl border border-yellow-200 text-center shadow-lg animate-in zoom-in duration-500">
          <div className="relative inline-block mb-4">
             <Trophy className="w-16 h-16 text-yellow-600 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-yellow-800 tracking-tight">Champion</h3>
          <div className="text-4xl font-extrabold text-gray-900 mt-2">
            {players.find(p => p.id === activeTournament.championId)?.name}
            {activeTournament.format === 'doubles' && " & Team"}
          </div>
        </div>
      )}

      {/* Visual Bracket */}
      {viewMode === 'bracket' && (
        <div className="overflow-x-auto pb-8 pt-4 bg-white rounded-xl border border-gray-100 min-h-[600px] animate-in fade-in duration-300">
          <div className="flex px-8" style={{ height: `${totalBracketHeight}px` }}>
            {rounds.map((roundNum, rIndex) => {
               const roundMatches = activeTournament.matches
                 .filter(m => m.round === roundNum)
                 .sort((a, b) => (a.matchIndex || 0) - (b.matchIndex || 0));

               const isFinal = roundNum === activeTournament.totalRounds;

               return (
                 <div key={roundNum} className="relative flex flex-col justify-around flex-shrink-0 w-72 group">
                   <div className="absolute -top-8 left-0 w-full text-center font-bold text-gray-400 uppercase tracking-widest text-xs">
                     {isFinal ? 'Championship' : `Round ${roundNum}`}
                   </div>

                   {roundMatches.map((match, mIndex) => {
                     const p1 = players.find(p => p.id === match.player1Id);
                     const p2 = players.find(p => p.id === match.player2Id);
                     const part1 = players.find(p => p.id === match.partner1Id);
                     const part2 = players.find(p => p.id === match.partner2Id);
                     
                     const isPlayable = !match.winnerId && p1 && p2;
                     
                     return (
                       <div key={match.id} className="relative px-4">
                         {!isFinal && (
                           <div className="absolute right-0 top-1/2 w-8 h-px bg-gray-300 transform translate-x-full z-0" />
                         )}
                         {!isFinal && mIndex % 2 === 0 && (
                            <div className="absolute -right-8 top-1/2 w-8 border-r border-gray-300 z-0" 
                                 style={{ height: 'calc(100% + 1px)', top: '50%' }} 
                            />
                         )}
                         
                         <div 
                           onClick={() => isPlayable && setEditingMatch(match)}
                           className={`
                             relative z-10 bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden
                             ${match.winnerId ? 'border-pickle-500 ring-1 ring-pickle-100' : 'border-gray-200 hover:border-pickle-400 hover:shadow-md'}
                             ${isPlayable ? 'cursor-pointer' : ''}
                           `}
                         >
                            {/* Top Side */}
                            <div className={`p-2 flex justify-between items-center ${match.winnerId === match.player1Id ? 'bg-pickle-50' : ''}`}>
                               <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="flex -space-x-2">
                                     <img src={p1?.avatarUrl || generateAvatar(p1?.name || 'P1')} className="w-6 h-6 rounded-full ring-2 ring-white" />
                                     {part1 && <img src={part1.avatarUrl || generateAvatar(part1.name)} className="w-6 h-6 rounded-full ring-2 ring-white" />}
                                  </div>
                                  <div className="flex flex-col">
                                      <span className={`text-xs truncate font-medium ${match.winnerId === match.player1Id ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {p1?.name || '...'}
                                      </span>
                                      {part1 && <span className={`text-xs truncate font-medium ${match.winnerId === match.player1Id ? 'text-gray-900' : 'text-gray-500'}`}>{part1.name}</span>}
                                  </div>
                               </div>
                               {match.winnerId && <span className={`font-bold ${match.winnerId === match.player1Id ? 'text-pickle-700' : 'text-gray-400'}`}>{match.score1}</span>}
                            </div>
                            
                            <div className="h-px bg-gray-100 w-full" />

                            {/* Bottom Side */}
                            <div className={`p-2 flex justify-between items-center ${match.winnerId === match.player2Id ? 'bg-pickle-50' : ''}`}>
                               <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="flex -space-x-2">
                                     <img src={p2?.avatarUrl || generateAvatar(p2?.name || 'P2')} className="w-6 h-6 rounded-full ring-2 ring-white" />
                                     {part2 && <img src={part2.avatarUrl || generateAvatar(part2.name)} className="w-6 h-6 rounded-full ring-2 ring-white" />}
                                  </div>
                                  <div className="flex flex-col">
                                      <span className={`text-xs truncate font-medium ${match.winnerId === match.player2Id ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {p2?.name || '...'}
                                      </span>
                                      {part2 && <span className={`text-xs truncate font-medium ${match.winnerId === match.player2Id ? 'text-gray-900' : 'text-gray-500'}`}>{part2.name}</span>}
                                  </div>
                               </div>
                               {match.winnerId && <span className={`font-bold ${match.winnerId === match.player2Id ? 'text-pickle-700' : 'text-gray-400'}`}>{match.score2}</span>}
                            </div>
                            
                            {isPlayable && (
                              <div className="absolute inset-0 bg-white/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                 <div className="bg-pickle-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                   <Play className="w-3 h-3 fill-current" />
                                   Play
                                 </div>
                              </div>
                            )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {/* Standings View */}
      {viewMode === 'standings' && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
               <List className="w-5 h-5" />
               Tournament Standings & Records
            </div>
            <table className="w-full text-left">
               <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                     <th className="p-4">Rank/Status</th>
                     <th className="p-4">Player</th>
                     <th className="p-4 text-center">Round Reached</th>
                     <th className="p-4 text-center">Record (W-L)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {standings.map((stat, idx) => (
                     <tr key={stat.player.id} className="hover:bg-gray-50">
                        <td className="p-4">
                           {stat.isChampion ? (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                                 <Trophy className="w-3 h-3 mr-1" />
                                 Champion
                              </div>
                           ) : stat.isEliminated ? (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                 <Ban className="w-3 h-3 mr-1" />
                                 Eliminated
                              </div>
                           ) : (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                 <Play className="w-3 h-3 mr-1" />
                                 Active
                              </div>
                           )}
                        </td>
                        <td className="p-4 flex items-center gap-3">
                           <span className="text-gray-400 font-mono text-sm w-4">{idx + 1}.</span>
                           <img 
                              src={stat.player.avatarUrl || generateAvatar(stat.player.name)} 
                              className="w-8 h-8 rounded-full border border-gray-200" 
                           />
                           <span className={`font-medium ${stat.isChampion ? 'text-yellow-700 font-bold' : 'text-gray-900'}`}>
                              {stat.player.name}
                           </span>
                        </td>
                        <td className="p-4 text-center text-sm text-gray-600">
                           {stat.maxRound === activeTournament.totalRounds && stat.isChampion 
                              ? 'Winner' 
                              : stat.maxRound === activeTournament.totalRounds 
                                 ? 'Finalist'
                                 : `Round ${stat.maxRound}`
                           }
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-gray-700">
                           <span className="text-green-600">{stat.wins}</span> - <span className="text-red-500">{stat.losses}</span>
                        </td>
                     </tr>
                  ))}
                  {standings.length === 0 && (
                     <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-400">
                           No standings data available yet.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      )}

      {editingMatch && (
        <MatchEditModal
          match={editingMatch}
          p1={players.find(p => p.id === editingMatch.player1Id)}
          p2={players.find(p => p.id === editingMatch.player2Id)}
          partner1={players.find(p => p.id === editingMatch.partner1Id)}
          partner2={players.find(p => p.id === editingMatch.partner2Id)}
          onSave={handleSaveScore}
          onClose={() => setEditingMatch(null)}
        />
      )}
    </div>
  );
};

export default TournamentManager;