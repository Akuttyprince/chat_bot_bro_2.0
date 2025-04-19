import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_BASE_URL}/get_history`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error('History error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Chat History</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        {history.length === 0 ? (
          <p>No history yet, bro!</p>
        ) : (
          history.map((entry, index) => (
            <div key={index} className="mb-4">
              <Link to={`/content?level=beginner&answer=${encodeURIComponent(entry.response)}&question=${encodeURIComponent(entry.question)}`}>
                <p className="text-blue-600 underline">Q: {entry.question}</p>
              </Link>
              <p className="text-gray-800">A: {entry.response}</p>
            </div>
          ))
        )}
        <Link to="/">
          <button className="mt-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600">Back to Chat</button>
        </Link>
      </div>
    </div>
  );
};

export default History;