const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.VITE_USER_NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (import.meta.env.VITE_USER_NODE_ENV !== 'production') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.VITE_USER_NODE_ENV !== 'production') {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (import.meta.env.VITE_USER_NODE_ENV !== 'production') {
      console.info(...args);
    }
  }
};

export default logger;
