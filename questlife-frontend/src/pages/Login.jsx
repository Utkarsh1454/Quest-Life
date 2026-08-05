import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useAuth } from '../context/AuthContext';
import { Loader2, KeyRound } from 'lucide-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes('YOUR_CLERK_PUBLISHABLE_KEY_HERE');

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-quest-accent dark:bg-quest-darkest text-gray-900 dark:text-white flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-quest-primary/10 dark:from-quest-primary/20 via-transparent dark:via-quest-darkest to-transparent dark:to-quest-darkest"></div>
      
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Clerk Sign In view when Key is provided */}
        {isClerkConfigured ? (
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-quest-primary to-quest-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-quest-primary/30 mb-3">
                <span className="font-heading font-bold text-2xl text-white">QL</span>
              </div>
              <h1 className="text-2xl font-heading font-bold tracking-tight">Enter the Realm</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sign in with Clerk Authentication</p>
            </div>
            
            <SignIn 
              routing="hash"
              signUpUrl="#/register"
              fallbackRedirectUrl="/"
              forceRedirectUrl="/"
              appearance={{
                baseTheme: dark,
                variables: {
                  colorPrimary: '#F62440',
                  colorBackground: '#161622',
                  colorSurface: '#161622',
                  colorText: '#ffffff',
                  colorTextSecondary: '#9ca3af',
                  colorInputBackground: '#0d0d14',
                  colorInputText: '#ffffff',
                  borderRadius: '1rem',
                },
                elements: {
                  card: 'bg-[#161622]/95 border border-white/10 shadow-2xl rounded-2xl backdrop-blur-xl',
                  headerTitle: 'font-heading font-bold text-white text-xl',
                  headerSubtitle: 'text-gray-400 text-sm',
                  socialButtonsBlockButton: 'bg-[#0d0d14] border border-white/10 hover:bg-white/10 text-white transition-all',
                  socialButtonsBlockButtonText: 'text-white font-medium',
                  formButtonPrimary: 'bg-quest-primary hover:bg-quest-primary/90 text-white font-bold py-3 shadow-[0_0_15px_rgba(246,36,64,0.4)] transition-all',
                  formFieldLabel: 'text-gray-300 font-medium text-sm',
                  formFieldInput: 'bg-[#0d0d14] border border-white/10 text-white focus:border-quest-primary rounded-xl',
                  footer: 'bg-[#161622]/95 border-t border-white/10 rounded-b-2xl',
                  footerActionText: 'text-gray-400',
                  footerActionLink: 'text-quest-primary hover:text-quest-primary/80 font-medium',
                  dividerLine: 'bg-white/10',
                  dividerText: 'text-gray-400 text-xs uppercase tracking-wider',
                }
              }}
            />
          </div>
        ) : (
          /* Standard / Direct Login view + Clerk setup instruction banner */
          <div className="glass-card w-full p-8 relative z-10 border-t-2 border-t-quest-primary">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-quest-primary to-quest-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-quest-primary/30 mb-4">
                <span className="font-heading font-bold text-3xl text-white">QL</span>
              </div>
              <h1 className="text-3xl font-heading font-bold tracking-tight">Enter the Realm</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Log in to continue your journey</p>
            </div>

            {/* Clerk API Key Prompt Banner */}
            <div className="mb-6 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-blue-300">Clerk Authentication Setup</div>
                <div className="text-gray-400 mt-0.5">
                  To enable Clerk sign-in, add your key to <code className="bg-black/40 px-1 py-0.5 rounded text-blue-300">questlife-frontend/.env</code>:
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="login-identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username or Email</label>
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input-field"
                  placeholder="PlayerOne or player@questlife.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-quest-primary hover:bg-quest-primary/80 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(246,36,64,0.5)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Entering Realm...
                  </>
                ) : (
                  'Start Questing'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              New to the realm? <Link to="/register" className="text-quest-primary hover:text-quest-primary/80 font-medium">Create Character</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
