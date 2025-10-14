import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // Computed property
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (token && !user) {
      // TODO: Tự động gọi API lấy user info nếu có token
      // Ví dụ:
      // fetchUserInfo(token).then(userData => setUser(userData));
      
      // Tạm thời mock data để test
      const mockUser = {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        role: "admin" // hoặc 'dealer-manager', 'dealer-staff'
      };
      setUser(mockUser);
    }
    setLoading(false);
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated,
      loading,
      login, 
      logout,
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};