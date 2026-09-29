import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaLeaf,
  FaSeedling,
  FaTree,
  FaArrowRight,
  FaMoneyBillWave,
  FaChartPie,
  FaBoxes,
  FaShieldAlt
} from "react-icons/fa";
const LandingPage = () => {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        maxWidth: '1300px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '2rem' }}></span>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary-color)' }}>
            FarmTrack
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span className="badge badge-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            Centralized Agricultural Financial Platform
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Manage Your Farm. Track Your Expenses. <span style={{ color: 'var(--primary-color)' }}>Grow Your Profit.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Eliminate manual spreadsheets. Track crop expenses, fertilizer & pesticide costs, labour charges, harvest yields, and real-time net profitability from a single unified dashboard.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Start Free Farm Account <FaArrowRight />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Demo Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '3rem' }}>
          Everything You Need to Run a Profitable Farm
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }}><FaTree /></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Multi-Farm Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Manage multiple land holdings, record soil types, area size, irrigation methods, and ownership structures easily.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }}><FaSeedling /></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Crop Cycle Tracking</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Track crops from sowing to harvest. Monitor varieties, seasonal schedules, expected yield, and actual production.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }}><FaMoneyBillWave /></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Granular Expense Logs</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Categorize spending across seeds, fertilizers, pesticides, labour, fuel, machinery, transportation, and land prep.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }}><FaChartPie /></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Profitability & ROI Engine</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Calculate net profit/loss and Return on Investment (ROI) for each individual crop automatically in real-time.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }}><FaBoxes /></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Smart Inventory Alerts</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Never run out of fertilizer or seeds. Automated low-stock, out-of-stock, and expiration date notifications.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }}><FaShieldAlt /></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Exportable Financial Reports</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Generate monthly summaries, crop profitability reports, and export clean CSV spreadsheets for accounting.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: '4rem 2rem', background: 'var(--bg-color)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2.5rem' }}>How FarmTrack Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', fontWeight: '800' }}>1</div>
              <h4 style={{ fontWeight: '700' }}>Create Farm</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Add farm name, location & area.</p>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', fontWeight: '800' }}>2</div>
              <h4 style={{ fontWeight: '700' }}>Add Crop</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Specify season, variety & sowing date.</p>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', fontWeight: '800' }}>3</div>
              <h4 style={{ fontWeight: '700' }}>Record Expenses</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Log seeds, fertilizers & labour costs.</p>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', fontWeight: '800' }}>4</div>
              <h4 style={{ fontWeight: '700' }}>Log Sales & Income</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Record crop sales & buyer receipts.</p>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', fontWeight: '800' }}>5</div>
              <h4 style={{ fontWeight: '700' }}>Analyze Profit</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>View ROI charts & harvest insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} Farmer Expense & Crop Tracker. Designed for Indian Farmers & Agri-Businesses.
      </footer>
    </div>
  );
};

export default LandingPage;
