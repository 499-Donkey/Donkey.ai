// page/auth.tsx

import React, { useState, useEffect } from 'react';
import { login, logout, getGoogleAuthUrl, getMicrosoftAuthUrl } from '../network/users_api'; 
import '../styles/Auth.css';
import googleLogo from '../assets/google-logo.svg';
import microsoftLogo from '../assets/microsoft-logo.svg';
import appleLogo from '../assets/apple-logo.svg';
import { Link, useNavigate } from 'react-router-dom';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginSuccess, setLoginSuccess] = useState('');
    const [isError, setIsError] = useState(false);
    const [showModal, setShowModal] = useState(false);  // 状态控制显示模态窗口
    const navigate = useNavigate();

    // 检查登录状态
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            // 如果用户已登录，可以重定向或执行其他操作
            setLoginSuccess('已成功登录');
        }
    }, []);

    // 登录提交处理
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const user = await login({ username: email, password });
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            setLoginSuccess('Login Successful, Welcome Back!'); // 设置成功消息
            setIsError(false); // 登录成功
            setShowModal(true); // 显示登录成功的弹窗
            setTimeout(() => {
                setShowModal(false); // 2秒后自动关闭弹窗
                navigate('/'); // 可能还需要重定向到主页或其他页面
            }, 2000); // 2000毫秒后执行
        } catch (error) {
            console.error('登录失败:', error);
            setLoginSuccess('Login Failed, Please Try Again'); // 设置失败消息
            setIsError(true); // 登录失败
            setShowModal(true); // 显示错误信息的弹窗
            setTimeout(() => {
                setShowModal(false); // 也许这里也要自动关闭
            }, 2000);
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
{showModal && (
    <div className="modal">
        <div className="modal-content">
            {/* 根据 isError 状态选择对应的类名 */}
            <p className={`modal-message ${isError ? 'error' : 'success'}`}>{loginSuccess}</p>
        </div>
    </div>
)}


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
    {/* 显示登录按钮，而不考虑登出按钮 */}
    <button type="submit" className="sign-in-button">Sign in</button>
    {/* 如果需要，可以在这里添加其他按钮或表单元素 */}
</form>
            
            <div className="auth-footer">
                By using Donkey.AI you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </div>
        </div>
    );
};

export default Auth;