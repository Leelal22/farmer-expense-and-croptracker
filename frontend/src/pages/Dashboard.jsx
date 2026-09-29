import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FaTree, FaSeedling, FaMoneyBillWave, FaCoins, FaChartLine, FaTasks, FaBoxes, FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const COLORS = ['#2e7d32', '#0284c7', '#d97706', '#dc2626', '#8b5cf6', '#ec4899', '#14b8a6'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyFinancials, setMonthlyFinancials] = useState([]);
  const [cropPerformance, setCropPerformance] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [cropStatus, setCropStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, monthRes, perfRes, catRes, statusRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getMonthlyFinancials(),
        dashboardService.getCropPerformance(),
        dashboardService.getExpenseCategories(),
        dashboardService.getCropStatusDistribution()
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (monthRes.success) setMonthlyFinancials(monthRes.data);
      if (perfRes.success) setCropPerformance(perfRes.data);
      if (catRes.success) setExpenseCategories(catRes.data);
      if (statusRes.success) setCropStatus(statusRes.data);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading farm analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  const isProfitable = (summary?.total_profit || 0) >= 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Farm Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time farm financial summary, crop analytics & activities
          </p>
        </div>
        <Link to="/crops" className="btn btn-primary">
          + Manage Crops
        </Link>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="dashboard-grid">
        <DashboardCard
          title="Total Farms"
          value={summary?.total_farms || 0}
          icon={<FaTree />}
          color="#0284c7"
        />
        <DashboardCard
          title="Active Crops"
          value={summary?.active_crops || 0}
          icon={<FaSeedling />}
          color="#2e7d32"
        />
        <DashboardCard
          title="Total Expenses"
          value={`₹${(summary?.total_expenses || 0).toLocaleString()}`}
          icon={<FaMoneyBillWave />}
          color="#dc2626"
        />
        <DashboardCard
          title="Total Income"
          value={`₹${(summary?.total_income || 0).toLocaleString()}`}
          icon={<FaCoins />}
          color="#16a34a"
        />
        <DashboardCard
          title="Total Net Profit"
          value={`₹${(summary?.total_profit || 0).toLocaleString()}`}
          icon={<FaChartLine />}
          color={isProfitable ? '#16a34a' : '#dc2626'}
          subtitle={`Avg ROI: ${summary?.average_roi || 0}%`}
        />
        <DashboardCard
          title="Pending Tasks"
          value={summary?.pending_activities || 0}
          icon={<FaTasks />}
          color="#d97706"
        />
        <DashboardCard
          title="Low Stock Alerts"
          value={summary?.low_stock_items || 0}
          icon={<FaBoxes />}
          color="#dc2626"
        />
      </div>

      {/* Main Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Monthly Financial Trend Line/Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Financial Breakdown</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {monthlyFinancials.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFinancials}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No monthly data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Crop Financial Performance Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Crop Financial Performance</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {cropPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="crop_name" type="category" width={90} />
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="total_income" name="Income" fill="#16a34a" />
                  <Bar dataKey="total_expense" name="Expense" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No crop data available.
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Expense Category Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expense Category Distribution</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            {expenseCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No expense category records.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Activities Widget */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Tasks & Activities</h3>
            <Link to="/activities" style={{ fontSize: '0.85rem', fontWeight: '600' }}>View All</Link>
          </div>
          <div>
            {summary?.upcoming_activities && summary.upcoming_activities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {summary.upcoming_activities.map((act) => (
                  <div key={act.id} style={{
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: act.status === 'OVERDUE' ? 'var(--danger-bg)' : '#f8fafc'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{act.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {act.crop_name} • {act.activity_date}
                      </div>
                    </div>
                    <span className={`badge badge-${act.status === 'OVERDUE' ? 'danger' : 'warning'}`}>
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending tasks scheduled.</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts Widget */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Low Stock Alerts</h3>
            <Link to="/inventory" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Manage Stock</Link>
          </div>
          <div>
            {summary?.low_stock_alerts && summary.low_stock_alerts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {summary.low_stock_alerts.map((inv) => (
                  <div key={inv.id} style={{
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{inv.item_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        In Stock: {inv.quantity} {inv.unit} (Min: {inv.minimum_stock})
                      </div>
                    </div>
                    <span className="badge badge-danger">{inv.stock_status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All inventory items are well-stocked.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
