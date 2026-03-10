import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MatchingItems.css";

export default function MatchingItems() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    findMatches();
  }, []);

  const findMatches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/items");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const items = await response.json();

      // IMPROVED MATCHING ALGORITHM
      const potentialMatches = [];

      const lostItems = items.filter(
        (item) => item.type === "lost" && item.status !== "matched",
      );
      const foundItems = items.filter(
        (item) => item.type === "found" && item.status !== "matched",
      );

      lostItems.forEach((lost) => {
        foundItems.forEach((found) => {
          // Calculate name similarity
          const nameMatch = calculateAdvancedSimilarity(
            lost.itemName.toLowerCase(),
            found.itemName.toLowerCase(),
          );

          // Calculate location similarity
          const locationMatch = calculateAdvancedSimilarity(
            lost.location.toLowerCase(),
            found.location.toLowerCase(),
          );

          // Calculate date proximity (within 30 days is better)
          const dateProximity = calculateDateProximity(lost.date, found.date);

          // Calculate description similarity
          const descMatch = calculateAdvancedSimilarity(
            lost.description.toLowerCase(),
            found.description.toLowerCase(),
          );

          // IMPROVED WEIGHTED SCORING
          // Name is most important (40%), location (25%), description (20%), date (15%)
          const matchScore =
            nameMatch * 0.4 +
            locationMatch * 0.25 +
            descMatch * 0.2 +
            dateProximity * 0.15;

          // Only show matches with reasonable confidence (>40%)
          if (matchScore > 0.4) {
            // Determine confidence level based on stricter criteria
            let confidence;
            if (matchScore > 0.75 && nameMatch > 0.7) {
              confidence = "high";
            } else if (matchScore > 0.55) {
              confidence = "medium";
            } else {
              confidence = "low";
            }

            potentialMatches.push({
              id: `${lost._id}-${found._id}`,
              lostItem: lost,
              foundItem: found,
              matchScore: Math.round(matchScore * 100),
              confidence: confidence,
              details: {
                nameMatch: Math.round(nameMatch * 100),
                locationMatch: Math.round(locationMatch * 100),
                descMatch: Math.round(descMatch * 100),
                dateProximity: Math.round(dateProximity * 100),
              },
            });
          }
        });
      });

      // Sort by match score
      potentialMatches.sort((a, b) => b.matchScore - a.matchScore);
      setMatches(potentialMatches);
      setLoading(false);
    } catch (error) {
      console.error("Error finding matches:", error);
      alert(
        "Failed to load matches. Please check if the backend server is running.",
      );
      setLoading(false);
    }
  };

  // IMPROVED SIMILARITY CALCULATION
  const calculateAdvancedSimilarity = (str1, str2) => {
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
    ];

    const words1 = str1
      .split(" ")
      .filter((w) => !commonWords.includes(w) && w.length > 2);
    const words2 = str2
      .split(" ")
      .filter((w) => !commonWords.includes(w) && w.length > 2);

    if (words1.length === 0 || words2.length === 0) return 0;

    let matches = 0;
    let partialMatches = 0;

    words1.forEach((word1) => {
      words2.forEach((word2) => {
        if (word1 === word2) {
          matches += 1;
        } else if (word1.includes(word2) || word2.includes(word1)) {
          partialMatches += 0.5;
        } else if (areSimilar(word1, word2)) {
          partialMatches += 0.3;
        }
      });
    });

    const totalMatches = matches + partialMatches;
    const maxPossible = Math.max(words1.length, words2.length);

    return totalMatches / maxPossible;
  };

  const areSimilar = (word1, word2) => {
    if (Math.abs(word1.length - word2.length) > 3) return false;

    let differences = 0;
    const minLen = Math.min(word1.length, word2.length);

    for (let i = 0; i < minLen; i++) {
      if (word1[i] !== word2[i]) differences++;
    }

    differences += Math.abs(word1.length - word2.length);
    return differences / Math.max(word1.length, word2.length) < 0.3;
  };

  const calculateDateProximity = (date1, date2) => {
    const diff = Math.abs(new Date(date1) - new Date(date2));
    const days = diff / (1000 * 60 * 60 * 24);

    if (days <= 7) return 1;
    if (days <= 30) return 1 - ((days - 7) / 23) * 0.5;
    return Math.max(0, 0.5 - ((days - 30) / 60) * 0.5);
  };

  // VERIFY MATCH FUNCTION
  const handleVerifyMatch = async (match) => {
    if (
      !confirm(
        "Are you sure you want to verify this match? Both items will be marked as matched.",
      )
    ) {
      return;
    }

    try {
      console.log("Sending verify request with:", {
        lostItemId: match.lostItem._id,
        foundItemId: match.foundItem._id,
      });

      const response = await fetch("http://localhost:5000/api/matches/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lostItemId: match.lostItem._id,
          foundItemId: match.foundItem._id,
        }),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (response.ok && data.success) {
        alert(
          "✅ Match verified successfully! Both items have been marked as matched.",
        );
        findMatches();
      } else {
        const errorMessage =
          data.error || data.message || "Failed to verify match";
        console.error("Verify failed:", errorMessage);
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error verifying match:", error);
      alert(
        "❌ Network error. Please check if the backend server is running and try again.",
      );
    }
  };

  const handleContactBoth = (match) => {
    const message = `Found a possible match!\n\nLost Item: ${match.lostItem.itemName}\nFound Item: ${match.foundItem.itemName}\n\nLost Contact: ${match.lostItem.contact}\nFound Contact: ${match.foundItem.contact}`;

    alert(message);
    navigator.clipboard.writeText(
      `Lost: ${match.lostItem.contact}\nFound: ${match.foundItem.contact}`,
    );
  };

  const filteredMatches = matches.filter(
    (match) => filter === "all" || match.confidence === filter,
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Finding matches...</p>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <div>
          <h1>
            <span className="header-icon">🎯</span>
            Smart Matching
          </h1>
          <p>AI-powered matching between lost and found items</p>
        </div>

        <div className="match-stats">
          <div className="match-stat">
            <span className="stat-number">{matches.length}</span>
            <span className="stat-label">Total Matches</span>
          </div>
          <div className="match-stat">
            <span className="stat-number">
              {matches.filter((m) => m.confidence === "high").length}
            </span>
            <span className="stat-label">High Confidence</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <label>Filter by confidence:</label>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Matches ({matches.length})
          </button>
          <button
            className={`filter-btn high ${filter === "high" ? "active" : ""}`}
            onClick={() => setFilter("high")}
          >
            <span>🔥</span> High Confidence (
            {matches.filter((m) => m.confidence === "high").length})
          </button>
          <button
            className={`filter-btn medium ${filter === "medium" ? "active" : ""}`}
            onClick={() => setFilter("medium")}
          >
            <span>⚡</span> Medium (
            {matches.filter((m) => m.confidence === "medium").length})
          </button>
          <button
            className={`filter-btn low ${filter === "low" ? "active" : ""}`}
            onClick={() => setFilter("low")}
          >
            <span>💡</span> Low (
            {matches.filter((m) => m.confidence === "low").length})
          </button>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="no-matches">
          <div className="no-matches-icon">🔍</div>
          <h3>No matches found</h3>
          <p>
            Try adjusting your filter or check back later when more items are
            reported
          </p>
        </div>
      ) : (
        <div className="matches-grid">
          {filteredMatches.map((match, index) => (
            <div
              key={match.id}
              className="match-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="match-header">
                <div className={`confidence-badge ${match.confidence}`}>
                  <span className="badge-icon">
                    {match.confidence === "high"
                      ? "🔥"
                      : match.confidence === "medium"
                        ? "⚡"
                        : "💡"}
                  </span>
                  <span>{match.confidence} confidence</span>
                </div>
                <div className="match-score">{match.matchScore}% match</div>
              </div>

              <div className="match-breakdown">
                <small>
                  Name: {match.details.nameMatch}% | Location:{" "}
                  {match.details.locationMatch}% | Description:{" "}
                  {match.details.descMatch}% | Date:{" "}
                  {match.details.dateProximity}%
                </small>
              </div>

              <div className="match-items">
                <Link
                  to={`/item/${match.lostItem._id}`}
                  className="match-item lost-match"
                >
                  <div className="item-type-label">
                    <span>😢</span> Lost Item
                  </div>
                  <div className="item-image-container">
                    {match.lostItem.photo ? (
                      <img
                        src={`http://localhost:5000${match.lostItem.photo}`}
                        alt={match.lostItem.itemName}
                      />
                    ) : (
                      <div className="no-image-match">📷</div>
                    )}
                  </div>
                  <div className="item-info">
                    <h4>{match.lostItem.itemName}</h4>
                    <p>📍 {match.lostItem.location}</p>
                    <p>
                      📅 {new Date(match.lostItem.date).toLocaleDateString()}
                    </p>
                  </div>
                </Link>

                <div className="match-connector">
                  <div className="connector-line"></div>
                  <div className="connector-icon">↔️</div>
                  <div className="connector-line"></div>
                </div>

                <Link
                  to={`/item/${match.foundItem._id}`}
                  className="match-item found-match"
                >
                  <div className="item-type-label">
                    <span>✨</span> Found Item
                  </div>
                  <div className="item-image-container">
                    {match.foundItem.photo ? (
                      <img
                        src={`http://localhost:5000${match.foundItem.photo}`}
                        alt={match.foundItem.itemName}
                      />
                    ) : (
                      <div className="no-image-match">📷</div>
                    )}
                  </div>
                  <div className="item-info">
                    <h4>{match.foundItem.itemName}</h4>
                    <p>📍 {match.foundItem.location}</p>
                    <p>
                      📅 {new Date(match.foundItem.date).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="match-actions">
                <button
                  className="contact-btn"
                  onClick={() => handleContactBoth(match)}
                >
                  <span>📞</span> Contact Both Parties
                </button>
                <button
                  className="verify-btn"
                  onClick={() => handleVerifyMatch(match)}
                >
                  <span>✅</span> Verify Match
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
