import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Pour le dashboard admin, on considère toujours authentifié
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    id: 'admin',
    email: 'admin@finea-academie.com',
    firstName: 'Admin',
    lastName: 'Finéa',
    role: 'admin'
  });

  useEffect(() => {
    // Ici on pourrait vérifier le token d'authentification
    // Pour l'instant, on simule un utilisateur authentifié
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulation d'une connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;