export const mockUser = {
  name: "Player One",
  level: 5,
  class: "Warrior",
  xp: 150,
  nextLevelXp: 425,
  streak: 7,
  stats: {
    str: 25,
    end: 22,
    spd: 15,
    dis: 18,
    con: 20,
    rec: 17
  }
};

export const mockQuests = [
  { id: 1, title: "Morning Run", description: "Run 5km before 9 AM", xp: 8, type: "daily", progress: 100, target: 100, status: "complete", icon: "run" },
  { id: 2, title: "Strength Training", description: "Complete upper body workout", xp: 12, type: "daily", progress: 60, target: 100, status: "in-progress", icon: "dumbbell" },
  { id: 3, title: "Hydration", description: "Drink 3L of water", xp: 5, type: "daily", progress: 30, target: 100, status: "in-progress", icon: "water" },
  { id: 4, title: "Meditation", description: "10 mins mindfulness", xp: 5, type: "daily", progress: 0, target: 100, status: "not-started", icon: "brain" },
  { id: 5, title: "Marathon Prep", description: "Run total 30km", xp: 80, type: "weekly", progress: 60, target: 100, status: "in-progress", icon: "target" },
  { id: 6, title: "Perfect Week", description: "Workout 5 days", xp: 80, type: "weekly", progress: 80, target: 100, status: "in-progress", icon: "calendar" },
  { id: 7, title: "Titan's Challenge", description: "Lift 10,000kg total volume", xp: 250, type: "boss", progress: 60, target: 100, status: "in-progress", icon: "sword" }
];

export const mockActivities = [
  { id: 1, action: "Completed Morning Run", xp: "+8 XP", time: "2 hours ago", type: "quest" },
  { id: 2, action: "Leveled up Strength", xp: "+1 STR", time: "Yesterday", type: "stat" },
  { id: 3, action: "Claimed Daily Reward", xp: "+2 XP", time: "Yesterday", type: "reward" },
  { id: 4, action: "Completed 10k Steps", xp: "+10 XP", time: "2 days ago", type: "quest" },
  { id: 5, action: "Maintained Streak (7 days)", xp: "+5% Workout XP", time: "2 days ago", type: "milestone" }
];

export const mockXpHistory = [
  { name: 'Week 1', xp: 120 },
  { name: 'Week 2', xp: 210 },
  { name: 'Week 3', xp: 350 },
  { name: 'Week 4', xp: 480 },
  { name: 'Week 5', xp: 620 },
  { name: 'Week 6', xp: 790 },
  { name: 'Week 7', xp: 950 },
  { name: 'Week 8', xp: 1120 }
];
