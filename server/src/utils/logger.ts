export const logger = {
  info: (msg: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? meta : '');
  },
  warn: (msg: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? meta : '');
  },
  error: (msg: string, meta?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta ? meta : '');
  },
  autonomous: (service: string, action: string, details?: any) => {
    console.log(`[AUTONOMOUS-AI] [${service.toUpperCase()}] ${new Date().toISOString()} - ${action}`, details ? details : '');
  }
};
