import React from 'react';
import '../styles/CreateAccount.css'; // 确保引入正确的CSS文件 
import googleLogo from '../asserts/images/google-logo.svg'; // 更新图片文件路径
import microsoftLogo from '../asserts/images/microsoft-logo.svg'; // 更新图片文件路径
import { Link } from 'react-router-dom';

const CreateAccount = () => {
  // ...保留逻辑不变

  return (
    <div className="create-account-wrapper">
      <div className="create-account-container">
        {/* 左侧表单部分 */}
        <div className="form-section">
          <h2>Create Account</h2>
          <p>Sync your work calendar to start using Donkey</p>
          <div className="social-login">
            <button className="social-button google">
              <img src={googleLogo} alt="Google" />
              <span className="button-text">Continue with Google</span>
            </button>
            <button className="social-button microsoft">
              <img src={microsoftLogo} alt="Microsoft" />
              <span className="button-text">Continue with Microsoft</span>
            </button>
          </div>
          <p className="calendar-access" style={{ marginTop: '40px', textDecoration: 'underline' }}>
  Why does Otter need calendar access?
</p>

          <div className="divider"></div>
          <form className="auth-form">
            <input type="email" placeholder="Email" required />
            <button className="sign-in-button">Create account</button>
            <Link to="/auth" className="create-account-link">Already have an Dunkey Account? Sign in</Link>
            <p className="terms-service">
                By using Otter you agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
            </p>
          </form>
        </div>
        {/* 右侧介绍部分 */}
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
