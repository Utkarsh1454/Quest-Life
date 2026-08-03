import { useState, useEffect } from 'react';
import { useUser, getXpRequiredForLevel } from '../context/UserContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Flame, Target, Zap, Swords, Heart, Brain, Shield, Sparkles } from 'lucide-react';

const statIcons = {
  str: { label: 'Strength', icon: Swords, color: 'text-quest-str', bar: 'bg-quest-str' },
  end: { label: 'Endurance', icon: Heart, color: 'text-quest-end', bar: 'bg-quest-end' },
  spd: { label: 'Speed', icon: Zap, color: 'text-quest-spd', bar: 'bg-quest-spd' },
  dis: { label: 'Discipline', icon: Brain, color: 'text-quest-dis', bar: 'bg-quest-dis' },
  con: { label: 'Consistency', icon: Shield, color: 'text-quest-con', bar: 'bg-quest-con' },
  rec: { label: 'Recovery', icon: Target, color: 'text-quest-rec', bar: 'bg-quest-rec' }
};

export default function Progress() {
  const { profile, quests, activityHistory } = useUser();
  const [timeframe, setTimeframe] = useState('7d');

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const nextLevelXp = profile?.nextLevelXp || (getXpRequiredForLevel ? getXpRequiredForLevel(level) : 133);
  const streak = profile?.streak || 0;
  
  const xpPercentage = Math.min((xp / nextLevelXp) * 100, 100);

  // Completed quests count
  const completedQuestsCount = (quests || []).filter(q => q.status === 'claimed' || q.progress === 100).length;

  // Calculate total lifetime XP
  let calculatedTotalXp = xp;
  for (let i = 1; i < level; i++) {
    const req = getXpRequiredForLevel ? getXpRequiredForLevel(i) : (100 + 25 * i + 8 * i * i);
    calculatedTotalXp += req;
  }

  const history = activityHistory || [];

  // Dynamic growth chart data based on real user activity history
  let chartData = [];
  if (history.length === 0) {
    chartData = [
      { name: 'Start', xp: Math.max(0, calculatedTotalXp - 100) },
      { name: 'Current (Day 1)', xp: calculatedTotalXp }
    ];
  } else if (timeframe === '7d') {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toDateString();
      const label = i === 0 ? 'Today' : dayNames[d.getDay()];
      days.push({ dateKey: dateString, name: label, xpEarned: 0 });
    }

    history.forEach(act => {
      const actDate = new Date(act.created_at).toDateString();
      const match = days.find(day => day.dateKey === actDate);
      if (match) {
        match.xpEarned += act.xp_earned || 0;
      }
    });

    let runningTotalXp = calculatedTotalXp;
    for (let i = days.length - 1; i >= 0; i--) {
      days[i].xp = runningTotalXp;
      runningTotalXp = Math.max(0, runningTotalXp - days[i].xpEarned);
    }
    chartData = days;

  } else if (timeframe === '4w') {
    const weeks = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      weeks.push({ name: `Week ${4 - i}`, xpEarned: 0, index: i });
    }

    history.forEach(act => {
      const actDate = new Date(act.created_at);
      const diffDays = Math.floor((now - actDate) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < 4) {
        const match = weeks.find(w => w.index === weekIndex);
        if (match) {
          match.xpEarned += act.xp_earned || 0;
        }
      }
    });

    let runningTotalXp = calculatedTotalXp;
    for (let i = weeks.length - 1; i >= 0; i--) {
      weeks[i].xp = runningTotalXp;
      runningTotalXp = Math.max(0, runningTotalXp - weeks[i].xpEarned);
    }
    chartData = weeks.reverse();

  } else {
    const sorted = [...history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    let runningTotalXp = calculatedTotalXp - history.reduce((sum, a) => sum + (a.xp_earned || 0), 0);
    runningTotalXp = Math.max(0, runningTotalXp);

    chartData = [
      { name: 'Start', xp: runningTotalXp },
      ...sorted.map(act => {
        runningTotalXp += act.xp_earned || 0;
        const dateStr = new Date(act.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
        return {
          name: `${act.activity_type.toUpperCase()} (${dateStr})`,
          xp: runningTotalXp
        };
      })
    ];

    if (chartData.length === 1) {
      chartData.push({ name: 'Current Today', xp: calculatedTotalXp });
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Character Progress & Stats</h1>
          <p className="text-gray-400">Analyze your attribute milestones, level trajectory, and habit consistency.</p>
        </div>
        
        {/* Timeframe Filter */}
        {history.length > 0 && (
          <div className="flex items-center gap-2 bg-[#FFF2DB]/50 dark:bg-quest-darkest p-1.5 rounded-xl border border-[#FFE5BF]/60 dark:border-white/10">
            {[
              { id: '7d', label: '7 Days' },
              { id: '4w', label: '4 Weeks' },
              { id: 'all', label: 'All Time' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === t.id ? 'bg-quest-primary text-white shadow-lg shadow-quest-primary/40' : 'text-gray-500 dark:text-gray-400 hover:text-quest-primary dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top Banner - Level Progress & XP */}
      <div className="glass-card p-6 border-t-4 border-t-quest-primary relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-quest-gold" />
              <h2 className="text-2xl font-bold font-heading">Level {level} {profile?.class || 'Warrior'}</h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {history.length === 0 ? 'Welcome Adventurer! Complete daily quests to earn your first Level 2 rank.' : `Keep completing quests to reach Level ${level + 1}.`}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold font-heading text-quest-gold">{xp} / {nextLevelXp} XP</div>
            <div className="text-xs text-gray-400">{nextLevelXp - xp} XP to Level {level + 1}</div>
          </div>
        </div>

        <div className="h-4 bg-[#FFF2DB]/50 dark:bg-quest-dark rounded-full overflow-hidden border border-[#FFE5BF]/60 dark:border-white/10">
          <div 
            className="h-full bg-gradient-to-r from-quest-primary via-quest-secondary to-quest-gold transition-all duration-700 relative shadow-[0_0_15px_rgba(246,36,64,0.8)]"
            style={{ width: `${xpPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-t-2 border-t-quest-primary">
          <div className="p-4 bg-quest-primary/20 text-quest-primary rounded-xl">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Tier</div>
            <div className="text-2xl font-bold font-heading">Level {level}</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-t-2 border-t-quest-gold">
          <div className="p-4 bg-quest-gold/20 text-quest-gold rounded-xl">
            <Flame className="w-8 h-8 fill-quest-gold" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Daily Streak</div>
            <div className="text-2xl font-bold font-heading text-quest-gold">{streak} Days</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-t-2 border-t-quest-secondary">
          <div className="p-4 bg-quest-secondary/20 text-quest-secondary rounded-xl">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Lifetime XP</div>
            <div className="text-2xl font-bold font-heading">{calculatedTotalXp.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-t-2 border-t-quest-success">
          <div className="p-4 bg-quest-success/20 text-quest-success rounded-xl">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Completed Quests</div>
            <div className="text-2xl font-bold font-heading text-quest-success">{completedQuestsCount}</div>
          </div>
        </div>
      </div>

      {/* Grid: XP Growth Chart & Attribute Progress Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* XP Growth History Chart */}
        <div className="lg:col-span-2 glass-card p-6 h-[420px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-quest-primary" /> XP Growth Trajectory
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-quest-primary/20 text-quest-primary border border-quest-primary/40 uppercase">
              {history.length === 0 ? 'Day 1 Account Session' : `${timeframe.toUpperCase()} View`}
            </span>
          </div>

          <div className="flex-1 -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F62440" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F62440" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                 <XAxis dataKey="name" stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)"} tick={{fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)'}} />
                 <YAxis stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)"} tick={{fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)'}} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: isDark ? '#111827' : '#FFFAF3', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '0.5rem', color: isDark ? '#fff' : '#111' }}
                   itemStyle={{ color: '#F62440' }}
                 />
                 <Area type="monotone" dataKey="xp" stroke="#F62440" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attribute Progress Breakdown */}
        <div className="lg:col-span-1 glass-card p-6 space-y-4">
          <h2 className="text-xl font-heading font-bold border-b border-gray-200 dark:border-white/10 pb-3">Attributes Build</h2>
          
          <div className="space-y-4 max-h-[330px] overflow-y-auto pr-1">
            {Object.entries(profile?.stats || { str: 10, end: 10, spd: 10, dis: 10, con: 10, rec: 10 }).map(([key, val]) => {
              const meta = statIcons[key] || { label: key.toUpperCase(), icon: Target, color: 'text-quest-primary', bar: 'bg-quest-primary' };
              const Icon = meta.icon;
              const fillPct = Math.min((val / 50) * 100, 100);

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                      <span className="font-bold text-gray-800 dark:text-white">{meta.label}</span>
                    </div>
                    <span className="font-bold text-quest-gold">{val} / 50</span>
                  </div>

                  <div className="h-2 bg-[#FFF2DB]/50 dark:bg-quest-darkest rounded-full overflow-hidden border border-[#FFE5BF]/60 dark:border-white/10">
                    <div 
                      className={`h-full ${meta.bar} transition-all duration-500`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
