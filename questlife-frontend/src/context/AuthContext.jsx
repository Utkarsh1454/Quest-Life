import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser as useClerkUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { apiClient, setClerkTokenGetter } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clerk hooks (safe optional calls)
  let clerkUser = null;
  let isClerkLoaded = true;
  let isClerkSignedIn = false;
  let clerkSignOut = null;
  let clerkGetToken = null;

  try {
    const clerkAuth = useClerkAuth();
    const clerkUserObj = useClerkUser();
    const clerk = useClerk();
    isClerkLoaded = clerkAuth.isLoaded;
    isClerkSignedIn = clerkAuth.isSignedIn;
    clerkGetToken = clerkAuth.getToken;
    clerkUser = clerkUserObj.user;
    clerkSignOut = clerk.signOut;
  } catch (e) {
    // ClerkProvider not mounted or key missing
  }

  useEffect(() => {
    if (clerkGetToken) {
      setClerkTokenGetter(clerkGetToken);
    }
  }, [clerkGetToken]);

  const getUserDetails = async () => {
    try {
      const profileData = await apiClient('/users/me');
      if (profileData && profileData.user) {
        return {
          ...profileData.user,
          stats: profileData.stats,
          preferences: profileData.preferences,
          streak: profileData.streak,
        };
      }
      return profileData;
    } catch (e) {
      return await apiClient('/auth/me');
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('questlife_token');
    const isClerkActive = isClerkSignedIn && clerkUser;

    if (!token && !isClerkActive) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getUserDetails();
      if (isClerkActive && userData) {
        userData.email = clerkUser.primaryEmailAddress?.emailAddress || userData.email;
        userData.display_name = clerkUser.fullName || clerkUser.username || userData.display_name;
        userData.avatar_url = clerkUser.imageUrl || userData.avatar_url;
        setUser(userData);
      } else if (userData) {
        setUser(userData);
      } else if (isClerkActive && clerkUser) {
        setUser({
          id: clerkUser.id,
          username: clerkUser.username || clerkUser.firstName?.toLowerCase() || 'hero',
          email: clerkUser.primaryEmailAddress?.emailAddress || `${clerkUser.id}@clerk.user`,
          display_name: clerkUser.fullName || clerkUser.firstName || 'Hero',
          character_class: 'warrior',
          avatar_url: clerkUser.imageUrl,
          stats: { level: 1, current_xp: 0, total_xp: 0, strength: 10, endurance: 10, speed: 10, discipline: 10, consistency: 10, recovery: 10, unspent_stat_points: 0 },
          preferences: {},
          streak: { current_streak: 0, longest_streak: 0 }
        });
      }
    } catch (error) {
      console.warn('Authentication user sync warning:', error);
      if (isClerkActive && clerkUser) {
        setUser({
          id: clerkUser.id,
          username: clerkUser.username || clerkUser.firstName?.toLowerCase() || 'hero',
          email: clerkUser.primaryEmailAddress?.emailAddress || `${clerkUser.id}@clerk.user`,
          display_name: clerkUser.fullName || clerkUser.firstName || 'Hero',
          character_class: 'warrior',
          avatar_url: clerkUser.imageUrl,
          stats: { level: 1, current_xp: 0, total_xp: 0, strength: 10, endurance: 10, speed: 10, discipline: 10, consistency: 10, recovery: 10, unspent_stat_points: 0 },
          preferences: {},
          streak: { current_streak: 0, longest_streak: 0 }
        });
      } else {
        localStorage.removeItem('questlife_token');
        localStorage.removeItem('questlife_refresh_token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isClerkSignedIn, clerkUser]);

  useEffect(() => {
    if (isClerkLoaded) {
      fetchCurrentUser();
    }

    const handleAuthError = () => {
      setUser(null);
      localStorage.removeItem('questlife_token');
      localStorage.removeItem('questlife_refresh_token');
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [fetchCurrentUser, isClerkLoaded]);

  const login = async (identifier, password) => {
    try {
      const tokenData = await apiClient('/auth/login', {
        body: { username: identifier, password },
        isFormUrlEncoded: true,
      });

      if (tokenData && tokenData.access_token) {
        localStorage.setItem('questlife_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem('questlife_refresh_token', tokenData.refresh_token);
        }
        const userData = await getUserDetails();
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const tokenData = await apiClient('/auth/register', {
        body: {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          display_name: userData.display_name || userData.username,
          character_class: userData.character_class || 'warrior',
        },
      });

      if (tokenData && tokenData.access_token) {
        localStorage.setItem('questlife_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem('questlife_refresh_token', tokenData.refresh_token);
        }
        const userDetails = await getUserDetails();
        setUser(userDetails);
        return userDetails;
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('questlife_token');
    localStorage.removeItem('questlife_refresh_token');
    localStorage.removeItem('questlife_profile');
    setUser(null);
    if (clerkSignOut) {
      try {
        await clerkSignOut();
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      register, 
      logout, 
      loading: loading || !isClerkLoaded, 
      refreshUser: fetchCurrentUser,
      isClerkSignedIn,
      clerkUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
