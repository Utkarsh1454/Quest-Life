import { Trophy, Medal, Flame, Zap, Shield, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

const LEAGUE_STYLING = {
  Diamond: { badge: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/40', icon: '💎', title: 'Diamond League' },
  Gold: { badge: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40', icon: '🥇', title: 'Gold League' },
  Silver: { badge: 'bg-slate-500/20 text-slate-800 dark:text-slate-300 border-slate-500/40', icon: '🥈', title: 'Silver League' },
  Bronze: { badge: 'bg-orange-500/20 text-orange-900 dark:text-orange-300 border-orange-500/40', icon: '🥉', title: 'Bronze League' },
};

export default function Leaderboard() {
  const [tab, setTab] = useState('Global');
  const [entries, setEntries] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useUser();
  const { user: authUser } = useAuth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    let endpoint = '/leaderboard/global';
    if (tab === 'Friends') {
      endpoint = '/leaderboard/friends';
    } else if (['Diamond', 'Gold', 'Silver', 'Bronze'].includes(tab)) {
      endpoint = `/leaderboard/league?league_name=${tab.toLowerCase()}`;
    }

    // Fetch user rank & main leaderboard in parallel
    Promise.all([
      apiClient(endpoint).catch(() => []),
      apiClient('/leaderboard/my-rank').catch(() => null)
    ])
      .then(([lbData, rankData]) => {
        if (cancelled) return;
        if (lbData && lbData.length > 0) {
          setEntries(lbData);
        } else {
          // Fallback leaderboard entries if backend empty or guest mode
          const userName = authUser?.username || profile?.name || 'Hero';
          const userXp = profile?.xp || 0;
          const userLevel = profile?.level || 1;
          const fallback = [
            { username: 'Iamhero', level: 4, total_xp: 2654, power_score: 1741, rank: 1, percentile: 99.0, league: 'Diamond', streak: 1, character_class: 'Paladin' },
            { username: 'Astrix550', level: 4, total_xp: 2302, power_score: 1359, rank: 2, percentile: 85.0, league: 'Gold', streak: 2, character_class: 'Ranger' },
            { username: userName, level: userLevel, total_xp: userXp, power_score: userXp, rank: 3, percentile: userXp > 500 ? 50.0 : 15.0, league: userXp > 2000 ? 'Diamond' : userXp > 500 ? 'Gold' : 'Bronze', streak: profile?.streak || 1, character_class: profile?.characterClass || 'Warrior' },
            { username: 'testuser', level: 1, total_xp: 51, power_score: 30, rank: 4, percentile: 10.0, league: 'Bronze', streak: 1, character_class: 'Warrior' }
          ];
          setEntries(fallback);
        }
        if (rankData) {
          setMyRank(rankData);
        }
      })
      .catch(err => {
        if (cancelled) return;
        setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tab, authUser, profile]);

  const userName = authUser?.username || profile?.name || 'Hero';
  const effectiveMyRank = myRank || {
    username: userName,
    level: profile?.level || 1,
    total_xp: profile?.xp || 0,
    power_score: profile?.xp || 0,
    rank: (entries.findIndex(e => e.username === userName) + 1) || 3,
    percentile: profile?.xp > 500 ? 50.0 : 15.0,
    league: profile?.xp > 2000 ? 'Diamond' : profile?.xp > 500 ? 'Gold' : 'Bronze',
    streak: profile?.streak || 1,
    character_class: profile?.characterClass || 'Warrior'
  };

  const userLeague = effectiveMyRank?.league || 'Bronze';
  const leagueStyle = LEAGUE_STYLING[userLeague] || LEAGUE_STYLING.Bronze;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight text-gray-900 dark:text-white">Decayed Power Leagues</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Weekly-decayed power scores and dynamic percentile ranks.
          </p>
        </div>
      </div>

      {/* Personal Hero Rank Card */}
      {effectiveMyRank && (
        <div className="glass-card p-6 border-l-4 border-l-quest-primary relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-quest-primary to-quest-secondary flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-quest-primary/30">
                {effectiveMyRank.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">{effectiveMyRank.username}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${leagueStyle.badge}`}>
                    {leagueStyle.icon} {effectiveMyRank.league} League
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                  Rank <span className="font-bold text-quest-primary">#{effectiveMyRank.rank}</span> · Top <span className="font-bold text-yellow-700 dark:text-quest-gold">{effectiveMyRank.percentile}%</span> Percentile
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-[#FFFAF3] dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
              <div className="text-center px-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Power Score</div>
                <div className="text-xl font-heading font-bold text-amber-700 dark:text-quest-gold flex items-center justify-center gap-1">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  {effectiveMyRank.power_score?.toLocaleString()}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300 dark:bg-white/10"></div>
              <div className="text-center px-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Total XP</div>
                <div className="text-xl font-heading font-bold text-quest-primary">
                  {effectiveMyRank.total_xp?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combined Tabs: Global & Friends */}
      <div className="flex border-b border-gray-200 dark:border-white/10 gap-4 mb-6">
        {['Global', 'Friends'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 font-bold transition-all relative text-base cursor-pointer rounded-t-xl ${
              tab === t 
                ? 'text-quest-primary border-b-2 border-quest-primary bg-quest-primary/10' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
            }`}
          >
            {t === 'Global' ? '🌐 Global Leaderboard' : '👥 Friends & Guild'}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-600 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-quest-primary" />
            <span className="font-medium">Loading rankings…</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 dark:text-red-400 text-sm font-semibold">{error}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-gray-600 dark:text-gray-400 text-sm font-medium">
            No players found in this view. Log workouts to rank up!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">
                  <th className="p-4 w-16 text-center">Rank</th>
                  <th className="p-4">Hero</th>
                  <th className="p-4 text-center">League</th>
                  <th className="p-4 text-right">Power Score</th>
                  <th className="p-4 text-right">Total XP</th>
                  <th className="p-4 text-right">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-sm">
                {entries.map((player, index) => {
                  const rank = player.rank || index + 1;
                  const isFirst = rank === 1;
                  const isSecond = rank === 2;
                  const isThird = rank === 3;
                  const isUser = player.username === authUser?.username;
                  const badge = LEAGUE_STYLING[player.league] || LEAGUE_STYLING.Bronze;

                  return (
                    <tr key={player.username} className={`hover:bg-white/5 transition-colors ${isUser ? 'bg-quest-primary/20 border-l-4 border-l-quest-primary' : ''}`}>
                      <td className="p-4 text-center font-bold">
                        {isFirst && <Trophy className="w-6 h-6 text-amber-500 mx-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />}
                        {isSecond && <Medal className="w-6 h-6 text-gray-400 mx-auto drop-shadow-[0_0_8px_rgba(209,213,219,0.8)]" />}
                        {isThird && <Medal className="w-6 h-6 text-amber-700 mx-auto drop-shadow-[0_0_8px_rgba(180,83,9,0.8)]" />}
                        {!isFirst && !isSecond && !isThird && <span className="text-gray-500 dark:text-gray-400">#{rank}</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                            isFirst ? 'bg-amber-400 text-black shadow-md' :
                            isSecond ? 'bg-gray-300 text-black shadow-md' :
                            isThird ? 'bg-amber-700 text-white shadow-md' :
                            'bg-quest-primary/10 border border-quest-primary/30'
                          }`}>
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`font-bold flex items-center gap-2 ${isUser ? 'text-quest-primary' : 'text-gray-900 dark:text-white'}`}>
                              {player.username} {isUser && <span className="text-[10px] px-2 py-0.5 rounded bg-quest-primary text-white font-bold">YOU</span>}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">Lvl {player.level} {player.character_class}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.badge}`}>
                          {badge.icon} {player.league}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-amber-700 dark:text-quest-gold">
                        <span className="inline-flex items-center gap-1">
                          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                          {player.power_score?.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold text-gray-700 dark:text-gray-300">
                        {player.total_xp?.toLocaleString()} XP
                      </td>
                      <td className="p-4 text-right">
                        {player.streak ? (
                          <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-900 dark:text-amber-300 px-2 py-1 rounded-lg border border-amber-500/30 text-xs font-bold">
                            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{player.streak}d</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
