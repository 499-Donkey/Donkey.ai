// App.tsx
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Upload from "./pages/upload";
import ScriptList from "./pages/scripts";
import Auth from "./pages/auth";
import CreateAccount from "./pages/create_account"; // 确保引入了CreateAccount组件
import OAuthCallback from "./pages/OAuthCallback"; // import your OAuth callback handler component

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/scripts" element={<ScriptList />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/create-account" element={<CreateAccount />} />  
        <Route path="/auth/google/callback" element={<OAuthCallback />} />
      </Routes>
    </>
  );
}

export default App;
