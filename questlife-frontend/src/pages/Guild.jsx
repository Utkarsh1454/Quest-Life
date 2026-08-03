import { Users, Shield, MessageSquare, Plus, Zap, Heart, Send, Sparkles, X, Check, LogOut, ArrowRight, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

const PUBLIC_GUILDS = [
  { 
    id: 'g1', 
    name: 'Iron Vanguard', 
    level: 8, 
    focus: 'Strength & Heavy Lifting', 
    membersCount: 18, 
    xp: 12500, 
    nextLevelXp: 15000,
    members: [
      { id: 2, name: 'ShadowNinja', role: 'Officer', level: 21, class: 'Ranger' },
      { id: 3, name: 'HealerMain', role: 'Member', level: 18, class: 'Monk' },
      { id: 4, name: 'MageGamer', role: 'Member', level: 19, class: 'Paladin' },
    ]
  },
  { 
    id: 'g2', 
    name: 'Shadow Assassins', 
    level: 12, 
    focus: 'Agility & HIIT Sprints', 
    membersCount: 20, 
    xp: 22000, 
    nextLevelXp: 25000,
    members: [
      { id: 5, name: 'SprintKing', role: 'Leader', level: 28, class: 'Ranger' },
      { id: 6, name: 'ViperX', role: 'Officer', level: 22, class: 'Warrior' }
    ]
  },
  { 
    id: 'g3', 
    name: 'Paladin Order', 
    level: 6, 
    focus: 'Nutrition & Discipline', 
    membersCount: 14, 
    xp: 8500, 
    nextLevelXp: 10000,
    members: [
      { id: 7, name: 'MacroMaster', role: 'Leader', level: 19, class: 'Paladin' },
      { id: 8, name: 'IronClean', role: 'Member', level: 15, class: 'Monk' }
    ]
  },
  { 
    id: 'g4', 
    name: 'Arcane Fitness', 
    level: 10, 
    focus: 'Yoga & Mindful Recovery', 
    membersCount: 16, 
    xp: 17500, 
    nextLevelXp: 20000,
    members: [
      { id: 9, name: 'ZenMaster', role: 'Leader', level: 24, class: 'Monk' }
    ]
  }
];

export default function Guild() {
  const { profile, addXP, showToast } = useUser();
  const { user: authUser } = useAuth();

  const activeUserName = profile?.name || authUser?.display_name || authUser?.username || 'Hero Adventurer';
  const activeUserLevel = profile?.level || 1;
  const activeUserClass = profile?.class || 'Warrior';

  const guildStorageKey = authUser?.id ? `questlife_guild_${authUser.id}` : 'questlife_guild';

  const [activeGuild, setActiveGuild] = useState(() => {
    const saved = localStorage.getItem(guildStorageKey);
    return saved ? JSON.parse(saved) : null; // Default: UNASSIGNED for new users!
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [feed, setFeed] = useState([
    { id: 1, user: 'ShadowNinja', action: 'completed Titan Challenge', xp: 500, time: '2h ago' },
    { id: 2, user: 'HealerMain', action: 'leveled up to 18', xp: 100, time: '5h ago' }
  ]);

  // Form State
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildFocus, setNewGuildFocus] = useState('Strength & Heavy Lifting');

  // Sync active Guild to localStorage
  useEffect(() => {
    if (authUser?.id) {
      if (activeGuild) {
        localStorage.setItem(`questlife_guild_${authUser.id}`, JSON.stringify(activeGuild));
      } else {
        localStorage.removeItem(`questlife_guild_${authUser.id}`);
      }
    }
  }, [activeGuild, authUser]);

  const handleJoinGuild = (g) => {
    const joinedGuild = {
      ...g,
      membersCount: g.membersCount + 1,
      members: [
        { id: `u_${Date.now()}`, name: activeUserName, role: 'Member (You)', level: activeUserLevel, class: activeUserClass, isUser: true },
        ...(g.members || [])
      ]
    };

    setActiveGuild(joinedGuild);
    addXP(150, `Joined Guild: ${g.name}`);
    showToast(`Welcome to ${g.name}! Earned +150 XP! 🎉`, 'level-up', 150);
  };

  const handleCreateGuild = (e) => {
    e.preventDefault();
    if (!newGuildName) return;

    const createdGuild = {
      id: `g_${Date.now()}`,
      name: newGuildName,
      level: 1,
      focus: newGuildFocus,
      membersCount: 1,
      xp: 0,
      nextLevelXp: 5000,
      members: [
        { id: `u_${Date.now()}`, name: activeUserName, role: 'Guild Master (You)', level: activeUserLevel, class: activeUserClass, isUser: true }
      ]
    };

    setActiveGuild(createdGuild);
    setShowCreateModal(false);
    setNewGuildName('');
    addXP(250, `Forged New Guild: ${newGuildName}`);
    showToast(`Forged Guild: ${newGuildName}! You are Guild Master 👑 (+250 XP)`, 'level-up', 250);
  };

  const handleLeaveGuild = () => {
    setActiveGuild(null);
    showToast('Left current guild. You are now unassigned.', 'info');
  };

  const handleDonate = () => {
    if (!activeGuild) return;
    setActiveGuild(prev => ({
      ...prev,
      xp: Math.min(prev.xp + 500, prev.nextLevelXp)
    }));
    setFeed(prev => [
      { id: Date.now(), user: activeUserName, action: 'donated 500 Gold to Guild Vault', xp: 500, time: 'Just now' },
      ...prev
    ]);
    addXP(100, 'Guild Vault Contribution');
    showToast('Donated 500 Gold! +500 Guild XP & +100 Personal XP', 'success');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setFeed(prev => [
      { id: Date.now(), user: activeUserName, action: `says: "${chatInput}"`, xp: 20, time: 'Just now' },
      ...prev
    ]);
    addXP(20, 'Guild Chat Engagement');
    setChatInput('');
  };

  // UNASSIGNED STATE - SHOW GUILD HALL LANDING PAGE
  if (!activeGuild) {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight">Guild Hall</h1>
            <p className="text-gray-400">You are currently unaligned. Join an established alliance or forge your own guild.</p>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary bg-gradient-to-r from-quest-gold via-amber-500 to-quest-primary text-black font-bold flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-quest-gold/20"
          >
            <Plus className="w-5 h-5 text-black" /> Forge Your Own Guild (+250 XP)
          </button>
        </div>

        {/* Guild Hall Callout Card */}
        <div className="glass-card p-8 border-t-4 border-t-quest-primary text-center space-y-4 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-quest-primary/20 text-quest-primary flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(246,36,64,0.3)]">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-heading">Choose Your Alliance</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Guilds allow heroes to pool XP, unlock exclusive guild bank perks, and climb global alliance leaderboards. Select a guild below to enlist.
          </p>
        </div>

        {/* Available Guilds List */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold">Public Guilds Seeking Recruits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PUBLIC_GUILDS.map(g => (
              <div key={g.id} className="glass-card p-6 glass-card-hover flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-white">{g.name}</h3>
                    <div className="text-xs font-bold text-quest-secondary mt-1">{g.focus}</div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-quest-primary/20 text-quest-primary border border-quest-primary/30">
                    Level {g.level}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-white/10">
                  <span>{g.membersCount} Active Members</span>
                  <span className="text-quest-gold font-bold">{g.xp} / {g.nextLevelXp} Guild XP</span>
                </div>

                <button 
                  onClick={() => handleJoinGuild(g)}
                  className="w-full py-3 bg-quest-primary hover:bg-quest-primary/80 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(246,36,64,0.4)] flex items-center justify-center gap-2"
                >
                  Join Alliance <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Forge Guild Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-6 relative border-t-2 border-t-quest-gold animate-scale-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-heading font-bold text-quest-gold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Forge New Guild
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGuild} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Guild Name *</label>
                  <input 
                    type="text" 
                    value={newGuildName}
                    onChange={(e) => setNewGuildName(e.target.value)}
                    className="input-field" 
                    placeholder="e.g. Apex Titans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Guild Primary Focus</label>
                  <select 
                    value={newGuildFocus}
                    onChange={(e) => setNewGuildFocus(e.target.value)}
                    className="input-field bg-[#FFFAF3] dark:bg-quest-darkest"
                  >
                    <option>Strength & Heavy Lifting</option>
                    <option>Agility & HIIT Sprints</option>
                    <option>Nutrition & Discipline</option>
                    <option>Yoga & Mindful Recovery</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-4 btn-primary bg-quest-gold hover:bg-quest-gold/80 py-3 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-quest-gold/30"
                >
                  <Plus className="w-5 h-5" /> Create Guild (+250 XP)
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ACTIVE GUILD DASHBOARD STATE
  const xpPercentage = (activeGuild.xp / (activeGuild.nextLevelXp || 15000)) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Active Guild Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-heading font-bold tracking-tight">Guild: {activeGuild.name}</h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-quest-gold/20 text-quest-gold border border-quest-gold/30">
              {activeGuild.focus}
            </span>
          </div>
          <p className="text-gray-400 mt-1">Collaborate with allies to earn bonus XP and rank up your guild.</p>
        </div>

        <div className="flex flex-wrap gap-3">
           <button 
             onClick={handleDonate}
             className="bg-quest-gold/20 text-quest-gold hover:bg-quest-gold/30 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-quest-gold/30 flex items-center gap-2"
           >
             <Heart className="w-4 h-4" /> Contribute (+100 XP)
           </button>
           <button 
             onClick={handleLeaveGuild}
             className="bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 px-4 py-2 rounded-lg font-medium transition-colors border border-white/10 text-sm flex items-center gap-1"
           >
             <LogOut className="w-4 h-4" /> Leave Guild
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roster & Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border-t-2 border-t-quest-primary">
             <div className="flex justify-between items-end mb-2">
               <div>
                  <h2 className="text-2xl font-heading font-bold text-quest-primary">Level {activeGuild.level} Guild</h2>
                  <p className="text-xs text-gray-400">Guild Level Progress</p>
               </div>
               <span className="text-sm font-bold text-quest-gold">{activeGuild.xp} / {activeGuild.nextLevelXp || 15000} XP</span>
             </div>
             <div className="h-4 bg-[#FFE5BF]/40 dark:bg-quest-dark rounded-full overflow-hidden border border-[#FFE5BF]/60 dark:border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-quest-primary to-quest-secondary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(246,36,64,0.8)] relative"
                  style={{ width: `${Math.min(xpPercentage, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-quest-primary" />
              Member Roster ({(activeGuild.members || []).length}/20)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="pb-3 font-medium">Player</th>
                    <th className="pb-3 font-medium">Class</th>
                    <th className="pb-3 font-medium">Level</th>
                    <th className="pb-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(activeGuild.members || []).map((member, idx) => (
                    <tr key={member.id || idx} className={`hover:bg-white/5 transition-colors ${member.isUser ? 'bg-quest-primary/10 font-bold' : ''}`}>
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-quest-primary/10 dark:bg-quest-dark border border-quest-primary/30 dark:border-white/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-quest-gold" />
                        </div>
                        <span className="font-bold">{member.name}</span>
                      </td>
                      <td className="py-4 text-gray-300">{member.class}</td>
                      <td className="py-4 text-quest-primary font-bold">Lvl {member.level}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${member.isUser ? 'bg-quest-primary/20 text-quest-primary border border-quest-primary/40' : 'bg-white/5 text-gray-400'}`}>
                          {member.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Guild Chat Feed */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 flex flex-col h-full justify-between">
            <div>
              <h3 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-quest-gold" />
                Guild Feed & Chat
              </h3>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {feed.map(item => (
                  <div key={item.id} className="relative pl-5 border-l-2 border-quest-primary/40">
                    <p className="text-xs">
                      <strong className="text-white">{item.user}</strong> <span className="text-gray-300">{item.action}</span>
                    </p>
                    <div className="flex justify-between items-center mt-1 text-[10px]">
                      <span className="font-bold text-quest-gold">+{item.xp} XP</span>
                      <span className="text-gray-500">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendChat} className="mt-6 pt-4 border-t border-white/10 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send message to guild..."
                className="input-field py-2 text-xs"
              />
              <button type="submit" className="p-2.5 rounded-xl bg-quest-primary hover:bg-quest-primary/80 text-white shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
