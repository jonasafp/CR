import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute/ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";

import Clientes from "../pages/Clientes/Clientes";
import Compras from "../pages/Compras/Compras";
import ConfiguracaoInicial from "../pages/ConfiguracaoInicial/ConfiguracaoInicial";
import Configuracoes from "../pages/Configuracoes/Configuracoes";
import Dashboard from "../pages/Dashboard/Dashboard";
import Estoque from "../pages/Estoque/Estoque";
import Financeiro from "../pages/Financeiro/Financeiro";
import Fornecedores from "../pages/Fornecedores/Fornecedores";
import Login from "../pages/Login/Login";
import Produtos from "../pages/Produtos/Produtos";
import Relatorios from "../pages/Relatorios/Relatorios";
import Vendas from "../pages/Vendas/Vendas";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <Login />
        }
      />

      <Route
        element={
          <ProtectedRoute
            requireCompany={
              false
            }
          />
        }
      >
        <Route
          path="configuracao-inicial"
          element={
            <ConfiguracaoInicial />
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <Dashboard />
            }
          />

          <Route
            path="estoque"
            element={
              <Estoque />
            }
          />

          <Route
            path="vendas"
            element={
              <Vendas />
            }
          />

          <Route
            path="produtos"
            element={
              <Produtos />
            }
          />

          <Route
            path="clientes"
            element={
              <Clientes />
            }
          />

          <Route
            path="financeiro"
            element={
              <Financeiro />
            }
          />

          <Route
            path="relatorios"
            element={
              <Relatorios />
            }
          />

          <Route
            path="configuracoes"
            element={
              <Configuracoes />
            }
          />

          <Route
            path="compras"
            element={
              <Compras />
            }
          />

          <Route
            path="fornecedores"
            element={
              <Fornecedores />
            }
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}