import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Flame, Shield, Swords, Zap, Brain, Target, Heart, Check, Plus } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const statIcons = {
  str: { icon: Swords, color: 'text-quest-str', bg: 'bg-quest-str' },
  end: { icon: Heart, color: 'text-quest-end', bg: 'bg-quest-end' },
  spd: { icon: Zap, color: 'text-quest-spd', bg: 'bg-quest-spd' },
  dis: { icon: Brain, color: 'text-quest-dis', bg: 'bg-quest-dis' },
  con: { icon: Shield, color: 'text-quest-con', bg: 'bg-quest-con' },
  rec: { icon: Target, color: 'text-quest-rec', bg: 'bg-quest-rec' }
};

export default function Dashboard() {
  const { profile, quests, claimQuest, logWorkout, logMeal, showToast } = useUser();
  const [acceptedAiQuest, setAcceptedAiQuest] = useState(false);

  const user = profile || { name: 'Player One', level: 1, class: 'Warrior', xp: 0, nextLevelXp: 133, streak: 1, stats: { str: 10, end: 10, spd: 10, dis: 10, con: 10, rec: 10 } };
  
  const radarData = Object.entries(user.stats).map(([key, value]) => ({
    subject: key.toUpperCase(),
    A: value,
    fullMark: 50,
  }));

  const xpPercentage = Math.min((user.xp / user.nextLevelXp) * 100, 100);
  const dailyQuests = quests.filter(q => q.type === 'daily');

  const handleAcceptAiQuest = () => {
    setAcceptedAiQuest(true);
    showToast('AI Quest Accepted: 20-Min Endurance Cardio! Complete cardio workout to claim.', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in text-gray-900 dark:text-white">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight">Welcome back, {user.name}</h1>
          <p className="text-gray-400">Class: <span className="text-quest-gold font-semibold">{user.class}</span> · Level Up. Live Better.</p>
        </div>
        
        <div className="glass-card p-4 flex items-center gap-6">
          <div className="flex flex-col items-center">
            <Flame className="w-8 h-8 text-quest-gold animate-pulse" />
            <span className="font-bold text-quest-gold">{user.streak} Day</span>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between mb-2">
              <span className="font-heading font-semibold text-quest-primary">Level {user.level}</span>
              <span className="text-sm text-gray-400">{user.xp} / {user.nextLevelXp} XP</span>
            </div>
            <div className="h-3 bg-[#FFE5BF]/40 dark:bg-quest-dark rounded-full overflow-hidden border border-[#FFE5BF]/60 dark:border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-quest-primary to-quest-secondary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(246,36,64,0.8)] relative"
                style={{ width: `${xpPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Logging Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={() => logWorkout('Quick Strength Session')}
          className="glass-card p-4 hover:border-quest-primary transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-quest-primary/20 text-quest-primary group-hover:scale-110 transition-transform">
              <Swords className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-bold">Log Workout</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">STR / END Session</div>
            </div>
          </div>
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-quest-primary" />
        </button>

        <button 
          onClick={() => logMeal('Healthy Protein Meal')}
          className="glass-card p-4 hover:border-quest-success transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-quest-success/20 text-quest-success group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-bold">Log Healthy Meal</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">DIS / REC Nutrition</div>
            </div>
          </div>
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-quest-success" />
        </button>

        <button 
          onClick={() => logWorkout('10k Steps Walk')}
          className="glass-card p-4 hover:border-quest-gold transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-quest-gold/20 text-quest-gold group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-bold">Log 10k Steps</div>
              <div className="text-xs text-gray-400">SPD / END Activity</div>
            </div>
          </div>
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-quest-gold" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats Radar & Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 h-[350px] flex flex-col">
            <h2 className="text-xl font-heading font-bold mb-4">Attribute Chart</h2>
            <div className="flex-1 -ml-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(128,128,128,0.25)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 50]} tick={false} axisLine={false} />
                  <Radar name="Stats" dataKey="A" stroke="#F62440" fill="#F62440" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(user.stats).map(([key, value]) => {
              const info = statIcons[key] || { icon: Target, color: 'text-quest-primary' };
              const Icon = info.icon;
              return (
                <div key={key} className="glass-card p-4 glass-card-hover flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${info.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{key}</div>
                    <div className="font-heading font-bold text-lg">{value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center - Quests */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-heading font-bold">Today's Quests</h2>
          </div>
          <div className="space-y-4">
            {dailyQuests.map(quest => (
              <div key={quest.id} className="glass-card p-5 glass-card-hover border-l-4 border-quest-primary">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-lg">{quest.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{quest.description}</p>
                  </div>
                  <span className="bg-quest-gold/20 text-quest-gold text-xs px-2 py-1 rounded border border-quest-gold/30 font-bold">
                    +{quest.xp} XP
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span>{quest.status === 'claimed' ? '100%' : `${quest.progress}%`}</span>
                  </div>
                  <div className="h-2 bg-[#FFE5BF]/40 dark:bg-quest-dark rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        quest.status === 'claimed' ? 'bg-quest-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-quest-secondary'
                      }`}
                      style={{ width: `${quest.status === 'claimed' ? 100 : quest.progress}%` }}
                    />
                  </div>
                </div>
                
                {quest.status === 'claimed' ? (
                  <div className="mt-4 py-2 bg-quest-success/10 text-quest-success text-center rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Reward Claimed
                  </div>
                ) : (
                  <button 
                    onClick={() => claimQuest(quest.id)}
                    className="w-full mt-4 bg-quest-primary hover:bg-quest-primary/80 text-white py-2 rounded-lg font-medium transition-all shadow-[0_0_10px_rgba(246,36,64,0.4)] cursor-pointer"
                  >
                    Claim Reward (+{quest.xp} XP)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right - Feed & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-quest-primary/20 to-transparent border-quest-primary/30">
            <h2 className="font-heading font-bold text-lg mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-quest-primary" /> 
              AI Quest Suggestion
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Your END stat is falling behind. Try a 20-minute cardio session to balance your build.</p>
            {acceptedAiQuest ? (
              <div className="w-full bg-quest-success/20 text-quest-success border border-quest-success/40 py-2.5 rounded-lg text-center font-medium text-sm flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Quest Active
              </div>
            ) : (
              <button 
                onClick={handleAcceptAiQuest}
                className="w-full bg-quest-primary hover:bg-quest-primary/80 text-white py-2 rounded-lg font-medium transition-colors shadow-lg shadow-quest-primary/30 cursor-pointer"
              >
                Accept Quest
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
