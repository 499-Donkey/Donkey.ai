
// Auth.tsx
import React, { useState } from 'react';
import { login } from '../network/users_api'; 
import '../styles/Auth.css';
import googleLogo from '../assets/google-logo.svg';
import microsoftLogo from '../assets/microsoft-logo.svg';
import appleLogo from '../assets/apple-logo.svg';
import { Link } from 'react-router-dom';



const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(''); // 添加状态管理登录成功消息

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            // 这里假设后端需要的是 'username' 字段
            const user = await login({ username: email, password });


            setLoginSuccess('登录成功！欢迎回来.'); // 更新登录成功消息
            console.log('登录成功，用户信息:', user);
            // 登录成功后的逻辑，比如跳转到主页或保存用户状态
        } catch (error) {
            console.error('登录失败:', error);
            // 登录失败时的处理逻辑，比如显示错误提示
        }
    };
    

    return (
        
        <div className="auth-container">
            <div className="auth-logo">Donkey.AI</div>
            <div className="auth-title">Sign In</div>
            <div className="social-login">
                <button className="social-button google">
                    <img src={googleLogo} alt="Google" className="social-logo" />
                    <span className="button-text">Continue with Google</span>
                </button>
                <button className="social-button microsoft" >
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
            </form>
            
            <div className="auth-footer">
                By using Donkey.AI you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </div>
        </div>
    );
};

export default Auth;
