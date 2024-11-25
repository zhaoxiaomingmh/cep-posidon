import ReactDOM from 'react-dom/client';
import { App, AppRef } from './router/App';
import React from 'react';
import '@/locales/i18n';
import 'intl-pluralrules';

if (!Object.fromEntries) {
    Object.fromEntries = function (entries) {
        if (!entries || !entries[Symbol.iterator]) {
            throw new TypeError('Object.fromEntries() requires a single iterable argument');
        }
        const obj = {};
        for (const [key, value] of entries) {
            obj[key] = value;
        }
        return obj;
    };
}

const domNode = document.getElementById('root');
console.log(domNode);
const root = ReactDOM.createRoot(domNode);
root.render(<App ref={AppRef} />);
