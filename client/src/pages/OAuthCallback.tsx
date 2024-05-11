// src/pages/OAuthCallback.tsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { exchangeCodeForToken, exchangeCodeForMicrosoftToken } from '../network/users_api'; // Import exchangeMicrosoftCodeForToken

const OAuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const code = query.get('code');
        const service = location.pathname.includes('google') ? 'google' : 'microsoft';
    
        if (code) {
            const exchangeFunction = service === 'google' ? exchangeCodeForToken : exchangeCodeForMicrosoftToken;
            exchangeFunction(code)
                .then((data) => {
                    console.log(`${service} login successful`, data);
                    localStorage.setItem('isLoggedIn', 'true');
                    navigate('/'); // Redirect to home or other page as needed
                })
                .catch((error) => {
                    console.error(`Error during ${service} token exchange:`, error);
                    navigate('/auth'); // Optionally handle errors by redirecting back to login
                });
        }
    }, [location, navigate]);

    return <div>Processing your login...</div>;
};


export default OAuthCallback;
