import { Routes, Route } from 'react-router-dom';
import Chat from './compontents/Chat';
import History from './compontents/History';
import Content from './compontents/Content';
import Quiz from './compontents/Quiz';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Chat />} />
      <Route path="/history" element={<History />} />
      <Route path="/content" element={<Content />} />
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  );
}

export default App;