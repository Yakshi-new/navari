import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders', {
        params: { page, limit: 10, ...(statusFilter && { status: statusFilter }) },
      });
      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'placed': return 'bg-info text-dark';
      case 'confirmed': return 'bg-warning text-dark';
      case 'processing': return 'bg-primary';
      case 'shipped': return 'bg-purple text-white';
      case 'delivered': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 bg-white rounded">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h3 className="h5 fw-bold mb-0">Manage Orders</h3>
        
        <div className="d-flex align-items-center gap-2">
          <label className="text-muted small text-nowrap">Filter Status:</label>
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Orders</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-crimson" role="status"></div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="small text-muted text-uppercase">
                  <th>Order No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id} style={{ fontSize: '0.88rem' }}>
                    <td className="fw-bold text-dark">{ord.orderNumber}</td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="fw-semibold d-block">{ord.user?.name || 'Guest'}</span>
                      <span className="small text-muted">{ord.user?.email}</span>
                    </td>
                    <td className="fw-bold text-crimson">₹{ord.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${ord.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning text-dark'} text-capitalize`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(ord.orderStatus)} text-capitalize`}>
                        {ord.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${ord._id}`} className="btn btn-sm btn-outline-dark">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <nav className="mt-4 d-flex justify-content-center">
              <ul className="pagination pagination-sm">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchOrders(pagination.page - 1)}>
                    Previous
                  </button>
                </li>
                {[...Array(pagination.pages)].map((_, i) => (
                  <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      style={pagination.page === i + 1 ? { backgroundColor: 'var(--clr-crimson)', borderColor: 'var(--clr-crimson)' } : {}}
                      onClick={() => fetchOrders(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchOrders(pagination.page + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;
