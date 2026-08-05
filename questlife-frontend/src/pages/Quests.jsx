import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Swords, Target, Calendar, Dumbbell, Droplets, Brain, Check, Clock, RotateCw, Sparkles } from 'lucide-react';

const iconMap = {
  run: Target,
  dumbbell: Dumbbell,
  water: Droplets,
  brain: Brain,
  target: Target,
  calendar: Calendar,
  sword: Swords
};

export default function Quests() {
  const [activeTab, setActiveTab] = useState('daily');
  const { quests, claimQuest, refreshQuests } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      if (activeTab === 'daily') {
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const diff = tomorrow - now;
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days: 0, hours: h, minutes: m, seconds: s });
      } else if (activeTab === 'weekly') {
        const sunday = new Date(now);
        sunday.setDate(now.getDate() + (7 - now.getDay()));
        sunday.setHours(24, 0, 0, 0);
        const diff = sunday - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      } else {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const diff = nextMonth - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshQuests();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredQuests = (quests || []).filter(q => q.type === activeTab);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header & Refresh Timer Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-quest-dark/80 via-quest-dark to-quest-dark/80 p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-quest-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <h1 className="text-4xl font-heading font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-quest-secondary dark:to-quest-accent">
            Hero Quest Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Complete active tasks to earn XP rewards, gold, and progress your level.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Live Refresh Countdown Timer */}
          <div className="glass-card px-4 py-2.5 rounded-xl border border-quest-gold/40 text-xs font-semibold flex items-center gap-2.5 text-quest-gold shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-quest-gold/10">
            <Clock className="w-4 h-4 text-quest-gold animate-pulse" />
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block uppercase font-bold tracking-wider">
                {activeTab} Refresh Timer
              </span>
              <span className="font-mono text-sm text-gray-900 dark:text-white font-extrabold tracking-widest">
                {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-quest-primary/20 hover:bg-quest-primary/30 border border-quest-primary/40 text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(246,36,64,0.3)] cursor-pointer"
            title="Force refresh quests for today"
          >
            <RotateCw className={`w-4 h-4 text-quest-primary dark:text-quest-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Quests ⚡'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-white/10 pb-4">
        {['daily', 'weekly', 'boss'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all capitalize text-sm cursor-pointer ${
              activeTab === tab 
                ? 'bg-quest-primary text-white shadow-[0_0_15px_rgba(246,36,64,0.5)] border border-quest-primary/50' 
                : 'bg-white/5 text-gray-700 dark:text-gray-400 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5'
            }`}
          >
            {tab === 'daily' ? '⚡ Daily Quests' : tab === 'weekly' ? '📜 Weekly Challenges' : '⚔️ Boss Fights'}
          </button>
        ))}
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuests.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-card rounded-2xl border border-gray-200 dark:border-white/10">
            <Sparkles className="w-12 h-12 text-quest-gold mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-heading font-bold mb-1 text-gray-900 dark:text-white">No Active Quests</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Click "Refresh Quests" above to assign fresh tasks!</p>
            <button
              onClick={handleManualRefresh}
              className="btn-primary px-6 py-2.5 text-xs font-bold rounded-xl"
            >
              Generate Quests Now ⚡
            </button>
          </div>
        ) : (
          filteredQuests.map(quest => {
            const Icon = iconMap[quest.icon] || Target;
            const isBoss = quest.type === 'boss';
            const isClaimed = quest.status === 'claimed';
            const isComplete = quest.status === 'completed' || quest.progress >= 100;
            
            return (
              <div 
                key={quest.id} 
                className={`glass-card p-6 glass-card-hover transition-all duration-300 relative overflow-hidden ${
                  isBoss 
                    ? 'md:col-span-2 lg:col-span-3 border-quest-danger/50 bg-gradient-to-br from-quest-danger/10 via-quest-dark to-transparent shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                    : isClaimed 
                    ? 'opacity-75 border-quest-success/30 bg-quest-success/5'
                    : 'border-gray-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl flex-shrink-0 ${
                    isBoss 
                      ? 'bg-quest-danger/20 text-quest-danger shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                      : isClaimed
                      ? 'bg-quest-success/20 text-quest-success'
                      : 'bg-white/5 text-quest-secondary'
                  }`}>
                    <Icon className={isBoss ? 'w-10 h-10' : 'w-6 h-6'} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className={`font-heading font-bold text-gray-900 dark:text-white ${isBoss ? 'text-2xl text-quest-danger dark:text-quest-danger' : 'text-xl'}`}>
                        {quest.title}
                      </h3>
                      <span className="bg-quest-gold/20 text-yellow-700 dark:text-quest-gold px-3 py-1 rounded-lg border border-quest-gold/30 font-bold text-xs whitespace-nowrap shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        +{quest.xp} XP
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{quest.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-700 dark:text-gray-300">Progress</span>
                        <span className={isClaimed || isComplete ? 'text-quest-success font-bold' : 'text-gray-700 dark:text-gray-300'}>
                          {isClaimed ? '100% (Claimed)' : `${quest.progress}%`}
                        </span>
                      </div>
                      <div className="h-3 bg-[#FFE5BF]/40 dark:bg-quest-dark rounded-full overflow-hidden border border-[#FFE5BF]/60 dark:border-white/10">
                        <div 
                          className={`h-full transition-all duration-500 relative ${
                            isClaimed || isComplete 
                              ? 'bg-quest-success' 
                              : isBoss ? 'bg-quest-danger' : 'bg-quest-secondary'
                          }`}
                          style={{ width: `${isClaimed ? 100 : quest.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    
                    {isClaimed ? (
                      <div className="mt-6 w-full py-3 bg-quest-success/10 text-quest-success border border-quest-success/30 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Reward Claimed
                      </div>
                    ) : (
                      <button 
                        onClick={() => claimQuest(quest.id)}
                        className={`mt-6 w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isComplete
                            ? 'bg-gradient-to-r from-quest-success to-emerald-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse'
                            : 'bg-quest-primary hover:bg-quest-primary/80 text-white shadow-[0_0_15px_rgba(246,36,64,0.4)]'
                        }`}
                      >
                        {isComplete ? '✨ Claim Completed Reward!' : `Claim Reward (+${quest.xp} XP)`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
