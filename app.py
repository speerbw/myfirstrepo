from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# Path to store high scores
SCORES_FILE = 'scores.json'

# Initialize scores file if it doesn't exist
if not os.path.exists(SCORES_FILE):
    with open(SCORES_FILE, 'w') as f:
        json.dump([], f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scores', methods=['GET'])
def get_scores():
    try:
        with open(SCORES_FILE, 'r') as f:
            scores = json.load(f)
        return jsonify(sorted(scores, key=lambda x: x['score'], reverse=True)[:10])
    except Exception as e:
        return jsonify([])

@app.route('/scores', methods=['POST'])
def save_score():
    try:
        data = request.get_json()
        player_name = data.get('name', 'Anonymous')
        score = data.get('score', 0)
        
        with open(SCORES_FILE, 'r') as f:
            scores = json.load(f)
        
        scores.append({'name': player_name, 'score': score})
        scores.sort(key=lambda x: x['score'], reverse=True)
        scores = scores[:100]  # Keep only top 100 scores
        
        with open(SCORES_FILE, 'w') as f:
            json.dump(scores, f)
        
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True) 