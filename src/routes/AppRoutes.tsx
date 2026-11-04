import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute/ProtectedRoute";
import ControlProtectedRoute from "../components/auth/ControlProtectedRoute/ControlProtectedRoute";
import RoleProtectedRoute from "../components/auth/RoleProtectedRoute/RoleProtectedRoute";
import AccessDenied from "../components/auth/AccessDenied/AccessDenied";

import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";

import Clientes from "../pages/Clientes/Clientes";
import Compras from "../pages/Compras/Compras";
import Configuracoes from "../pages/Configuracoes/Configuracoes";
import Dashboard from "../pages/Dashboard/Dashboard";
import Estoque from "../pages/Estoque/Estoque";
import Financeiro from "../pages/Financeiro/Financeiro";
import Fornecedores from "../pages/Fornecedores/Fornecedores";
import Login from "../pages/Login/Login";
import Produtos from "../pages/Produtos/Produtos";
import Relatorios from "../pages/Relatorios/Relatorios";
import Vendas from "../pages/Vendas/Vendas";
import DefinirSenha from "../pages/DefinirSenha/DefinirSenha";
import NotFound from "../pages/NotFound/NotFound";
import Controle from "../pages/Controle/Controle";
import {
  isMobileApp,
} from "../services/mobile/mobilePlatformService";
import {
  isControlApp,
} from "../config/appVariant";

export default function AppRoutes() {
  const isNativeApp = isMobileApp();
  const isNativeControl = isNativeApp && isControlApp;
  const isNativeClient = isNativeApp && !isControlApp;

  return (
    <Routes>
      <Route
        path="login"
        element={
          <Login controlMode={isNativeControl} />
        }
      />

      {isNativeControl && (
        <Route
          index
          element={<Navigate to="/controle/login" replace />}
        />
      )}

      {isNativeClient ? (
        <Route
          path="controle/*"
          element={<Navigate to="/login" replace />}
        />
      ) : (
        <>
          <Route
            path="controle/login"
            element={<Login controlMode />}
          />

          <Route element={<ControlProtectedRoute />}>
            <Route
              path="controle"
              element={<Controle />}
            />
          </Route>
        </>
      )}

      {!isNativeControl && (
        <Route
          path="definir-senha"
          element={<DefinirSenha />}
        />
      )}

      {!isNativeControl && (
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
            path="acesso-negado"
            element={<AccessDenied />}
          />

          <Route
            path="estoque"
            element={
              <RoleProtectedRoute permission="manageInventory">
                <Estoque />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="vendas"
            element={
              <RoleProtectedRoute permission="createSales">
                <Vendas />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="produtos"
            element={
              <RoleProtectedRoute permission="manageProducts">
                <Produtos />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="clientes"
            element={
              <RoleProtectedRoute permission="manageCustomers">
                <Clientes />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="financeiro"
            element={
              <RoleProtectedRoute permission="manageFinancial">
                <Financeiro />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="relatorios"
            element={
              <RoleProtectedRoute permission="viewReports">
                <Relatorios />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="configuracoes"
            element={
              <RoleProtectedRoute permission="manageSettings">
                <Configuracoes />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="compras"
            element={
              <RoleProtectedRoute permission="managePurchases">
                <Compras />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="fornecedores"
            element={
              <RoleProtectedRoute permission="manageSuppliers">
                <Fornecedores />
              </RoleProtectedRoute>
            }
          />
        </Route>
        </Route>
      )}

      <Route
        path="*"
        element={
          isNativeControl
            ? <Navigate to="/controle" replace />
            : <NotFound />
        }
      />
    </Routes>
  );
}
