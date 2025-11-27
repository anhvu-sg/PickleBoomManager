import React, { useState, useEffect } from 'react';
import { ViewState, Player, Match, Tournament, AppNotification, UserSession, UserRole } from './types';
import Dashboard from './components/Dashboard';
import MatchRecorder from './components/MatchRecorder';
import Leaderboard from './components/Leaderboard';
import AIReferee from './components/AIReferee';
import TournamentManager from './components/TournamentManager';
import PlayerRegistration from './components/PlayerRegistration';
import NotificationPanel from './components/NotificationPanel';
import PlayerProfile from './components/PlayerProfile';
import LoginPage from './components/LoginPage';
import { Home, List, PlusCircle, UserPlus, Bot, Menu, X, Users, Bell, LogOut, User } from 'lucide-react';
import { generateAvatar } from './utils';

// Initial Mock Data with DUPR Ratings (2.000 - 8.000 scale)
const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'John Doe', rating: 3.254, wins: 5, losses: 2, matchesPlayed: 7 },
  { id: '2', name: 'Jane Smith', rating: 3.421, wins: 6, losses: 1, matchesPlayed: 7 },
  { id: '3', name: 'Bob Wilson', rating: 2.890, wins: 2, losses: 5, matchesPlayed: 7 },
  { id: '4', name: 'Alice Cooper', rating: 3.105, wins: 4, losses: 3, matchesPlayed: 7 },
  { id: '5', name: 'Mike Johnson', rating: 4.050, wins: 8, losses: 0, matchesPlayed: 8 },
  { id: '6', name: 'Sarah Connor', rating: 2.950, wins: 3, losses: 3, matchesPlayed: 6 },
  { id: '7', name: 'Tom Hardy', rating: 3.670, wins: 5, losses: 4, matchesPlayed: 9 },
  { id: '8', name: 'Emily Blunt', rating: 4.120, wins: 7, losses: 2, matchesPlayed: 9 },
].map(p => ({ ...p, avatarUrl: generateAvatar(p.name) }));

