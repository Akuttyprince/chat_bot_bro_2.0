import { useLocation, Link } from 'react-router-dom';

const Content = () => {
  const { search } = useLocation();
  const level = new URLSearchParams(search).get("level") || "beginner";
  const answerStr = decodeURIComponent(new URLSearchParams(search).get("answer") || "{}");
  const question = decodeURIComponent(new URLSearchParams(search).get("question") || "");
  const answer = JSON.parse(answerStr);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Content</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
        <p className="text-blue-600">Question: {question}</p>
        <p className="text-gray-800">Level: {level}</p>
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-orange-600">📺 Video Lessons</h3>
          <ul className="mt-2 space-y-2">
            {answer.videos.map((url, index) => (
              <li key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Video {index + 1}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-orange-600">🧠 Learning Tips</h3>
          <ul className="list-disc ml-6">
            {answer.tips.map((tip, index) => <li key={index}>{tip}</li>)}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-orange-600">💡 Real Life Example</h3>
          <p className="ml-2">{answer.example}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-orange-600">🎮 Fun/GK Fact</h3>
          <p className="ml-2 italic">{answer.funFact}</p>
        </div>
        <Link to="/">
          <button className="mt-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600">Back to Chat</button>
        </Link>
      </div>
    </div>
  );
};

export default Content;