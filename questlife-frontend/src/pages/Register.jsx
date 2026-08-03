import { Link, useNavigate } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import { Swords, Shield, Zap, Brain, Loader2, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes('YOUR_CLERK_PUBLISHABLE_KEY_HERE');

const classes = [
  { id: 'warrior', name: 'Warrior', icon: Swords, color: 'text-quest-str', desc: 'Focuses on strength and building muscle mass.' },
  { id: 'ranger', name: 'Ranger', icon: Zap, color: 'text-quest-spd', desc: 'Prioritizes speed, running, and endurance.' },
  { id: 'monk', name: 'Monk', icon: Brain, color: 'text-quest-dis', desc: 'Balanced approach with focus on yoga and mindfulness.' },
  { id: 'paladin', name: 'Paladin', icon: Shield, color: 'text-quest-con', desc: 'Consistency and perfect diet execution.' }
];

export default function Register() {
  const [selectedClass, setSelectedClass] = useState('warrior');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        display_name: displayName || username,
        username,
        email,
        password,
        character_class: selectedClass
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Username or email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-quest-accent dark:bg-quest-darkest text-gray-900 dark:text-white flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden font-sans transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-quest-primary/10 dark:from-quest-primary/20 via-transparent dark:via-quest-darkest to-transparent dark:to-quest-darkest"></div>
      
      {isClerkConfigured ? (
        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">Create Character</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sign up with Clerk Authentication</p>
          </div>
          
          <SignUp 
            routing="hash"
            signInUrl="#/login"
            fallbackRedirectUrl="/"
            forceRedirectUrl="/"
            appearance={{
              elements: {
                card: 'glass-card border border-white/10 shadow-2xl rounded-2xl',
                headerTitle: 'font-heading font-bold',
                formButtonPrimary: 'bg-quest-primary hover:bg-quest-primary/90 text-white font-bold',
              }
            }}
          />
        </div>
      ) : (
        <>
          <div className="text-center mb-8 relative z-10">
            <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">Create Character</h1>
            <p className="text-gray-500 dark:text-gray-400">Choose your path and begin your fitness journey</p>
          </div>

          <div className="glass-card w-full max-w-4xl p-8 relative z-10 border-t-2 border-t-quest-secondary">
            
            {/* Clerk API Key Prompt Banner */}
            <div className="mb-6 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-blue-300">Clerk Authentication Setup</div>
                <div className="text-gray-400 mt-0.5">
                  To enable Clerk sign-up, set your publishable key in <code className="bg-black/40 px-1 py-0.5 rounded text-blue-300">questlife-frontend/.env</code>:
                  <div className="font-mono text-[10px] bg-black/50 p-1.5 rounded mt-1 text-gray-300">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-quest-danger/20 border border-quest-danger text-quest-danger text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Form */}
                <div className="space-y-5">
                  <h2 className="text-2xl font-heading font-semibold border-b border-gray-200 dark:border-white/10 pb-2">Player Details</h2>
                  <div>
                    <label htmlFor="register-displayname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Character / Display Name</label>
                    <input
                      id="register-displayname"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="input-field"
                      placeholder="Hero Legend"
                    />
                  </div>
                  <div>
                    <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username *</label>
                    <input
                      id="register-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field"
                      placeholder="player_one"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="hero@questlife.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password * <span className="text-gray-500 font-normal">(min. 8 characters)</span></label>
                    <input
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Class Selection */}
                <div>
                  <h2 className="text-2xl font-heading font-semibold border-b border-gray-200 dark:border-white/10 pb-2 mb-6">Choose Class</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Character class">
                    {classes.map(c => {
                      const isSelected = selectedClass === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedClass(c.id)}
                          className={`p-4 rounded-xl cursor-pointer transition-all border text-left ${
                            isSelected
                              ? 'bg-quest-primary/10 border-quest-primary shadow-[0_0_15px_rgba(246,36,64,0.3)]'
                              : 'bg-white/5 border-gray-200 dark:border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <c.icon className={`w-8 h-8 mb-3 ${c.color}`} />
                          <h3 className="font-heading font-bold text-lg">{c.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="mt-12 pt-6 border-t border-gray-200 dark:border-white/10 flex flex-col items-center">
                <button 
                  type="submit"
                  disabled={loading || !selectedClass}
                  className="w-full max-w-md bg-quest-primary hover:bg-quest-primary/80 text-white font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(246,36,64,0.6)] transition-all transform hover:scale-[1.02] text-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Spawning in World...
                    </>
                  ) : (
                    'Spawn in World'
                  )}
                </button>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Already have a character? <Link to="/login" className="text-quest-primary hover:text-quest-primary/80 font-medium">Log In</Link>
                </div>
              </div>
            </form>

          </div>
        </>
      )}
    </div>
  );
}
