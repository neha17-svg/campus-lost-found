import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Home.css";

export default function Home() {
  const [stats, setStats] = useState({ lost: 0, found: 0, matched: 0 });

  useEffect(() => {
    // Fetch statistics
    fetch("http://localhost:5000/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ lost: 0, found: 0, matched: 0 }));
  }, []);

  return (
    <div className="home">
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="home-content">
        <div className="hero-section">
          <div className="hero-icon">🔍✨</div>
          <h1 className="hero-title">
            Lost & Found
            <span className="title-gradient"> Hub</span>
          </h1>
          <p className="hero-subtitle">
            Reuniting people with their precious belongings through technology
            and community
          </p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">😢</div>
            <div className="stat-number">{stats.lost}</div>
            <div className="stat-label">Lost Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✨</div>
            <div className="stat-number">{stats.found}</div>
            <div className="stat-label">Found Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎉</div>
            <div className="stat-number">{stats.matched}</div>
            <div className="stat-label">Reunited</div>
          </div>
        </div>

        <div className="action-cards">
          <Link to="/lost" className="action-card lost-card">
            <div className="card-icon">😢</div>
            <h3>Lost Something?</h3>
            <p>Report your lost item and we'll help you find it</p>
            <span className="card-arrow">→</span>
          </Link>

          <Link to="/found" className="action-card found-card">
            <div className="card-icon">✨</div>
            <h3>Found Something?</h3>
            <p>Help someone by reporting what you found</p>
            <span className="card-arrow">→</span>
          </Link>

          <Link to="/items" className="action-card view-card">
            <div className="card-icon">📋</div>
            <h3>Browse Items</h3>
            <p>Check if your item has been found</p>
            <span className="card-arrow">→</span>
          </Link>

          <Link to="/matches" className="action-card match-card">
            <div className="card-icon">🎯</div>
            <h3>Find Matches</h3>
            <p>AI-powered matching for lost & found items</p>
            <span className="card-arrow">→</span>
          </Link>
        </div>

        <div className="features">
          <h2>Why Choose Us?</h2>
          <div className="feature-grid">
            <div className="feature">
              <span className="feature-icon">🤖</span>
              <h4>Smart Matching</h4>
              <p>AI algorithms match lost and found items</p>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <h4>Instant Alerts</h4>
              <p>Get notified when potential matches are found</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <h4>Secure & Private</h4>
              <p>Your data is protected and confidential</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🌍</span>
              <h4>Community Driven</h4>
              <p>Join thousands helping each other</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
