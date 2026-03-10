import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ViewItems.css";

export default function ViewItems() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("https://campus-lost-found-jnqg.onrender.com/api/items");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Loaded ${data.length} items`);
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError(
        "Failed to load items. Please check if the backend server is running.",
      );
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter;
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Failed to Load Items</h2>
        <p>{error}</p>
        <button onClick={fetchItems} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="view-items-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">📋</span>
            Browse All Items
          </h1>
          <p>Search through lost and found items</p>
        </div>

        <div className="stats-mini">
          <div className="stat-mini">
            <span className="stat-icon">😢</span>
            <div>
              <strong>{items.filter((i) => i.type === "lost").length}</strong>
              <p>Lost</p>
            </div>
          </div>
          <div className="stat-mini">
            <span className="stat-icon">✨</span>
            <div>
              <strong>{items.filter((i) => i.type === "found").length}</strong>
              <p>Found</p>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by item name, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <span>📋</span>
            All Items ({items.length})
          </button>
          <button
            className={`filter-btn lost ${filter === "lost" ? "active" : ""}`}
            onClick={() => setFilter("lost")}
          >
            <span>😢</span>
            Lost Only ({items.filter((i) => i.type === "lost").length})
          </button>
          <button
            className={`filter-btn found ${filter === "found" ? "active" : ""}`}
            onClick={() => setFilter("found")}
          >
            <span>✨</span>
            Found Only ({items.filter((i) => i.type === "found").length})
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="no-items">
          <div className="no-items-icon">🔍</div>
          <h3>No items found</h3>
          <p>
            {searchQuery
              ? "Try adjusting your search or filter criteria"
              : "No items have been reported yet"}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="clear-filters-btn"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="results-info">
            <p>
              Showing <strong>{filteredItems.length}</strong>{" "}
              {filteredItems.length === 1 ? "item" : "items"}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          <div className="items-grid">
            {filteredItems.map((item, index) => (
              <Link
                to={`/item/${item._id}`}
                key={item._id}
                className="item-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="card-image">
                  {item.photo ? (
                    <img
                     src={`https://campus-lost-found-jnqg.onrender.com${item.photo}`}
                      alt={item.itemName}
                      onError={(e) => {
                        console.error("Image failed to load:", item.photo);
                        e.target.style.display = "none";
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : (
                    <div className="no-image">
                      <span>📷</span>
                      <p>No Image</p>
                    </div>
                  )}
                  <span className={`type-badge ${item.type}`}>
                    {item.type === "lost" ? "😢" : "✨"}
                  </span>
                  {item.status === "matched" && (
                    <span className="matched-indicator">✅</span>
                  )}
                </div>

                <div className="card-body">
                  <h3>{item.itemName}</h3>
                  <p className="description">{item.description}</p>

                  <div className="card-details">
                    <div className="detail-item">
                      <span className="icon">📍</span>
                      <span>{item.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">📅</span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {item.status === "matched" && (
                    <div className="status-indicator">
                      <span>✅ Matched</span>
                    </div>
                  )}

                  <div className="card-footer">
                    <span className="view-details">
                      View Details <span className="arrow">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
