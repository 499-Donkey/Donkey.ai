// auth.tsx

import React, { useState } from 'react';
import { login, logout, getGoogleAuthUrl, getMicrosoftAuthUrl } from '../network/users_api'; 
import '../styles/Auth.css';
import googleLogo from '../assets/google-logo.svg';
import microsoftLogo from '../assets/microsoft-logo.svg';
import appleLogo from '../assets/apple-logo.svg';
import { Link } from 'react-router-dom';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginSuccess, setLoginSuccess] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 管理用户的登录状态

    // 登录提交处理
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const user = await login({ username: email, password });
            setLoginSuccess('登录成功！欢迎回来.');
            setIsLoggedIn(true); // 设置为已登录状态
            console.log('登录成功，用户信息:', user);
        } catch (error) {
            console.error('登录失败:', error);
            // 在这里可以设置一个状态来显示登录错误信息
        }
    };

    // 登出处理
    const handleLogout = async () => {
        try {
            await logout();
            setLoginSuccess('');
            setIsLoggedIn(false); // 设置为未登录状态
            setEmail('');
            setPassword('');
            console.log('登出成功');
        } catch (error) {
            console.error('登出失败:', error);
        }
    };
    const handleGoogleLogin = async () => {
        try {
          const url = await getGoogleAuthUrl();
          window.location.href = url;
        } catch (error) {
          console.error('Error fetching the Google auth URL', error);
        }
      };

      const handleMicrosoftLogin = async () => {
        try {
            // 这里使用的是GET请求
            const response = await fetch('/api/auth/microsoft/url');
            if (response.ok) {
                // 服务器应该发送一个包含URL的JSON对象，而不是一个重定向响应
                const data = await response.json();
                window.location.href = data.url; // 直接使用JSON对象中的URL进行跳转
            } else {
                // 处理错误情况
                console.error('Failed to fetch the Microsoft auth URL.');
            }
        } catch (error) {
            console.error('Error fetching the Microsoft auth URL', error);
        }
    };
    
    
    
    

    

    return (
        
        <div className="auth-container">
            <div className="auth-logo">Donkey.AI</div>
            <div className="auth-title">Sign In</div>
            <div className="social-login">
                <button className="social-button google" onClick={handleGoogleLogin}>
                    <img src={googleLogo} alt="Google" className="social-logo" />
                    <span className="button-text">Continue with Google</span>
                </button>
                <button className="social-button microsoft" onClick={handleMicrosoftLogin} >
                    <img src={microsoftLogo} alt="Microsoft" className="social-logo" />
                    <span className="button-text">Continue with Microsoft</span>
                </button>
                <button className="social-button apple" >
                    <img src={appleLogo} alt="Apple" className="social-logo" />
                    <span className="button-text">Continue with Apple</span>
                </button>
            </div>
            {loginSuccess && <div className="login-success-message">{loginSuccess}</div>}
            <div className="auth-links">
                <Link to="/forgot-password" className="forgot-password">Forgot your password?</Link>
                <Link to="/create-account" className="create-account">Create Account</Link>
            </div>
            <div className="divider"></div>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit" className="sign-in-button">Sign in</button>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            {/* 登出按钮，点击时调用 handleLogout 函数 */}
            </form>
            
            <div className="auth-footer">
                By using Donkey.AI you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </div>
        </div>
    );
};

export default Auth;
