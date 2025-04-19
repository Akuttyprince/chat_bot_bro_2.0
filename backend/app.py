from flask import Flask, request, jsonify
import json
import requests
from config import XAI_API_KEY
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_input = request.json.get('input').lower()
        headers = {'Authorization': f'Bearer {XAI_API_KEY}', 'Content-Type': 'application/json'}
        # Generate quiz from Groq
        quiz_prompt = f"Generate 3 simple questions to assess a user's knowledge level for the topic '{user_input}'. Return a JSON object with 'questions' (array of objects with text, options, and correct answer)."
        quiz_payload = {'model': 'llama-3.3-70b-versatile', 'messages': [{'role': 'user', 'content': quiz_prompt}], 'response_format': {'type': 'json_object'}}
        quiz_response = requests.post('https://api.groq.com/openai/v1/chat/completions', json=quiz_payload, headers=headers, timeout=5)
        if quiz_response.status_code != 200:
            return jsonify({'response': f"Quiz generation failed: {quiz_response.status_code}"})
        quiz_data = json.loads(quiz_response.json()['choices'][0]['message']['content'])
        quiz = quiz_data['questions']
        
        return jsonify({'response': "Let’s find your level! Answer these:", 'quiz': quiz, 'question': user_input})
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({'response': f"Chat error: {str(e)}"})

@app.route('/get_answer', methods=['POST'])
def get_answer():
    try:
        user_input = request.json.get('input')
        level = request.json.get('level')
        headers = {'Authorization': f'Bearer {XAI_API_KEY}', 'Content-Type': 'application/json'}
        prompt = f"Explain '{user_input}' for a {level} learner. Return a JSON object with: 'videos' (3 YouTube URLs), 'tips' (3 learning tips), 'example' (a real-life example), 'funFact' (an out-of-the-box fact related to {user_input})."
        payload = {'model': 'llama-3.3-70b-versatile', 'messages': [{'role': 'user', 'content': prompt}], 'response_format': {'type': 'json_object'}}
        api_response = requests.post('https://api.groq.com/openai/v1/chat/completions', json=payload, headers=headers, timeout=5)
        if api_response.status_code == 200:
            structured_answer = json.loads(api_response.json()['choices'][0]['message']['content'])
            return jsonify(structured_answer)
        else:
            return jsonify({'error': f"API error: {api_response.status_code}"})
    except Exception as e:
        logger.error(f"Answer generation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/check_learning', methods=['POST'])
def check_learning():
    try:
        user_input = request.json.get('input')
        level = request.json.get('level')
        headers = {'Authorization': f'Bearer {XAI_API_KEY}', 'Content-Type': 'application/json'}
        prompt = f"Generate 3 questions to check if a {level} learner understood '{user_input}'. Return a JSON object with 'questions' (array of objects with text, options, and correct answer)."
        payload = {'model': 'llama-3.3-70b-versatile', 'messages': [{'role': 'user', 'content': prompt}], 'response_format': {'type': 'json_object'}}
        api_response = requests.post('https://api.groq.com/openai/v1/chat/completions', json=payload, headers=headers, timeout=5)
        if api_response.status_code == 200:
            learning_quiz = json.loads(api_response.json()['choices'][0]['message']['content'])
            return jsonify({'response': "Let’s see what you learned! Answer these:", 'quiz': learning_quiz['questions']})
        else:
            return jsonify({'error': f"API error: {api_response.status_code}"})
    except Exception as e:
        logger.error(f"Learning check error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/assess_level', methods=['POST'])
def assess_level():
    try:
        data = request.json.get('answers')
        # Simple scoring (assumes Groq-generated quiz has 'correct' field)
        score = sum(1 for q_text in data if data[q_text] == next((q['correct'] for q in [{"text": "Who thinks like humans?", "options": ["AI", "Cat", "Tree"], "correct": "AI"},
                                                                                       {"text": "Full form of AI?", "options": ["Artificial Intelligence", "Auto Increment", "Advanced Input"], "correct": "Artificial Intelligence"},
                                                                                       {"text": "What does AI do?", "options": ["Talk", "Learn and solve problems", "Sleep"], "correct": "Learn and solve problems"}] if q['text'] == q_text), None))
        level = 'beginner' if score <= 1 else 'medium' if score == 2 else 'advanced'
        return jsonify({'level': level})
    except Exception as e:
        logger.error(f"Level assessment error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/save_history', methods=['POST'])
def save_history():
    try:
        history_entry = request.json
        with open('history.json', 'a') as f:
            json.dump(history_entry, f)
            f.write('\n')
        return jsonify({'status': 'saved'})
    except Exception as e:
        logger.error(f"Save history error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_history', methods=['GET'])
def get_history():
    try:
        history = []
        with open('history.json', 'r') as f:
            for line in f:
                if line.strip():
                    history.append(json.loads(line))
        return jsonify(history)
    except FileNotFoundError:
        return jsonify([])
    except Exception as e:
        logger.error(f"Get history error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)