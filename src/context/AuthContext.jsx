import { createContext } from "react";
import useAuth from "../hooks/useAuth";

// const AuthContext = createContext(undefined);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check if user is already logged in via localStorage on boot
//     const savedUser = localStorage.getItem('phi_user');
//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//     setLoading(false);
//   }, []);

//   const loginUser = (userData) => {
//     setUser(userData);
//     localStorage.setItem('phi_user', JSON.stringify(userData));
//   };

//   const logoutUser = () => {
//     setUser(null);
//     localStorage.removeItem('phi_user');
//     localStorage.removeItem('phi_token');
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser, loginUser, logoutUser, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const allContext = useAuth();
  return (
    <AuthContext.Provider value={allContext}>{children}</AuthContext.Provider>
  );
};
export default AuthContext;
