import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// import './index.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min'
createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>,
)
