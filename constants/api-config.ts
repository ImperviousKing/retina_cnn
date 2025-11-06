export const RETFOUND_API = {
  baseUrl: __DEV__ 
    ? 'http://localhost:5000'
    : process.env.EXPO_PUBLIC_RETFOUND_API_URL || 'https://your-retfound-api.com',
  endpoints: {
    health: '/health',
    analyze: '/analyze',
  },
  timeout: 30000,
  githubRepo: 'https://github.com/openmedlab/RETFound_MAE',
};

export const API_CONFIG = {
  retfound: RETFOUND_API,
  preferRETFound: true,
  fallbackToCNN: false,
};
