// ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset } from '../network/users_api';
import '../styles/ForgotPasswordPage.css';
import forgotpage from '../assets/forgotpage.png';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await requestPasswordReset(email);
            setMessage('A link to reset your password has been sent to your email.');
        } catch (error) {

            setMessage('A link to reset your password has been sent to your email.');
        }
        setTimeout(() => navigate('/auth'), 5000);
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-image">
                <img src={forgotpage} alt="Forgot Password" />
            </div>
            <div className="forgot-password-form">
                <h1>Forgot Your Password?</h1>
                <p>Enter your email and we'll send you a link to reset your password.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="input-icon"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                    <button type="submit">Send Reset Email</button>
                </form>
                {message && <div className="form-success">{message}</div>}
                <div className="back-to-login">
                    <span className="back-arrow">&lt;</span>
                    <Link to="/auth">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
