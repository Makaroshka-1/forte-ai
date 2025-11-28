require('dotenv').config();

module.exports = {
  gitlab: {
    url: process.env.GITLAB_URL || 'https://gitlab.com',
    token: process.env.GITLAB_TOKEN,
    projectId: process.env.GITLAB_PROJECT_ID,
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'default-secret',
    port: process.env.PORT || 3000,
  },
};
