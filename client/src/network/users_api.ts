// user_api.ts

// import { ConflictError, UnauthorizedError } from "../errors/http_errors";
import { User } from "../models/user"


// 用于发起网络请求并处理响应
async function fetchData(input: RequestInfo, init?: RequestInit) {
    const response = await fetch(input, init);
    if (response.ok) {
        return response;
    } else {
        const errorBody = await response.json();
        const errorMessage = errorBody.error || 'An unknown error occurred';
        throw new Error(errorMessage);
    }
}

// 获取当前登录的用户信息
export async function getLoggedInUser(): Promise<User> {
    const response = await fetchData("/api/users", { method: "GET" });
    return response.json();
}



// 获取 Google 授权 URL
export async function getGoogleAuthUrl() {
    const response = await fetch('/api/auth/google/url');
    const data = await response.json();
    return data.url;
}
  

  // 获取 Microsoft 授权 URL
export async function getMicrosoftAuthUrl() {
    try {
        const response = await fetch('/api/auth/microsoft/url');
        // 由于你后端可能进行重定向，这里需要根据实际响应处理
        // 如果后端发送的是重定向 URL，则在这里处理
        if (response.redirected) {
            return response.url; // 如果有重定向，返回重定向的 URL
        } else {
            const data = await response.json();
            return data.url; // 如果返回的是 JSON，返回 URL 字段
        }
    } catch (error) {
        console.error('Error fetching the Microsoft auth URL:', error);
        throw new Error('Failed to fetch the Microsoft auth URL');
    }
}


// 使用授权码交换 Microsoft 令牌
export async function exchangeCodeForMicrosoftToken(code: string) {
    const response = await fetch(`/api/auth/microsoft/callback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    });
    if (!response.ok) {
        throw new Error('Failed to exchange code for token with Microsoft');
    }
    return await response.json();
}

export interface SignUpCredentials {
    username: string,
    email: string,
    password: string,
}

// 用户注册
export async function signUp(credentials: SignUpCredentials): Promise<User> {
    const response = await fetchData("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    return response.json();
}


export interface LoginCredentials {
   
    password: string,
    username: string,
}

// 用户登录
export async function login(credentials: LoginCredentials): Promise<User> {
    const response = await fetchData("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    return response.json();
}


// 用户登出
export async function logout() {
    await fetchData("/api/users/logout", { method: "POST" });
}

// Add your other imports and functions above as needed

// 使用授权码交换 Google 令牌（之前已实现）
export async function exchangeCodeForToken(code: string) {
    const response = await fetch(`/api/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });
    if (!response.ok) {
        throw new Error('Failed to exchange code for token');
    }
    return await response.json();
}