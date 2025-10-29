import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { Privacy } from "./components/Privacy";
import { Terms } from "./components/Terms";
export function AppRouter() {
  return <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
    </BrowserRouter>;
}