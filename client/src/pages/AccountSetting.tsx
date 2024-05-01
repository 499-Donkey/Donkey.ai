// AccountSetting.tsx
import React, { useState } from 'react';
import '../styles/AccountSetting.css';

const AccountSetting = () => {
    const [activeTab, setActiveTab] = useState('general');
    const userEmail = localStorage.getItem('userEmail') || '';
    const [password, setPassword] = useState('');  // 用于输入新密码
    const [isEditing, setEditing] = useState(false);  // 控制编辑状态

    // 从localStorage获取的用户名
    const userName = "username"; // 这应该基于实际登录用户信息获取

    // 处理密码更新
    const handlePasswordUpdate = async () => {
        const response = await fetch('/api/users/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: password })
        });

        if (response.ok) {
            alert('Password updated successfully');
            setPassword('');  // 清空密码字段
            setEditing(false);  // 关闭编辑模式
        } else {
            alert('Failed to update password');
        }
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'general':
                return (
                    <div className="profile-section">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <div className="avatar-circle">
                                    <span className="initials">{userName.charAt(0)}</span>
                                </div>
                            </div>
                            <div className="profile-info">
                                <h2>{userName}</h2>
                                <p>Email: {userEmail}</p>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="New password"
                                        />
                                        <button onClick={handlePasswordUpdate}>Update Password</button>
                                        <button onClick={() => setEditing(false)}>Cancel</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setEditing(true)}>Edit</button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'personalization':
                return <div>Personalization settings</div>;
            case 'security':
                return <div>Security settings</div>;
            case 'notifications':
                return <div>Notification settings</div>;
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
