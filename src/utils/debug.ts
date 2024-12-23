export const debug = {
  log: (message: string, data?: any) => {
    console.log(`[PowerMTA] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[PowerMTA Error] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[PowerMTA Warning] ${message}`, data);
  }
}; 