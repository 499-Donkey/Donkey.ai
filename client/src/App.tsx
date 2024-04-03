import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Home from "./pages/home";
import Upload from "./pages/upload";
import ScriptList from "./pages/scripts";
import Auth from "./pages/auth";
import CreateAccount from "./pages/create_account"; 

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
      </Routes>
      <Footer />
    </>
  );
}

export default App;
