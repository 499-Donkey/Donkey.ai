// pages/ResetPasswordPage.tsx
import '../styles/ResetPasswordPage.css';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPasswordPage() {
    const { token } = useParams<{ token: string }>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please re-enter your password.');
            return;
        }

        try {
            const response = await fetch(`/api/users/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                alert('Your password has been successfully reset.');
                navigate('/auth');
            } else {
                const errorData = await response.json();
                alert(`Failed to reset password: ${errorData.message || 'An unknown error occurred'}`);
            }
        } catch (error) {
            console.error('Error during password reset:', error);
            alert('Network request failed. Please check your network connection or contact the site administrator.');
        }
    };

    return (
        <div className="reset-password-page-container">  {/* Changed class name */}
            <h1>Reset Your Password</h1>
            <form onSubmit={handleSubmit} className="reset-password-page-form">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
}

export default ResetPasswordPage;
