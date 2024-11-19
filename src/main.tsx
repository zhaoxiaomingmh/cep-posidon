import ReactDOM from 'react-dom/client';
import { App, AppRef } from './router/App';
import React from 'react';

const domNode = document.getElementById('root');
console.log(domNode);
const root = ReactDOM.createRoot(domNode);
root.render(<App ref={AppRef} />);
