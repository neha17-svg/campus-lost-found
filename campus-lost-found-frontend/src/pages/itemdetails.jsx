import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ItemDetails.css";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching item details for ID:", id);

      const response = await fetch(`https://campus-lost-found-jnqg.onrender.com/api/items/${id}`);

      console.log("Response status:", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Item not found");
        } else if (response.status === 400) {
          setError("Invalid item ID");
        } else {
          setError("Failed to load item details");
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Item data received:", data);
      setItem(data);

      // Fetch similar items
      try {
        const allItemsResponse = await fetch("https://campus-lost-found-jnqg.onrender.com/api/items");

        if (allItemsResponse.ok) {
          const allItems = await allItemsResponse.json();

          const similar = allItems
            .filter(
              (i) =>
                i._id !== id &&
                i.type !== data.type &&
                i.status !== "matched" &&
                (i.itemName
                  .toLowerCase()
                  .includes(data.itemName.toLowerCase()) ||
                  i.location
                    .toLowerCase()
                    .includes(data.location.toLowerCase())),
            )
            .slice(0, 3);

          setSimilarItems(similar);
        }
      } catch (err) {
        console.error("Error fetching similar items:", err);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching item details:", error);
      setError("Network error. Please check if the backend server is running.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="error-container">
        <div className="error-icon">😢</div>
        <h2>{error || "Item not found"}</h2>
        <p>The item you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate("/items")}
          className="back-to-items-btn"
        >
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="item-details-page">
      <button className="back-btn" onClick={() => navigate("/items")}>
        <span>←</span> Back to Items
      </button>

      <div className="details-container">
        <div className="details-card">
          <div className="image-section">
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
            ) : null}
            {(!item.photo || !item.photo.trim()) && (
              <div className="no-image-detail">
                <span>📷</span>
                <p>No image available</p>
              </div>
            )}
            <span className={`type-badge-large ${item.type}`}>
              {item.type === "lost" ? "😢 Lost Item" : "✨ Found Item"}
            </span>
            {item.status === "matched" && (
              <span className="matched-badge">✅ Matched</span>
            )}
          </div>

          <div className="info-section">
            <h1>{item.itemName}</h1>

            <div className="detail-row">
              <div className="detail-label">
                <span className="icon">📝</span>
                Description
              </div>
              <div className="detail-value">{item.description}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">
                <span className="icon">📍</span>
                Location
              </div>
              <div className="detail-value">{item.location}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">
                <span className="icon">📅</span>
                Date
              </div>
              <div className="detail-value">
                {new Date(item.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">
                <span className="icon">📞</span>
                Contact
              </div>
              <div className="detail-value">
                {showContact ? (
                  <span className="contact-number">{item.contact}</span>
                ) : (
                  <button
                    className="reveal-btn"
                    onClick={() => setShowContact(true)}
                  >
                    <span>👁️</span> Reveal Contact
                  </button>
                )}
              </div>
            </div>

            {item.status && (
              <div className="detail-row">
                <div className="detail-label">
                  <span className="icon">🏷️</span>
                  Status
                </div>
                <div className="detail-value">
                  <span className={`status-badge ${item.status}`}>
                    {item.status === "matched" ? "✅ Matched" : "⏳ Pending"}
                  </span>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button
                className="primary-action-btn"
                onClick={() => {
                  setShowContact(true);
                  window.location.href = `tel:${item.contact}`;
                }}
              >
                <span>💬</span>
                Contact Owner
              </button>
              <button
                className="secondary-action-btn"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
              >
                <span>🔗</span>
                Share Item
              </button>
            </div>
          </div>
        </div>

        {similarItems.length > 0 && (
          <div className="similar-items">
            <h2>
              <span>🎯</span>
              Possible Matches
            </h2>
            <p className="similar-subtitle">
              These items might be related to what you're looking for
            </p>
            <div className="similar-grid">
              {similarItems.map((similar) => (
                <div
                  key={similar._id}
                  className="similar-card"
                  onClick={() => {
                    navigate(`/item/${similar._id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <div className="similar-image">
                    {similar.photo ? (
                      <img
                       src={`https://campus-lost-found-jnqg.onrender.com${similar.photo}`}
                        alt={similar.itemName}
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : (
                      <div className="similar-no-image">📷</div>
                    )}
                    <span className={`similar-badge ${similar.type}`}>
                      {similar.type === "lost" ? "😢" : "✨"}
                    </span>
                  </div>
                  <div className="similar-info">
                    <h4>{similar.itemName}</h4>
                    <p>{similar.location}</p>
                    <span className="view-link">View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
