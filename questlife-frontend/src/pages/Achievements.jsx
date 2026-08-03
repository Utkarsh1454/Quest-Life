import { Award, Zap, Target, Star, Lock, Check, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

const INITIAL_ACHIEVEMENTS = [
  { id: 1, title: 'First Blood',        description: 'Complete your first quest',            icon: Zap,    category: 'Quests',    total: 1,  xp: 100 },
  { id: 2, title: 'Streak Master',      description: 'Maintain a 3-day workout streak',      icon: Star,   category: 'Streaks',   total: 3,  xp: 250 },
  { id: 3, title: 'Iron Pumping',       description: 'Reach Level 5 Adventurer',             icon: Target, category: 'Workouts',  total: 5,  xp: 500 },
  { id: 4, title: 'Nutritionist',       description: 'Log meals & macros in the Feast Hall', icon: Award,  category: 'Nutrition', total: 3,  xp: 300 },
  { id: 5, title: 'Master of Strength', description: 'Level up Strength (STR) stat to 15',  icon: Target, category: 'Stats',     total: 15, xp: 600 },
];

export default function Achievements() {
  const [filter, setFilter] = useState('All');
  const [claiming, setClaiming] = useState({});
  const { profile, quests, showToast, logWorkout } = useUser();
  const { user: authUser } = useAuth();

  const categories = ['All', 'Quests', 'Streaks', 'Workouts', 'Nutrition', 'Stats'];

  // Persist claimed state per-user in localStorage
  const claimedStorageKey = authUser?.id ? `questlife_achievements_claimed_${authUser.id}` : 'questlife_achievements_claimed';
  const [claimedIds, setClaimedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(claimedStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const completedQuestsCount = (quests || []).filter(q => q.status === 'claimed' || q.progress === 100).length;
  const userStreak = profile?.streak || 0;
  const userLevel  = profile?.level  || 1;
  const userStr    = profile?.stats?.str || 10;

  const achievementsWithProgress = INITIAL_ACHIEVEMENTS.map(ach => {
    let currentProgress = 0;
    if      (ach.id === 1) currentProgress = completedQuestsCount > 0 ? 1 : 0;
    else if (ach.id === 2) currentProgress = userStreak;
    else if (ach.id === 3) currentProgress = userLevel;
    else if (ach.id === 4) currentProgress = Math.min(completedQuestsCount + 1, 3);
    else if (ach.id === 5) currentProgress = userStr;

    const isUnlocked = currentProgress >= ach.total;
    const isClaimed  = !!claimedIds[ach.id];

    return { ...ach, progress: Math.min(currentProgress, ach.total), unlocked: isUnlocked, claimed: isClaimed };
  });

  const handleClaimReward = useCallback(async (ach) => {
    if (claiming[ach.id]) return;
    setClaiming(prev => ({ ...prev, [ach.id]: true }));

    try {
      const token = localStorage.getItem('questlife_token');
      if (authUser && token && token !== 'mock-token') {
        // Log as a special achievement activity so XP is backend-calculated
        await apiClient('/activities/log', {
          method: 'POST',
          body: {
            activity_type: 'achievement',
            workout: {
              exercise_name: `Achievement: ${ach.title}`,
              sets: 1,
              reps: 1,
              weight_kg: 0,
              duration_minutes: 0,
              notes: ach.description
            }
          }
        });
      }

      // Mark claimed locally (persisted per-user)
      setClaimedIds(prev => {
        const updated = { ...prev, [ach.id]: true };
        localStorage.setItem(claimedStorageKey, JSON.stringify(updated));
        return updated;
      });

      showToast(`Achievement Unlocked: ${ach.title}! +${ach.xp} XP`, 'level-up', ach.xp);
    } catch (err) {
      console.warn('Achievement claim error:', err);
      // Still mark locally claimed even if API fails
      setClaimedIds(prev => {
        const updated = { ...prev, [ach.id]: true };
        localStorage.setItem(claimedStorageKey, JSON.stringify(updated));
        return updated;
      });
      showToast(`${ach.title} unlocked! +${ach.xp} XP`, 'level-up', ach.xp);
    } finally {
      setClaiming(prev => ({ ...prev, [ach.id]: false }));
    }
  }, [authUser, claiming, claimedStorageKey, showToast]);

  const filteredAchievements = filter === 'All'
    ? achievementsWithProgress
    : achievementsWithProgress.filter(a => a.category === filter);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight">Achievements & Trophies</h1>
          <p className="text-gray-400">Unlock badges and claim bonus XP for your milestones.</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === cat ? 'bg-quest-primary text-white shadow-[0_0_10px_rgba(246,36,64,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.map(ach => (
          <div key={ach.id} className={`glass-card p-6 relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${ach.unlocked ? 'border-quest-gold shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'opacity-70 grayscale-[30%]'}`}>
            {ach.unlocked && <div className="absolute -right-10 -top-10 w-32 h-32 bg-quest-gold/20 blur-3xl rounded-full pointer-events-none"></div>}

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl inline-flex ${ach.unlocked ? 'bg-quest-gold/20 text-quest-gold' : 'bg-white/10 text-gray-500'}`}>
                {ach.unlocked ? <ach.icon className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded text-xs font-bold text-quest-gold backdrop-blur-sm">
                <Star className="w-3 h-3 fill-quest-gold" /> +{ach.xp} XP
              </div>
            </div>

            <div className="relative z-10 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg mb-1">{ach.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{ach.description}</p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-gray-400">Progress</span>
                  <span className={ach.unlocked ? 'text-quest-gold' : 'text-gray-300'}>{ach.progress} / {ach.total}</span>
                </div>
                <div className="h-2.5 bg-[#FFE5BF]/40 dark:bg-quest-dark rounded-full overflow-hidden border border-[#FFE5BF]/60 dark:border-white/10">
                  <div
                    className={`h-full transition-all duration-500 ${ach.unlocked ? 'bg-quest-gold shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-quest-secondary'}`}
                    style={{ width: `${(ach.progress / ach.total) * 100}%` }}
                  />
                </div>

                {ach.claimed ? (
                  <div className="mt-4 w-full py-2 bg-quest-success/10 text-quest-success border border-quest-success/30 rounded-lg text-center font-bold text-xs flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Reward Claimed
                  </div>
                ) : ach.unlocked ? (
                  <button
                    onClick={() => handleClaimReward(ach)}
                    disabled={!!claiming[ach.id]}
                    className="mt-4 w-full py-2 bg-quest-gold hover:bg-quest-gold/80 text-black font-bold rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(250,204,21,0.4)] flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    {claiming[ach.id] ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Claiming…</>
                    ) : (
                      <>Claim Reward (+{ach.xp} XP)</>
                    )}
                  </button>
                ) : (
                  <div className="mt-4 text-center text-xs text-gray-500 font-medium">In Progress</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
