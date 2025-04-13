const FloatingJokeBar = () => {
    const jokes = [
      'Why did the coder quit? Too many bugs in life!',
      'What’s a coder’s favorite snack? Chips and dip!',
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
  
    return (
      <div className="fixed bottom-4 left-4 bg-yellow-200 p-2 rounded-lg shadow">
        <p className="text-sm text-gray-800">{joke}</p>
      </div>
    );
  };
  
  export default FloatingJokeBar;