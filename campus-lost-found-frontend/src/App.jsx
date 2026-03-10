import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import ViewItems from "./pages/Viewitems";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ItemDetails from "./pages/itemdetails";
import MatchingItems from "./pages/Matchingitems";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lost" element={<Lost />} />
        <Route path="/found" element={<Found />} />
        <Route path="/items" element={<ViewItems />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/matches" element={<MatchingItems />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
