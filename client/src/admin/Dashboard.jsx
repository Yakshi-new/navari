import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-crimson" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-danger">Failed to load statistics.</p>;

  // Prepare chart data
  const revenueChartData = stats.revenueByDay?.map((day) => ({
    name: day._id,
    revenue: day.revenue,
    orders: day.orders,
  })) || [];

  const pieColors = ['#C41E3A', '#C9963C', '#2D9CDB', '#27AE60', '#8E44AD', '#E67E22'];
  const statusData = stats.ordersByStatus?.map((status) => ({
    name: status._id.toUpperCase(),
    value: status.count,
  })) || [];

  return (
    <div>
      {/* STAT CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-card-title">Total Revenue</div>
            <div className="stat-card-value text-crimson">₹{stats.revenue?.total?.toLocaleString('en-IN') || 0}</div>
            <span className="text-muted small">Month: ₹{stats.revenue?.thisMonth?.toLocaleString('en-IN') || 0}</span>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-card-title">Total Orders</div>
            <div className="stat-card-value text-gold">{(stats.orders?.total || 0).toLocaleString()}</div>
            <span className="text-muted small">Pending: {stats.orders?.pending || 0} orders</span>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-card-title">Active Products</div>
            <div className="stat-card-value">{stats.products || 0}</div>
            <span className="text-muted small">In stock items</span>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-card-title">Customers</div>
            <div className="stat-card-value">{stats.users || 0}</div>
            <span className="text-muted small">Registered users</span>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="row g-4 mb-4">
        
        {/* Revenue Area Chart */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 bg-white rounded">
            <h3 className="h6 fw-bold mb-4">Revenue Trend (Last 7 Days)</h3>
            <div style={{ width: '100%', height: 300 }}>
              {revenueChartData.length === 0 ? (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted small">No recent sales data.</div>
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--clr-crimson)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--clr-crimson)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="var(--clr-crimson)" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-4 bg-white rounded h-100">
            <h3 className="h6 fw-bold mb-4">Order Statuses</h3>
            <div style={{ width: '100%', height: 300 }} className="d-flex align-items-center justify-content-center">
              {statusData.length === 0 ? (
                <div className="text-muted small">No orders recorded yet.</div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* TABLES */}
      <div className="row g-4">
        
        {/* Recent Orders */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-4 bg-white rounded">
            <h3 className="h6 fw-bold mb-3">Recent Orders</h3>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-muted text-uppercase">
                    <th>Order No</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders?.map((ord) => (
                    <tr key={ord._id} style={{ fontSize: '0.88rem' }}>
                      <td><Link to={`/admin/orders/${ord._id}`} className="text-crimson fw-bold text-decoration-none">{ord.orderNumber}</Link></td>
                      <td>{ord.user?.name || 'Guest'}</td>
                      <td>₹{ord.totalAmount?.toLocaleString('en-IN')}</td>
                      <td><span className="badge bg-secondary text-capitalize">{ord.orderStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-4 bg-white rounded">
            <h3 className="h6 fw-bold mb-3">Top Products</h3>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="small text-muted text-uppercase">
                    <th>Product</th>
                    <th>Price</th>
                    <th>Sold Count</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts?.map((prod) => (
                    <tr key={prod._id} style={{ fontSize: '0.88rem' }}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={prod.images[0]?.startsWith('http') ? prod.images[0] : `http://localhost:5000${prod.images[0]}`}
                            alt={prod.name}
                            style={{ width: '32px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '160px' }}>{prod.name}</span>
                        </div>
                      </td>
                      <td>₹{(prod.discountPrice > 0 ? prod.discountPrice : prod.price)?.toLocaleString('en-IN')}</td>
                      <td className="fw-bold">{prod.soldCount} sold</td>
                      <td><i className="bi bi-star-fill text-gold me-1"></i>{prod.ratingsAverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
