import React from 'react';
import { FaTwitter, FaLinkedin } from 'react-icons/fa'; 
import '../styles/footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="social-icons">
                        {/* <a href="https://twitter.com/your_twitter_handle" target="_blank" rel="noopener noreferrer">
                            <FaTwitter />
                        </a>
                        <a href="https://www.linkedin.com/in/your_linkedin_profile" target="_blank" rel="noopener noreferrer">
                            <FaLinkedin />
                        </a> */}
                    </div>
                    <p className="copyright">Copyright © 2024 Donkey.ai. All Rights Reserved.</p>
                    <p className="legal-info">
                        <a href="/">Terms of Service</a> | <a href="/">Privacy Policy</a> | <a href="/">Contact Us</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
