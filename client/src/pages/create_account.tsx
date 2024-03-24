import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/CreateAccount.css';
import googleLogo from '../assets/google-logo.svg';
import microsoftLogo from '../assets/microsoft-logo.svg';
import { signUp } from '../network/users_api';


const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage(''); // Clear any previous error message
  
    try {
      const user = await signUp({ email, username: email, password }); // Assuming username can be the email
      console.log('Account created successfully:', user);
      navigate('/auth'); // Navigate to the login page upon successful sign up
    } catch (error) {
      console.error('Error creating account:', error);
  
      // Type guard to ensure error is an instance of Error
      if (error instanceof Error) {
        setErrorMessage(error.message || 'An unexpected error occurred. Please try again later.');
      } else {
        // If error is not an Error instance, we cannot be sure of its structure
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="create-account-wrapper">
      <div className="create-account-container">
        <div className="form-section">
          <h2>Create Account</h2>
          <p>Sync your work calendar to start using Donkey</p>
          <div className="social-login">
            <button className="social-button google">
              <img src={googleLogo} alt="Google" />
              <span>Continue with Google</span>
            </button>
            <button className="social-button microsoft">
              <img src={microsoftLogo} alt="Microsoft" />
              <span>Continue with Microsoft</span>
            </button>
          </div>
          <p className="calendar-access" style={{ marginTop: '40px', textDecoration: 'underline' }}>
            Why does Donkey.ai need calendar access?
          </p>
          <div className="divider"></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="sign-in-button">Create account</button>
          </form>
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* 显示错误消息 */}
          <Link to="/auth" className="create-account-link">Already have an Donkey Account? Sign in</Link>
          <p className="terms-service">
            By using Donkey.ai you agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
        <div className="info-section">
          <div className="testimonial-container">
            <blockquote className="testimonial-quote">
              “Donkey has really boosted my confidence in my work because now I know that every user interview I conduct is stored somewhere for me always to look back to.”
            </blockquote>
            <p className="testimonial-author">Donkey, Product Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
