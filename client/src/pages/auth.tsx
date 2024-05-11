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
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            setLoginSuccess('login success');
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const user = await login({ username: email, password });
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            setLoginSuccess('Login Successful, Welcome Back!');
            setIsError(false);
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('login fail:', error);
            setLoginSuccess('Login Failed, Please Try Again');
            setIsError(true);
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
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

            const response = await fetch('/api/auth/microsoft/url');
            if (response.ok) {

                const data = await response.json();
                window.location.href = data.url;
            } else {

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
            {}
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
    {}
    <button type="submit" className="sign-in-button">Sign in</button>
    {}
</form>
            
            <div className="auth-footer">
                By using Donkey.AI you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </div>
        </div>
    );
};

export default Auth;