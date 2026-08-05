import { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Swords, Zap, Brain, Target, Heart, Award, Flame, Mail, Sparkles, Check, Edit2, Save, Shirt, UploadCloud } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const statIcons = {
  str: { label: 'Strength', icon: Swords, color: 'text-red-600 dark:text-quest-str', bg: 'bg-red-500/20 dark:bg-quest-str/20' },
  end: { label: 'Endurance', icon: Heart, color: 'text-rose-600 dark:text-quest-end', bg: 'bg-rose-500/20 dark:bg-quest-end/20' },
  spd: { label: 'Speed', icon: Zap, color: 'text-cyan-600 dark:text-quest-spd', bg: 'bg-cyan-500/20 dark:bg-quest-spd/20' },
  dis: { label: 'Discipline', icon: Brain, color: 'text-amber-700 dark:text-quest-dis', bg: 'bg-amber-500/20 dark:bg-quest-dis/20' },
  con: { label: 'Consistency', icon: Shield, color: 'text-emerald-700 dark:text-quest-con', bg: 'bg-emerald-500/20 dark:bg-quest-con/20' },
  rec: { label: 'Recovery', icon: Target, color: 'text-teal-600 dark:text-quest-rec', bg: 'bg-teal-500/20 dark:bg-quest-rec/20' }
};

