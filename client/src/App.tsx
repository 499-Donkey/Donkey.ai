import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Home from "./pages/home";
import Upload from "./pages/upload";
import ScriptList from "./pages/scripts";
import Auth from "./pages/auth";
import CreateAccount from "./pages/create_account"; 
import OAuthCallback from "./pages/OAuthCallback"; 
import AccountSettings from "./pages/AccountSetting";
import Upgrade from "./pages/Upgrade";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";


function App() {
  return (
    <body>
      <Navbar />
      <div id="page-container">
        <div id="content-warp">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/scripts" element={<ScriptList />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create-account" element={<CreateAccount />} />  
            <Route path="/auth/google/callback" element={<OAuthCallback />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />  
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Routes>
        </div>
      </div>
      
      <footer id="footer">
        <Footer />
      </footer>
    </body>
  );
}

export default App;
