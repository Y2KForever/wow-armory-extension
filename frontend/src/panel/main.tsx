import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import './panel.css';
import { store } from '../store/store';
import { Provider } from 'react-redux';
import App from './App.tsx';
import { installTwitchDevMock } from '@/dev/twitchMock';

installTwitchDevMock();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
        <App />
    </Provider>
  </StrictMode>,
);
