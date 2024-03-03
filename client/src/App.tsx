// import React, {useEffect, useState} from 'react';

import "./App.css";
import { Route, Router, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Upload from "./pages/upload";
import ScriptList from "./pages/scripts";
import Auth from "./pages/auth";

function App() {


  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/scripts" element={<ScriptList />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </>
  );
}

export default App;
