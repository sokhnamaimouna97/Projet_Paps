// main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ThemeToggle from "./components/ui/ThemeToggle";
import Router from "../Routes";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <BrowserRouter>
      <AuthProvider>
        <Router />
        <ThemeToggle />
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);