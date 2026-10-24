import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
} from "react-router-dom";

import useAuth from "../../../contexts/AuthContext/useAuth";
import {
  controlService,
} from "../../../services/control/controlService";

export default function ControlProtectedRoute() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let active = true;

    if (isAuthLoading) {
      return () => {
        active = false;
      };
    }

    if (!session) {
      setHasAccess(false);
      setIsChecking(false);
      return () => {
        active = false;
      };
    }

    setIsChecking(true);

    void controlService.getSession()
      .then((profile) => {
        if (active) {
          setHasAccess(Boolean(profile));
        }
      })
      .catch(() => {
        if (active) {
          setHasAccess(false);
        }
      })
      .finally(() => {
        if (active) {
          setIsChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, session]);

  if (isAuthLoading || isChecking) {
    return <div className="center" style={{ minHeight: "100vh" }}>Carregando...</div>;
  }

  if (!session || !hasAccess) {
    return <Navigate to="/controle/login" replace />;
  }

  return <Outlet />;
}
