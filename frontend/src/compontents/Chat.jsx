import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FloatingJokeBar from './FloatingJokeBar';

const Chat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [levels, setLevels] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000'; // Update for deployment

  const sendMessage = async () => {
    if (!input) return;

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();

      await fetch(`${API_BASE_URL}/save_history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, response: data.response || data.answer }),
      });

      if (data.levels) {
        setResponse(data.response);
        setLevels(data.levels);
        setSelectedQuestion(data.question);
      } else if (data.answer) {
        setResponse(`${data.response}\nAnswer: ${data.answer}`);
        const utterance = new SpeechSynthesisUtterance(data.answer);
        window.speechSynthesis.speak(utterance);
        setLevels([]);
        setSelectedQuestion(null);
      } else {
        setResponse(data.response);
      }

      setInput('');
    } catch (error) {
      console.error('Chat error:', error);
      setResponse('Oops, something broke, bro!');
    }
  };

  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setResponse('Listening... Speak now!');
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      console.log('Voice input:', text);
      setInput(text);
      setResponse(`Heard: "${text}"—hit Send to ask!`);
    };

    recognition.onerror = (event) => {
      console.error('Voice error:', event.error);
      setResponse(`Voice failed: ${event.error}. Try again, bro!`);
    };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload_questions`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResponse(data.status || data.error);
    } catch (error) {
      console.error('Upload error:', error);
      setResponse('Upload failed, bro!');
    }
  };

  const selectLevel = (level) => {
    navigate(`/content?level=${level}&question=${encodeURIComponent(selectedQuestion.question)}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Chat with Bro</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="mb-4 h-64 overflow-y-auto">
          <p className="text-gray-800">{response}</p>
          {levels.length > 0 && (
            <div className="mt-4">
              <p className="text-blue-600">Pick your level:</p>
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => selectLevel(level)}
                  className="m-2 p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {level}
                </button>
              ))}
              {selectedQuestion && (
                <>
                  <p className="text-blue-600 mt-2">Fun Fact: {selectedQuestion.funFact}</p>
                  <p className="text-blue-600">Tip: {selectedQuestion.suggestion}</p>
                  <Link to={`/content?level=beginner&question=${encodeURIComponent(selectedQuestion.question)}`}>
                    <button className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Click here to get your answer
                    </button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Ask away!"
        />
        <div className="flex gap-2">
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
          <button
            onClick={handleVoiceInput}
            className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🎙️ Voice
          </button>
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".json"
            className="p-2"
          />
        </div>
        <Link to="/history">
          <button className="mt-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            View History
          </button>
        </Link>
      </div>
      <FloatingJokeBar />
    </div>
  );
};

export default Chat;