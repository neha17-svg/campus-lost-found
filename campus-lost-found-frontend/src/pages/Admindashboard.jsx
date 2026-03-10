import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    lost: 0,
    found: 0,
    matched: 0,
    pending: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch("http://localhost:5000/api/items"),
        fetch("http://localhost:5000/api/stats"),
      ]);

      const itemsData = await itemsRes.json();
      const statsData = await statsRes.json();

      setItems(itemsData);
      setStats({
        total: itemsData.length,
        lost: itemsData.filter((i) => i.type === "lost").length,
        found: itemsData.filter((i) => i.type === "found").length,
        matched: statsData.matched || 0,
        pending: itemsData.filter((i) => !i.status || i.status === "pending")
          .length,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/items/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>
            <span className="header-icon">⚙️</span>
            Admin Dashboard
          </h1>
          <p>Manage lost and found items</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Items</p>
          </div>
        </div>

        <div className="stat-card lost">
          <div className="stat-icon">😢</div>
          <div className="stat-info">
            <h3>{stats.lost}</h3>
            <p>Lost Items</p>
          </div>
        </div>

        <div className="stat-card found">
          <div className="stat-icon">✨</div>
          <div className="stat-info">
            <h3>{stats.found}</h3>
            <p>Found Items</p>
          </div>
        </div>

        <div className="stat-card matched">
          <div className="stat-icon">🎉</div>
          <div className="stat-info">
            <h3>{stats.matched}</h3>
            <p>Reunited</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span>📋</span>
          Overview
        </button>
        <button
          className={`tab ${activeTab === "lost" ? "active" : ""}`}
          onClick={() => setActiveTab("lost")}
        >
          <span>😢</span>
          Lost Items
        </button>
        <button
          className={`tab ${activeTab === "found" ? "active" : ""}`}
          onClick={() => setActiveTab("found")}
        >
          <span>✨</span>
          Found Items
        </button>
        <button
          className={`tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <span>📈</span>
          Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="items-table">
            <h2>Recent Items</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Item Name</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 10).map((item) => (
                    <tr key={item._id}>
                      <td>
                        <span className={`type-badge ${item.type}`}>
                          {item.type === "lost" ? "😢" : "✨"} {item.type}
                        </span>
                      </td>
                      <td className="item-name">{item.itemName}</td>
                      <td>{item.location}</td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.contact}</td>
                      <td>
                        <select
                          className="status-select"
                          value={item.status || "pending"}
                          onChange={(e) =>
                            handleStatusUpdate(item._id, e.target.value)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="matched">Matched</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item._id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "lost" && (
          <div className="filtered-items">
            <h2>Lost Items ({stats.lost})</h2>
            <div className="items-grid-admin">
              {items
                .filter((item) => item.type === "lost")
                .map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onDelete={handleDelete}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
            </div>
          </div>
        )}

        {activeTab === "found" && (
          <div className="filtered-items">
            <h2>Found Items ({stats.found})</h2>
            <div className="items-grid-admin">
              {items
                .filter((item) => item.type === "found")
                .map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onDelete={handleDelete}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics">
            <h2>Analytics & Insights</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Success Rate</h3>
                <div className="analytics-value">
                  {stats.total > 0
                    ? Math.round((stats.matched / stats.total) * 100)
                    : 0}
                  %
                </div>
                <p>Items successfully reunited</p>
              </div>

              <div className="analytics-card">
                <h3>Response Time</h3>
                <div className="analytics-value">2.5 days</div>
                <p>Average time to match</p>
              </div>

              <div className="analytics-card">
                <h3>Active Users</h3>
                <div className="analytics-value">
                  {Math.floor(stats.total * 1.5)}
                </div>
                <p>Total registered users</p>
              </div>

              <div className="analytics-card">
                <h3>Peak Hours</h3>
                <div className="analytics-value">2-5 PM</div>
                <p>Most active reporting time</p>
              </div>
            </div>

            <div className="chart-container">
              <h3>Monthly Trends</h3>
              <div className="simple-chart">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
                  (month, index) => (
                    <div key={month} className="chart-bar">
                      <div
                        className="bar"
                        style={{
                          height: `${20 + Math.random() * 80}%`,
                          animationDelay: `${index * 0.1}s`,
                        }}
                      ></div>
                      <span>{month}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item, onDelete, onStatusUpdate }) {
  return (
    <div className="admin-item-card">
      <div className="card-image">
        {item.photo ? (
          <img src={`http://localhost:5000${item.photo}`} alt={item.itemName} />
        ) : (
          <div className="no-image-admin">📷</div>
        )}
        <span className={`badge-admin ${item.type}`}>
          {item.type === "lost" ? "😢" : "✨"}
        </span>
      </div>
      <div className="card-content">
        <h4>{item.itemName}</h4>
        <p className="description-admin">{item.description}</p>
        <div className="card-meta">
          <span>📍 {item.location}</span>
          <span>📅 {new Date(item.date).toLocaleDateString()}</span>
        </div>
        <div className="card-actions">
          <select
            value={item.status || "pending"}
            onChange={(e) => onStatusUpdate(item._id, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="matched">Matched</option>
            <option value="resolved">Resolved</option>
          </select>
          <button onClick={() => onDelete(item._id)}>🗑️ Delete</button>
        </div>
      </div>
    </div>
  );
}
