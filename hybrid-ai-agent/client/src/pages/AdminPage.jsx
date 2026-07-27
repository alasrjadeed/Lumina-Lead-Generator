import { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiBriefcase, FiBarChart2, FiSettings, FiCheck, FiX } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const tabs = [
  { key: 'users', label: 'Users', icon: FiUsers },
  { key: 'businesses', label: 'Businesses', icon: FiBriefcase },
  { key: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { key: 'system', label: 'System', icon: FiSettings },
];

const roleColors = {
  admin: 'badge-error',
  agent: 'badge-primary',
  user: 'badge-info',
};

const systemServices = [
  { name: 'API Gateway', status: 'online' },
  { name: 'Socket Server', status: 'online' },
  { name: 'AI Service', status: 'online' },
  { name: 'Email Service', status: 'offline' },
  { name: 'Database', status: 'online' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingBusiness, setEditingBusiness] = useState(null);

  const fetchTabData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data } = await api.get('/admin/users');
        setUsers(data.users || data || []);
      } else if (activeTab === 'businesses') {
        const { data } = await api.get('/admin/businesses');
        setBusinesses(data.businesses || data || []);
      } else if (activeTab === 'analytics') {
        const { data } = await api.get('/admin/analytics');
        setAnalytics(data);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  const toggleBan = async (userId, banned) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`, { banned: !banned });
      toast.success(banned ? 'User unbanned' : 'User banned');
      fetchTabData();
    } catch {
      toast.error('Action failed');
    }
  };

  const changeRole = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      toast.success('Role updated');
      fetchTabData();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const saveBusiness = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/businesses/${editingBusiness._id}`, editingBusiness);
      toast.success('Business updated');
      setEditingBusiness(null);
      fetchTabData();
    } catch {
      toast.error('Failed to update business');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        <div role="tablist" className="tabs tabs-boxed mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              className={`tab gap-2 ${activeTab === key ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="card bg-base-100 shadow-md overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="hover">
                        <td className="font-medium">{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge badge-sm ${roleColors[u.role] || 'badge-ghost'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}</td>
                        <td>
                          {u.banned ? (
                            <span className="badge badge-error badge-sm">Banned</span>
                          ) : (
                            <span className="badge badge-success badge-sm">Active</span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-2 items-center">
                            <select
                              className="select select-bordered select-xs"
                              value={u.role}
                              onChange={(e) => changeRole(u._id, e.target.value)}
                            >
                              <option value="user">User</option>
                              <option value="agent">Agent</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              className={`btn btn-xs ${u.banned ? 'btn-success' : 'btn-error'}`}
                              onClick={() => toggleBan(u._id, u.banned)}
                            >
                              {u.banned ? 'Unban' : 'Ban'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'businesses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((biz) => (
                  <div key={biz._id} className="card bg-base-100 shadow-md">
                    <div className="card-body">
                      <h3 className="card-title">{biz.name}</h3>
                      <p className="text-sm text-base-content/60">{biz.industry || 'No industry'}</p>
                      <p className="text-sm">{biz.website || '—'}</p>
                      <div className="card-actions justify-end mt-2">
                        <button className="btn btn-primary btn-sm" onClick={() => setEditingBusiness(biz)}>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {businesses.length === 0 && (
                  <p className="text-base-content/40 col-span-full text-center py-10">No businesses found</p>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="stat bg-base-100 rounded-xl shadow-md">
                    <div className="stat-title">Total Messages</div>
                    <div className="stat-value text-primary">{analytics.totalMessages || 0}</div>
                  </div>
                  <div className="stat bg-base-100 rounded-xl shadow-md">
                    <div className="stat-title">Active Users</div>
                    <div className="stat-value text-secondary">{analytics.activeUsers || 0}</div>
                  </div>
                  <div className="stat bg-base-100 rounded-xl shadow-md">
                    <div className="stat-title">AI Interactions</div>
                    <div className="stat-value text-accent">{analytics.aiInteractions || 0}</div>
                  </div>
                  <div className="stat bg-base-100 rounded-xl shadow-md">
                    <div className="stat-title">Avg Response Time</div>
                    <div className="stat-value text-info">{analytics.avgResponseTime || '0s'}</div>
                  </div>
                </div>
                <div className="card bg-base-100 shadow-md">
                  <div className="card-body">
                    <h3 className="card-title">Usage Over Time</h3>
                    <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center text-base-content/40">
                      <FiBarChart2 className="w-12 h-12 mr-2" /> Chart placeholder
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="card bg-base-100 shadow-md">
                  <div className="card-body">
                    <h3 className="card-title mb-4">Service Status</h3>
                    <div className="space-y-3">
                      {systemServices.map((svc) => (
                        <div key={svc.name} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                          <span className="font-medium">{svc.name}</span>
                          {svc.status === 'online' ? (
                            <span className="badge badge-success gap-1"><FiCheck className="w-3 h-3" /> Online</span>
                          ) : (
                            <span className="badge badge-error gap-1"><FiX className="w-3 h-3" /> Offline</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card bg-base-100 shadow-md">
                  <div className="card-body">
                    <h3 className="card-title mb-4">API Keys</h3>
                    <div className="form-control mb-3">
                      <label className="label"><span className="label-text">OpenAI API Key</span></label>
                      <input type="password" className="input input-bordered" placeholder="sk-..." />
                    </div>
                    <div className="form-control mb-3">
                      <label className="label"><span className="label-text">Google API Key</span></label>
                      <input type="password" className="input input-bordered" placeholder="AIza..." />
                    </div>
                    <button className="btn btn-primary btn-sm self-start">Save Keys</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editingBusiness && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={() => setEditingBusiness(null)}>
              <FiX />
            </button>
            <h3 className="font-bold text-lg mb-4">Edit Business</h3>
            <form onSubmit={saveBusiness}>
              <div className="form-control mb-3">
                <label className="label"><span className="label-text">Name</span></label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editingBusiness.name || ''}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                />
              </div>
              <div className="form-control mb-3">
                <label className="label"><span className="label-text">Industry</span></label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editingBusiness.industry || ''}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, industry: e.target.value })}
                />
              </div>
              <div className="form-control mb-6">
                <label className="label"><span className="label-text">Website</span></label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={editingBusiness.website || ''}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, website: e.target.value })}
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setEditingBusiness(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
