import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from "react-helmet-async";

import './styles/adminstyles/admin.css';
import './styles/adminstyles/adminarticles.css';

import './styles/ShoeStrap.css';
import './styles/_index.css';
import './styles/header.css';
import './styles/footer.css';
import './styles/homescreen.css';
import './styles/banddeailsscreen.css';
import './styles/bandsscreen.css';
import './styles/about.css';
import './styles/releases.css';
import './styles/articles.css';
import './styles/playlists.css';



import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <HelmetProvider>
    <App />
  </HelmetProvider>
);

