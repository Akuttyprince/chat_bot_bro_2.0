import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FloatingJokeBar from './FloatingJokeBar';
import '../styles/Chat.css';
const Chat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [levels, setLevels] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();
  const synthRef = useRef(window.speechSynthesis);

  const API_BASE_URL = 'http://localhost:5000'; // update for deployment

  useEffect(() => {
    const loadVoices = () => {
      const loadedVoices = synthRef.current.getVoices();
      if (loadedVoices.length > 0) {
        setVoices(loadedVoices);
      }
    };

    loadVoices();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("Loaded voices:", voices.map(v => `${v.name} (${v.lang})`));
    };
  
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);
  

  const speak = (text) => {
    if (!text || !voices.length) return;

    const isTamil = /[\u0B80-\u0BFF]/.test(text);
    let voiceToUse = voices[selectedVoiceIndex];

    if (isTamil) {
      const tamilVoice = voices.find((v) => v.lang.includes('ta'));
      if (tamilVoice) {
        voiceToUse = tamilVoice;
        console.log('Using Tamil voice:', tamilVoice.name);
      } else {
        console.warn('Tamil voice not found.');
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceToUse;
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
        const fullResponse = `${data.response}\nAnswer: ${data.answer}`;
        setResponse(fullResponse);
        speak(data.answer);
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
      setResponse(`Heard: "${text}" — hit Send to ask!`);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Chat with Bro 2.0</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="mb-4 h-64 overflow-y-auto whitespace-pre-wrap">
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
          onKeyDown={handleKeyDown}
          className="w-full p-2 border rounded mb-2"
          placeholder="Ask away!"
        />

        <div className="flex gap-2 flex-wrap">
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
          <button
            onClick={isSpeaking ? stopSpeaking : () => speak(response)}
            className={`p-2 text-white rounded ${isSpeaking ? 'bg-red-500' : 'bg-green-500'} hover:opacity-80`}
          >
            {isSpeaking ? '🛑 Stop Voice' : '🔈 Speak Again'}
          </button>
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".json"
            className="p-2"
          />
        </div>

        <div className="mt-2">
          <label className="text-sm text-gray-600">Change Voice:</label>
          <select
            className="w-full p-1 border rounded"
            value={selectedVoiceIndex}
            onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
          >
            {voices.map((v, i) => (
              <option key={i} value={i}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        <Link to="/history">
          <button className="mt-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full">
            View History
          </button>
        </Link>
      </div>

      <FloatingJokeBar />
    </div>
  );
};

export default Chat;
