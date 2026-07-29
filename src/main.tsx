import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import InventoryProvider from "./contexts/InventoryContext/InventoryProvider";
import ProductsProvider from "./contexts/ProductsContext/ProductsProvider";

import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/animations.css";

createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <BrowserRouter>
      <ProductsProvider>
        <InventoryProvider>
          <App />
        </InventoryProvider>
      </ProductsProvider>
    </BrowserRouter>
  </StrictMode>,
);