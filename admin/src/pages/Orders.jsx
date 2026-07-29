import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  placed:           { cls: 'info',     label: 'Placed' },
  confirmed:        { cls: 'warning',  label: 'Confirmed' },
  processing:       { cls: 'accent',   label: 'Processing' },
  shipped:          { cls: 'purple',   label: 'Shipped' },
  out_for_delivery: { cls: 'warning',  label: 'Out for Delivery' },
  delivered:        { cls: 'success',  label: 'Delivered' },
  cancelled:        { cls: 'danger',   label: 'Cancelled' },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders', {
        params: { page, limit: 12, ...(statusFilter && { status: statusFilter }) },
      });
      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      }
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(1); }, [statusFilter]);

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Orders</div>
          <div className="crm-page-sub">{pagination.total} total orders</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '12px', color: 'var(--txt-muted)', whiteSpace: 'nowrap' }}>Filter:</label>
          <select className="crm-select" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Orders</option>
            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="crm-card">
        {loading ? (
          <div className="crm-loading" style={{ minHeight: '300px' }}><div className="crm-spinner"></div></div>
        ) : orders.length === 0 ? (
          <div className="crm-empty">
            <i className="bi bi-inbox"></i>
            <p>No orders found.</p>
          </div>
        ) : (
          <>
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Tracking</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => {
                    const st = STATUS_MAP[ord.orderStatus] || { cls: 'secondary', label: ord.orderStatus };
                    return (
                      <tr key={ord._id}>
                        <td style={{ fontWeight: 700 }}>{ord.orderNumber}</td>
                        <td style={{ color: 'var(--txt-muted)', fontSize: '12.5px' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{ord.user?.name || 'Guest'}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--txt-muted)' }}>{ord.user?.email}</div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--clr-accent)' }}>
                          ₹{ord.totalAmount?.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className={`badge-crm ${ord.paymentStatus === 'paid' ? 'success' : 'warning'}`} style={{ textTransform: 'capitalize' }}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td>
                          {ord.trackingNumber ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {ord.courierName && (
                                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{ord.courierName}</span>
                              )}
                              {ord.courierTrackingUrl ? (
                                <a href={ord.courierTrackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-accent)', textDecoration: 'none' }}>
                                  {ord.trackingNumber} ↗
                                </a>
                              ) : (
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>{ord.trackingNumber}</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--txt-muted)', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge-crm ${st.cls}`}>{st.label}</span>
                        </td>
                        <td>
                          <Link to={`/orders/${ord._id}`} className="btn-crm btn-crm-outline btn-crm-sm">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="crm-pagination">
                <button className="crm-page-btn" disabled={pagination.page === 1} onClick={() => fetchOrders(pagination.page - 1)}>
                  <i className="bi bi-chevron-left"></i>
                </button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button key={i} className={`crm-page-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => fetchOrders(i + 1)}>{i + 1}</button>
                ))}
                <button className="crm-page-btn" disabled={pagination.page === pagination.pages} onClick={() => fetchOrders(pagination.page + 1)}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
