import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { RestaurantProvider } from "./context/RestaurantContext";

createRoot(document.getElementById("root")!).render(
  <RestaurantProvider>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </RestaurantProvider>
);
