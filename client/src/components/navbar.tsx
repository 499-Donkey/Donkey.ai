// navbar.tsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/navbar.css'; 
import donkeyLogo from '../assets/DonkeyLogo1.png';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const handleLogout = () => {
    // 实际的登出逻辑应调用后端API进行登出
    // 这里只是简单地更改localStorage
    localStorage.setItem('isLoggedIn', 'false');
    navigate('/'); // 重定向到首页或任何其他页面
    // 你可能需要刷新页面或触发状态更新来反映登录状态的改变
    window.location.reload(); // 这是一种方法，但不是最好的实践
  };

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
        {isLoggedIn ? (
          <button onClick={handleLogout} className="auth-button">
            Logout
          </button>
        ) : (
          <>
            <NavLink to="/auth" className="auth-button">
              Login
            </NavLink>
            <NavLink to="/auth" className="upgrade-button">
              Upgrade
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
