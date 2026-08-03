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
        setEntries(lbData || []);
        if (rankData) {
          setMyRank(rankData);
        }
      })
      .catch(err => {
        if (cancelled) return;
        setError('Could not load leaderboard — try again shortly.');
        setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tab]);

  const userLeague = myRank?.league || 'Bronze';
  const leagueStyle = LEAGUE_STYLING[userLeague] || LEAGUE_STYLING.Bronze;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight">Decayed Power Leagues</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Weekly-decayed power scores + Fenwick $O(\log N)$ dynamic percentile ranks.
          </p>
        </div>
      </div>

      {/* Personal Hero Rank Card (Option B + D Integration) */}
      {myRank && (
        <div className="glass-card p-6 border-l-4 border-l-quest-primary relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-quest-primary to-quest-secondary flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-quest-primary/30">
                {myRank.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-xl">{myRank.username}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${leagueStyle.badge}`}>
                    {leagueStyle.icon} {myRank.league} League
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Rank <span className="font-bold text-quest-primary">#{myRank.rank}</span> · Top <span className="font-bold text-quest-gold">{myRank.percentile}%</span> Percentile
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
              <div className="text-center px-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Power Score</div>
                <div className="text-xl font-heading font-bold text-amber-700 dark:text-quest-gold flex items-center justify-center gap-1">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  {myRank.power_score?.toLocaleString()}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300 dark:bg-white/10"></div>
              <div className="text-center px-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total XP</div>
                <div className="text-xl font-heading font-bold text-quest-primary">
                  {myRank.total_xp?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-white/10 gap-2 mb-6">
        {['Global', 'Diamond', 'Gold', 'Silver', 'Bronze', 'Friends'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 font-medium transition-colors relative text-sm rounded-t-lg ${
              tab === t 
                ? 'text-quest-primary font-bold bg-white/5' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t === 'Diamond' && '💎 '}
            {t === 'Gold' && '🥇 '}
            {t === 'Silver' && '🥈 '}
            {t === 'Bronze' && '🥉 '}
            {t}
            {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-quest-primary shadow-[0_0_8px_rgba(246,36,64,0.8)]"></div>}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-quest-primary" />
            <span className="font-medium">Computing Fenwick $O(\log N)$ ranks…</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400 text-sm font-medium">{error}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">
            No players found in this league tier. Complete workouts to rank up!
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
                          <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-xs">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-bold">{player.streak}d</span>
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
