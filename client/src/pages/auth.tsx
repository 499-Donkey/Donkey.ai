import React, { useState } from 'react';
import { login, signUp, LoginCredentials, SignUpCredentials } from '../network/users_api';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({ username: '', password: '' });
    const [signUpCredentials, setSignUpCredentials] = useState<SignUpCredentials>({ username: '', password: '', email: '' });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isLogin) {
            setLoginCredentials({ ...loginCredentials, [event.target.name]: event.target.value });
        } else {
            setSignUpCredentials({ ...signUpCredentials, [event.target.name]: event.target.value });
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            if (isLogin) {
                const user = await login(loginCredentials);
                console.log('Logged in user:', user);
            } else {
                const user = await signUp(signUpCredentials);
                console.log('Registered user:', user);
            }
        } catch (error) {
            console.error('Authentication error:', error);
        }
    };

    return (
        <div className="container">
            <h1>{isLogin ? 'Login' : 'Register'}</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    value={isLogin ? loginCredentials.username : signUpCredentials.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                />
                {!isLogin && (
                    <input
                        type="email"
                        name="email"
                        value={signUpCredentials.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                    />
                )}
                <input
                    type="password"
                    name="password"
                    value={isLogin ? loginCredentials.password : signUpCredentials.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                />
                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
        </div>
    );
};

export default Auth;

