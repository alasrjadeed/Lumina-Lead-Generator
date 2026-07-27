import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiGlobe,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiCpu,
  FiLinkedin,
  FiMapPin,
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter,
  FiBarChart2,
  FiUserPlus,
  FiSend,
  FiAward,
  FiPhone,
  FiBriefcase,
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusColors = {
  new: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  contacted: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  qualified: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  won: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  lost: 'bg-red-500/20 text-red-400 border border-red-500/30',
  unqualified: 'bg-red-500/20 text-red-400 border border-red-500/30',
  converted: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

const statusDot = {
  new: 'bg-blue-400',
  contacted: 'bg-amber-400',
  qualified: 'bg-emerald-400',
  won: 'bg-purple-400',
  lost: 'bg-red-400',
  unqualified: 'bg-red-400',
  converted: 'bg-purple-400',
};

const sourceIcons = {
  google: FiGlobe,
  linkedin: FiLinkedin,
  website: FiGlobe,
  'google maps': FiMapPin,
};

const LEADS_PER_PAGE = 10;

const GlassCard = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white/5 dark:bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl ${className}`}
    {...props}
  >
    {children}
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center py-16">
    <div className="relative">
      <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
      <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-cyan-500/10 border-b-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
    </div>
  </div>
);

const ScoreBar = ({ score = 0 }) => {
  const color = score >= 80 ? 'from-emerald-500 to-green-400' : score >= 50 ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-orange-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-white/40 font-mono">{score}</span>
    </div>
  );
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailTab, setDetailTab] = useState('info');
  const [generateForm, setGenerateForm] = useState({ source: 'google maps', query: '', location: '', country: 'bahrain' });
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [editingLead, setEditingLead] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [emailModal, setEmailModal] = useState(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [scoringLeads, setScoringLeads] = useState(false);
  const [stats, setStats] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const totalPages = Math.ceil(totalLeads / LEADS_PER_PAGE);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: LEADS_PER_PAGE };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const data = await api.get('/leads', { params });
      // API returns { leads: [...], pagination: { page, limit, total, pages } }
      setLeads(Array.isArray(data?.leads) ? data.leads : Array.isArray(data) ? data : []);
      setTotalLeads(data?.pagination?.total || data?.total || 0);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get('/leads/stats');
      // API returns { total, byStatus, bySource, byCountry, conversionRate, avgScore }
      setStats(data || {});
    } catch {}
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // Fetch supported countries
    api.get('/leads/countries').then((data) => {
      setCountries(data?.countries || []);
    }).catch(() => {});
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedLeads = useMemo(() => {
    const arr = [...leads];
    arr.sort((a, b) => {
      let aVal = a[sortField] ?? '';
      let bVal = b[sortField] ?? '';
      if (sortField === 'score') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [leads, sortField, sortDir]);

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedLeads.map((l) => l._id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      setSelectedLead(null);
      fetchLeads();
      fetchStats();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateForm.query.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    setGenerating(true);
    setGenerateResult(null);
    try {
      const data = await api.post('/leads/generate', {
        query: generateForm.query,
        location: generateForm.location,
        platform: generateForm.source,
        country: generateForm.country,
      });
      const count = data?.count || data?.leads?.length || 0;
      setGenerateResult(`Successfully generated ${count} lead${count !== 1 ? 's' : ''}`);
      toast.success(`Generated ${count} leads`);
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate leads');
    } finally {
      setGenerating(false);
    }
  };

  const handleScoreSelected = async () => {
    const ids = selectedIds.size > 0 ? [...selectedIds] : leads.map((l) => l._id);
    if (ids.length === 0) {
      toast.error('No leads to score');
      return;
    }
    setScoringLeads(true);
    try {
      await api.post('/leads/score', { leadIds: ids });
      toast.success(`Scored ${ids.length} lead${ids.length !== 1 ? 's' : ''}`);
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to score leads');
    } finally {
      setScoringLeads(false);
    }
  };

  const handleGenerateEmail = async (lead) => {
    setEmailModal(lead);
    setGeneratingEmail(true);
    try {
      const data = await api.post('/ai/generate-email', { leadId: lead._id });
      setEmailModal((prev) => ({ ...prev, generatedEmail: data }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate email');
      setEmailModal(null);
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleSaveLead = async () => {
    setSaving(true);
    try {
      await api.put(`/leads/${editingLead._id}`, editForm);
      toast.success('Lead updated');
      setEditingLead(null);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please select a CSV file');
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      await api.post('/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('CSV imported successfully');
      setShowImport(false);
      setImportFile(null);
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  const openEdit = (lead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      status: lead.status || 'new',
      notes: lead.notes || '',
    });
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FiArrowUp className="w-3 h-3 text-white/20" />;
    return sortDir === 'asc' ? (
      <FiArrowUp className="w-3 h-3 text-purple-400" />
    ) : (
      <FiArrowDown className="w-3 h-3 text-purple-400" />
    );
  };

  const StatCard = ({ icon: Icon, label, value, gradient }) => (
    <GlassCard className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-xs text-white/40">{label}</p>
      </div>
    </GlassCard>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard icon={FiUserPlus} label="Total Leads" value={stats.total} gradient="from-purple-600 to-blue-600" />
            <StatCard icon={FiBarChart2} label="New Leads" value={stats.new || stats.byStatus?.new} gradient="from-cyan-500 to-blue-500" />
            <StatCard icon={FiCheckCircle} label="Qualified" value={stats.qualified || stats.byStatus?.qualified} gradient="from-emerald-500 to-green-500" />
            <StatCard icon={FiAward} label="Avg Score" value={stats.avgScore ? Math.round(stats.avgScore) : '—'} gradient="from-amber-500 to-orange-500" />
          </div>
        )}

        {/* Top Bar */}
        <GlassCard className="p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Lead Generation & Management
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] lg:min-w-[260px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                <select
                  className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm appearance-none focus:outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="" className="bg-slate-800">All Status</option>
                  <option value="new" className="bg-slate-800">New</option>
                  <option value="contacted" className="bg-slate-800">Contacted</option>
                  <option value="qualified" className="bg-slate-800">Qualified</option>
                  <option value="won" className="bg-slate-800">Won</option>
                  <option value="lost" className="bg-slate-800">Lost</option>
                </select>
              </div>
              <button
                onClick={() => setShowGenerate(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
              >
                <FiGlobe className="w-4 h-4" />
                <span className="hidden sm:inline">Generate Leads</span>
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
              >
                <FiDownload className="w-4 h-4" />
                <span className="hidden sm:inline">Import CSV</span>
              </button>
              <button
                onClick={handleScoreSelected}
                disabled={scoringLeads}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                {scoringLeads ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <FiCpu className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Score with AI</span>
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Table */}
        <GlassCard className="overflow-hidden">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-purple-500/10 border-b border-purple-500/20">
              <span className="text-sm text-purple-300">{selectedIds.size} selected</span>
              <button
                onClick={() => handleScoreSelected()}
                className="text-xs px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all"
              >
                Score Selected
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pl-4 pr-2 py-3 text-left">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-white/20 bg-white/5 checked:bg-purple-500"
                      checked={selectedIds.size === sortedLeads.length && sortedLeads.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'company', label: 'Company' },
                    { key: 'source', label: 'Source' },
                    { key: 'status', label: 'Status' },
                    { key: 'score', label: 'Score' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/60 transition-colors select-none"
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <SortIcon field={col.key} />
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9}>
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : sortedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                          <FiUserPlus className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/30 text-sm">No leads found</p>
                        <button
                          onClick={() => setShowGenerate(true)}
                          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Generate your first leads
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedLeads.map((lead) => {
                    const SourceIcon = sourceIcons[lead.source?.toLowerCase()] || FiGlobe;
                    return (
                      <tr
                        key={lead._id}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="pl-4 pr-2 py-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm border-white/20 bg-white/5 checked:bg-purple-500"
                            checked={selectedIds.has(lead._id)}
                            onChange={() => toggleSelect(lead._id)}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm font-medium text-white">{lead.name || '—'}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-white/50">{lead.email || '—'}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-white/50">{lead.phone || '—'}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-white/50">{lead.company || '—'}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <SourceIcon className="w-3.5 h-3.5 text-white/30" />
                            <span className="text-xs text-white/40 capitalize">{lead.source || '—'}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${statusDot[lead.status] || 'bg-white/20'}`} />
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[lead.status] || 'bg-white/10 text-white/40'}`}>
                              {lead.status || 'new'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <ScoreBar score={lead.score || 0} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                              title="View details"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleGenerateEmail(lead)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                              title="Generate email"
                            >
                              <FiMail className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEdit(lead)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                              title="Edit"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(lead._id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Delete"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-xs text-white/30">
              Page {currentPage} of {totalPages} ({totalLeads} leads)
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page;
                if (totalPages <= 7) {
                  page = i + 1;
                } else if (currentPage <= 4) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i;
                } else {
                  page = currentPage - 3 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      currentPage === page
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'text-white/40 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Generate Leads Modal */}
        {showGenerate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGenerate(false)} />
            <GlassCard className="relative w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => { setShowGenerate(false); setGenerateResult(null); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiX className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-white mb-1">Generate Leads</h3>
              <p className="text-xs text-white/30 mb-5">Scrape and discover new leads from multiple sources</p>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Country</label>
                  <select
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                    value={generateForm.country}
                    onChange={(e) => setGenerateForm({ ...generateForm, country: e.target.value })}
                  >
                    {countries.length > 0 ? (
                      countries.map((c) => (
                        <option key={c.key} value={c.key} className="bg-slate-800">
                          {c.name} ({c.classifiedsCount} classifieds)
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="bahrain" className="bg-slate-800">Bahrain</option>
                        <option value="uae" className="bg-slate-800">United Arab Emirates</option>
                        <option value="saudiArabia" className="bg-slate-800">Saudi Arabia</option>
                        <option value="usa" className="bg-slate-800">United States</option>
                        <option value="uk" className="bg-slate-800">United Kingdom</option>
                        <option value="india" className="bg-slate-800">India</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Source</label>
                  <select
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                    value={generateForm.source}
                    onChange={(e) => setGenerateForm({ ...generateForm, source: e.target.value })}
                  >
                    <option value="google maps" className="bg-slate-800">Google Maps</option>
                    <option value="google business" className="bg-slate-800">Google Business</option>
                    <option value="linkedin" className="bg-slate-800">LinkedIn</option>
                    <option value="instagram" className="bg-slate-800">Instagram</option>
                    <option value="facebook" className="bg-slate-800">Facebook</option>
                    <option value="website" className="bg-slate-800">Custom Website</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Search Query</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="e.g. restaurants, software companies"
                    value={generateForm.query}
                    onChange={(e) => setGenerateForm({ ...generateForm, query: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="e.g. New York, London"
                    value={generateForm.location}
                    onChange={(e) => setGenerateForm({ ...generateForm, location: e.target.value })}
                  />
                </div>
                {generateResult && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <FiCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-emerald-300">{generateResult}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiGlobe className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          </div>
        )}

        {/* Import CSV Modal */}
        {showImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImport(false)} />
            <GlassCard className="relative w-full max-w-md p-6">
              <button
                onClick={() => { setShowImport(false); setImportFile(null); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiX className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-white mb-1">Import Leads from CSV</h3>
              <p className="text-xs text-white/30 mb-5">Upload a CSV file with columns: name, email, phone, company</p>
              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 transition-all"
                    onChange={(e) => setImportFile(e.target.files[0])}
                  />
                </div>
                <button
                  type="submit"
                  disabled={importing}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FiDownload className="w-4 h-4" />
                      Import
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          </div>
        )}

        {/* Email Generation Modal */}
        {emailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEmailModal(null)} />
            <GlassCard className="relative w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setEmailModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiX className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-white mb-1">Generated Email</h3>
              <p className="text-xs text-white/30 mb-4">For {emailModal.name} ({emailModal.email})</p>
              {generatingEmail ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <p className="text-sm text-white/40">AI is crafting the perfect email...</p>
                </div>
              ) : emailModal.generatedEmail ? (
                <div className="space-y-4">
                  {emailModal.generatedEmail.subject && (
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">Subject</label>
                      <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white">
                        {emailModal.generatedEmail.subject}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Body</label>
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                      {emailModal.generatedEmail.body || emailModal.generatedEmail.content || JSON.stringify(emailModal.generatedEmail, null, 2)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        (emailModal.generatedEmail.body || emailModal.generatedEmail.content || '') +
                        (emailModal.generatedEmail.subject ? `Subject: ${emailModal.generatedEmail.subject}\n\n` : '')
                      );
                      toast.success('Email copied to clipboard');
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <FiMail className="w-4 h-4" />
                    Copy to Clipboard
                  </button>
                </div>
              ) : (
                <p className="text-sm text-white/40 py-4 text-center">No email generated</p>
              )}
            </GlassCard>
          </div>
        )}

        {/* Edit Lead Modal */}
        {editingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingLead(null)} />
            <GlassCard className="relative w-full max-w-md p-6">
              <button
                onClick={() => setEditingLead(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiX className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-white mb-5">Edit Lead</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Company</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="new" className="bg-slate-800">New</option>
                    <option value="contacted" className="bg-slate-800">Contacted</option>
                    <option value="qualified" className="bg-slate-800">Qualified</option>
                    <option value="won" className="bg-slate-800">Won</option>
                    <option value="lost" className="bg-slate-800">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Notes</label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setEditingLead(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveLead}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Lead Detail Slide-Over */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
            <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border-l border-white/10 h-full overflow-y-auto shadow-2xl animate-slide-in">
              <style>{`
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
              `}</style>

              {/* Header */}
              <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedLead.name}</h3>
                    <p className="text-xs text-white/30">{selectedLead.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-1 mt-3">
                  {['info', 'interactions', 'analysis'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        detailTab === tab
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {tab === 'info' ? 'Info' : tab === 'interactions' ? 'Interactions' : 'AI Analysis'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-5">
                {detailTab === 'info' && (
                  <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <FiBarChart2 className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{selectedLead.score || 0}</p>
                        <p className="text-[10px] text-white/30">Score</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <FiClock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{selectedLead.interactions?.length || 0}</p>
                        <p className="text-[10px] text-white/30">Interactions</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <FiAward className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <p className={`text-sm font-bold ${statusColors[selectedLead.status]?.split(' ')[1] || 'text-white'}`}>
                          {selectedLead.status}
                        </p>
                        <p className="text-[10px] text-white/30">Status</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      {[
                        { icon: FiPhone, label: 'Phone', value: selectedLead.phone },
                        { icon: FiBriefcase, label: 'Company', value: selectedLead.company },
                        { icon: FiGlobe, label: 'Source', value: selectedLead.source },
                        { icon: FiMapPin, label: 'Location', value: selectedLead.location },
                        { icon: FiMail, label: 'Email', value: selectedLead.email },
                      ].filter((item) => item.value).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                          <item.icon className="w-4 h-4 text-white/20 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider">{item.label}</p>
                            <p className="text-sm text-white">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {selectedLead.notes && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-sm text-white/70">{selectedLead.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateEmail(selectedLead)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all"
                      >
                        <FiSend className="w-4 h-4" />
                        Generate Email
                      </button>
                      <button
                        onClick={() => {
                          setDetailTab('analysis');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <FiCpu className="w-4 h-4" />
                        AI Analysis
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedLead(null);
                        openEdit(selectedLead);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit Lead
                    </button>
                    <button
                      onClick={() => handleDelete(selectedLead._id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400/70 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete Lead
                    </button>
                  </>
                )}

                {detailTab === 'interactions' && (
                  <>
                    {selectedLead.interactions?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedLead.interactions.map((inter, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                <FiClock className="w-3.5 h-3.5 text-purple-400" />
                              </div>
                              {i < selectedLead.interactions.length - 1 && (
                                <div className="w-px flex-1 bg-white/10 my-1" />
                              )}
                            </div>
                            <div className="pb-4 flex-1">
                              <p className="text-sm text-white">{inter.description || inter.type}</p>
                              {inter.details && (
                                <p className="text-xs text-white/40 mt-1">{inter.details}</p>
                              )}
                              <p className="text-[10px] text-white/20 mt-1">
                                {inter.createdAt ? format(new Date(inter.createdAt), 'MMM d, yyyy HH:mm') : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-12">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                          <FiClock className="w-7 h-7 text-white/15" />
                        </div>
                        <p className="text-sm text-white/30">No interactions yet</p>
                      </div>
                    )}
                  </>
                )}

                {detailTab === 'analysis' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <FiCpu className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-semibold text-white">AI Score</h4>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                          {selectedLead.score || 0}
                        </div>
                        <div className="text-xs text-white/30">/ 100</div>
                      </div>
                      <ScoreBar score={selectedLead.score || 0} />
                    </div>
                    {selectedLead.aiAnalysis && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <h4 className="text-sm font-semibold text-white mb-2">AI Analysis</h4>
                        <p className="text-sm text-white/60 leading-relaxed">{selectedLead.aiAnalysis}</p>
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await api.post('/leads/score', { leadIds: [selectedLead._id] });
                          toast.success('Lead scored');
                          const updated = await api.get(`/leads/${selectedLead._id}`);
                          setSelectedLead(updated);
                          fetchLeads();
                        } catch {
                          toast.error('Failed to score lead');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all"
                    >
                      <FiCpu className="w-4 h-4" />
                      Re-score with AI
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
