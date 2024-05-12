
import React, { useState } from 'react';
import { updatePassword } from '../network/users_api'; 
import '../styles/AccountSetting.css';

const AccountSetting = () => {
    const [activeTab, setActiveTab] = useState('general');
    const userEmail = localStorage.getItem('userEmail') || '';
    const [newPassword, setNewPassword] = useState('');
    const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);  

    const handlePasswordUpdate = async () => {
        try {
            await updatePassword(newPassword);
            alert('Password updated successfully!');
            setNewPassword('');  
            setShowPasswordUpdate(false);  
        } catch (error) {
            if (error instanceof Error) {
                alert('Password update failed: ' + error.message);
            } else {
                alert('Password update failed due to an unknown error');
            }
        }
    };

    const toggleChangePassword = () => {
        setShowPasswordUpdate(!showPasswordUpdate);  
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'general':
                return (
                    <div>
                        <h2>General Settings</h2>
                        <p>Current User: <span className="user-email">{userEmail}</span></p>
                        <p className="change-password-link" onClick={toggleChangePassword}>Change password?</p>
                        {showPasswordUpdate && (
                            <div className="password-update">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="New Password"
                                />
                                <button onClick={handlePasswordUpdate}>Update Password</button>
                            </div>
                        )}
                    </div>
                );
            case 'personalization':
                return <div>Personalization Settings</div>;
            case 'security':
                return <div>Security Settings</div>;
            case 'notifications':
                return <div>Notifications Settings</div>;
            default:
                return <div>Select a category</div>;
        }
    };

    return (
        <div className="account-settings-container">
            <div className="settings-sidebar">
                <div className={`settings-sidebar-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</div>
                <div className={`settings-sidebar-item ${activeTab === 'personalization' ? 'active' : ''}`} onClick={() => setActiveTab('personalization')}>Personalization</div>
                <div className={`settings-sidebar-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</div>
                <div className={`settings-sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</div>
            </div>
            <div className="settings-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AccountSetting;
