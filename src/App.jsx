
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ChatInterface from './pages/ChatInterface';
import { ThemeProvider } from './context/ThemeContext';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
