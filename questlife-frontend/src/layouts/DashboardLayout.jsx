import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Scroll, TrendingUp, User as UserIcon, Settings, Menu, X, Dumbbell, Utensils, LogOut, Award, Users, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: UserIcon, label: 'Profile', path: '/profile' },
  { icon: Scroll, label: 'Quests', path: '/quests' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
  { icon: Dumbbell, label: 'Workout', path: '/workout' },
  { icon: Utensils, label: 'Diet', path: '/diet' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
  { icon: Users, label: 'Guild', path: '/guild' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const { profile } = useUser();

  const user = profile || { name: 'Player', level: 1, class: 'Novice' };
  const avatarUrl = profile?.equippedAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80';
  const equippedTitle = profile?.equippedTitle || 'WARRIOR ADVENTURER';

  return (
    <div className="flex h-screen bg-[#FFF2DB]/10 dark:bg-quest-darkest text-gray-800 dark:text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#FFFAF3] dark:bg-quest-dark border-r border-[#FFE5BF]/60 dark:border-white/10 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-quest-primary to-quest-secondary flex items-center justify-center shadow-lg shadow-quest-primary/20">
              <span className="font-heading font-bold text-xl text-white">QL</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-wide">Quest Life</span>
          </div>
          <button
            className="lg:hidden"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-quest-primary/20 to-transparent text-quest-primary border-l-2 border-quest-primary shadow-[inset_0_0_20px_rgba(246,36,64,0.05)]' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-quest-primary dark:hover:text-white hover:bg-quest-primary/5 dark:hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="glass-card p-4 flex flex-col gap-3">
            <NavLink 
              to="/profile" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-quest-gold shadow-[0_0_12px_rgba(245,158,11,0.4)] shrink-0">
                <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-sm truncate text-gray-900 dark:text-white group-hover:text-quest-gold transition-colors">{user.name}</div>
                <div className="text-[10px] text-quest-gold font-bold truncate">{equippedTitle}</div>
                <div className="text-xs text-quest-secondary flex items-center justify-between mt-0.5">
                  <span>Lvl {user.level}</span>
                </div>
              </div>
            </NavLink>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors w-full p-2 rounded-lg hover:bg-quest-primary/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile backdrop — tap to close sidebar */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            aria-hidden="true"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile top header */}
        <header className="h-20 lg:hidden flex items-center px-6 border-b border-white/10 glass-card rounded-none">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        
        <div className="flex-1 overflow-auto p-4 lg:p-8 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-quest-primary/5 dark:from-quest-primary/10 via-transparent dark:via-quest-darkest to-transparent dark:to-quest-darkest pointer-events-none"></div>
           <div className="relative z-10 max-w-7xl mx-auto pb-20">
            <Outlet />
           </div>
        </div>
      </main>
    </div>
  );
}
