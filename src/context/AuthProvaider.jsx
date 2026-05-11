import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Navigate } from "react-router-dom";

const AuthContext = createContext();

// ---------------- PROVIDER ----------------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);

    // 🔥 CLEAR EVERYTHING (incognito behaviour)
    localStorage.clear();
    sessionStorage.clear();

    setUser(null);
  };

  if (loading) return null; // or loader

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ---------------- HOOK ----------------
export const useAuth = () => useContext(AuthContext);

// ---------------- PROTECTED ROUTE ----------------
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};
