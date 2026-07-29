import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getImageUrl } from '../utils/imageUrl';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#38bdf8', '#a855f7', '#ef4444'];

const statusBadge = (status) => {
  const map = {
    placed: 'info', confirmed: 'warning', processing: 'accent',
    shipped: 'purple', delivered: 'success', cancelled: 'danger',
  };
  return map[status] || 'secondary';
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then(({ data }) => { if (data.success) setStats(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="crm-loading">
        <div className="crm-spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="crm-empty">
        <i className="bi bi-exclamation-circle"></i>
        <p>Failed to load dashboard statistics.</p>
      </div>
    );
  }

  const revenueData = stats.revenueByDay?.map((d) => ({
    name: d._id, revenue: d.revenue, orders: d.orders,
  })) || [];

  const statusData = stats.ordersByStatus?.map((s) => ({
    name: s._id.toUpperCase(), value: s.count,
  })) || [];

  return (
    <div>
      {/* Page Header */}
      <div className="crm-page-header">
        <div>
          <div className="crm-page-title">Dashboard</div>
          <div className="crm-page-sub">Live overview of your store performance</div>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
          <i className="bi bi-clock" style={{ marginRight: '5px' }}></i>
          Last updated just now
        </span>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        <div className="stat-card accent">
          <div className="stat-icon accent"><i className="bi bi-currency-rupee"></i></div>
          <div className="stat-value">₹{(stats.revenue?.total || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-sub">This month: ₹{(stats.revenue?.thisMonth || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning"><i className="bi bi-box-seam"></i></div>
          <div className="stat-value">{(stats.orders?.total || 0).toLocaleString()}</div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-sub">{stats.orders?.pending || 0} pending orders</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success"><i className="bi bi-bag-heart"></i></div>
          <div className="stat-value">{stats.products || 0}</div>
          <div className="stat-label">Active Products</div>
          <div className="stat-sub">Items currently in stock</div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon info"><i className="bi bi-people"></i></div>
          <div className="stat-value">{stats.users || 0}</div>
          <div className="stat-label">Customers</div>
          <div className="stat-sub">Registered accounts</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Revenue Chart */}
        <div className="crm-card">
          <div className="crm-card-header">
            <span className="crm-card-title">Revenue Trend — Last 7 Days</span>
          </div>
          <div className="crm-card-body" style={{ paddingTop: '12px' }}>
            {revenueData.length === 0 ? (
              <div className="crm-empty" style={{ minHeight: '220px' }}>
                <i className="bi bi-bar-chart"></i>
                <p>No sales data yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Status Pie */}
        <div className="crm-card">
          <div className="crm-card-header">
            <span className="crm-card-title">Order Status Breakdown</span>
          </div>
          <div className="crm-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {statusData.length === 0 ? (
              <div className="crm-empty">
                <i className="bi bi-pie-chart"></i>
                <p>No orders yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={72} dataKey="value" labelLine={false}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Orders */}
        <div className="crm-card">
          <div className="crm-card-header">
            <span className="crm-card-title">Recent Orders</span>
            <Link to="/orders" style={{ fontSize: '12px', color: 'var(--clr-accent)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <Link to={`/orders/${ord._id}`} style={{ color: 'var(--clr-accent)', fontWeight: 600, textDecoration: 'none' }}>
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--txt-secondary)' }}>{ord.user?.name || 'Guest'}</td>
                    <td style={{ fontWeight: 600 }}>₹{ord.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge-crm ${statusBadge(ord.orderStatus)}`} style={{ textTransform: 'capitalize' }}>
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="crm-card">
          <div className="crm-card-header">
            <span className="crm-card-title">Top Selling Products</span>
            <Link to="/products" style={{ fontSize: '12px', color: 'var(--clr-accent)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Sold</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts?.map((prod) => (
                  <tr key={prod._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={getImageUrl(prod.images?.[0])}
                          alt={prod.name}
                          style={{ width: '32px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <span style={{ fontSize: '12.5px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{(prod.discountPrice > 0 ? prod.discountPrice : prod.price)?.toLocaleString('en-IN')}</td>
                    <td><span className="badge-crm accent">{prod.soldCount}</span></td>
                    <td>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                        <i className="bi bi-star-fill" style={{ marginRight: '3px' }}></i>
                        {prod.ratingsAverage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
