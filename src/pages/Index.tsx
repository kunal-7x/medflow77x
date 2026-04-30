import { Navigate } from "react-router-dom";

// Index page now redirects to dashboard (handled by App.tsx routing)
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
