import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css";

export default function Lost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    location: "",
    date: "",
    contact: "",
    photo: null,
    preview: null,
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];
      if (file) {
        setFormData({
          ...formData,
          photo: file,
          preview: URL.createObjectURL(file),
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("type", "lost");
      data.append("itemName", formData.itemName);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("date", formData.date);
      data.append("contact", formData.contact);
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      const response = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        alert("Lost item submitted successfully! We'll help you find it.");
        navigate("/items");
      } else {
        alert("Error submitting item. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page lost-page">
      <div className="form-particles">
        {[...Array(15)].map((_, i) => (
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

      <form className="form-card lost-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="form-icon">😢</div>
          <h1>Report Lost Item</h1>
          <p>Help us help you find your lost item</p>
        </div>

        <div className="input-wrapper">
          <label>
            <span className="label-icon">🏷️</span>
            Item Name
          </label>
          <input
            type="text"
            name="itemName"
            placeholder="e.g., iPhone 13, Blue Backpack"
            value={formData.itemName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-wrapper">
          <label>
            <span className="label-icon">📝</span>
            Description
          </label>
          <textarea
            name="description"
            placeholder="Provide detailed description (color, brand, unique features)"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-wrapper">
          <label>
            <span className="label-icon">📍</span>
            Last Seen Location
          </label>
          <input
            type="text"
            name="location"
            placeholder="e.g., Main Library, 3rd Floor"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-wrapper">
          <label>
            <span className="label-icon">📅</span>
            Date Lost
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-wrapper">
          <label>
            <span className="label-icon">📞</span>
            Contact Number
          </label>
          <input
            type="tel"
            name="contact"
            placeholder="+91 XXXXX XXXXX"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-wrapper">
          <label>
            <span className="label-icon">📷</span>
            Upload Photo (Optional)
          </label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleChange}
            className="file-input"
          />
        </div>

        {formData.preview && (
          <div className="preview-container">
            <img src={formData.preview} alt="Preview" />
            <button
              type="button"
              className="remove-preview"
              onClick={() =>
                setFormData({ ...formData, photo: null, preview: null })
              }
            >
              ✕
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="submit-btn lost-btn"
        >
          {submitting ? (
            <>
              <span className="spinner-small"></span>
              Submitting...
            </>
          ) : (
            <>
              <span>😢</span>
              Report Lost Item
            </>
          )}
        </button>
      </form>
    </div>
  );
}
