// service/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import api from "./api";
import apiAdmin from "./apiAdmin"

export const AdminRoute = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const token = sessionStorage.getItem("accessToken")
  React.useEffect(() => {
    if(token){
      apiAdmin.get("/auth/profile" )
      .then((res) => {
        if (res.data.role === "admin") setIsAdmin(true);
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
    }
    
  }, []);
  console.log(loading);
  

  if (loading) return <div>Đang kiểm tra quyền...</div>;
  if (!isAdmin) return <Navigate to="/login/admin" />;

  return children;
};
