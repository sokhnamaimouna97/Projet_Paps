// AppWrapper.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Router from '../Routes';
import ThemeToggle from './components/ui/ThemeToggle';

const AppWrapper = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
        <ThemeToggle />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppWrapper;