import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Helper function để decode JWT token
const decodeToken = (token) => {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData, userToken) => {
    console.log("💾 Saving to context:", { userData, userToken });
    setUser(userData);
    setToken(userToken);
    // Dùng sessionStorage - tự động xóa khi đóng browser
    sessionStorage.setItem("accessToken", userToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
  };

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const storedToken = sessionStorage.getItem("accessToken");
        const storedUser = sessionStorage.getItem("user");

        console.log("🔍 Checking stored auth:", {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
        });
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("🔑 DEBUG - User role:", parsedUser.role);
            console.log("🔑 DEBUG - Full user info:", parsedUser);
          } catch (e) {
            console.error("Error parsing user for debug:", e);
          }
        }

        if (storedToken && isMounted) {
          setToken(storedToken);

          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log("Loaded user from sessionStorage:", parsedUser);
              setUser(parsedUser);
            } catch (parseError) {
              console.error("Error parsing stored user:", parseError);
              sessionStorage.removeItem("user");
              sessionStorage.removeItem("accessToken");
            }
          } else {
            const decodedToken = decodeToken(storedToken);
            if (decodedToken && isMounted) {
              const userFromToken = {
                id:
                  decodedToken.sub ||
                  decodedToken.userId ||
                  decodedToken.nameid,
                email: decodedToken.email || decodedToken.unique_name,
                role:
                  decodedToken.role ||
                  decodedToken[
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                  ],
                name:
                  decodedToken.name ||
                  decodedToken.unique_name ||
                  decodedToken.email,
              };
              console.log("Decoded user from token:", userFromToken);
              setUser(userFromToken);
              sessionStorage.setItem("user", JSON.stringify(userFromToken));
            } else {
              console.warn("⚠️ Invalid token, clearing storage");
              sessionStorage.removeItem("accessToken");
              sessionStorage.removeItem("user");
            }
          }
        } else {
          console.log("ℹ️ No stored token found - user needs to login");
        }
      } catch (err) {
        console.error("Auth init error:", err);
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("Auth initialization complete");
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        setUser,
      }}
    >
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
