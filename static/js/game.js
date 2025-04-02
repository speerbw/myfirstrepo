document.addEventListener('DOMContentLoaded', () => {
    // Game canvas
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Game screens
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const highScoresScreen = document.getElementById('high-scores-screen');
    
    // Buttons
    const startButton = document.getElementById('start-button');
    const highScoresButton = document.getElementById('high-scores-button');
    const restartButton = document.getElementById('restart-button');
    const menuButton = document.getElementById('menu-button');
    const backButton = document.getElementById('back-button');
    const submitScoreButton = document.getElementById('submit-score');
    
    // Score display elements
    const finalScoreElement = document.getElementById('final-score');
    const playerNameInput = document.getElementById('player-name');
    const scoresList = document.getElementById('scores-list');
    
    // Generate sprite sheet
    const sprites = generateSprites();
    
    // Generate game sounds using Web Audio API
    const sounds = {
        score: generateAudioData('score'),
        flap: generateAudioData('flap'),
        hit: generateAudioData('hit'),
        die: generateAudioData('die')
    };
    
    // Game variables
    let frames = 0;
    let score = 0;
    let highScore = 0;
    let gameActive = false;
    
    // Bird properties
    const bird = {
        x: 50,
        y: 150,
        width: 34,
        height: 24,
        gravity: 0.25,
        jump: 4.6,
        velocity: 0,
        
        draw: function() {
            // Bird animation - flapping wings
            const birdIndex = Math.floor(frames / 10) % 4;
            
            // Create a temporary canvas for rotation
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.width;
            tempCanvas.height = this.height;
            
            // Draw bird on temporary canvas
            tempCtx.drawImage(
                sprites,
                0, 26 * birdIndex, 34, 24,
                0, 0, this.width, this.height
            );
            
            // Save context state
            ctx.save();
            
            // Move to bird position
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            
            // Rotate based on velocity
            const angle = Math.max(-25, Math.min(this.velocity * 3, 90)) * Math.PI / 180;
            ctx.rotate(angle);
            
            // Draw rotated bird
            ctx.drawImage(
                tempCanvas,
                -this.width / 2, -this.height / 2,
                this.width, this.height
            );
            
            // Restore context
            ctx.restore();
        },
        
        update: function() {
            if (gameActive) {
                this.velocity += this.gravity;
                this.y += this.velocity;
                
                // Floor collision
                if (this.y + this.height >= canvas.height - background.ground.height) {
                    this.y = canvas.height - background.ground.height - this.height;
                    if (gameActive) {
                        gameOver();
                    }
                }
                
                // Ceiling collision
                if (this.y <= 0) {
                    this.y = 0;
                    this.velocity = 0;
                }
            }
        },
        
        flap: function() {
            this.velocity = -this.jump;
            sounds.flap.play().catch(e => console.log("Audio play error:", e));
        },
        
        reset: function() {
            this.y = 150;
            this.velocity = 0;
        }
    };
    
    // Background properties
    const background = {
        sky: {
            sX: 0,
            sY: 0,
            sWidth: 276,
            sHeight: 228,
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height - 112
        },
        ground: {
            sX: 276,
            sY: 0,
            sWidth: 224,
            sHeight: 112,
            x: 0,
            y: canvas.height - 112,
            width: canvas.width,
            height: 112,
            dx: 2  // Speed of ground movement
        },
        
        draw: function() {
            // Draw sky background
            ctx.drawImage(
                sprites,
                this.sky.sX, this.sky.sY, this.sky.sWidth, this.sky.sHeight,
                this.sky.x, this.sky.y, this.sky.width, this.sky.height
            );
            
            // Draw ground (two images for continuous scrolling)
            const groundPos = -(frames * this.ground.dx) % canvas.width;
            
            ctx.drawImage(
                sprites,
                this.ground.sX, this.ground.sY, this.ground.sWidth, this.ground.sHeight,
                groundPos, this.ground.y, this.ground.width, this.ground.height
            );
            
            ctx.drawImage(
                sprites,
                this.ground.sX, this.ground.sY, this.ground.sWidth, this.ground.sHeight,
                groundPos + canvas.width, this.ground.y, this.ground.width, this.ground.height
            );
        }
    };
    
    // Pipe properties
    const pipes = {
        position: [],
        top: {
            sX: 553,
            sY: 0
        },
        bottom: {
            sX: 502,
            sY: 0
        },
        width: 53,
        height: 400,
        gap: 120,
        maxYPos: -150,
        dx: 2,
        
        draw: function() {
            for (let i = 0; i < this.position.length; i++) {
                const p = this.position[i];
                
                // Top pipe
                ctx.drawImage(
                    sprites,
                    this.top.sX, this.top.sY, this.width, this.height,
                    p.x, p.y, this.width, this.height
                );
                
                // Bottom pipe
                ctx.drawImage(
                    sprites,
                    this.bottom.sX, this.bottom.sY, this.width, this.height,
                    p.x, p.y + this.height + this.gap, this.width, this.height
                );
            }
        },
        
        update: function() {
            if (!gameActive) return;
            
            // Add new pipe every 100 frames
            if (frames % 100 === 0) {
                this.position.push({
                    x: canvas.width,
                    y: this.maxYPos * (Math.random() + 1)
                });
            }
            
            // Update pipe positions
            for (let i = 0; i < this.position.length; i++) {
                const p = this.position[i];
                p.x -= this.dx;
                
                // Remove pipes that are off screen
                if (p.x + this.width <= 0) {
                    this.position.shift();
                    // Add score when passing a pipe
                    score++;
                    sounds.score.play().catch(e => console.log("Audio play error:", e));
                    
                    // Update high score
                    highScore = Math.max(score, highScore);
                }
                
                // Check for collision
                if (
                    bird.x + bird.width > p.x && 
                    bird.x < p.x + this.width && 
                    (
                        bird.y < p.y + this.height || 
                        bird.y + bird.height > p.y + this.height + this.gap
                    )
                ) {
                    gameOver();
                }
            }
        },
        
        reset: function() {
            this.position = [];
        }
    };
    
    // Draw score
    function drawScore() {
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.font = "35px Arial";
        ctx.textAlign = "center";
        
        if (gameActive) {
            ctx.fillText(score, canvas.width/2, 50);
            ctx.strokeText(score, canvas.width/2, 50);
        }
    }
    
    // Game over function
    function gameOver() {
        sounds.hit.play().catch(e => console.log("Audio play error:", e));
        setTimeout(() => {
            sounds.die.play().catch(e => console.log("Audio play error:", e));
        }, 100);
        
        gameActive = false;
        finalScoreElement.textContent = score;
        gameOverScreen.style.display = 'flex';
    }
    
    // Start game function
    function startGame() {
        bird.reset();
        pipes.reset();
        score = 0;
        frames = 0;
        gameActive = true;
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
    }
    
    // Load high scores
    function loadHighScores() {
        fetch('/scores')
            .then(response => response.json())
            .then(data => {
                scoresList.innerHTML = '';
                data.forEach((score, index) => {
                    const scoreItem = document.createElement('div');
                    scoreItem.className = 'score-item';
                    scoreItem.innerHTML = `
                        <span class="score-rank">#${index+1}</span>
                        <span class="score-name">${score.name}</span>
                        <span class="score-value">${score.score}</span>
                    `;
                    scoresList.appendChild(scoreItem);
                });
                
                if (data.length === 0) {
                    scoresList.innerHTML = '<div class="score-item">No scores yet!</div>';
                }
            })
            .catch(error => {
                console.error('Error fetching scores:', error);
                scoresList.innerHTML = '<div class="score-item">Error loading scores</div>';
            });
    }
    
    // Submit high score
    function submitScore() {
        const playerName = playerNameInput.value.trim() || 'Anonymous';
        
        fetch('/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playerName,
                score: score
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    submitScoreButton.disabled = true;
                    submitScoreButton.textContent = 'Submitted!';
                } else {
                    alert('Error submitting score. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error submitting score:', error);
                alert('Error submitting score. Please try again.');
            });
    }
    
    // Game loop
    function update() {
        frames++;
        
        // Clear canvas
        ctx.fillStyle = "#70c5ce";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw game elements
        background.draw();
        pipes.update();
        pipes.draw();
        bird.update();
        bird.draw();
        drawScore();
        
        requestAnimationFrame(update);
    }
    
    // Event listeners
    canvas.addEventListener('click', () => {
        if (gameActive) {
            bird.flap();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if ((e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') && gameActive) {
            bird.flap();
        }
    });
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    
    highScoresButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        highScoresScreen.style.display = 'flex';
        loadHighScores();
    });
    
    backButton.addEventListener('click', () => {
        highScoresScreen.style.display = 'none';
        startScreen.style.display = 'flex';
    });
    
    menuButton.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        startScreen.style.display = 'flex';
    });
    
    submitScoreButton.addEventListener('click', submitScore);
    
    // Start game loop
    update();
}); 