import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Content = () => {
  const location = new URLSearchParams(useLocation().search);
  const level = location.get('level');
  const question = location.get('question');
  const [answer, setAnswer] = useState('');
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: question }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.question && data.question.answer[level]) {
          setAnswer(data.question.answer[level]);
        }
      });
  }, [level, question]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Content</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        <p className="text-blue-600">Question: {question}</p>
        <p className="text-gray-800">Level: {level}</p>
        <p className="text-gray-800 mt-2">{answer}</p>
        <Link to="/">
          <button className="mt-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Back to Chat
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Content;