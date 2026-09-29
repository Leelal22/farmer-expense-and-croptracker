import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cropService } from '../services/cropService';
import ProfitCard from '../components/ProfitCard';
import ExpenseTable from '../components/ExpenseTable';
import IncomeTable from '../components/IncomeTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { FaArrowLeft, FaSeedling, FaCalendarAlt, FaChartPie, FaMoneyBillWave, FaCoins } from 'react-icons/fa';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#2e7d32', '#0284c7', '#d97706', '#dc2626', '#8b5cf6', '#ec4899'];

const CropDetails = () => {
  const { id } = useParams();
  const [profitability, setProfitability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCropDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await cropService.getCropProfitability(id);
      if (resp.success) {
        setProfitability(resp.data);
      }
    } catch (err) {
      setError('Failed to fetch crop detailed analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCropDetails();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading crop detailed dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCropDetails} />;
  if (!profitability) return null;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/crops" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <FaArrowLeft /> Back to Crops
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {profitability.crop_name} Details
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {profitability.farm_name} • {profitability.crop_variety || 'Standard Variety'}
            </p>
          </div>
          <span className="badge badge-success">{profitability.status}</span>
        </div>
      </div>

      {/* Financial & ROI Gauge Card */}
      <div style={{ marginBottom: '2rem' }}>
        <ProfitCard
          cropName={profitability.crop_name}
          farmName={profitability.farm_name}
          totalExpense={profitability.total_expense}
          totalIncome={profitability.total_income}
          profit={profitability.profit}
          roi={profitability.roi}
        />
      </div>

      {/* Grid for Overview and Expense Distribution Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Crop Cycle Specifications</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Farm Location:</span>
              <span style={{ fontWeight: '600' }}>{profitability.farm_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cultivated Area:</span>
              <span style={{ fontWeight: '600' }}>{profitability.area} {profitability.area_unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sowing Date:</span>
              <span style={{ fontWeight: '600' }}>{profitability.sowing_date || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Expected Harvest:</span>
              <span style={{ fontWeight: '600' }}>{profitability.expected_harvest_date || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expense Breakdown by Category</h3>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            {profitability.expense_breakdown && profitability.expense_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profitability.expense_breakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ category }) => category}
                  >
                    {profitability.expense_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No category expenses logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Income Sales History */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Crop Sales & Harvest Receipts</h3>
        </div>
        {profitability.incomes && profitability.incomes.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale Date</th>
                  <th>Buyer Name</th>
                  <th>Quantity</th>
                  <th>Price / Unit</th>
                  <th>Total Income</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {profitability.incomes.map((inc) => (
                  <tr key={inc.id}>
                    <td>{inc.sale_date}</td>
                    <td>{inc.buyer_name || '—'}</td>
                    <td>{inc.quantity} {inc.unit}</td>
                    <td>₹{inc.price_per_unit?.toLocaleString()}</td>
                    <td style={{ fontWeight: '700', color: 'var(--success-color)' }}>₹{inc.total_amount?.toLocaleString()}</td>
                    <td><span className="badge badge-success">{inc.payment_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No crop sales recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default CropDetails;
