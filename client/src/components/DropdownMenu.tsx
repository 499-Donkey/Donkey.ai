// components/DropdownMenu.tsx

import React from 'react';

// 首先定义一个类型为用户的属性
interface User {
  name: string;
  email: string;
}

interface DropdownMenuProps {
  user: User;
  onLogout: () => void; // 假设 onLogout 是一个没有参数的函数
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ user, onLogout }) => {
  return (
    <div className="dropdown-menu">
      <div className="dropdown-item">{user.email}</div>
      {/* 添加更多的菜单项 */}
      <div className="dropdown-item" onClick={onLogout}>Log out</div>
    </div>
  );
};

export default DropdownMenu;
