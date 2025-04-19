import { useState } from 'react';

const jokes = [
  'Why don’t programmers prefer dark mode? Because the light attracts bugs.',
  'Why was the computer cold? It left its Windows open!',
  'Why did the coder quit? They couldn’t find any statistically significant reason to stay!',
];

const FloatingJokeBar = () => {
  const [joke, setJoke] = useState('');

  const tellJoke = () => {
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    setJoke(randomJoke);
    const utterance = new SpeechSynthesisUtterance(randomJoke);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-300 p-4 rounded-lg shadow-lg">
      <button
        onClick={tellJoke}
        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Feeling Bored? Get a Joke!
      </button>
      {joke && <p className="mt-2 text-gray-800">{joke}</p>}
    </div>
  );
};

export default FloatingJokeBar;