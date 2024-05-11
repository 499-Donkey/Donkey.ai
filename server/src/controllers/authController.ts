// authController.ts
import { google } from 'googleapis';
import { ConfidentialClientApplication, AuthorizationCodeRequest } from '@azure/msal-node';
import 'dotenv/config';

// Initialize MSAL client for Microsoft
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID as string, // Asserting as string
    authority: 'https://login.microsoftonline.com/common',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string, // Asserting as string
  }
};
const msalClient = new ConfidentialClientApplication(msalConfig);

export const getGoogleAuthURL = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID as string,
    process.env.GOOGLE_CLIENT_SECRET as string,
    process.env.GOOGLE_CALLBACK_URL as string
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile'],
    prompt: 'consent',
  });
};

export const getTokens = async ({ code }: { code: string }) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID as string,
    process.env.GOOGLE_CLIENT_SECRET as string,
    process.env.GOOGLE_CALLBACK_URL as string
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

export const getMicrosoftAuthURL = async (): Promise<string> => {
  try {
    const authCodeUrlParameters = {
      scopes: ["user.read"],
      redirectUri: process.env.MICROSOFT_REDIRECT_URI as string,
    };

    const url = await msalClient.getAuthCodeUrl(authCodeUrlParameters);
    return url;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get the authorization URL');
  }
};

export const getMicrosoftTokens = async (code: string) => {
  const tokenRequest: AuthorizationCodeRequest = {
    code: code,
    scopes: ["user.read"],
    redirectUri: process.env.MICROSOFT_REDIRECT_URI as string,
  };

  try {
    const response = await msalClient.acquireTokenByCode(tokenRequest);
    return response;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to acquire tokens');
  }
};



