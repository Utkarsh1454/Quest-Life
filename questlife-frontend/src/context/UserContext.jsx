import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { mockUser, mockQuests } from '../data/mockData';
import { apiClient } from '../api/client';

const UserContext = createContext();

export const getXpRequiredForLevel = (level) => {
  if (level < 1) return 133;
  return 100 + 25 * level + 8 * level * level;
};

const defaultFreshQuests = [
  { id: 1, title: "Morning Run", description: "Run 5km before 9 AM", xp: 8, type: "daily", progress: 0, target: 100, status: "available", icon: "run" },
  { id: 2, title: "Strength Training", description: "Complete upper body workout", xp: 12, type: "daily", progress: 0, target: 100, status: "available", icon: "dumbbell" },
  { id: 3, title: "Hydration", description: "Drink 3L of water", xp: 5, type: "daily", progress: 0, target: 100, status: "available", icon: "water" },
  { id: 4, title: "Meditation", description: "10 mins mindfulness", xp: 5, type: "daily", progress: 0, target: 100, status: "available", icon: "brain" },
  { id: 5, title: "Marathon Prep", description: "Run total 30km", xp: 80, type: "weekly", progress: 0, target: 100, status: "available", icon: "target" },
  { id: 6, title: "Perfect Week", description: "Workout 5 days", xp: 80, type: "weekly", progress: 0, target: 100, status: "available", icon: "calendar" },
  { id: 7, title: "Titan's Challenge", description: "Lift 10,000kg total volume", xp: 250, type: "boss", progress: 0, target: 100, status: "available", icon: "sword" }
];

