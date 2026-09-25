import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../services/api";
export default function AdminRoute() { const { isAuthenticated, email } = useAuth(); if (!isAuthenticated) return <Navigate to="/login" replace />; return isAdmin(email) ? <Outlet /> : <Navigate to="/query" replace />; }
