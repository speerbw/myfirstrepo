# Flask Flappy Bird

A web-based version of the classic Flappy Bird game built with Flask and HTML5 Canvas.

## Features

- Classic Flappy Bird gameplay
- Responsive design
- High score tracking
- Sound effects
- Dynamically generated sprites and sounds (no external assets needed)

## Requirements

- Python 3.6+
- Flask

## Installation

1. Clone or download this repository
2. Install the required packages:

```bash
pip install flask
```

## Usage

1. Run the Flask application:

```bash
python app.py
```

2. Open your web browser and navigate to:

```
http://127.0.0.1:5000/
```

3. Play the game!

## How to Play

- Click the mouse or press the Spacebar/Up Arrow to make the bird flap
- Avoid the pipes
- Try to get the highest score possible

## Project Structure

```
flappy-bird-flask/
├── app.py                # Flask application
├── scores.json           # High scores storage
├── static/
│   ├── css/
│   │   └── style.css     # Game styling
│   └── js/
│       ├── game.js       # Game logic
│       └── sprite_generator.js # Dynamically generates sprites and sounds
└── templates/
    └── index.html        # Game HTML
```

## Technical Notes

- The game uses HTML5 Canvas for rendering
- All sprites are dynamically generated in JavaScript
- Game sounds are generated using the Web Audio API
- No external assets are required to run the game
- Scores are stored in a JSON file on the server 