from flask import Flask, request, jsonify
import json
import requests
from config import XAI_API_KEY
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow frontend

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load questions.json
try:
    with open('questions.json', 'r') as f:
        data = json.load(f)
    logger.info(f"Loaded {len(data)} questions")
except Exception as e:
    logger.error(f"Failed to load questions.json: {e}")
    data = []

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_input = request.json.get('input').lower()
        response = "I don’t know that one, bro!"
        matched_question = None

        for item in data:
            if user_input in item['question'].lower():
                matched_question = item
                response = "Question found! What’s your level?"
                return jsonify({'response': response, 'levels': ['beginner', 'medium', 'advanced'], 'question': item})

        headers = {'Authorization': f'Bearer {XAI_API_KEY}', 'Content-Type': 'application/json'}
        payload = {
            'model': 'llama-3.3-70b-versatile',
            'messages': [{'role': 'user', 'content': user_input}]
        }
        api_response = requests.post('https://api.groq.com/openai/v1/chat/completions', json=payload, headers=headers, timeout=5)
        logger.debug(f"API Status: {api_response.status_code}")
        if api_response.status_code == 200:
            response = api_response.json()['choices'][0]['message']['content']
            return jsonify({
                'response': "Training data not found, but don’t worry—I’ve got you covered!",
                'answer': response
            })
        else:
            response = f"API error: {api_response.status_code}"
    except Exception as e:
        response = f"Chat error: {str(e)}"
        logger.error(response)

    return jsonify({'response': response})

@app.route('/upload_questions', methods=['POST'])
def upload_questions():
    try:
        file = request.files['file']
        if not file:
            return jsonify({'error': 'No file uploaded!'}), 400
        
        new_questions = json.load(file)
        global data
        data.extend(new_questions)
        with open('questions.json', 'w') as f:
            json.dump(data, f, indent=2)
        logger.info(f"Uploaded {len(new_questions)} questions. Total: {len(data)}")
        return jsonify({'status': 'Questions uploaded successfully!', 'total': len(data)})
    except Exception as e:
        logger.error(f"Upload error: {e}")
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
        logger.error(f"Save history error: {e}")
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
        logger.error(f"Get history error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)