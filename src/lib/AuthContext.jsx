import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'poketracker_user';

// Simple hash function for passwords (in production use bcrypt on a real backend)
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'poketracker_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('poketracker_users') || '[]');
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem('poketracker_users', JSON.stringify(users));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const signup = async (email, password, name) => {
    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const hashed = await hashPassword(password);
    const newUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name,
      password: hashed,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    return safeUser;
  };

  const login = async (email, password) => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!found) throw new Error('No account found with this email.');
    const hashed = await hashPassword(password);
    if (found.password !== hashed) throw new Error('Incorrect password.');
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    return safeUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const resetPassword = async (email, newPassword) => {
    const users = getUsers();
    const idx = users.findIndex(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (idx === -1) throw new Error('No account found with this email.');
    const hashed = await hashPassword(newPassword);
    users[idx].password = hashed;
    saveUsers(users);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
