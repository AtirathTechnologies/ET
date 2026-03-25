// src/components/TransportPage.jsx
import React, { useState } from 'react';
import { Truck, MapPin, ArrowLeft, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { transportData } from '../data/ProductData';

const TransportPage = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState(null);

  const handleStateSelect = (state) => {
    setSelectedState(state);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (selectedState) {
      setSelectedState(null);
    } else {
      navigate(-1);
    }
  };

  const displayPrice = (price) => `₹ ${price}`;

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=600&auto=format';

  return (
    <div className="transport-page">
      <div className="container">
        {/* Back button – now in normal flow */}
        <div className="top-bar">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="header">
          <div className="header-content">
            <Truck className="truck-icon" size={48} />
            <h1>Transportation Pricing</h1>
          </div>
          <p className="subtitle">Competitive freight rates across all major states and ports in India</p>
        </div>

        {!selectedState ? (
          <div className="states-grid">
            {Object.entries(transportData).map(([key, state]) => (
              <div key={key} className="state-card" onClick={() => handleStateSelect(key)}>
                <div className="card-image">
                  <img
                    src={state.icon}
                    alt={state.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="card-overlay">
                    <h3>{state.name}</h3>
                    <p>{state.destinations.length} destination{state.destinations.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="details-view">
            <div className="state-header">
              <div className="state-avatar">
                <img
                  src={transportData[selectedState].icon}
                  alt={transportData[selectedState].name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
              <div>
                <h2>{transportData[selectedState].name}</h2>
                <p>Transportation Routes & Pricing</p>
              </div>
              <button className="back-to-states" onClick={() => setSelectedState(null)}>
                Back to States
              </button>
            </div>

            <div className="destinations-grid">
              {transportData[selectedState].destinations.map((dest, idx) => (
                <div key={idx} className="destination-card">
                  <div className="destination-header">
                    <Package size={20} className="destination-icon" />
                    <h3>{dest.port || dest.location}</h3>
                  </div>
                  <div className="price-item">
                    <span className="price-label kg-label">Price per kg:</span>
                    <span className="price-value kg-price">{displayPrice(dest.prices.kg)}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label liter-label">Price per liter:</span>
                    <span className="price-value liter-price">{displayPrice(dest.prices.liter)}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label piece-label">Price per piece:</span>
                    <span className="price-value piece-price">{displayPrice(dest.prices.piece)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="info-footer">
              <MapPin size={20} />
              <div>
                <h6>Pricing Information</h6>
                <p>
                  • <strong className="kg-text">Green prices</strong> indicate per kilogram rates<br />
                  • <strong className="liter-text">Blue prices</strong> indicate per liter rates<br />
                  • <strong className="piece-text">Yellow prices</strong> indicate per piece rates<br />
                  • Minimum charges may apply<br />
                  • Contact us for bulk shipments and special discounts<br />
                  • Prices subject to change based on fuel costs and market conditions<br />
                  • Rates include basic transportation charges
                </p>
                <div className="button-group">
                  <button className="btn-primary">Get Custom Quote for Bulk Orders</button>
                  <button className="btn-outline">Contact for Special Product Rates</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .transport-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a, #1e293b, #2d3a4e);
          padding-top: 20px;
          font-family: 'Inter', sans-serif;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .top-bar {
          margin-bottom: 20px;
        }
        .back-button {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          padding: 8px 18px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-weight: 500;
          transition: all 0.3s;
          cursor: pointer;
        }
        .back-button:hover {
          background: #00F5C8;
          color: #0f172a;
          transform: translateX(-5px);
        }

        .header {
          text-align: center;
          margin-bottom: 48px;
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .truck-icon {
          color: #00F5C8;
        }
        .header h1 {
          font-size: 2.8rem;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 800px;
          margin: 0 auto;
        }

        .states-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .states-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .states-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .header h1 {
            font-size: 2rem;
          }
          .truck-icon {
            width: 36px;
            height: 36px;
          }
        }
        @media (max-width: 480px) {
          .states-grid {
            grid-template-columns: 1fr;
          }
        }

        .state-card {
          cursor: pointer;
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        .state-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(0, 245, 200, 0.3);
        }
        .card-image {
          position: relative;
          height: 240px;
          overflow: hidden;
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .state-card:hover .card-image img {
          transform: scale(1.05);
        }
        .card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2));
          padding: 20px 15px 15px;
          text-align: center;
        }
        .card-overlay h3 {
          color: white;
          font-size: 1.4rem;
          font-weight: bold;
          margin-bottom: 4px;
          text-shadow: 0 1px 2px black;
        }
        .card-overlay p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin: 0;
        }

        .state-header {
          display: flex;
          align-items: center;
          gap: 20px;
          background: rgba(25, 35, 56, 0.9);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          padding: 24px 32px;
          margin-bottom: 32px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-wrap: wrap;
        }
        .state-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #00F5C8;
          box-shadow: 0 0 12px rgba(0,245,200,0.5);
        }
        .state-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .state-header h2 {
          color: white;
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
        }
        .state-header p {
          color: #cbd5e1;
          margin: 4px 0 0;
        }
        .back-to-states {
          margin-left: auto;
          background: transparent;
          border: 1px solid #00F5C8;
          color: #00F5C8;
          padding: 8px 20px;
          border-radius: 40px;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }
        .back-to-states:hover {
          background: #00F5C8;
          color: #0f172a;
        }

        .destinations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .destination-card {
          background: rgba(25, 35, 56, 0.7);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .destination-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          border-color: rgba(0,245,200,0.3);
        }
        .destination-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .destination-icon {
          color: #00F5C8;
        }
        .destination-header h3 {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
        }
        .price-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 12px 0;
        }
        .price-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }
        .kg-label {
          color: #10b981;
        }
        .liter-label {
          color: #3b82f6;
        }
        .piece-label {
          color: #f59e0b;
        }
        .price-value {
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }
        .kg-price {
          color: #10b981;
        }
        .liter-price {
          color: #3b82f6;
        }
        .piece-price {
          color: #f59e0b;
        }

        .info-footer {
          background: rgba(0, 245, 200, 0.05);
          border: 1px solid rgba(0, 245, 200, 0.2);
          border-radius: 20px;
          padding: 20px 24px;
          display: flex;
          gap: 16px;
        }
        .info-footer svg {
          color: #00F5C8;
          flex-shrink: 0;
        }
        .info-footer h6 {
          color: #00F5C8;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .info-footer p {
          color: #cbd5e1;
          font-size: 0.85rem;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }
        .kg-text {
          color: #10b981;
        }
        .liter-text {
          color: #3b82f6;
        }
        .piece-text {
          color: #f59e0b;
        }
        .button-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-primary {
          background: transparent;
          border: 1px solid #00F5C8;
          color: #00F5C8;
          padding: 8px 20px;
          border-radius: 40px;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: #00F5C8;
          color: #0f172a;
        }
        .btn-outline {
          background: transparent;
          border: 1px solid #00F5C8;
          color: #00F5C8;
          padding: 8px 20px;
          border-radius: 40px;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }
        .btn-outline:hover {
          background: #00F5C8;
          color: #0f172a;
        }

        @media (max-width: 768px) {
          .back-button {
            padding: 6px 12px;
          }
          .state-header {
            flex-direction: column;
            align-items: flex-start;
            text-align: center;
          }
          .back-to-states {
            margin-left: 0;
            align-self: center;
          }
          .destinations-grid {
            grid-template-columns: 1fr;
          }
          .info-footer {
            flex-direction: column;
          }
          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default TransportPage;