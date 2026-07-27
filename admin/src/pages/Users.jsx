import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users', { params: { search } });
      if (data.success) setUsers(data.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const { data } = await API.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      if (data.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
        setUsers(users.map((u) => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      }
    } catch (err) { toast.error(err.message); }
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      const { data } = await API.put(`/admin/users/${userId}`, { role: newRole });
      if (data.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers(users.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Customers</div>
          <div className="crm-page-sub">{users.length} registered accounts</div>
        </div>
        <div className="crm-search">
          <i className="bi bi-search"></i>
          <input className="crm-input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="crm-card">
        {loading ? (
          <div className="crm-loading" style={{ minHeight: '300px' }}><div className="crm-spinner"></div></div>
        ) : users.length === 0 ? (
          <div className="crm-empty"><i className="bi bi-people"></i><p>No users found.</p></div>
        ) : (
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--txt-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--txt-muted)' }}>{u.phone || '—'}</td>
                    <td>
                      <button
                        className={`btn-crm btn-crm-sm ${u.role === 'admin' ? 'btn-crm-danger' : 'btn-crm-outline'}`}
                        onClick={() => toggleRole(u._id, u.role)}
                        title="Click to toggle role"
                      >
                        {u.role === 'admin' ? (
                          <><i className="bi bi-shield-fill"></i> Admin</>
                        ) : (
                          <><i className="bi bi-person"></i> Customer</>
                        )}
                      </button>
                    </td>
                    <td>
                      <span className={`badge-crm ${u.isActive ? 'success' : 'danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn-crm btn-crm-sm ${u.isActive ? 'btn-crm-danger' : 'btn-crm-success'}`}
                        onClick={() => toggleStatus(u._id, u.isActive)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
