import { useState, useEffect } from 'react';
import './App.css';

// Use the password you got from the Spring Boot startup log!
const USERNAME = 'user';
const PASSWORD = '3c80a7f1-5650-4325-9c54-a41782faf6ea';

function App() {
  const [message, setMessage] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Encode Basic Auth credentials
    const basicAuth = 'Basic ' + Buffer.from(USERNAME + ':' + PASSWORD).toString('base64');

    fetch('/api/test', {
      method: 'GET',
      headers: {
        'Authorization': basicAuth
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          // Read the response body if the status is not ok
          const errorText = await res.text();
          throw new Error(`HTTP error! Status: ${res.status}. Response: ${errorText}`);
        }
        return res.text();
      })
      .then(data => setMessage(data))
      .catch(e => {
        console.error("Fetch Error:", e);
        setError(`Failed to connect to backend: ${e instanceof Error ? e.message : 'Unknown error'}`);
      });
  }, []);

  return (
    <div className="App">
      <h1>Financial Manager Status</h1>
      <h2>Backend API Status:</h2>
      {error ? (
        <p className="status-error">Error: {error}</p>
      ) : (
        <p className="status-success">{message}</p>
      )}
      <p>Frontend running on port 5173 (Vite)</p>
      <p>Backend running on port 5050 (Spring Boot)</p>
    </div>
  );
}

export default App;