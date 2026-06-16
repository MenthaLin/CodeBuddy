/**
 * main.tsx - 应用入口文件
 * English Fun Zone
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// 渲染根组件
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/CodeBuddy">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
