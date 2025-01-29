import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import './config.css';
import { store } from '../store/store';
import { Provider } from 'react-redux';
import App from './App.tsx';
import { ThemeProvider } from '@/components/ThemeProvider.tsx';

createRoot(document.getElementById('root-config')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark">
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
