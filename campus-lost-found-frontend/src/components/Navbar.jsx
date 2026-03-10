import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🔍</span>
          <span className="brand-text">Lost & Found</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">🏠</span>
            Home
          </Link>
          <Link
            to="/lost"
            className={`nav-link ${isActive("/lost") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">😢</span>
            Report Lost
          </Link>
          <Link
            to="/found"
            className={`nav-link ${isActive("/found") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">✨</span>
            Report Found
          </Link>
          <Link
            to="/items"
            className={`nav-link ${isActive("/items") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">📋</span>
            View Items
          </Link>
          <Link
            to="/matches"
            className={`nav-link ${isActive("/matches") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">🎯</span>
            Matches
          </Link>
          <Link
            to="/admin"
            className={`nav-link admin-link ${isActive("/admin") || isActive("/admin/dashboard") ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">⚙️</span>
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
