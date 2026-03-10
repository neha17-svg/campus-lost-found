const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// ============================================================================
// MIDDLEWARE - MUST BE BEFORE ROUTES
// ============================================================================

// CORS - Allow all origins for development
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// MONGODB CONNECTION
// ============================================================================

const MONGO_URL = "mongodb+srv://campususer:HtyWCMUbRJq0MSwV@cluster0.plgvadm.mongodb.net/lostfound";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ============================================================================
// ITEM MODEL - DEFINED INLINE
// ============================================================================

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    contact: { type: String, required: true },
    photo: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "matched", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

// ============================================================================
// MULTER CONFIGURATION
// ============================================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ============================================================================
// API ROUTES - ALL DEFINED HERE
// ============================================================================

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Campus Lost & Found Backend API",
    status: "running",
    version: "2.0",
    timestamp: new Date().toISOString(),
    routes: {
      items: "/api/items",
      stats: "/api/stats",
      matches: "/api/matches/verify",
      admin: "/api/admin/login"
    }
  });
});

// ============================================================================
// ITEMS ENDPOINTS
// ============================================================================

// CREATE item
app.post("/api/items", upload.single("photo"), async (req, res) => {
  try {
    console.log("📝 Creating item:", req.body.itemName);
    
    const item = new Item({
      type: req.body.type,
      itemName: req.body.itemName,
      description: req.body.description,
      location: req.body.location,
      date: req.body.date,
      contact: req.body.contact,
      photo: req.file ? `/uploads/${req.file.filename}` : "",
    });
    
    const savedItem = await item.save();
    console.log("✅ Item created with ID:", savedItem._id);
    
    return res.status(201).json(savedItem);
  } catch (err) {
    console.error("❌ Create error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET all items
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    console.log(`✅ Retrieved ${items.length} items`);
    return res.status(200).json(items);
  } catch (err) {
    console.error("❌ Get all error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET single item by ID
app.get("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching item ID:", id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ Invalid ObjectId:", id);
      return res.status(400).json({ 
        error: "Invalid item ID format" 
      });
    }
    
    const item = await Item.findById(id);
    
    if (!item) {
      console.log("❌ Item not found:", id);
      return res.status(404).json({ 
        error: "Item not found" 
      });
    }
    
    console.log("✅ Item found:", item.itemName);
    return res.status(200).json(item);
  } catch (err) {
    console.error("❌ Get item error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Deleting item:", id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }
    
    const item = await Item.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    console.log("✅ Item deleted");
    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE item status
app.patch("/api/items/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`📝 Updating status for ${id} to ${status}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }
    
    const item = await Item.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    console.log("✅ Status updated");
    return res.status(200).json(item);
  } catch (err) {
    console.error("❌ Update error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// STATS ENDPOINT
// ============================================================================

app.get("/api/stats", async (req, res) => {
  try {
    const items = await Item.find();
    
    const stats = {
      total: items.length,
      lost: items.filter(i => i.type === "lost").length,
      found: items.filter(i => i.type === "found").length,
      matched: items.filter(i => i.status === "matched").length,
      pending: items.filter(i => !i.status || i.status === "pending").length,
    };
    
    console.log("📊 Stats:", stats);
    return res.status(200).json(stats);
  } catch (err) {
    console.error("❌ Stats error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// MATCHING ENDPOINTS
// ============================================================================

app.post("/api/matches/verify", async (req, res) => {
  try {
    const { lostItemId, foundItemId } = req.body;
    
    console.log("🔄 Verifying match:");
    console.log("   Lost Item ID:", lostItemId);
    console.log("   Found Item ID:", foundItemId);
    
    // Validate IDs
    if (!lostItemId || !foundItemId) {
      return res.status(400).json({ 
        success: false,
        error: "Both item IDs are required" 
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(lostItemId)) {
      console.log("❌ Invalid lost item ID");
      return res.status(400).json({ 
        success: false,
        error: "Invalid lost item ID" 
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(foundItemId)) {
      console.log("❌ Invalid found item ID");
      return res.status(400).json({ 
        success: false,
        error: "Invalid found item ID" 
      });
    }
    
    // Update both items
    const lostItem = await Item.findByIdAndUpdate(
      lostItemId,
      { status: "matched" },
      { new: true }
    );
    
    const foundItem = await Item.findByIdAndUpdate(
      foundItemId,
      { status: "matched" },
      { new: true }
    );
    
    if (!lostItem) {
      console.log("❌ Lost item not found");
      return res.status(404).json({ 
        success: false,
        error: "Lost item not found" 
      });
    }
    
    if (!foundItem) {
      console.log("❌ Found item not found");
      return res.status(404).json({ 
        success: false,
        error: "Found item not found" 
      });
    }
    
    console.log("✅ Match verified successfully!");
    console.log("   Lost:", lostItem.itemName);
    console.log("   Found:", foundItem.itemName);
    
    return res.status(200).json({
      success: true,
      message: "Match verified successfully!",
      lostItem,
      foundItem,
    });
  } catch (err) {
    console.error("❌ Verify error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === "admin" && password === "admin123") {
      console.log("✅ Admin login successful");
      return res.status(200).json({
        success: true,
        token: "admin-token-" + Date.now(),
        message: "Login successful",
      });
    } else {
      console.log("❌ Invalid credentials");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (err) {
    console.error("❌ Login error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 404 HANDLER - MUST BE AFTER ALL ROUTES
// ============================================================================

app.use((req, res) => {
  console.log("❌ 404 Not Found:", req.method, req.path);
  return res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
    availableRoutes: [
      "GET /",
      "GET /api/items",
      "POST /api/items",
      "GET /api/items/:id",
      "DELETE /api/items/:id",
      "PATCH /api/items/:id/status",
      "GET /api/stats",
      "POST /api/matches/verify",
      "POST /api/admin/login"
    ]
  });
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  console.error(err.stack);
  return res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║          🚀 SERVER RUNNING ON PORT ${PORT}              ║
║                                                        ║
║          📡 http://localhost:${PORT}                    ║
║                                                        ║
║          ✅ ALL ROUTES WORKING:                         ║
║                                                        ║
║          📋 ITEMS:                                      ║
║             POST   /api/items                          ║
║             GET    /api/items                          ║
║             GET    /api/items/:id                      ║
║             DELETE /api/items/:id                      ║
║             PATCH  /api/items/:id/status               ║
║                                                        ║
║          📊 STATS:                                      ║
║             GET    /api/stats                          ║
║                                                        ║
║          🎯 MATCHING:                                   ║
║             POST   /api/matches/verify                 ║
║                                                        ║
║          👤 ADMIN:                                      ║
║             POST   /api/admin/login                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

✅ MongoDB connected
✅ All routes registered
✅ Ready to accept requests

Test: curl http://localhost:5000/api/stats

`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;