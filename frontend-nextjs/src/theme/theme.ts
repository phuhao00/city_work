export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    gray: string;
    lightGray: string;
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      s: number;
      m: number;
      l: number;
      xl: number;
      xxl: number;
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#4E6BFF',
    secondary: '#FF6B6B',
    background: '#FFFFFF',
    card: '#F9F9F9',
    text: '#333333',
    border: '#E0E0E0',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#007AFF',
    gray: '#8E8E93',
    lightGray: '#F2F2F7',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
  },
  typography: {
    fontFamily: {
      regular: 'Inter, sans-serif',
      medium: 'Inter, sans-serif',
      bold: 'Inter, sans-serif',
    },
    fontSize: {
      xs: 12,
      s: 14,
      m: 16,
      l: 18,
      xl: 20,
      xxl: 24,
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#5E7BFF',
    secondary: '#FF7B7B',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#2C2C2C',
    notification: '#FF453A',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FFD60A',
    info: '#0A84FF',
    gray: '#8E8E93',
    lightGray: '#2C2C2C',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
  },
  typography: {
    fontFamily: {
      regular: 'Inter, sans-serif',
      medium: 'Inter, sans-serif',
      bold: 'Inter, sans-serif',
    },
    fontSize: {
      xs: 12,
      s: 14,
      m: 16,
      l: 18,
      xl: 20,
      xxl: 24,
    },
  },
};