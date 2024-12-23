export const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true') {
      console.log(`[Debug] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true') {
      console.error(`[Debug Error] ${message}`, error);
    }
  }
}; 