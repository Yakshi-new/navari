import React, { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users', { params: { search } });
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const { data } = await API.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      if (data.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
        setUsers(users.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u)));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Are you sure you want to change user role to ${newRole}?`)) return;
    try {
      const { data } = await API.put(`/admin/users/${userId}`, { role: newRole });
      if (data.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 bg-white rounded">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h3 className="h5 fw-bold mb-0">Manage Customers</h3>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search by name/email..."
          style={{ maxWidth: '280px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-crimson" role="status"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="small text-muted text-uppercase">
                <th>User Details</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ fontSize: '0.88rem' }}>
                  <td>
                    <div>
                      <span className="fw-semibold text-dark d-block">{u.name}</span>
                      <span className="small text-muted">{u.email}</span>
                    </div>
                  </td>
                  <td>{u.phone || '-'}</td>
                  <td>
                    <button className={`btn btn-sm ${u.role === 'admin' ? 'btn-danger' : 'btn-outline-dark'}`} style={{ fontSize: '0.78rem' }} onClick={() => handleRoleToggle(u._id, u.role)}>
                      {u.role.toUpperCase()}
                    </button>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => handleStatusToggle(u._id, u.isActive)}>
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
  );
};

export default AdminUsers;