const ALL_AVATARS = [
  { id: 'a1', name: 'Paladin Knight', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
  { id: 'a2', name: 'Shadow Assassin', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
  { id: 'a3', name: 'Cyber Monk', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80' },
  { id: 'a4', name: 'Berserker Orc', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80' },
  { id: 'a5', name: 'Cosmic Valkyrie', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80' },
  { id: 'a6', name: 'Iron Titan Mech', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
  { id: 'a7', name: 'Flame Warden', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80' },
  { id: 'a8', name: 'Dragon Slayer', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80' },
  { id: 'a9', name: 'Neon Shinobi', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80' },
  { id: 'a10', name: 'Grand Archmage', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80' },
  { id: 'a11', name: 'Shadow Knight', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&q=80' },
  { id: 'a12', name: 'Golden Emperor', url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&q=80' }
];

export default function Profile() {
  const { profile, updatePreferences, equipAvatar, showToast } = useUser();
  const { user: authUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.name || 'Hero');
  const [showWardrobe, setShowWardrobe] = useState(false);
  const fileInputRef = useRef(null);

  const user = profile || {
    name: authUser?.display_name || 'Hero Adventurer',
    class: authUser?.character_class || 'Warrior',
    level: 1,
    xp: 0,
    nextLevelXp: 133,
    streak: 0,
    stats: { str: 10, end: 10, spd: 10, dis: 10, con: 10, rec: 10 }
  };

  const avatarUrl = profile?.equippedAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';
  const equippedTitle = profile?.equippedTitle || 'WARRIOR ADVENTURER';

  const radarData = Object.entries(user.stats || {}).map(([key, value]) => ({
    subject: key.toUpperCase(),
    A: value,
    fullMark: 50,
  }));

  const xpPercentage = Math.min(((user.xp || 0) / (user.nextLevelXp || 133)) * 100, 100);

  const handleSaveName = () => {
    updatePreferences({ name: displayName });
    setIsEditing(false);
    showToast('Profile display name updated!', 'success');
  };

  const handleCustomPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const customUrl = event.target.result;
        equipAvatar({
          id: `custom_${Date.now()}`,
          name: 'Custom Device Photo',
          url: customUrl
        });
        showToast('Custom Photo Uploaded & Equipped! 🎉', 'level-up');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto text-gray-900 dark:text-white">
      {/* Header Banner */}
      <div className="glass-card p-8 border-t-4 border-t-quest-gold relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-quest-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar Portrait Card */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-quest-gold shadow-[0_0_25px_rgba(245,158,11,0.5)] bg-black">
              <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => setShowWardrobe(prev => !prev)}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-quest-gold text-black hover:bg-amber-400 font-bold shadow-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
              title="Open Wardrobe Customizer"
            >
              <Shirt className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-[#FFFAF3] dark:bg-white/10 border-2 border-quest-primary rounded-lg px-3 py-1.5 text-2xl font-bold font-heading text-gray-900 dark:text-white focus:outline-none shadow-sm"
                    />
                    <button onClick={handleSaveName} className="p-2 rounded-lg bg-quest-primary text-white hover:bg-quest-primary/80 cursor-pointer">
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">{user.name}</h1>
                    <button onClick={() => setIsEditing(true)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                  <span className="px-3 py-0.5 rounded-md bg-quest-gold/20 text-yellow-800 dark:text-quest-gold border border-quest-gold/40 text-xs font-bold uppercase tracking-wider">
                    {equippedTitle}
                  </span>
                  <span className="text-quest-secondary font-semibold text-xs">
                    • {user.class} Class
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <div className="glass-card px-4 py-2 text-center">
                  <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Daily Streak</div>
                  <div className="font-heading font-bold text-lg text-yellow-700 dark:text-quest-gold flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" /> {user.streak} Days
                  </div>
                </div>
              </div>
            </div>

            {/* Level & XP Bar */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-center text-sm font-semibold mb-2">
                <span className="text-quest-primary font-heading text-base font-bold">Level {user.level} Hero</span>
                <span className="text-gray-600 dark:text-gray-400">{user.xp || 0} / {user.nextLevelXp || 133} XP</span>
              </div>
              <div className="h-4 bg-[#FFE5BF]/40 dark:bg-quest-dark rounded-full overflow-hidden border border-[#FFE5BF]/60 dark:border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-quest-primary via-quest-secondary to-amber-500 transition-all duration-700 relative shadow-[0_0_15px_rgba(246,36,64,0.6)]"
                  style={{ width: `${xpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wardrobe Quick Selector Sheet */}
      {showWardrobe && (
        <div className="glass-card p-6 border-t-2 border-t-quest-gold animate-scale-up space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-3">
            <h2 className="text-xl font-heading font-bold text-yellow-700 dark:text-quest-gold flex items-center gap-2">
              <Shirt className="w-5 h-5" /> Avatar Wardrobe Catalog
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary bg-gradient-to-r from-quest-primary to-quest-secondary text-white font-bold text-xs px-3 py-1.5 flex items-center gap-1 shadow-md cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Upload Device Photo
              </button>
              <input type="file" ref={fileInputRef} onChange={handleCustomPhotoUpload} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-h-[360px] overflow-y-auto pr-1">
            {ALL_AVATARS.map(av => {
              const isEquipped = profile?.equippedAvatar === av.id;

              return (
                <button
                  key={av.id}
                  onClick={() => equipAvatar(av)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-1 group cursor-pointer ${
                    isEquipped ? 'border-quest-gold shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'
                  }`}
                >
                  <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-lg" />
                  {isEquipped && (
                    <div className="absolute inset-0 bg-quest-gold/20 flex items-center justify-center font-bold text-xs text-black">
                      <Check className="w-6 h-6 text-quest-gold bg-black/80 rounded-full p-1 shadow-lg" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] font-bold p-1 text-center truncate text-gray-200">
                    {av.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid - Attributes & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Attribute Radar Chart */}
        <div className="glass-card p-6 md:col-span-1 flex flex-col justify-between">
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Sparkles className="w-5 h-5 text-quest-primary" /> Attribute Build
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#94a3b8" strokeOpacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 50]} tick={false} axisLine={false} />
                <Radar name="Attributes" dataKey="A" stroke="#F62440" fill="#F62440" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Attributes Grid */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">Attributes Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(user.stats || {}).map(([key, val]) => {
              const meta = statIcons[key] || { label: key.toUpperCase(), icon: Target, color: 'text-quest-primary', bg: 'bg-quest-primary/20' };
              const Icon = meta.icon;
              return (
                <div key={key} className="glass-card p-4 flex items-center justify-between hover:border-quest-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${meta.bg} ${meta.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-lg text-gray-900 dark:text-white">{meta.label}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">{key.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{val}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
