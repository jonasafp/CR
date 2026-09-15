import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import App from "./App";

import {
  queryClient,
} from "./application/query/queryClient";

import AuthProvider from "./contexts/AuthContext/AuthProvider";
import InventoryProvider from "./contexts/InventoryContext/InventoryProvider";
import NotificationProvider from "./contexts/NotificationContext/NotificationProvider";
import ProductsProvider from "./contexts/ProductsContext/ProductsProvider";
import SettingsProvider from "./contexts/SettingsContext/SettingsProvider";

import AppErrorBoundary from "./components/common/AppErrorBoundary/AppErrorBoundary";

import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/animations.css";

createRoot(
  document.getElementById(
    "root",
  )!,
).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider
        client={
          queryClient
        }
      >
        <NotificationProvider>
          <AppErrorBoundary>
            <AuthProvider>
              <SettingsProvider>
                <ProductsProvider>
                  <InventoryProvider>
                    <App />
                  </InventoryProvider>
                </ProductsProvider>
              </SettingsProvider>
            </AuthProvider>
          </AppErrorBoundary>
        </NotificationProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);