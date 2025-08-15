import { createRoot } from "react-dom/client";
// Temporarily bypass complex imports
// import App from "./App";
import "./index.css";

// Simple test component
function TestApp() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>React Test - BazaarLive</h1>
      <p>If you see this, React is working!</p>
      <div style={{ background: '#e5e7eb', padding: '10px', marginTop: '10px' }}>
        Test div with styling
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<TestApp />);
} else {
  console.error("Root element not found");
}
