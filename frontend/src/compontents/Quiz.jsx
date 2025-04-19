// Quiz.jsx

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/quiz.css";

// Quiz data
const quizData = {
  beginner: [
    {
      q: "What does HTML stand for?",
      options: ["HyperText Markup Language", "HighText Machine Language", "Home Tool Markup Language"],
      answer: "HyperText Markup Language",
    },
    {
      q: "Which tag is used for inserting a line break?",
      options: ["<br>", "<lb>", "<break>"],
      answer: "<br>",
    },
    {
      q: "CSS is used for?",
      options: ["Structure", "Logic", "Styling"],
      answer: "Styling",
    },
  ],
  medium: [
    {
      q: "Which React hook is used for managing state?",
      options: ["useFetch", "useState", "useClass"],
      answer: "useState",
    },
    {
      q: "What does API stand for?",
      options: ["Application Programming Interface", "Apple Programming Interface", "Applied Programming Internet"],
      answer: "Application Programming Interface",
    },
    {
      q: "Which CSS position property lets an element float with scroll?",
      options: ["relative", "fixed", "absolute"],
      answer: "fixed",
    },
  ],
  advanced: [
    {
      q: "Which HTTP method is used to update data?",
      options: ["GET", "PUT", "DELETE"],
      answer: "PUT",
    },
    {
      q: "What is MongoDB?",
      options: ["Relational DB", "Document DB", "Spreadsheet"],
      answer: "Document DB",
    },
    {
      q: "Which one is a JavaScript framework?",
      options: ["React", "Laravel", "Flask"],
      answer: "React",
    },
  ],
};

const Quiz = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const level = new URLSearchParams(search).get("level") || "beginner";
  const questions = quizData[level];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("");
  const [finished, setFinished] = useState(false);

  const handleNext = () => {
    if (selected === questions[current].answer) {
      setScore(score + 1);
    }
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected("");
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="quiz-container">
      <h2 className="quiz-header">{level} Level Quiz</h2>

      {!finished ? (
        <div className="quiz-card">
          <h3 className="quiz-question">
            Q{current + 1}: {questions[current].q}
          </h3>
          <div className="flex flex-col gap-3">
            {questions[current].options.map((option, idx) => (
              <label key={idx} className="option-label">
                <input
                  type="radio"
                  value={option}
                  checked={selected === option}
                  onChange={(e) => setSelected(e.target.value)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
          <button
            onClick={handleNext}
            className="quiz-button"
            disabled={!selected}
          >
            {current === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      ) : (
        <div className="end-screen">
          <h3>Quiz Completed!</h3>
          <p>Score: {score} / {questions.length}</p>
          <p className="mt-2">🎓 You’re ready to explore more content!</p>
          <button
            onClick={() => navigate(`/content?level=${level}`)}
            className="learn-more-button"
          >
            Go to Learning Content 🚀
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
