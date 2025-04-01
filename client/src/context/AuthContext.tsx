import { createContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "@/types";
import { apiRequest } from "@/lib/queryClient";

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  
  useEffect(() => {
    // Check if we have a user ID stored in local storage
    const userId = localStorage.getItem("userId");
    
    if (userId) {
      fetchUser(parseInt(userId))
        .catch((error) => {
          console.error("Error fetching user:", error);
          localStorage.removeItem("userId");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const fetchUser = async (userId: number) => {
    try {
      const response = await apiRequest("GET", `/api/auth/user?userId=${userId}`, undefined);
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };
  
  const login = async (username: string, password: string): Promise<User> => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      
      // Save user in state and localStorage
      setUser(userData);
      localStorage.setItem("userId", userData.id.toString());
      
      // Show welcome animation after successful login
      setShowWelcomeAnimation(true);
      
      return userData;
    } catch (error) {
      throw error;
    }
  };
  
  const register = async (userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    phone?: string;
  }): Promise<User> => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const newUser = await response.json();
      
      // Save user in state and localStorage
      setUser(newUser);
      localStorage.setItem("userId", newUser.id.toString());
      
      return newUser;
    } catch (error) {
      throw error;
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
    setShowWelcomeAnimation(false);
  };
  
  const hideWelcomeAnimation = () => {
    setShowWelcomeAnimation(false);
  };
  
  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isLoading,
    showWelcomeAnimation,
    hideWelcomeAnimation
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
