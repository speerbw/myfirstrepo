// This script generates sprites for the Flappy Bird game dynamically
// It should be included before game.js and creates a canvas with all sprites needed

function generateSprites() {
    // Create a canvas for the sprites
    const spritesCanvas = document.createElement('canvas');
    spritesCanvas.width = 606;  // Total width needed for all sprites
    spritesCanvas.height = 428; // Total height needed for all sprites
    const ctx = spritesCanvas.getContext('2d');
    
    // Background sky (276x228)
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, 276, 228);
    
    // Add clouds to background
    ctx.fillStyle = '#ffffff';
    // Cloud 1
    drawCloud(ctx, 30, 70, 60, 40);
    // Cloud 2
    drawCloud(ctx, 130, 40, 70, 30);
    // Cloud 3
    drawCloud(ctx, 210, 90, 50, 35);
    
    // Ground (224x112)
    ctx.fillStyle = '#ded895';
    ctx.fillRect(276, 0, 224, 92);
    // Ground detail
    ctx.fillStyle = '#c9a038';
    ctx.fillRect(276, 92, 224, 20);
    
    // Bird sprites (34x24 each, 4 frames for animation)
    const birdColors = ['#ff6b6b', '#feca57', '#1dd1a1'];
    const selectedColor = birdColors[Math.floor(Math.random() * birdColors.length)];
    
    // Draw 4 bird animation frames
    for (let i = 0; i < 4; i++) {
        drawBird(ctx, 0, 26 * i, selectedColor, i);
    }
    
    // Pipe bottom (53x400)
    ctx.fillStyle = '#6ab04c';
    ctx.fillRect(502, 0, 53, 400);
    // Pipe highlight
    ctx.fillStyle = '#81c766';
    ctx.fillRect(502, 0, 10, 400);
    // Pipe top lip
    ctx.fillStyle = '#4b8534';
    ctx.fillRect(496, 0, 65, 30);
    
    // Pipe top (53x400, upside down)
    ctx.fillStyle = '#6ab04c';
    ctx.fillRect(553, 0, 53, 400);
    // Pipe highlight
    ctx.fillStyle = '#81c766';
    ctx.fillRect(553, 0, 10, 400);
    // Pipe bottom lip
    ctx.fillStyle = '#4b8534';
    ctx.fillRect(547, 370, 65, 30);
    
    // Convert the canvas to an image
    const spriteImage = new Image();
    spriteImage.src = spritesCanvas.toDataURL();
    
    return spriteImage;
}

function drawCloud(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.arc(x, y + height/2, height/2, 0, Math.PI * 2);
    ctx.arc(x + width/3, y + height/2.5, height/2.5, 0, Math.PI * 2);
    ctx.arc(x + width/1.5, y + height/2, height/2.3, 0, Math.PI * 2);
    ctx.arc(x + width, y + height/2, height/2, 0, Math.PI * 2);
    ctx.fill();
}

function drawBird(ctx, x, y, color, frame) {
    // Bird body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + 17, y + 12, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x + 24, y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird pupil
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + 25, y + 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird beak
    ctx.fillStyle = '#f9ca24';
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 10);
    ctx.lineTo(x + 34, y + 12);
    ctx.lineTo(x + 30, y + 14);
    ctx.fill();
    
    // Bird wing
    ctx.fillStyle = darkenColor(color, 30);
    ctx.beginPath();
    
    // Wing animation based on frame
    if (frame === 0) {
        // Wing down
        ctx.ellipse(x + 14, y + 16, 8, 5, Math.PI/3, 0, Math.PI * 2);
    } else if (frame === 1) {
        // Wing middle down
        ctx.ellipse(x + 14, y + 14, 8, 5, Math.PI/6, 0, Math.PI * 2);
    } else if (frame === 2) {
        // Wing middle up
        ctx.ellipse(x + 13, y + 12, 8, 5, 0, 0, Math.PI * 2);
    } else {
        // Wing up
        ctx.ellipse(x + 12, y + 10, 8, 5, -Math.PI/6, 0, Math.PI * 2);
    }
    
    ctx.fill();
}

// Helper function to darken a color
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) - amt,
        G = (num >> 8 & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;
    
    return '#' + (0x1000000 + (R < 0 ? 0 : R) * 0x10000 + (G < 0 ? 0 : G) * 0x100 + (B < 0 ? 0 : B)).toString(16).slice(1);
}

// Function to generate audio data
function generateAudioData(type) {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    switch(type) {
        case 'flap':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'score':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
            break;
        case 'hit':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
            break;
        case 'die':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
            break;
    }
    
    // We'll use a simple callback since we're not actually generating an audio file
    return {
        play: function() {
            // Generate a new sound each time play is called
            generateAudioData(type);
            return Promise.resolve();
        },
        currentTime: 0
    };
} 