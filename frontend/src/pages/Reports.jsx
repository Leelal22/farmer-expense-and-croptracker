import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { farmService } from '../services/farmService';
import { cropService } from '../services/cropService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { FaFileDownload, FaChartBar, FaFilter } from 'react-icons/fa';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('crop-profitability'); // crop-profitability, expenses, income, farm-performance, monthly-summary
  const [reportData, setReportData] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [farmFilter, setFarmFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchFilters = async () => {
    try {
      const [fRes, cRes] = await Promise.all([farmService.getFarms(), cropService.getCrops()]);
      if (fRes.success) setFarms(fRes.data);
      if (cRes.success) setCrops(cRes.data);
    } catch (e) {
      console.warn('Filter fetch error:', e);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (farmFilter) params.farm_id = farmFilter;
      if (cropFilter) params.crop_id = cropFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      let res;
      if (activeTab === 'crop-profitability') {
        res = await reportService.getCropProfitabilityReport(params);
      } else if (activeTab === 'expenses') {
        res = await reportService.getExpenseReport(params);
      } else if (activeTab === 'income') {
        res = await reportService.getIncomeReport(params);
      } else if (activeTab === 'farm-performance') {
        res = await reportService.getFarmPerformanceReport(params);
      } else if (activeTab === 'monthly-summary') {
        res = await reportService.getMonthlySummaryReport();
      }

      if (res && res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      setError('Failed to generate financial report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [activeTab, farmFilter, cropFilter, startDate, endDate]);

  const handleExportCSV = async () => {
    const params = {};
    if (farmFilter) params.farm_id = farmFilter;
    if (cropFilter) params.crop_id = cropFilter;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    await reportService.exportCSV(activeTab, params, `${activeTab}_report.csv`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Financial & Farm Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Generate crop profitability analytics, expense logs, and export CSV spreadsheets
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-primary">
          <FaFileDownload /> Export CSV Report
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-color)', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { key: 'crop-profitability', label: 'Crop Profitability' },
          { key: 'expenses', label: 'Expense Audit Log' },
          { key: 'income', label: 'Income Sales Report' },
          { key: 'farm-performance', label: 'Farm Performance' },
          { key: 'monthly-summary', label: 'Monthly Summary' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: activeTab === tab.key ? '700' : '500',
              fontSize: '0.9rem',
              color: activeTab === tab.key ? 'var(--primary-color)' : 'var(--text-muted)',
              background: activeTab === tab.key ? 'var(--primary-light)' : 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Options Bar */}
      {activeTab !== 'monthly-summary' && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              <FaFilter /> Filters:
            </div>
            <select className="form-select" value={farmFilter} onChange={(e) => setFarmFilter(e.target.value)} style={{ width: '180px' }}>
              <option value="">All Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.farm_name}</option>
              ))}
            </select>
            <select className="form-select" value={cropFilter} onChange={(e) => setCropFilter(e.target.value)} style={{ width: '180px' }}>
              <option value="">All Crops</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>{c.crop_name}</option>
              ))}
            </select>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '160px' }}
            />
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '160px' }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Generating financial report..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchReport} />
      ) : (
        <div className="table-container">
          {activeTab === 'crop-profitability' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Variety</th>
                  <th>Farm</th>
                  <th>Status</th>
                  <th>Total Expense</th>
                  <th>Total Income</th>
                  <th>Net Profit</th>
                  <th>ROI (%)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700' }}>{row.crop}</td>
                    <td>{row.variety || 'Standard'}</td>
                    <td>{row.farm}</td>
                    <td><span className="badge badge-info">{row.status}</span></td>
                    <td style={{ color: 'var(--danger-color)', fontWeight: '600' }}>₹{row.expense?.toLocaleString()}</td>
                    <td style={{ color: 'var(--success-color)', fontWeight: '600' }}>₹{row.income?.toLocaleString()}</td>
                    <td style={{ fontWeight: '700', color: row.profit >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      ₹{row.profit?.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge badge-${row.roi >= 0 ? 'success' : 'danger'}`}>
                        {row.roi}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'expenses' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Farm</th>
                  <th>Crop</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.expense_date}</td>
                    <td>{row.farm_name}</td>
                    <td>{row.crop_name}</td>
                    <td><span className="badge badge-info">{row.category}</span></td>
                    <td>{row.vendor || '—'}</td>
                    <td style={{ fontWeight: '700', color: 'var(--danger-color)' }}>₹{row.amount?.toLocaleString()}</td>
                    <td>{row.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'income' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Farm</th>
                  <th>Crop</th>
                  <th>Buyer</th>
                  <th>Quantity</th>
                  <th>Price / Unit</th>
                  <th>Total Income</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.sale_date}</td>
                    <td>{row.farm_name}</td>
                    <td>{row.crop_name}</td>
                    <td>{row.buyer_name || '—'}</td>
                    <td>{row.quantity} {row.unit}</td>
                    <td>₹{row.price_per_unit?.toLocaleString()}</td>
                    <td style={{ fontWeight: '700', color: 'var(--success-color)' }}>₹{row.total_amount?.toLocaleString()}</td>
                    <td><span className="badge badge-success">{row.payment_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'farm-performance' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Farm Name</th>
                  <th>Location</th>
                  <th>Total Area</th>
                  <th>Crops Count</th>
                  <th>Total Expenses</th>
                  <th>Total Income</th>
                  <th>Net Profit</th>
                  <th>ROI (%)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row) => (
                  <tr key={row.farm_id}>
                    <td style={{ fontWeight: '700' }}>{row.farm_name}</td>
                    <td>{row.location}</td>
                    <td>{row.total_area} acres</td>
                    <td>{row.crop_count}</td>
                    <td style={{ color: 'var(--danger-color)', fontWeight: '600' }}>₹{row.total_expense?.toLocaleString()}</td>
                    <td style={{ color: 'var(--success-color)', fontWeight: '600' }}>₹{row.total_income?.toLocaleString()}</td>
                    <td style={{ fontWeight: '700', color: row.profit >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      ₹{row.profit?.toLocaleString()}
                    </td>
                    <td><span className="badge badge-success">{row.roi}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'monthly-summary' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Monthly Expenses</th>
                  <th>Monthly Income</th>
                  <th>Net Monthly Profit</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700' }}>{row.month}</td>
                    <td style={{ color: 'var(--danger-color)', fontWeight: '600' }}>₹{row.expense?.toLocaleString()}</td>
                    <td style={{ color: 'var(--success-color)', fontWeight: '600' }}>₹{row.income?.toLocaleString()}</td>
                    <td style={{ fontWeight: '700', color: row.profit >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      ₹{row.profit?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