const App: React.FC = () => {
  // Session State
  const [session, setSession] = useState<UserSession | null>(null);

  // Data State
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  
  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [viewPlayerId, setViewPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // Load data from local storage if available
    const savedPlayers = localStorage.getItem('pickle_players');
    const savedMatches = localStorage.getItem('pickle_matches');
    const savedTournament = localStorage.getItem('pickle_tournament');
    const savedNotifications = localStorage.getItem('pickle_notifications');
    const savedSession = localStorage.getItem('pickle_session');
    
    if (savedPlayers) {
      // Ensure loaded players have avatars and migrated ratings if they were old scale
      const loaded: Player[] = JSON.parse(savedPlayers);
      setPlayers(loaded.map(p => {
        let rating = p.rating;
        // Migration check: if rating is > 100, assume old scale (1000+) and convert roughly
        if (rating > 100) {
          rating = 3.0 + ((rating - 1000) / 200); // 1200 -> 4.0, 1000 -> 3.0
        }
        return {
          ...p,
          rating,
          avatarUrl: p.avatarUrl || generateAvatar(p.name) 
        };
      }));
    }
    if (savedMatches) setMatches(JSON.parse(savedMatches));
    if (savedTournament) setActiveTournament(JSON.parse(savedTournament));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    
    if (savedSession) {
      const sess = JSON.parse(savedSession);
      setSession(sess);
      if (sess.role === 'ADMIN') {
        setView(ViewState.DASHBOARD);
      } else {
        setViewPlayerId(sess.playerId);
        setView(ViewState.PLAYER_PROFILE);
      }
    } else {
      setView(ViewState.LOGIN);
    }
  }, []);

  useEffect(() => {
    // Save to local storage on change
    localStorage.setItem('pickle_players', JSON.stringify(players));
    localStorage.setItem('pickle_matches', JSON.stringify(matches));
    localStorage.setItem('pickle_notifications', JSON.stringify(notifications));
    if (activeTournament) {
      localStorage.setItem('pickle_tournament', JSON.stringify(activeTournament));
    }
    if (session) {
      localStorage.setItem('pickle_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('pickle_session');
    }
  }, [players, matches, activeTournament, notifications, session]);

  const handleLogin = (role: UserRole, playerId?: string) => {
    if (role === 'PLAYER' && playerId) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        setSession({ role: 'PLAYER', playerId: player.id, name: player.name });
        setViewPlayerId(player.id);
        setView(ViewState.PLAYER_PROFILE);
      }
    } else if (role === 'ADMIN') {
      setSession({ role: 'ADMIN', name: 'Administrator' });
      setView(ViewState.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setView(ViewState.LOGIN);
    localStorage.removeItem('pickle_session');
  };

  const addNotification = (message: string, type: 'info' | 'success' | 'warning') => {
    const newNotification: AppNotification = {
      id: Date.now().toString() + Math.random().toString(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Send Browser Notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('PickleBoom Manager', {
          body: message,
          icon: '/logo.png', // Uses the new logo for the notification icon
          silent: false
        });
      } catch (e) {
        console.warn('Failed to send browser notification', e);
      }
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNavigateToPlayer = (playerId: string) => {
    setViewPlayerId(playerId);
    setView(ViewState.PLAYER_PROFILE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePlayer = (playerId: string) => {
    if (session?.role !== 'ADMIN') return;

    if (activeTournament && activeTournament.status === 'active' && activeTournament.participants.includes(playerId)) {
      alert("Cannot delete a player who is participating in an active tournament.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this player? This action cannot be undone.")) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      addNotification("Player deleted successfully.", "warning");
      setView(ViewState.PLAYERS);
      setViewPlayerId(null);
    }
  };
  
  const handleDeleteAllPlayers = () => {
    if (session?.role !== 'ADMIN') return;

    if (activeTournament && activeTournament.status === 'active') {
      alert("Cannot delete players while a tournament is active. Please reset the tournament first.");
      return;
    }

    if (window.confirm("CRITICAL WARNING: Are you sure you want to delete ALL players?")) {
      if (window.confirm("This will also delete ALL match history and reset the club data. This action CANNOT be undone. Proceed?")) {
        setPlayers([]);
        setMatches([]);
        setActiveTournament(null);
        addNotification("All players and club history have been successfully deleted.", "warning");
      }
    }
  };

  const handleUpdatePlayerRating = (playerId: string, newRating: number) => {
    if (session?.role !== 'ADMIN') return;

    setPlayers(prev => prev.map(p => {
        if (p.id === playerId) {
            return { ...p, rating: newRating };
        }
        return p;
    }));
    addNotification(`Player rating manually updated to ${newRating.toFixed(3)}`, 'info');
  };

  const handleRecordMatch = (match: Match) => {
    setMatches(prev => [match, ...prev]);

    const p1 = players.find(p => p.id === match.player1Id);
    const p2 = players.find(p => p.id === match.player2Id);

    if (p1 && p2) {
      const isP1Winner = match.winnerId === p1.id;
      
      const ratingDiff = p2.rating - p1.rating;
      const expectedScore = 1 / (1 + Math.pow(10, ratingDiff / 1.0)); 
      
      const kFactor = 0.1; 
      
      const actualScore = isP1Winner ? 1 : 0;
      const rawChange = kFactor * (actualScore - expectedScore);
      
      const roundRating = (num: number) => Math.round(num * 1000) / 1000;

      const updatedPlayers = players.map(p => {
        if (p.id === p1.id) {
          return {
            ...p,
            rating: roundRating(Math.max(2.0, p.rating + rawChange)),
            wins: p.wins + (isP1Winner ? 1 : 0),
            losses: p.losses + (isP1Winner ? 0 : 1),
            matchesPlayed: p.matchesPlayed + 1
          };
        }
        if (p.id === p2.id) {
          return {
            ...p,
            rating: roundRating(Math.max(2.0, p.rating - rawChange)),
            wins: p.wins + (!isP1Winner ? 1 : 0),
            losses: p.losses + (!isP1Winner ? 0 : 1),
            matchesPlayed: p.matchesPlayed + 1
          };
        }
        return p;
      });
      setPlayers(updatedPlayers);
    }
  };

  const handleRegularMatchSubmit = (match: Match) => {
    handleRecordMatch(match);
    setView(ViewState.DASHBOARD);
  };

  const handleRegisterPlayer = (name: string, initialRating: number) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      rating: initialRating,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      avatarUrl: generateAvatar(name)
    };
    setPlayers(prev => [...prev, newPlayer]);
    setView(ViewState.PLAYERS);
    addNotification(`New player registered: ${name} (DUPR: ${initialRating.toFixed(3)})`, 'info'); 
  };

  const NavItem = ({ target, icon: Icon, label }: { target: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => { setView(target); setIsMobileMenuOpen(false); }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-colors ${
        view === target && view !== ViewState.PLAYER_PROFILE
        ? 'bg-pickle-100 text-pickle-700 font-bold' 
        : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Render Login Page if no session
  if (!session || view === ViewState.LOGIN) {
    return <LoginPage players={players} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-200 flex justify-center items-center">
          <img 
            src="/logo.png" 
            alt="PickleBoom" 
            className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" 
            onError={(e) => {
              // Fallback if image isn't loaded
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl font-extrabold text-pickle-700">PickleBoom</span>';
            }}
          />
        </div>
        
        <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${session.role === 'ADMIN' ? 'bg-gray-800' : 'bg-pickle-500'}`}>
             {session.role === 'ADMIN' ? 'A' : session.name.charAt(0)}
           </div>
           <div className="overflow-hidden">
             <div className="font-bold text-gray-800 truncate text-sm">{session.name}</div>
             <div className="text-xs text-gray-500">{session.role === 'ADMIN' ? 'Administrator' : 'Player'}</div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {session.role === 'ADMIN' && (
            <>
              <NavItem target={ViewState.DASHBOARD} icon={Home} label="Dashboard" />
              <NavItem target={ViewState.MATCH_ENTRY} icon={PlusCircle} label="Record Score" />
              <NavItem target={ViewState.PLAYERS} icon={List} label="Rankings" />
              <NavItem target={ViewState.PLAYER_REGISTRATION} icon={UserPlus} label="Register" />
              <NavItem target={ViewState.TOURNAMENTS} icon={Users} label="Tournament Mgr" />
            </>
          )}

          {session.role === 'PLAYER' && (
             <>
               <button
                  onClick={() => { handleNavigateToPlayer(session.playerId!); setIsMobileMenuOpen(false); }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-colors ${
                    view === ViewState.PLAYER_PROFILE && viewPlayerId === session.playerId
                    ? 'bg-pickle-100 text-pickle-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>My Profile</span>
                </button>
               <NavItem target={ViewState.PLAYERS} icon={List} label="Club Rankings" />
             </>
          )}
          
          <NavItem target={ViewState.AI_REF} icon={Bot} label="AI Referee" />
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
             <LogOut className="w-5 h-5" />
             <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Header (Mobile & Desktop) */}
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-2 lg:hidden">
              <img 
                src="/logo.png" 
                alt="PickleBoom" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                   e.currentTarget.style.display = 'none';
                   e.currentTarget.parentElement!.innerText = 'PickleBoom';
                }}
              />
           </div>

           {/* Right Side Header Controls */}
           <div className="flex items-center ml-auto gap-4 relative">
             <button 
               onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
               className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
             >
               <Bell className="w-6 h-6" />
               {unreadNotifications > 0 && (
                 <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white">
                   {unreadNotifications}
                 </span>
               )}
             </button>

             <NotificationPanel 
               notifications={notifications}
               isOpen={isNotificationPanelOpen}
               onClose={() => setIsNotificationPanelOpen(false)}
               onMarkAsRead={markNotificationAsRead}
               onClearAll={clearAllNotifications}
             />

             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 lg:hidden">
               {isMobileMenuOpen ? <X /> : <Menu />}
             </button>
           </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-10 bg-white pt-20 px-4 space-y-2">
             {session.role === 'ADMIN' && (
                <>
                  <NavItem target={ViewState.DASHBOARD} icon={Home} label="Dashboard" />
                  <NavItem target={ViewState.MATCH_ENTRY} icon={PlusCircle} label="Record Score" />
                  <NavItem target={ViewState.PLAYERS} icon={List} label="Rankings" />
                  <NavItem target={ViewState.PLAYER_REGISTRATION} icon={UserPlus} label="Register" />
                  <NavItem target={ViewState.TOURNAMENTS} icon={Users} label="Tournament Mgr" />
                </>
             )}
             {session.role === 'PLAYER' && (
               <>
                 <button
                    onClick={() => { handleNavigateToPlayer(session.playerId!); setIsMobileMenuOpen(false); }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-colors ${
                      view === ViewState.PLAYER_PROFILE && viewPlayerId === session.playerId
                      ? 'bg-pickle-100 text-pickle-700 font-bold' 
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </button>
                 <NavItem target={ViewState.PLAYERS} icon={List} label="Club Rankings" />
               </>
             )}
             <NavItem target={ViewState.AI_REF} icon={Bot} label="AI Referee" />
             <div className="pt-4 border-t border-gray-100 mt-4">
               <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                   <LogOut className="w-5 h-5" />
                   <span>Sign Out</span>
                </button>
             </div>
          </div>
        )}

        {/* Main View Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {view === ViewState.DASHBOARD && session.role === 'ADMIN' && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Club Overview</h2>
              <Dashboard 
                players={players} 
                matches={matches} 
                onNavigate={(v) => setView(v as ViewState)} 
                onNavigateToPlayer={handleNavigateToPlayer}
                onDeleteAllData={handleDeleteAllPlayers}
              />
            </>
          )}

          {view === ViewState.MATCH_ENTRY && session.role === 'ADMIN' && (
            <>
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-gray-800">New Match Entry</h2>
                 <button onClick={() => setView(ViewState.DASHBOARD)} className="text-gray-500 hover:text-gray-700">Back</button>
               </div>
               <MatchRecorder 
                players={players} 
                onRecordMatch={handleRegularMatchSubmit}
                onCancel={() => setView(ViewState.DASHBOARD)}
                onAddNotification={addNotification}
               />
            </>
          )}

          {view === ViewState.PLAYERS && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Club Rankings (DUPR)</h2>
              <Leaderboard 
                players={players} 
                matches={matches}
                onNavigateToPlayer={handleNavigateToPlayer}
              />
            </>
          )}

          {view === ViewState.PLAYER_PROFILE && viewPlayerId && (
            <PlayerProfile
              player={players.find(p => p.id === viewPlayerId) || players[0]}
              allPlayers={players}
              matches={matches}
              onBack={() => {
                // If admin, go back to players list. If player, they stay here usually or go to Leaderboard.
                if (session.role === 'ADMIN') {
                  setView(ViewState.PLAYERS);
                } else {
                  // If player clicks back, maybe go to rankings?
                  setView(ViewState.PLAYERS);
                }
              }}
              onNavigateToPlayer={handleNavigateToPlayer}
              // Only pass admin functions if the role is ADMIN
              onDelete={session.role === 'ADMIN' ? () => handleDeletePlayer(viewPlayerId) : undefined}
              onUpdateRating={session.role === 'ADMIN' ? (rating) => handleUpdatePlayerRating(viewPlayerId, rating) : undefined}
            />
          )}

          {view === ViewState.PLAYER_REGISTRATION && session.role === 'ADMIN' && (
             <>
               <h2 className="text-2xl font-bold text-gray-800 mb-6">Player Registration</h2>
               <PlayerRegistration 
                 onRegister={handleRegisterPlayer}
                 onCancel={() => setView(ViewState.DASHBOARD)}
               />
             </>
          )}

          {view === ViewState.AI_REF && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Referee & Rules Assistant</h2>
              <AIReferee />
            </>
          )}
          
          {view === ViewState.TOURNAMENTS && session.role === 'ADMIN' && (
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-800">Tournament Manager</h2>
                 {activeTournament && activeTournament.status !== 'setup' && (
                    <button 
                      onClick={() => {
                        if(window.confirm("End current tournament and start new?")) {
                          setActiveTournament(null);
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Reset Tournament
                    </button>
                 )}
               </div>
               
               <TournamentManager 
                 players={players}
                 activeTournament={activeTournament}
                 onStartTournament={setActiveTournament}
                 onUpdateTournament={setActiveTournament}
                 onTournamentMatchComplete={handleRecordMatch}
                 onAddNotification={addNotification}
               />
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;