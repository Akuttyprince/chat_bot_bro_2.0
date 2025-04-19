import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FloatingJokeBar from './FloatingJokeBar';
import '../styles/Chat.css';

const Chat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [level, setLevel] = useState(null);
  const [learningQuiz, setLearningQuiz] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();
  const synthRef = useRef(window.speechSynthesis);
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const loadVoices = () => {
      const loadedVoices = synthRef.current.getVoices();
      if (loadedVoices.length > 0) setVoices(loadedVoices);
    };
    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text) => {
    if (!text || !voices.length) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[selectedVoiceIndex];
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const sendMessage = async () => {
    if (!input) return;
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    const data = await res.json();
    setResponse(data.response);
    setQuiz(data.quiz);
    fetch(`${API_BASE_URL}/save_history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input, response: data.response }),
    });
    setInput('');
  };

  const submitQuiz = async () => {
    const res = await fetch(`${API_BASE_URL}/assess_level`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const { level } = await res.json();
    setLevel(level);
    const answerRes = await fetch(`${API_BASE_URL}/get_answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, level }),
    });
    const structuredAnswer = await answerRes.json();
    navigate(`/content?level=${level}&answer=${encodeURIComponent(JSON.stringify(structuredAnswer))}&question=${encodeURIComponent(input)}`);
    fetch(`${API_BASE_URL}/save_history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input, response: JSON.stringify(structuredAnswer) }),
    });
  };

  const checkLearning = async () => {
    const res = await fetch(`${API_BASE_URL}/check_learning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, level }),
    });
    const data = await res.json();
    setLearningQuiz(data.quiz);
    setResponse(data.response);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Chat with Bro 2.0</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="mb-4 h-64 overflow-y-auto whitespace-pre-wrap">
          <p className="text-gray-800">{response}</p>
          {quiz && quiz.map((q, i) => (
            <div key={i} className="mt-4">
              <p>{q.text}</p>
              {q.options.map((opt, j) => (
                <div key={j}>
                  <input
                    type="radio"
                    name={q.text}
                    value={opt}
                    onChange={(e) => setAnswers({ ...answers, [q.text]: e.target.value })}
                    className="mr-2"
                  />
                  {opt}
                </div>
              ))}
            </div>
          ))}
          {quiz && <button onClick={submitQuiz} className="mt-2 p-2 bg-green-500 text-white rounded hover:bg-green-600">Submit Quiz</button>}
          {level && (
            <div className="mt-4">
              <p>Your level: {level}</p>
              <button onClick={checkLearning} className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Check What You Learned</button>
            </div>
          )}
          {learningQuiz && learningQuiz.map((q, i) => (
            <div key={i} className="mt-4">
              <p>{q.text}</p>
              {q.options.map((opt, j) => (
                <div key={j}>
                  <input
                    type="radio"
                    name={`learn-${q.text}`}
                    value={opt}
                    onChange={(e) => setAnswers({ ...answers, [`learn-${q.text}`]: e.target.value })}
                    className="mr-2"
                  />
                  {opt}
                </div>
              ))}
            </div>
          ))}
          {learningQuiz && <button onClick={() => setLearningQuiz(null)} className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600">Finish Check</button>}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="w-full p-2 border rounded mb-2"
          placeholder="Ask away!"
        />
        <div className="flex gap-2 flex-wrap">
          <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Send</button>
          <button onClick={() => speak(response)} className="p-2 bg-green-500 text-white rounded hover:bg-green-600">🔈 Speak</button>
          <input type="file" onChange={async (e) => {
            setResponse('Upload feature disabled as questions.json is not in use.');
          }} className="p-2" disabled />
        </div>
        <Link to="/history">
          <button className="mt-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full">View History</button>
        </Link>
      </div>
      <FloatingJokeBar />
    </div>
  );
};

export default Chat;