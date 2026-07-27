import { useState, useEffect } from 'react';
import { 
  FiSettings, 
  FiSave, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiEyeOff,
  FiGlobe,
  FiMessageSquare,
  FiBook,
  FiZap,
  FiLink,
  FiCopy,
  FiCheck
} from 'react-icons/fi';
import { 
  MdBusiness, 
  MdPsychology, 
  MdIntegrationInstructions 
} from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import useAuthStore from '../store/authStore.js';

const AgentConfigPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Business Profile State
  const [business, setBusiness] = useState({
    name: '',
    description: '',
    industry: 'Technology',
    websiteUrl: '',
    logoUrl: ''
  });
  
  // AI Settings State
  const [aiSettings, setAiSettings] = useState({
    systemPrompt: '',
    provider: 'Auto',
    autoReplyEnabled: true,
    temperature: 0.7
  });
  
  // Knowledge Base State
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    category: 'Products',
    content: ''
  });
  
  // Widget State
  const [widgetSettings, setWidgetSettings] = useState({
    greeting: 'Hello! How can I help you today?',
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    enabled: true
  });
  
  // Integrations State
  const [integrations, setIntegrations] = useState({
    whatsapp: { connected: false },
    email: { host: '', port: '', username: '' },
    webhookUrl: '',
    apiKey: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const tabs = [
    { id: 'business', label: 'Business Profile', icon: <MdBusiness /> },
    { id: 'ai', label: 'AI Settings', icon: <MdPsychology /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <FiBook /> },
    { id: 'widget', label: 'Chat Widget', icon: <FiMessageSquare /> },
    { id: 'integrations', label: 'Integrations', icon: <MdIntegrationInstructions /> }
  ];
  
  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Education',
    'Real Estate', 'Marketing', 'Other'
  ];
  
  const aiProviders = ['Auto', 'DeepSeek', 'OpenAI', 'Gemini', 'Groq'];
  
  const knowledgeCategories = [
    'Products', 'Services', 'Pricing', 'FAQ', 'Policies', 'Company', 'Other'
  ];
  
  // Fetch business data on mount
  useEffect(() => {
    fetchBusinessData();
    fetchKnowledgeBase();
  }, []);
  
  // Update system prompt when business name changes
  useEffect(() => {
    if (business.name && !aiSettings.systemPrompt) {
      setAiSettings(prev => ({
        ...prev,
        systemPrompt: `You are a helpful AI assistant for ${business.name}. You are friendly, professional, and knowledgeable about our products and services. Always try to help the customer find what they need. If they seem interested, collect their contact information.`
      }));
    }
  }, [business.name]);
  
  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agent/business');
      const data = response.data;
      
      setBusiness({
        name: data.name || '',
        description: data.description || '',
        industry: data.industry || 'Technology',
        websiteUrl: data.websiteUrl || '',
        logoUrl: data.logoUrl || ''
      });
      
      setAiSettings({
        systemPrompt: data.systemPrompt || '',
        provider: data.provider || 'Auto',
        autoReplyEnabled: data.autoReplyEnabled ?? true,
        temperature: data.temperature ?? 0.7
      });
      
      setWidgetSettings({
        greeting: data.widgetGreeting || 'Hello! How can I help you today?',
        position: data.widgetPosition || 'bottom-right',
        primaryColor: data.primaryColor || '#3B82F6',
        backgroundColor: data.backgroundColor || '#FFFFFF',
        enabled: data.widgetEnabled ?? true
      });
      
      setIntegrations({
        whatsapp: { connected: data.whatsappConnected || false },
        email: {
          host: data.smtpHost || '',
          port: data.smtpPort || '',
          username: data.smtpUsername || ''
        },
        webhookUrl: data.webhookUrl || '',
        apiKey: data.apiKey || ''
      });
    } catch (error) {
      toast.error('Failed to load business data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchKnowledgeBase = async () => {
    try {
      const response = await api.get('/agent/knowledge');
      setKnowledgeBase(response.data || []);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
    }
  };
  
  const saveBusinessProfile = async () => {
    try {
      setSaving(true);
      await api.put('/agent/business', business);
      toast.success('Business profile saved successfully');
    } catch (error) {
      toast.error('Failed to save business profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  const saveAiSettings = async () => {
    try {
      setSaving(true);
      await api.put('/agent/prompt', aiSettings);
      toast.success('AI settings saved successfully');
    } catch (error) {
      toast.error('Failed to save AI settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  const saveKnowledgeEntry = async () => {
    try {
      setSaving(true);
      if (editingEntry) {
        await api.put(`/agent/knowledge/${editingEntry._id}`, newEntry);
        toast.success('Entry updated successfully');
      } else {
        await api.post('/agent/knowledge', newEntry);
        toast.success('Entry added successfully');
      }
      setShowAddForm(false);
      setEditingEntry(null);
      setNewEntry({ title: '', category: 'Products', content: '' });
      fetchKnowledgeBase();
    } catch (error) {
      toast.error('Failed to save entry');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  const deleteKnowledgeEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await api.delete(`/agent/knowledge/${id}`);
      toast.success('Entry deleted successfully');
      fetchKnowledgeBase();
    } catch (error) {
      toast.error('Failed to delete entry');
      console.error(error);
    }
  };
  
  const editKnowledgeEntry = (entry) => {
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      category: entry.category,
      content: entry.content
    });
    setShowAddForm(true);
  };
  
  const saveWidgetSettings = async () => {
    try {
      setSaving(true);
      await api.put('/agent/widget', widgetSettings);
      toast.success('Widget settings saved successfully');
    } catch (error) {
      toast.error('Failed to save widget settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  const copyEmbedCode = () => {
    const embedCode = `<iframe src="http://localhost:5173/widget/${user?.businessId || '{businessId}'}" width="400" height="600"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Embed code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const maskApiKey = (key) => {
    if (!key) return '';
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white flex items-center gap-3">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-lg">Loading configuration...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FiSettings className="text-purple-400" />
            Agent Configuration
          </h1>
          <p className="text-gray-400 mt-2">Configure your AI agent's personality, knowledge, and settings</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          
          {/* Tab 1: Business Profile */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <MdBusiness className="text-purple-400" />
                Business Profile
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Business Name</label>
                  <input
                    type="text"
                    value={business.name}
                    onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your business name"
                  />
                </div>
                
                {/* Industry */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Industry</label>
                  <select
                    value={business.industry}
                    onChange={(e) => setBusiness({ ...business, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind} className="bg-gray-800">{ind}</option>
                    ))}
                  </select>
                </div>
                
                {/* Website URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Website URL</label>
                  <input
                    type="url"
                    value={business.websiteUrl}
                    onChange={(e) => setBusiness({ ...business, websiteUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="https://example.com"
                  />
                </div>
                
                {/* Logo URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Logo URL</label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={business.logoUrl}
                      onChange={(e) => setBusiness({ ...business, logoUrl: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="https://example.com/logo.png"
                    />
                    {business.logoUrl && (
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                        <img 
                          src={business.logoUrl} 
                          alt="Logo preview" 
                          className="w-full h-full object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Business Description</label>
                <textarea
                  value={business.description}
                  onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe your business..."
                />
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveBusinessProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <FiSave size={18} />}
                  Save Business Profile
                </button>
              </div>
            </div>
          )}
          
          {/* Tab 2: AI Agent Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <MdPsychology className="text-purple-400" />
                AI Agent Settings
              </h2>
              
              {/* System Prompt */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  AI Personality Prompt
                  <span className="text-gray-500 ml-2">(This controls how your AI behaves)</span>
                </label>
                <textarea
                  value={aiSettings.systemPrompt}
                  onChange={(e) => setAiSettings({ ...aiSettings, systemPrompt: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                  placeholder="Enter the system prompt for your AI agent..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Provider */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">AI Provider</label>
                  <select
                    value={aiSettings.provider}
                    onChange={(e) => setAiSettings({ ...aiSettings, provider: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {aiProviders.map((provider) => (
                      <option key={provider} value={provider} className="bg-gray-800">{provider}</option>
                    ))}
                  </select>
                </div>
                
                {/* Temperature Slider */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Temperature: {aiSettings.temperature}
                    <span className="text-gray-500 ml-2">(Creativity level)</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={aiSettings.temperature}
                    onChange={(e) => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Precise (0.1)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>
              
              {/* Auto Reply Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h3 className="text-white font-medium">Auto-Reply</h3>
                  <p className="text-sm text-gray-400">When enabled, AI responds automatically to new messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings.autoReplyEnabled}
                    onChange={(e) => setAiSettings({ ...aiSettings, autoReplyEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveAiSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <FiSave size={18} />}
                  Save AI Settings
                </button>
              </div>
            </div>
          )}
          
          {/* Tab 3: Knowledge Base */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <FiBook className="text-purple-400" />
                  Knowledge Base
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingEntry(null);
                    setNewEntry({ title: '', category: 'Products', content: '' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all"
                >
                  <FiPlus size={18} />
                  Add Entry
                </button>
              </div>
              
              {/* Add/Edit Form Modal */}
              {showAddForm && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {editingEntry ? 'Edit Entry' : 'Add New Entry'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Title</label>
                        <input
                          type="text"
                          value={newEntry.title}
                          onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="Entry title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Category</label>
                        <select
                          value={newEntry.category}
                          onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        >
                          {knowledgeCategories.map((cat) => (
                            <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Content</label>
                      <textarea
                        value={newEntry.content}
                        onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                        placeholder="Enter the content..."
                      />
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingEntry(null);
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveKnowledgeEntry}
                        disabled={saving || !newEntry.title || !newEntry.content}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <FiSave size={18} />}
                        {editingEntry ? 'Update Entry' : 'Save Entry'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Knowledge Base List */}
              <div className="space-y-3">
                {knowledgeBase.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FiBook size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No knowledge base entries yet. Add your first entry to get started.</p>
                  </div>
                ) : (
                  knowledgeBase.map((entry) => (
                    <div
                      key={entry._id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-medium">{entry.title}</h4>
                            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                              {entry.category}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm line-clamp-2">{entry.content}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            Created: {new Date(entry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => editKnowledgeEntry(entry)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteKnowledgeEntry(entry._id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* Tab 4: Chat Widget */}
          {activeTab === 'widget' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <FiMessageSquare className="text-purple-400" />
                Chat Widget
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings */}
                <div className="space-y-6">
                  {/* Greeting */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Greeting Message</label>
                    <input
                      type="text"
                      value={widgetSettings.greeting}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, greeting: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Hello! How can I help you?"
                    />
                  </div>
                  
                  {/* Position */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Widget Position</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setWidgetSettings({ ...widgetSettings, position: 'bottom-left' })}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          widgetSettings.position === 'bottom-left'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        Bottom Left
                      </button>
                      <button
                        onClick={() => setWidgetSettings({ ...widgetSettings, position: 'bottom-right' })}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          widgetSettings.position === 'bottom-right'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        Bottom Right
                      </button>
                    </div>
                  </div>
                  
                  {/* Color Pickers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Primary Color</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={widgetSettings.primaryColor}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, primaryColor: e.target.value })}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/10"
                        />
                        <input
                          type="text"
                          value={widgetSettings.primaryColor}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, primaryColor: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Background Color</label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={widgetSettings.backgroundColor}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, backgroundColor: e.target.value })}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/10"
                        />
                        <input
                          type="text"
                          value={widgetSettings.backgroundColor}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, backgroundColor: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <h3 className="text-white font-medium">Enable Widget</h3>
                      <p className="text-sm text-gray-400">Show the chat widget on your website</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={widgetSettings.enabled}
                        onChange={(e) => setWidgetSettings({ ...widgetSettings, enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  {/* Embed Code */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Embed Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`<iframe src="http://localhost:5173/widget/${user?.businessId || '{businessId}'}" width="400" height="600"></iframe>`}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm font-mono focus:outline-none"
                      />
                      <button
                        onClick={copyEmbedCode}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                      >
                        {copied ? <FiCheck size={18} className="text-green-400" /> : <FiCopy size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={saveWidgetSettings}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <FiSave size={18} />}
                      Save Widget Settings
                    </button>
                  </div>
                </div>
                
                {/* Preview */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-medium mb-4">Widget Preview</h3>
                  <div 
                    className="relative bg-gray-100 rounded-xl overflow-hidden h-80"
                    style={{ backgroundColor: '#f3f4f6' }}
                  >
                    {/* Mock widget */}
                    <div 
                      className={`absolute bottom-4 ${widgetSettings.position === 'bottom-left' ? 'left-4' : 'right-4'} shadow-2xl rounded-2xl overflow-hidden`}
                      style={{ width: '280px', height: '380px' }}
                    >
                      {/* Header */}
                      <div 
                        className="p-4 text-white"
                        style={{ backgroundColor: widgetSettings.primaryColor }}
                      >
                        <p className="font-medium">{business.name || 'Chat Assistant'}</p>
                        <p className="text-xs opacity-80">Usually replies instantly</p>
                      </div>
                      
                      {/* Messages */}
                      <div className="p-4 bg-white h-full">
                        <div className="bg-gray-100 rounded-xl p-3 max-w-[80%]">
                          <p className="text-sm text-gray-700">{widgetSettings.greeting}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* FAB */}
                    <div 
                      className={`absolute bottom-4 ${widgetSettings.position === 'bottom-left' ? 'left-4' : 'right-4'} w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer`}
                      style={{ backgroundColor: widgetSettings.primaryColor }}
                    >
                      <FiMessageSquare className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tab 5: Integrations */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <MdIntegrationInstructions className="text-purple-400" />
                Integrations
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WhatsApp */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <FiMessageSquare className="text-green-400" />
                      WhatsApp Business API
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      integrations.whatsapp.connected 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {integrations.whatsapp.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Connect your WhatsApp Business account to receive and send messages.
                  </p>
                  <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all">
                    {integrations.whatsapp.connected ? 'Manage Connection' : 'Connect WhatsApp'}
                  </button>
                </div>
                
                {/* Email SMTP */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-medium flex items-center gap-2 mb-4">
                    <FiGlobe className="text-blue-400" />
                    Email (SMTP)
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={integrations.email.host}
                      onChange={(e) => setIntegrations({ ...integrations, email: { ...integrations.email, host: e.target.value } })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                      placeholder="SMTP Host (e.g., smtp.gmail.com)"
                    />
                    <input
                      type="text"
                      value={integrations.email.port}
                      onChange={(e) => setIntegrations({ ...integrations, email: { ...integrations.email, port: e.target.value } })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                      placeholder="Port (e.g., 587)"
                    />
                    <input
                      type="text"
                      value={integrations.email.username}
                      onChange={(e) => setIntegrations({ ...integrations, email: { ...integrations.email, username: e.target.value } })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                      placeholder="Username"
                    />
                  </div>
                </div>
                
                {/* Webhook */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-medium flex items-center gap-2 mb-4">
                    <FiZap className="text-yellow-400" />
                    Webhook URL
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={integrations.webhookUrl || 'No webhook configured'}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(integrations.webhookUrl);
                        toast.success('Webhook URL copied');
                      }}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                    >
                      <FiCopy size={18} />
                    </button>
                  </div>
                </div>
                
                {/* API Key */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-medium flex items-center gap-2 mb-4">
                    <FiLink className="text-purple-400" />
                    API Key
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      readOnly
                      value={showApiKey ? integrations.apiKey : maskApiKey(integrations.apiKey)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                    >
                      {showApiKey ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(integrations.apiKey);
                        toast.success('API key copied');
                      }}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                    >
                      <FiCopy size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentConfigPage;