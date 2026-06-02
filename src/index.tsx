import './index.css';
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { AppRouter } from "./AppRouter";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
const root = createRoot(container);
root.render(
  <HelmetProvider>
    <AppRouter />
  </HelmetProvider>
);