export const UserProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  
  const userStorageKey = authUser?.id ? `questlife_profile_${authUser.id}` : 'questlife_profile';
  const questStorageKey = authUser?.id ? `questlife_quests_${authUser.id}` : 'questlife_quests';

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(userStorageKey);
    if (saved) return JSON.parse(saved);
    if (authUser) {
      const initialLevel = authUser.stats?.level ?? 1;
      return {
        name: authUser.display_name || authUser.username || 'Hero Adventurer',
        class: authUser.character_class ? (authUser.character_class.charAt(0).toUpperCase() + authUser.character_class.slice(1)) : 'Warrior',
        title: authUser.character_class ? `${authUser.character_class.toUpperCase()} ADVENTURER` : 'WARRIOR ADVENTURER',
        level: initialLevel,
        xp: authUser.stats?.total_xp ?? authUser.stats?.current_xp ?? 0,
        nextLevelXp: getXpRequiredForLevel(initialLevel),
        streak: authUser.streak?.current_streak ?? 0,
        equippedAvatar: 'a1',
        equippedAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        equippedTitle: 'WARRIOR ADVENTURER',
        equippedFrame: 'gold',
        unlockedAvatars: ['a1', 'a2'],
        unlockedTitles: ['ADVENTURER'],
        email: authUser.email || '',
        username: authUser.username || '',
        stats: {
          str: authUser.stats?.strength ?? 10,
          end: authUser.stats?.endurance ?? 10,
          spd: authUser.stats?.speed ?? 10,
          dis: authUser.stats?.discipline ?? 10,
          con: authUser.stats?.consistency ?? 10,
          rec: authUser.stats?.recovery ?? 10,
        }
      };
    }
    return {
      ...mockUser,
      nextLevelXp: getXpRequiredForLevel(mockUser.level || 1),
      equippedAvatar: 'a1',
      equippedAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      equippedTitle: 'WARRIOR ADVENTURER',
      equippedFrame: 'gold',
      unlockedAvatars: ['a1', 'a2'],
      unlockedTitles: ['ADVENTURER']
    };
  });
  
  const [quests, setQuests] = useState(() => {
    const saved = localStorage.getItem(questStorageKey);
    if (saved) return JSON.parse(saved);
    return authUser ? defaultFreshQuests : mockQuests;
  });

  const [toasts, setToasts] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [activityHistory, setActivityHistory] = useState(() => {
    const saved = localStorage.getItem('questlife_activities_history');
    return saved ? JSON.parse(saved) : [];
  });

  const showToast = useCallback((message, type = 'success', xp = 0) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { message, type, xp, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const applyXpResult = useCallback((result, reason) => {
    if (!result) return;
    setProfile(prev => {
      const currentLevel = prev?.level || 1;
      const newLevel = Math.max(currentLevel, result.new_level || 1);
      const currentXp = prev?.xp || 0;
      const newXp = result.new_total_xp !== undefined ? Math.max(currentXp, result.new_total_xp) : currentXp;

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: getXpRequiredForLevel(newLevel),
        stats: result.stats_after ? {
          str: Math.max(result.stats_after.strength ?? 10, prev?.stats?.str ?? 10),
          end: Math.max(result.stats_after.endurance ?? 10, prev?.stats?.end ?? 10),
          spd: Math.max(result.stats_after.speed ?? 10, prev?.stats?.spd ?? 10),
          dis: Math.max(result.stats_after.discipline ?? 10, prev?.stats?.dis ?? 10),
          con: Math.max(result.stats_after.consistency ?? 10, prev?.stats?.con ?? 10),
          rec: Math.max(result.stats_after.recovery ?? 10, prev?.stats?.rec ?? 10),
        } : prev?.stats
      };
    });

    if (result.level_up) {
      showToast(`LEVEL UP! Reached Level ${newLevel}! 🎉`, 'level-up', result.xp_earned);
    } else if (result.xp_earned > 0) {
      showToast(`${reason} (+${result.xp_earned} XP)`, 'xp', result.xp_earned);
    } else {
      showToast(`${reason}`, 'info');
    }
  }, [showToast]);

  const fetchTodayMeals = useCallback(async () => {
    if (!authUser) {
      const saved = localStorage.getItem('questlife_today_meals');
      if (saved) {
        setTodayMeals(JSON.parse(saved));
      } else {
        setTodayMeals([]);
      }
      return;
    }

    try {
      const data = await apiClient('/activities/today');
      const mealActivities = (data.activities || []).filter(act => act.activity_type === 'meal');
      const mapped = mealActivities.map(act => {
        const meta = act.metadata || {};
        const time = new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const title = meta.food_items && meta.food_items.length > 0 
          ? meta.food_items.join(', ') 
          : 'Logged Meal';
          
        return {
          id: act.id,
          title: title,
          calories: meta.calories || 0,
          protein: meta.protein_g || 0,
          carbs: meta.carbs_g || 0,
          fat: meta.fat_g || 0,
          fiber: meta.fiber || 0,
          time: time
        };
      });
      setTodayMeals(mapped);
      localStorage.setItem('questlife_today_meals', JSON.stringify(mapped));
    } catch (err) {
      console.warn('Failed to fetch today meals from API, using local storage fallback:', err);
      const saved = localStorage.getItem('questlife_today_meals');
      if (saved) {
        setTodayMeals(JSON.parse(saved));
      }
    }
  }, [authUser]);

  const fetchActivityHistory = useCallback(async () => {
    if (!authUser) {
      const saved = localStorage.getItem('questlife_activities_history');
      if (saved) {
        setActivityHistory(JSON.parse(saved));
      } else {
        setActivityHistory([]);
      }
      return;
    }

    try {
      const data = await apiClient('/activities/history?limit=50');
      setActivityHistory(data || []);
      localStorage.setItem('questlife_activities_history', JSON.stringify(data || []));
    } catch (err) {
      console.warn('Failed to fetch activity history from API, using local storage fallback:', err);
      const saved = localStorage.getItem('questlife_activities_history');
      if (saved) {
        setActivityHistory(JSON.parse(saved));
      }
    }
  }, [authUser]);

  const logLocalActivity = useCallback((type, xp, metadata = {}) => {
    const saved = localStorage.getItem('questlife_activities_history');
    const history = saved ? JSON.parse(saved) : [];
    const newAct = {
      id: Date.now(),
      activity_type: type,
      xp_earned: xp,
      created_at: new Date().toISOString(),
      metadata
    };
    const updated = [newAct, ...history].slice(0, 100);
    setActivityHistory(updated);
    localStorage.setItem('questlife_activities_history', JSON.stringify(updated));
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('questlife_theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  useEffect(() => {
    if (authUser) {
      const key = `questlife_profile_${authUser.id}`;
      const questKey = `questlife_quests_${authUser.id}`;
      
      const savedProf = localStorage.getItem(key);
      const savedQ = localStorage.getItem(questKey);

      if (savedProf) {
        const parsed = JSON.parse(savedProf);
        if (authUser.stats) {
          const maxLevel = Math.max(parsed.level || 1, authUser.stats.level || 1);
          const maxTotalXp = Math.max(parsed.xp || 0, authUser.stats.total_xp || 0, authUser.stats.current_xp || 0);
          
          parsed.level = maxLevel;
          parsed.xp = maxTotalXp;
          parsed.nextLevelXp = getXpRequiredForLevel(maxLevel);

          if (authUser.stats.strength !== undefined) {
            parsed.stats = {
              str: Math.max(parsed.stats?.str || 10, authUser.stats.strength || 10),
              end: Math.max(parsed.stats?.end || 10, authUser.stats.endurance || 10),
              spd: Math.max(parsed.stats?.spd || 10, authUser.stats.speed || 10),
              dis: Math.max(parsed.stats?.dis || 10, authUser.stats.discipline || 10),
              con: Math.max(parsed.stats?.con || 10, authUser.stats.consistency || 10),
              rec: Math.max(parsed.stats?.rec || 10, authUser.stats.recovery || 10),
            };
          }
        }
        if (authUser.streak) {
          parsed.streak = Math.max(parsed.streak || 0, authUser.streak.current_streak || 0);
        }
        setProfile(parsed);
      } else {
        const initialLevel = authUser.stats?.level ?? 1;
        const freshProfile = {
          name: authUser.display_name || authUser.username || 'Hero Adventurer',
          class: authUser.character_class ? (authUser.character_class.charAt(0).toUpperCase() + authUser.character_class.slice(1)) : 'Warrior',
          title: authUser.character_class ? `${authUser.character_class.toUpperCase()} ADVENTURER` : 'WARRIOR ADVENTURER',
          level: initialLevel,
          xp: authUser.stats?.total_xp ?? authUser.stats?.current_xp ?? 0,
          nextLevelXp: getXpRequiredForLevel(initialLevel),
          streak: authUser.streak?.current_streak ?? 0,
          equippedAvatar: 'a1',
          equippedAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
          equippedTitle: 'WARRIOR ADVENTURER',
          equippedFrame: 'gold',
          unlockedAvatars: ['a1', 'a2'],
          unlockedTitles: ['ADVENTURER'],
          email: authUser.email || '',
          username: authUser.username || '',
          stats: {
            str: authUser.stats?.strength ?? 10,
            end: authUser.stats?.endurance ?? 10,
            spd: authUser.stats?.speed ?? 10,
            dis: authUser.stats?.discipline ?? 10,
            con: authUser.stats?.consistency ?? 10,
            rec: authUser.stats?.recovery ?? 10,
          }
        };
        setProfile(freshProfile);
        localStorage.setItem(key, JSON.stringify(freshProfile));
      }

      if (savedQ) {
        setQuests(JSON.parse(savedQ));
      } else {
        setQuests(defaultFreshQuests);
        localStorage.setItem(questKey, JSON.stringify(defaultFreshQuests));
      }
      
      fetchTodayMeals();
      fetchActivityHistory();
    }
  }, [authUser, fetchTodayMeals, fetchActivityHistory]);

  useEffect(() => {
    if (profile && authUser?.id) {
      localStorage.setItem(`questlife_profile_${authUser.id}`, JSON.stringify(profile));
    }
  }, [profile, authUser]);

  useEffect(() => {
    if (quests && authUser?.id) {
      localStorage.setItem(`questlife_quests_${authUser.id}`, JSON.stringify(quests));
    }
  }, [quests, authUser]);

  const addXP = useCallback((amount, reason = 'Action completed') => {
    setProfile(prev => {
      if (!prev) return prev;
      let newXP = (prev.xp || 0) + amount;
      let newLevel = prev.level || 1;
      let newNextLevelXP = getXpRequiredForLevel(newLevel);
      let levelUp = false;
      let levelGainBonus = 0;

      while (newXP >= newNextLevelXP) {
        newXP -= newNextLevelXP;
        newLevel += 1;
        newNextLevelXP = getXpRequiredForLevel(newLevel);
        levelUp = true;
        levelGainBonus += 3;
      }

      const curStats = prev.stats || { str: 10, end: 10, spd: 10, dis: 10, con: 10, rec: 10 };
      const updatedStats = {
        str: curStats.str + (levelUp ? Math.ceil(levelGainBonus / 3) : 1),
        end: curStats.end + (levelUp ? Math.ceil(levelGainBonus / 3) : 1),
        spd: curStats.spd + (levelUp ? Math.ceil(levelGainBonus / 3) : 1),
        dis: curStats.dis + (levelUp ? 1 : 0),
        con: curStats.con + (levelUp ? 1 : 0),
        rec: curStats.rec + (levelUp ? 1 : 0),
      };

      if (levelUp) {
        showToast(`LEVEL UP! Reached Level ${newLevel}! 🎉`, 'level-up', amount);
      } else {
        showToast(`${reason} (+${amount} XP)`, 'xp', amount);
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXP,
        nextLevelXp: newNextLevelXP,
        stats: updatedStats
      };
    });
  }, [showToast]);

  const equipAvatar = useCallback((avatarItem) => {
    setProfile(prev => ({
      ...prev,
      equippedAvatar: avatarItem.id,
      equippedAvatarUrl: avatarItem.url || prev?.equippedAvatarUrl
    }));
    showToast(`Equipped ${avatarItem.name}!`, 'success');
  }, [showToast]);

  const equipTitle = useCallback((titleString) => {
    setProfile(prev => ({
      ...prev,
      equippedTitle: titleString
    }));
    showToast(`Equipped Title: "${titleString}"!`, 'success');
  }, [showToast]);

  const claimQuest = useCallback(async (questId) => {
    const targetQuest = (quests || []).find(q => q.id === questId);
    const rewardXp = targetQuest?.xp || 10;

    if (!authUser) {
      addXP(rewardXp, 'Quest claimed');
      setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: 'claimed', progress: 100 } : q));
      return;
    }

    try {
      const result = await apiClient(`/quests/${questId}/claim`, { method: 'POST' });
      applyXpResult(result, 'Quest claimed');
      setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: 'claimed', progress: 100 } : q));
    } catch (err) {
      console.warn('Failed to claim quest via backend API, claiming locally:', err);
      addXP(rewardXp, 'Quest claimed');
      setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: 'claimed', progress: 100 } : q));
    }
  }, [authUser, quests, applyXpResult, addXP]);

  const fetchUserQuests = useCallback(async () => {
    if (!authUser) return;
    const questKey = `questlife_quests_${authUser.id}`;
    try {
      const [dailyData, weeklyData] = await Promise.all([
        apiClient('/quests/daily'),
        apiClient('/quests/weekly')
      ]);
      const allApiQuests = [...(dailyData || []), ...(weeklyData || [])];
      if (allApiQuests.length > 0) {
        const savedQStr = localStorage.getItem(questKey);
        const savedQList = savedQStr ? JSON.parse(savedQStr) : [];

        const mapped = allApiQuests.map(uq => {
          const matchingLocal = savedQList.find(lq => lq.id === uq.id || lq.quest_id === uq.quest.id || lq.title === uq.quest.title);
          let finalStatus = uq.status;
          let finalProgress = uq.status === 'claimed' ? 100 : Math.round((uq.progress / (uq.quest.target_value || 100)) * 100);

          if (matchingLocal) {
            if (matchingLocal.status === 'claimed') {
              finalStatus = 'claimed';
              finalProgress = 100;
            } else if (matchingLocal.status === 'completed') {
              if (finalStatus !== 'claimed') {
                finalStatus = 'completed';
                finalProgress = Math.max(finalProgress, matchingLocal.progress || 100);
              }
            } else {
              finalProgress = Math.max(finalProgress, matchingLocal.progress || 0);
              if (finalProgress >= 100 && finalStatus === 'active') {
                finalStatus = 'completed';
              }
            }
          }

          return {
            id: uq.id,
            quest_id: uq.quest.id,
            title: uq.quest.title,
            description: uq.quest.description,
            xp: uq.quest.xp_reward,
            type: uq.quest.quest_type,
            progress: finalProgress,
            target: 100,
            status: finalStatus,
            icon: uq.quest.stat_affinity === 'speed' ? 'run' : uq.quest.stat_affinity === 'strength' ? 'dumbbell' : uq.quest.stat_affinity === 'recovery' ? 'water' : uq.quest.stat_affinity === 'discipline' ? 'brain' : uq.quest.quest_type === 'boss' ? 'sword' : uq.quest.quest_type === 'weekly' ? 'calendar' : 'target'
          };
        });

        setQuests(mapped);
        localStorage.setItem(questKey, JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn('Failed to fetch quests from backend:', err);
    }
  }, [authUser]);

  const logWorkout = useCallback(async (workoutName = 'Workout', workoutDetails = {}) => {
    // Advance matching quest progress
    setQuests(prev => prev.map(q => {
      if (q.status === 'claimed') return q;
      if (q.icon === 'dumbbell' || q.icon === 'run' || q.type === 'daily' || q.title.toLowerCase().includes('workout') || q.title.toLowerCase().includes('run')) {
        const newProgress = Math.min(100, (q.progress || 0) + 50);
        return {
          ...q,
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : 'available'
        };
      }
      if (q.type === 'weekly' || q.type === 'boss') {
        const newProgress = Math.min(100, (q.progress || 0) + 25);
        return {
          ...q,
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : 'available'
        };
      }
      return q;
    }));

    if (authUser) {
      try {
        const payload = {
          activity_type: 'workout',
          workout: {
            exercise_name: workoutName,
            sets: workoutDetails.sets || 3,
            reps: workoutDetails.reps || 8,
            weight_kg: workoutDetails.weight_kg || 50,
            duration_minutes: workoutDetails.duration_minutes || 45,
            notes: workoutDetails.notes || 'Completed session'
          }
        };
        const result = await apiClient('/activities/log', {
          body: payload,
          method: 'POST'
        });
        applyXpResult(result, `Completed ${workoutName}`);
        fetchActivityHistory();
      } catch (err) {
        console.warn('Failed to persist logged workout to backend:', err);
        logLocalActivity('workout', 35, { workoutName });
        addXP(35, `Completed ${workoutName}`);
      }
    } else {
      logLocalActivity('workout', 35, { workoutName });
      addXP(35, `Completed ${workoutName}`);
    }
  }, [authUser, applyXpResult, fetchActivityHistory, logLocalActivity, addXP]);

  const logMeal = useCallback(async (mealName = 'Meal', macros = null) => {
    const newMeal = {
      id: Date.now(),
      title: mealName,
      calories: Number(macros?.calories || 250),
      protein: Number(macros?.protein || 20),
      carbs: Number(macros?.carbs || 30),
      fat: Number(macros?.fat || 10),
      fiber: Number(macros?.fiber || 0),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setTodayMeals(prev => {
      const updated = [newMeal, ...prev];
      localStorage.setItem('questlife_today_meals', JSON.stringify(updated));
      return updated;
    });

    // Advance nutrition & daily quest progress
    setQuests(prev => prev.map(q => {
      if (q.status === 'claimed') return q;
      if (q.icon === 'water' || q.icon === 'brain' || q.title.toLowerCase().includes('hydration') || q.title.toLowerCase().includes('meal') || q.title.toLowerCase().includes('meditation')) {
        const newProgress = Math.min(100, (q.progress || 0) + 50);
        return {
          ...q,
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : 'available'
        };
      }
      return q;
    }));

    if (authUser) {
      try {
        const payload = {
          activity_type: 'meal',
          meal: {
            meal_type: 'lunch',
            calories: Number(macros?.calories || 250),
            protein_g: Number(macros?.protein || 20),
            carbs_g: Number(macros?.carbs || 30),
            fat_g: Number(macros?.fat || 10),
            food_items: [mealName],
            is_healthy: true
          }
        };
        const result = await apiClient('/activities/log', {
          body: payload,
          method: 'POST'
        });
        applyXpResult(result, `Logged ${mealName}`);
        fetchActivityHistory();
      } catch (err) {
        console.warn('Failed to persist logged meal to backend database:', err);
        logLocalActivity('meal', 10, { mealName, ...macros });
        addXP(10, `Logged ${mealName}`);
      }
    } else {
      logLocalActivity('meal', 10, { mealName, ...macros });
      addXP(10, `Logged ${mealName}`);
    }
  }, [authUser, applyXpResult, fetchActivityHistory, logLocalActivity, addXP]);

  const deleteMeal = useCallback(async (mealId) => {
    setTodayMeals(prev => {
      const updated = prev.filter(m => m.id !== mealId);
      localStorage.setItem('questlife_today_meals', JSON.stringify(updated));
      return updated;
    });

    if (authUser) {
      try {
        await apiClient(`/activities/${mealId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Failed to delete activity from backend:', err);
      }
    }
  }, [authUser]);

  const updatePreferences = useCallback((newPrefs) => {
    setProfile(prev => ({
      ...prev,
      ...newPrefs
    }));
    showToast('Preferences updated & saved!', 'success');
  }, [showToast]);

  const refreshQuests = useCallback(async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const questKey = authUser?.id ? `questlife_quests_${authUser.id}` : 'questlife_quests';
    
    if (authUser) {
      try {
        await apiClient('/quests/refresh', { method: 'POST' });
        await fetchUserQuests();
      } catch (err) {
        console.warn('Failed to re-sync quests from backend:', err);
      }
    } else {
      setQuests(prev => {
        const currentList = prev && prev.length > 0 ? prev : defaultFreshQuests;
        localStorage.setItem(questKey, JSON.stringify(currentList));
        return currentList;
      });
    }
    
    localStorage.setItem('questlife_last_daily_reset', todayStr);
    showToast('Quests synchronized! ⚡', 'success');
  }, [authUser, fetchUserQuests, showToast]);

  const resetQuestProgress = useCallback(() => {
    setQuests(prev => {
      const reset = prev.map(q => ({
        ...q,
        progress: 0,
        status: 'available'
      }));
      const questKey = authUser?.id ? `questlife_quests_${authUser.id}` : 'questlife_quests';
      localStorage.setItem(questKey, JSON.stringify(reset));
      return reset;
    });
    showToast('Quest progress reset to 0%', 'info');
  }, [authUser, showToast]);

  const clearAccountData = useCallback(async () => {
    if (authUser) {
      try {
        await apiClient('/users/me/reset', { method: 'POST' });
      } catch (err) {
        console.warn('Failed to reset backend account data:', err);
      }
    }

    if (authUser?.id) {
      localStorage.removeItem(`questlife_profile_${authUser.id}`);
      localStorage.removeItem(`questlife_quests_${authUser.id}`);
    }
    localStorage.removeItem('questlife_profile');
    localStorage.removeItem('questlife_quests');
    localStorage.removeItem('questlife_today_meals');
    localStorage.removeItem('questlife_activities_history');
    localStorage.removeItem('questlife_last_daily_reset');

    const freshProfile = {
      name: authUser?.display_name || authUser?.username || 'Hero Adventurer',
      class: authUser?.character_class ? (authUser.character_class.charAt(0).toUpperCase() + authUser.character_class.slice(1)) : 'Warrior',
      title: 'WARRIOR ADVENTURER',
      level: 1,
      xp: 0,
      nextLevelXp: 133,
      streak: 0,
      equippedAvatar: 'a1',
      equippedAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      equippedTitle: 'WARRIOR ADVENTURER',
      equippedFrame: 'gold',
      unlockedAvatars: ['a1', 'a2'],
      unlockedTitles: ['ADVENTURER'],
      stats: { str: 10, end: 10, spd: 10, dis: 10, con: 10, rec: 10 }
    };
    setProfile(freshProfile);
    setQuests(defaultFreshQuests);
    setTodayMeals([]);
    setActivityHistory([]);

    showToast('Account processes, activity history & quests cleared successfully!', 'level-up');
  }, [authUser, showToast]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem('questlife_last_daily_reset');
    if (!lastReset || lastReset !== todayStr) {
      refreshQuests();
    } else if (authUser) {
      fetchUserQuests();
    }
  }, [authUser, refreshQuests, fetchUserQuests]);

  return (
    <UserContext.Provider value={{
      profile,
      stats: profile?.stats || mockUser.stats,
      quests,
      toast: toasts[0] ?? null,
      toasts,
      showToast,
      addXP,
      applyXpResult,
      equipAvatar,
      equipTitle,
      claimQuest,
      logWorkout,
      logMeal,
      deleteMeal,
      updatePreferences,
      refreshQuests,
      resetQuestProgress,
      clearAccountData,
      todayMeals,
      fetchTodayMeals,
      activityHistory,
      fetchActivityHistory,
      refreshData: () => {}
    }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 pointer-events-none">
          {toasts.map((t, i) => (
            <div key={t.id} className="animate-bounce pointer-events-auto">
              <div className={`glass-card p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
                t.type === 'level-up'
                  ? 'border-quest-gold bg-quest-gold/20 text-quest-gold shadow-[0_0_20px_rgba(255,242,219,0.5)]'
                  : t.type === 'xp'
                  ? 'border-quest-primary bg-quest-primary/20 text-white shadow-[0_0_20px_rgba(246,36,64,0.5)]'
                  : 'border-quest-success bg-quest-success/20 text-quest-success'
              }`}>
                <span className="text-xl">
                  {t.type === 'level-up' ? '👑' : t.type === 'xp' ? '⚡' : '✅'}
                </span>
                <div>
                  <div className="font-bold font-heading">{t.message}</div>
                  {t.xp > 0 && <div className="text-xs font-bold text-quest-gold">+{t.xp} XP Earned</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
