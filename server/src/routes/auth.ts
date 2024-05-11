// src/routes/auth.ts
import express from 'express';
import { getGoogleAuthURL, getTokens, getMicrosoftAuthURL, getMicrosoftTokens } from '../controllers/authController';
const router = express.Router();

router.get('/google/url', (req, res) => {
    const url = getGoogleAuthURL();
    res.json({ url });
});

router.get('/microsoft/url', async (req, res) => {
    try {
        const url = await getMicrosoftAuthURL();
        // 发送包含URL的JSON对象，而不是重定向
        res.json({ url });
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to get Microsoft authorization URL');
    }
});






// 改成POST请求处理Google登录回调
router.post('/google/callback', async (req, res) => {
    const code = req.body.code; // 假设Google的响应在POST的body中

    if (!code) {
        return res.status(400).json({ error: 'Invalid request: no code provided' });
    }

    try {
        const tokens = await getTokens({ code });
        // 此处根据你的前端路径调整
        res.json({ tokens }); // 或者其他需要传递给前端的信息
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

router.post('/microsoft/callback', async (req, res) => {
    const code = req.body.code;
  
    if (!code) {
      return res.status(400).json({ error: 'Invalid request: no code provided' });
    }
  
    try {
      const tokens = await getMicrosoftTokens(code);
      res.json({ tokens }); // 或者进行其他操作，比如创建会话等
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

export default router;
