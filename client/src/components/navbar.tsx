// Navbar.tsx

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';
import donkeyLogo from '../assets/DonkeyLogo1.png';
import userDefaultImage from '../assets/user.png';
import { logout } from '../network/users_api'; 

const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [showModal, setShowModal] = useState(false); 

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userName = localStorage.getItem('user');
  const [userImage, setUserImage] = useState(userDefaultImage); 
  
  
  // Generate user initials from username
  const userInitials = userName?.charAt(0).toUpperCase();


  const handleLogout = async () => {
    try {
        await logout();
        localStorage.clear();
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
            navigate('/');
        }, 900);
    } catch (error) {
        console.error('Logout failed:', error);
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
        }, 900);
    }
};



  const toggleDropdown = () => {
    console.log('Before toggle:', isDropdownVisible);
    setDropdownVisible(!isDropdownVisible);
    console.log('After toggle:', !isDropdownVisible);
  };

  return (
    <nav className="navbar">
      <div className="brand-logo">
        <img src={donkeyLogo} alt="Donkey Logo" />
        <span className="web-name">Donkey.ai</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active-link' : ''}>Home</NavLink>
        <NavLink to="/upload" className={({ isActive }) => isActive ? 'active-link' : ''}>Upload</NavLink>
        <NavLink to="/scripts" className={({ isActive }) => isActive ? 'active-link' : ''}>Test</NavLink>
      </div>
      {showModal && (
            <div className="modal">
                <div className="modal-content">
                <p className="modal-message">Logout Success</p>
                    
                </div>
            </div>
        )}
      <div className="nav-action-buttons">
        {isLoggedIn ? (
          <div className="user-info" onClick={toggleDropdown}>
            {userImage ? (
              <img src={userImage} alt="User" className="user-image" />
            ) : (
              <div className="user-initials">{userInitials}</div>
            )}
            {isDropdownVisible && (
              <div className="user-menu-dropdown">
                <div className="user-full-email">{userName}</div>
                <NavLink to="/account-settings" className="dropdown-item">Account Settings</NavLink>
                <NavLink to="/upgrade" className="dropdown-item">Upgrade Plan</NavLink>
                <button onClick={handleLogout} className="dropdown-item logout-button">Logout</button>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/auth" className="auth-button">Login</NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
