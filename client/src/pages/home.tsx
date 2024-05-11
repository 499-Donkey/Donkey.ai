import React from 'react';
import { Link } from 'react-router-dom'; 
import '../styles/home.css';

import uploadImage from '../assets/upload_home.jpg';
import transcriptImage from '../assets/trans_home.jpg';
import questionImage from '../assets/ques_home.jpg';

const Home: React.FC = () => {
    return (
        <div className="container">
            <h1 className="greeting-title">Having Done The Key For You.</h1>
            <div className="sections">
                <div className="section">
                    <h2>Upload Your Media File</h2>
                    <p>Upload your file to start the process</p>
                    <img src={uploadImage} alt="Upload" />
                </div>
                <div className="section">
                    <h2>Get An Evaluation Report</h2>
                    <p>Access the results of your uploaded files</p>
                    <img src={transcriptImage} alt="Transcript" />
                </div>
                <div className="section">
                    <h2>Extract What You Want</h2>
                    <p>Interact with your data through queries</p>
                    <img src={questionImage} alt="Question" />
                </div>
            </div>

            <Link to="/upload" className="start-button">
                START
            </Link>

            <p className="funny-paragraph">
                Welcome to Donkey.ai, where we've done the heavy lifting, or should we say, 'key lifting' for you! Our AI-powered platform is like having a team of hyper-intelligent donkeys (without the stubbornness) working tirelessly to analyze and organize your video content. 
                We don't just talk the talk; we 'hee-haw' the 'key' to unlocking seamless video processing! So, saddle up and let Donkey.ai take the reins while you sit back and enjoy the ride!
            </p>
        </div>
    );
};

export default Home;