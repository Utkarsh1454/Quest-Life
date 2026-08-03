import { useState } from 'react';
import { Save, Sliders, Zap, Shield, Target, User, Sun, Moon, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import WearablesModal from '../components/WearablesModal';

export default function Settings() {
  const { profile, updatePreferences, clearAccountData, showToast } = useUser();
  const { theme: themeMode, setTheme } = useTheme();

  const handleThemeChange = (mode) => {
    setTheme(mode);
    showToast(`Interface set to ${mode === 'dark' ? 'Dark' : 'Light'} Mode!`, 'success');
  };

  const [displayName, setDisplayName] = useState(profile?.name || '');
  const [goal, setGoal] = useState(profile?.goal || 'Build Muscle (Strength Path)');
  const [trainingDays, setTrainingDays] = useState(profile?.trainingDays || 4);
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || 'Apprentice');
  const [dietType, setDietType] = useState(profile?.dietType || 'Standard Omnivore');
  const [allergies, setAllergies] = useState(profile?.allergies || 'None');
  const [intensity, setIntensity] = useState(profile?.intensity || 3);
  const [notifications, setNotifications] = useState(profile?.notifications ?? true);

  const [saving, setSaving] = useState(false);
  const [showWearablesModal, setShowWearablesModal] = useState(false);

  const xpMultiplier = (1 + (intensity - 1) * 0.15).toFixed(2);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      updatePreferences({
        ...(displayName && { name: displayName }),
        goal,
        trainingDays,
        experienceLevel,
        dietType,
        allergies,
        intensity,
        intensityMultiplier: xpMultiplier,
        notifications
      });
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">Player Settings & Parameters</h1>
        <p className="text-gray-400 mt-1">Customize your hero stats, quest modifiers, and training preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Identity & Objectives */}
          <div className="glass-card p-6 border-t-2 border-t-quest-primary">
             <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-6">
               <User className="w-5 h-5 text-quest-primary" />
               Hero Identity & Objectives
             </h2>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-medium text-gray-300 mb-1.5">In-Game Character Display Name</label>
                 <input 
                   type="text" 
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
                   className="input-field" 
                   placeholder={profile?.name || 'Hero Name'}
                 />
               </div>

               <div>
                 <label className="block text-xs font-medium text-gray-300 mb-1.5">Primary Quest Goal</label>
                 <select 
                   value={goal}
                   onChange={(e) => setGoal(e.target.value)}
                   className="input-field appearance-none bg-[#FFFAF3] dark:bg-quest-darkest"
                 >
                   <option>Build Muscle (Strength Path)</option>
                   <option>Lose Fat (Agility Path)</option>
                   <option>Maintain & Recover (Endurance Path)</option>
                 </select>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-gray-300 mb-1.5">Training Frequency</label>
                   <select 
                     value={trainingDays}
                     onChange={(e) => setTrainingDays(Number(e.target.value))}
                     className="input-field appearance-none bg-[#FFFAF3] dark:bg-quest-darkest"
                   >
                     {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{d} Days / Week</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-gray-300 mb-1.5">Experience Tier</label>
                   <select 
                     value={experienceLevel}
                     onChange={(e) => setExperienceLevel(e.target.value)}
                     className="input-field appearance-none bg-[#FFFAF3] dark:bg-quest-darkest"
                   >
                     <option value="Novice">Novice</option>
                     <option value="Apprentice">Apprentice</option>
                     <option value="Master">Master</option>
                   </select>
                 </div>
               </div>
             </div>
          </div>

          {/* Nutrition Preferences */}
          <div className="glass-card p-6">
             <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-6">
               <Shield className="w-5 h-5 text-blue-400" />
               Nutrition & Dietary Modifiers
             </h2>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-medium text-gray-300 mb-1.5">Diet Type</label>
                 <select 
                   value={dietType}
                   onChange={(e) => setDietType(e.target.value)}
                   className="input-field appearance-none bg-[#FFFAF3] dark:bg-quest-darkest"
                 >
                   <option>Standard Omnivore</option>
                   <option>High Protein Macro Focus</option>
                   <option>Vegetarian</option>
                   <option>Vegan</option>
                   <option>Keto</option>
                   <option>Paleo</option>
                 </select>
               </div>

               <div>
                 <label className="block text-xs font-medium text-gray-300 mb-1.5">Allergies & Intolerances</label>
                 <input 
                   type="text" 
                   value={allergies}
                   onChange={(e) => setAllergies(e.target.value)}
                   className="input-field" 
                   placeholder="e.g. Peanuts, Shellfish, Dairy" 
                 />
               </div>
             </div>
          </div>

          {/* Integrations */}
          <div className="glass-card p-6 relative overflow-hidden">
            <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-quest-secondary" />
              Integrations & Alerts
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Wearables Sync</div>
                  <div className="text-xs text-gray-400">Google Fit / Apple Health</div>
                </div>
                <button 
                  onClick={() => setShowWearablesModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-quest-primary/20 text-quest-primary text-xs font-bold hover:bg-quest-primary/30 transition-colors"
                >
                  Manage
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="font-medium text-sm">Push Notifications</div>
                  <div className="text-xs text-gray-400">Quest updates & reminders</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications} 
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-quest-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Theme Mode Option */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-4">
              {themeMode === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
              Display & Theme
            </h2>
            <p className="text-xs text-gray-400 mb-6">Choose between signature dark mode or clean warm light mode.</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-quest-primary text-white border-transparent shadow-lg shadow-quest-primary/30'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-quest-primary text-white border-transparent shadow-lg shadow-quest-primary/30'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
            </div>
          </div>

          {/* Danger Zone: Clear Account Processes */}
          <div className="glass-card p-6 border-t-4 border-t-red-500/50 bg-red-500/5">
            <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              Account Reset & Clear Process
            </h2>
            <p className="text-xs text-gray-400 mb-4">Clear all account activity history, quest progress, logged workouts/meals, and reset stats back to Level 1 initial state.</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all account processes and reset data? This action cannot be undone.')) {
                  clearAccountData();
                }
              }}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear All Account Process & Reset Data
            </button>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary bg-gradient-to-r from-quest-primary to-quest-secondary text-white font-bold flex items-center justify-center gap-2 py-4 shadow-lg shadow-quest-primary/30 cursor-pointer"
          >
            {saving ? (
              <Sliders className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Saving Settings...' : 'Save Preferences'}
          </button>
        </div>
      </div>
      
      {showWearablesModal && (
        <WearablesModal onClose={() => setShowWearablesModal(false)} />
      )}
    </div>
  );
}
