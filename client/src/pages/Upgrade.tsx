// Upgrade.tsx

import React, { useState } from 'react';
import '../styles/Upgrade.css';

const Upgrade = () => {
  const [modalVisible, setModalVisible] = useState(false); // 控制模态的显示

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <div className="upgrade-container">
      {/* Existing content */}
      <div className="plan">
        <div className="plan-header">
          <div className="plan-title">Plus</div>
          <div className="plan-cost">USD 9.99/month</div>
        </div>
        <button className="current-plan">Your current plan</button>
        <ul className="plan-features">
          <li>Access to Donkey-AI-Up, our most capable model</li>
          <li>Browse, create, and use Donkey-AI</li>
          <li>Access to additional tools like Browsing, Advanced Data Analysis and more</li>
        </ul>
        <div className="plan-action">
          <button onClick={toggleModal}>Manage my subscription</button>
        </div>
      </div>

      {/* Modal Component */}
      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={toggleModal}>&times;</span>
            <h2>Manage Subscription</h2>
            <p>Here you can update your subscription preferences, renew or cancel your plan, or change billing information.</p>
            <div className="modal-actions">
              <button onClick={() => alert('Subscription Updated!')}>Update</button>
              <button onClick={toggleModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upgrade;
