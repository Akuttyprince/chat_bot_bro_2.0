import { Routes, Route } from 'react-router-dom';
import Chat from './compontents/Chat';
import History from './compontents/History';
import Content from './compontents/Content';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Chat />} />
      <Route path="/history" element={<History />} />
      <Route path="/content" element={<Content />} />
    </Routes>
  );
}

export default App;