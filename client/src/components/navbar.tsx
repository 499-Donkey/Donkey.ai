import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/navbar.css'; 
import donkeyLogo from '../assets/DonkeyLogo1.png';

const Navbar = () => {
  return (
    <nav className="navbar">

      <div className="brand-logo">
        <img src={donkeyLogo} alt="Donkey Logo" />
        <span className="web-name">Donkey.ai</span>
      </div>

      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active-link' : ''}>
          Home
        </NavLink>

        <NavLink to="/upload" className={({ isActive }) => isActive ? 'active-link' : ''}>
          Upload
        </NavLink>

        <NavLink to="/scripts" className={({ isActive }) => isActive ? 'active-link' : ''}>
          Scripts
        </NavLink>
      </div>

      <div className="nav-action-buttons">
        <NavLink to="/auth" className="auth-button">
          Login
        </NavLink>
        <NavLink to="/auth" className="upgrade-button">
          Upgrade
        </NavLink>
      </div>

    </nav>
  );
};

export default Navbar;
