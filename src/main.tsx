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

import InventoryProvider from "./contexts/InventoryContext/InventoryProvider";
import ProductsProvider from "./contexts/ProductsContext/ProductsProvider";
import SettingsProvider from "./contexts/SettingsContext/SettingsProvider";

import NotificationProvider from "./contexts/NotificationContext/NotificationProvider";
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
        client={queryClient}
      >
        <NotificationProvider>
          <AppErrorBoundary>
            <SettingsProvider>
              <ProductsProvider>
                <InventoryProvider>
                  <App />
                </InventoryProvider>
              </ProductsProvider>
            </SettingsProvider>
          </AppErrorBoundary>
        </NotificationProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);