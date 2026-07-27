import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiMessageSquare, FiTarget, FiTrendingUp,
  FiBell, FiPlus, FiSend, FiBarChart2, FiSettings,
  FiDownload, FiUserPlus, FiChevronDown, FiClock,
  FiZap, FiCheckCircle, FiActivity, FiLinkedin,
  FiMail, FiMessageCircle, FiGlobe, FiRefreshCw,
  FiTrendingDown, FiDollarSign, FiSmile, FiThumbsUp,
  FiArrowUp, FiArrowDown, FiMoreHorizontal,
} from 'react-icons/fi';
import {
  MdOutlineWhatsapp, MdOutlineEmail, MdOutlineWeb,
  MdOutlineChat, MdOutlinePeople, MdOutlineAutorenew,
} from 'react-icons/md';
import {
  BarChart3, LineChart, PieChart, Activity,
  Cpu, Wifi, WifiOff, Zap, Target,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { format } from 'date-fns';

const statCardsData = [
  {
    title: 'Total Leads',
    key: 'totalLeads',
    icon: FiUsers,
    gradient: 'from-purple-500/20 to-purple-600/5',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    badge: '+12%',
    badgeColor: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    title: 'Active Conversations',
    key: 'activeChats',
    icon: FiMessageSquare,
    gradient: 'from-cyan-500/20 to-cyan-600/5',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    badge: '+8%',
    badgeColor: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    title: 'Messages Today',
    key: 'messagesToday',
    icon: FiActivity,
    gradient: 'from-pink-500/20 to-pink-600/5',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
    badge: '+23%',
    badgeColor: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    title: 'Conversion Rate',
    key: 'conversionRate',
    icon: FiTrendingUp,
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    badge: '4.2%',
    badgeColor: 'text-amber-400 bg-amber-500/10',
    suffix: '%',
    decimals: 1,
  },
];

const activityFeed = [
  { icon: FiLinkedin, color: 'text-blue-400 bg-blue-500/10', description: 'New lead generated from LinkedIn', time: '2 min ago' },
  { icon: MdOutlineWhatsapp, color: 'text-emerald-400 bg-emerald-500/10', description: 'Customer inquiry from WhatsApp', time: '8 min ago' },
  { icon: FiMail, color: 'text-amber-400 bg-amber-500/10', description: 'Email campaign sent to 250 leads', time: '15 min ago' },
  { icon: FiZap, color: 'text-violet-400 bg-violet-500/10', description: 'AI agent resolved 15 support tickets', time: '32 min ago' },
  { icon: FiMessageCircle, color: 'text-sky-400 bg-sky-500/10', description: 'Live chat converted 3 leads', time: '1 hour ago' },
  { icon: FiCheckCircle, color: 'text-emerald-400 bg-emerald-500/10', description: 'Follow-up scheduled for 45 contacts', time: '2 hours ago' },
  { icon: FiBarChart2, color: 'text-orange-400 bg-orange-500/10', description: 'Weekly report generated', time: '3 hours ago' },
  { icon: FiUsers, color: 'text-rose-400 bg-rose-500/10', description: '5 new team members joined', time: '5 hours ago' },
];

const channelsData = [
  { name: 'WhatsApp', percentage: 78, color: 'bg-emerald-400', icon: MdOutlineWhatsapp },
  { name: 'Email', percentage: 15, color: 'bg-amber-400', icon: MdOutlineEmail },
  { name: 'Web Chat', percentage: 7, color: 'bg-sky-400', icon: MdOutlineChat },
];

const recentLeadsData = [
  { name: 'Sarah Johnson', source: 'LinkedIn', status: 'Hot', score: 92, statusColor: 'text-rose-400 bg-rose-500/10' },
  { name: 'Michael Chen', source: 'Website', status: 'Warm', score: 78, statusColor: 'text-amber-400 bg-amber-500/10' },
  { name: 'Emily Rodriguez', source: 'Referral', status: 'Hot', score: 88, statusColor: 'text-rose-400 bg-rose-500/10' },
  { name: 'James Wilson', source: 'WhatsApp', status: 'Cold', score: 45, statusColor: 'text-blue-400 bg-blue-500/10' },
  { name: 'Lisa Thompson', source: 'Email', status: 'Warm', score: 71, statusColor: 'text-amber-400 bg-amber-500/10' },
];

const followUpsData = [
  { name: 'Alex Turner', channel: 'fa-phone', channelIcon: MdOutlineWhatsapp, time: '10:30 AM', badge: 'bg-emerald-500/10 text-emerald-400' },
  { name: 'Nina Patel', channel: 'fa-envelope', channelIcon: MdOutlineEmail, time: '11:45 AM', badge: 'bg-amber-500/10 text-amber-400' },
  { name: 'David Kim', channel: 'fa-comment', channelIcon: MdOutlineChat, time: '2:00 PM', badge: 'bg-sky-500/10 text-sky-400' },
  { name: 'Maria Garcia', channel: 'fa-phone', channelIcon: FiLinkedin, time: '3:30 PM', badge: 'bg-blue-500/10 text-blue-400' },
];

const weeklyLeads = [65, 78, 52, 91, 84, 103, 72];
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function AnimatedCounter({ value, suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const target = Number(value);
    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(easeOut * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value]);

  return <>{display.toFixed(decimals)}{suffix}</>;
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalLeads: 0, activeChats: 0, messagesToday: 0, conversionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const [statsRes] = await Promise.allSettled([
        api.get('/admin/dashboard/stats'),
      ]);
      if (statsRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, ...statsRes.value.data }));
      }
    } catch {
      // use fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: 'Generate Leads', icon: FiTarget, path: '/leads', color: 'from-violet-500/20 to-violet-600/5 text-violet-400 border-violet-500/20 hover:border-violet-500/40' },
    { label: 'New Campaign', icon: FiSend, path: '/campaigns/new', color: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40' },
    { label: 'View Analytics', icon: BarChart3, path: '/analytics', color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20 hover:border-amber-500/40' },
    { label: 'AI Settings', icon: FiSettings, path: '/settings', color: 'from-pink-500/20 to-pink-600/5 text-pink-400 border-pink-500/20 hover:border-pink-500/40' },
    { label: 'Export Report', icon: FiDownload, path: '/reports', color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40' },
    { label: 'Invite Team', icon: FiUserPlus, path: '/team/invite', color: 'from-sky-500/20 to-sky-600/5 text-sky-400 border-sky-500/20 hover:border-sky-500/40' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Welcome back, {user?.name || 'Admin'}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {format(time, 'EEEE, MMMM do, yyyy')} &middot; {format(time, 'h:mm a')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiBell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/25">
                  3
                </span>
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 z-50 p-1.5 rounded-2xl border border-white/10 bg-[#12121a]/95 backdrop-blur-xl shadow-2xl shadow-black/50">
                    <div className="p-3 border-b border-white/5">
                      <p className="text-white font-semibold text-sm">Notifications</p>
                    </div>
                    {[
                      { text: 'New lead scored 92 - Sarah Johnson', time: '2 min ago', dot: 'bg-rose-400' },
                      { text: 'AI agent resolved 15 tickets', time: '32 min ago', dot: 'bg-emerald-400' },
                      { text: 'Campaign "Q3 Outreach" completed', time: '1 hour ago', dot: 'bg-cyan-400' },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm truncate">{n.text}</p>
                          <p className="text-white/30 text-xs mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiPlus className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Quick Actions</span>
                <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 z-50 p-1.5 rounded-2xl border border-white/10 bg-[#12121a]/95 backdrop-blur-xl shadow-2xl shadow-black/50">
                    {[
                      { label: 'Generate Leads', icon: FiTarget, path: '/leads' },
                      { label: 'New Campaign', icon: FiSend, path: '/campaigns/new' },
                      { label: 'View Analytics', icon: BarChart3, path: '/analytics' },
                      { label: 'AI Settings', icon: FiSettings, path: '/settings' },
                    ].map((action) => (
                      <button
                        key={action.label}
                        onClick={() => { setDropdownOpen(false); navigate(action.path); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                      >
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCardsData.map((card) => {
            const Icon = card.icon;
            const val = stats[card.key] ?? 0;
            return (
              <div
                key={card.key}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/20 hover:from-white/[0.10] hover:to-white/[0.04] hover:shadow-xl hover:shadow-black/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{card.title}</p>
                    <p className="text-3xl font-bold text-white mt-2 tabular-nums">
                      <AnimatedCounter value={val} suffix={card.suffix || ''} decimals={card.decimals || 0} />
                    </p>
                  </div>
                  <div className={`${card.iconBg} ${card.iconColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 mt-3">
                  {card.badge.includes('+') || card.badge.includes('%') && !card.badge.includes('+') ? (
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                      <FiArrowUp className="w-3 h-3" />
                      {card.badge}
                    </span>
                  ) : (
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  )}
                  <span className="text-white/30 text-xs">vs last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Wider */}
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Activity Feed */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-cyan-400" />
                  Recent Activity
                </h2>
                <button className="text-white/30 hover:text-white/60 text-xs font-medium transition-colors">View All</button>
              </div>
              <div className="space-y-1 max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                {activityFeed.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className={`${item.color} p-2 rounded-lg flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm truncate group-hover:text-white transition-colors">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-white/30 text-xs flex-shrink-0">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leads Chart */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  Weekly Leads
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs">This Week</span>
                  <FiRefreshCw className="w-3.5 h-3.5 text-white/20 hover:text-white/60 transition-colors cursor-pointer" />
                </div>
              </div>
              <div className="flex items-end justify-between gap-2 h-48">
                {weeklyLeads.map((val, i) => {
                  const maxVal = Math.max(...weeklyLeads);
                  const heightPercent = (val / maxVal) * 100;
                  const colors = ['bg-violet-400', 'bg-cyan-400', 'bg-pink-400', 'bg-amber-400', 'bg-emerald-400', 'bg-rose-400', 'bg-sky-400'];
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                      <span className="text-white/40 text-xs tabular-nums">{val}</span>
                      <div
                        className={`w-full max-w-[40px] ${colors[i]} rounded-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group/bar`}
                        style={{ height: `${heightPercent}%`, minHeight: '12px' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/10 px-2 py-1 rounded-lg text-white text-xs opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                          {val} leads
                        </div>
                      </div>
                      <span className="text-white/30 text-xs">{weekDays[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* AI Agent Status */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  AI Agent
                </h2>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <Wifi className="w-3 h-3" />
                  Online
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Msgs Today', value: '1,247', icon: FiMessageCircle, color: 'text-cyan-400' },
                  { label: 'Avg Response', value: '1.2s', icon: FiClock, color: 'text-amber-400' },
                  { label: 'Satisfaction', value: '96%', icon: FiSmile, color: 'text-emerald-400' },
                  { label: 'Resolved', value: '342', icon: FiCheckCircle, color: 'text-violet-400' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                      <div className={`${item.color} mb-1`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-white/40 text-xs">{item.label}</p>
                      <p className="text-white font-bold text-lg tabular-nums">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performing Channels */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-amber-400" />
                Top Channels
              </h2>
              <div className="space-y-4">
                {channelsData.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <div key={ch.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-white/50" />
                          <span className="text-white/70 text-sm">{ch.name}</span>
                        </div>
                        <span className="text-white/50 text-sm font-medium">{ch.percentage}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${ch.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${ch.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-pink-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl bg-gradient-to-br ${action.color} border transition-all text-sm font-medium backdrop-blur-sm`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Leads Table */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <MdOutlinePeople className="w-4 h-4 text-cyan-400" />
                Recent Leads
              </h2>
              <button onClick={() => navigate('/leads')} className="text-white/30 hover:text-white/60 text-xs font-medium transition-colors">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-white/30 text-xs font-medium pb-3 pr-4">Name</th>
                    <th className="text-left text-white/30 text-xs font-medium pb-3 pr-4">Source</th>
                    <th className="text-left text-white/30 text-xs font-medium pb-3 pr-4">Status</th>
                    <th className="text-right text-white/30 text-xs font-medium pb-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeadsData.map((lead, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400/30 to-pink-400/30 flex items-center justify-center text-white/70 text-xs font-medium">
                            {lead.name.charAt(0)}
                          </div>
                          <span className="text-white/80 text-sm group-hover:text-white transition-colors">{lead.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-white/40 text-sm">{lead.source}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${lead.statusColor}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-white/60 text-sm font-medium tabular-nums">{lead.score}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Follow-ups */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <FiClock className="w-4 h-4 text-amber-400" />
                Upcoming Follow-ups
              </h2>
              <button className="text-white/30 hover:text-white/60 text-xs font-medium transition-colors">View All</button>
            </div>
            <div className="space-y-2">
              {followUpsData.map((item, i) => {
                const Icon = item.channelIcon;
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-amber-400/70" />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm group-hover:text-white transition-colors">{item.name}</p>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${item.badge}`}>{item.channel}</span>
                      </div>
                    </div>
                    <span className="text-white/40 text-xs tabular-nums font-medium">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
