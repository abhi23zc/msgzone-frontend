"use client"
import useLocalStorage from '@/hooks/useLocalstorage';
import { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [totalMessages, setTotalMessages] = useState(0)
  const [myuser] = useLocalStorage("user");
  useEffect(() => {

    if (myuser) setUser(myuser)
  }, [myuser])
  return (
    <AuthContext.Provider value={{ user, setUser, totalMessages, setTotalMessages }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
