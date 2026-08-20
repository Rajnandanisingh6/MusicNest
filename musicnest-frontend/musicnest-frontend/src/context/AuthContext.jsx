import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load saved user info so a page refresh doesn't log the user out.
  // The real auth token stays in an httpOnly cookie set by the backend —
  // this is just so the UI knows who is logged in and what role they have.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('musicnest_user');
    return saved ? JSON.parse(saved) : null;
  });

  function login(userData) {
    setUser(userData);
    localStorage.setItem('musicnest_user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('musicnest_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
