
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    api
      .get("/auth/me")
      .then((response) => {
        const user = response.data?.data?.user;

        if (active) {
          setStatus(user?.role === "admin" ? "admin" : "denied");
        }
      })
      .catch(() => {
        if (active) setStatus("denied");
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <div style={{ padding: 30 }}>Loading permissions...</div>;
  }

  if (status !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
