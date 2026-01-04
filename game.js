// D&D Adventure Game Engine

class Game {
  constructor() {
    this.gameData = null;
    this.currentScene = 1;
    this.pendingRoll = null;
    this.character = null;
    
    // DOM elements
    this.titleEl = document.querySelector('.game-title');
    this.characterEl = document.querySelector('.character-display');
    this.mainEl = document.querySelector('.game-main');
    this.imageEl = document.querySelector('.scene-image');
    this.textEl = document.querySelector('.scene-text');
    this.choicesEl = document.querySelector('.choices-container');
    this.diceContainerEl = document.querySelector('.dice-container');
    this.diceEl = document.querySelector('.dice');
    this.diceValueEl = document.querySelector('.dice-value');
    this.diceResultEl = document.querySelector('.dice-result');
    this.restartBtn = document.querySelector('.restart-btn');
    
    // Sound effects
    this.sounds = {
      diceRoll: this.createSound(200, 0.3, 'square'),
      victory: null,
      defeat: null,
    };
    
    this.init();
  }
  
  // Create simple synthesized sounds
  createSound(frequency, duration, type = 'sine') {
    return () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch (e) {
        // Audio not supported
      }
    };
  }
  
  playDiceSound() {
    // Play multiple short clicks for dice rolling
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createSound(300 + Math.random() * 200, 0.05, 'square')();
      }, i * 100);
    }
  }
  
  playVictorySound() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createSound(freq, 0.3, 'sine')();
      }, i * 150);
    });
  }
  
  playDefeatSound() {
    const notes = [294, 262, 220, 196]; // D4, C4, A3, G3
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createSound(freq, 0.4, 'sawtooth')();
      }, i * 200);
    });
  }
  
  async init() {
    try {
      const response = await fetch('game.yaml');
      const yamlText = await response.text();
      this.gameData = jsyaml.load(yamlText);
      
      this.titleEl.textContent = this.gameData.title || 'Adventure';
      this.restartBtn.addEventListener('click', () => this.restart());
      this.diceEl.addEventListener('click', () => this.rollDice());
      
      this.renderScene();
    } catch (error) {
      console.error('Failed to load game:', error);
      this.textEl.textContent = 'Failed to load game. Please refresh the page.';
    }
  }
  
  renderScene() {
    const scene = this.gameData.scenes[this.currentScene];
    if (!scene) {
      console.error('Scene not found:', this.currentScene);
      return;
    }
    
    // Clear previous state
    this.mainEl.classList.remove('win', 'lose', 'fade-in');
    this.diceContainerEl.classList.add('hidden');
    this.diceResultEl.textContent = '';
    this.diceValueEl.textContent = '?';
    this.pendingRoll = null;
    
    // Trigger reflow for animation
    void this.mainEl.offsetWidth;
    this.mainEl.classList.add('fade-in');
    
    // Set image (emoji, URL, or default)
    this.renderImage(scene.image);
    
    // Set text
    this.textEl.textContent = scene.text;
    
    // Handle ending
    if (scene.ending) {
      this.mainEl.classList.add(scene.ending);
      this.choicesEl.innerHTML = '';
      this.restartBtn.classList.remove('hidden');
      return;
    }
    
    // Render choices
    this.renderChoices(scene.choices);
    this.restartBtn.classList.add('hidden');
  }
  
  renderImage(image) {
    // Default images for common keywords
    const defaultImages = {
      rat: '🐀',
      'giant-rat': '🐀',
      wizard: '🧙‍♀️',
      cat: '🐱',
      'wizard-cat': '🐱✨',
      mountain: '🏔️',
      cave: '🕳️',
      traveller: '🧝‍♀️',
      fight: '⚔️',
      victory: '🏆',
      death: '💀',
      queen: '👑🐀',
      welcome: '🎲',
      character: '🧙‍♀️',
      name: '📝',
    };
    
    if (!image) {
      // Try to guess from scene text
      const text = this.textEl.textContent.toLowerCase();
      if (text.includes('rat queen')) {
        this.imageEl.innerHTML = '👑🐀';
      } else if (text.includes('wizard cat')) {
        this.imageEl.innerHTML = '🐱✨';
      } else if (text.includes('rat')) {
        this.imageEl.innerHTML = '🐀';
      } else if (text.includes('traveller')) {
        this.imageEl.innerHTML = '🧝‍♀️';
      } else if (text.includes('cave')) {
        this.imageEl.innerHTML = '🕳️';
      } else if (text.includes('win') || text.includes('congratulations')) {
        this.imageEl.innerHTML = '🏆';
      } else if (text.includes('dead') || text.includes('game over')) {
        this.imageEl.innerHTML = '💀';
      } else if (text.includes('welcome')) {
        this.imageEl.innerHTML = '🎲';
      } else if (text.includes('character')) {
        this.imageEl.innerHTML = '🧙‍♀️';
      } else if (text.includes('name')) {
        this.imageEl.innerHTML = '📝';
      } else if (text.includes('mountain')) {
        this.imageEl.innerHTML = '🏔️';
      } else {
        this.imageEl.innerHTML = '⚔️';
      }
    } else if (image.startsWith('http') || image.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
      // URL or local image file - show as image with loading indicator
      this.imageEl.innerHTML = '<div class="loading-spinner"></div>';
      const img = new Image();
      img.alt = 'Scene illustration';
      img.onload = () => {
        this.imageEl.innerHTML = '';
        this.imageEl.appendChild(img);
      };
      img.onerror = () => {
        this.imageEl.innerHTML = '🖼️';
      };
      img.src = image;
    } else if (defaultImages[image]) {
      // Keyword
      this.imageEl.innerHTML = defaultImages[image];
    } else {
      // Assume it's an emoji or text
      this.imageEl.innerHTML = image;
    }
  }
  
  renderChoices(choices) {
    this.choicesEl.innerHTML = '';
    
    if (!choices || choices.length === 0) return;
    
    choices.forEach(choice => {
      // Each choice is an object with one key (the action name)
      const actionName = Object.keys(choice)[0];
      const actionValue = choice[actionName];
      
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = actionName;
      
      if (actionName === 'continue') {
        btn.classList.add('continue-btn');
      }
      
      if (typeof actionValue === 'number') {
        // Simple goto - check if this is character selection (scene 2)
        btn.addEventListener('click', () => {
          if (this.currentScene === 2) {
            this.selectCharacter(actionName);
          }
          this.goToScene(actionValue);
        });
      } else if (typeof actionValue === 'object') {
        // Has dice roll
        btn.addEventListener('click', () => this.showDiceRoll(actionValue));
      }
      
      this.choicesEl.appendChild(btn);
    });
  }
  
  showDiceRoll(rollData) {
    this.pendingRoll = rollData;
    this.choicesEl.innerHTML = '';
    this.diceContainerEl.classList.remove('hidden');
    this.diceResultEl.textContent = `Roll ${rollData.roll_needed} or higher to succeed!`;
    this.diceResultEl.className = 'dice-result';
  }
  
  rollDice() {
    if (!this.pendingRoll) return;
    
    // Play dice sound
    this.playDiceSound();
    
    // Animate the dice
    this.diceEl.classList.add('rolling');
    
    // Generate random number during animation
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      this.diceValueEl.textContent = Math.floor(Math.random() * 20) + 1;
      rollCount++;
    }, 50);
    
    // Final result after animation
    setTimeout(() => {
      clearInterval(rollInterval);
      this.diceEl.classList.remove('rolling');
      
      const result = Math.floor(Math.random() * 20) + 1;
      this.diceValueEl.textContent = result;
      
      const success = result >= this.pendingRoll.roll_needed;
      
      if (success) {
        this.diceResultEl.textContent = `You rolled ${result}! Success! 🎉`;
        this.diceResultEl.className = 'dice-result success';
        this.playVictorySound();
        setTimeout(() => this.goToScene(this.pendingRoll.succeed), 1500);
      } else {
        this.diceResultEl.textContent = `You rolled ${result}... Failed! 😢`;
        this.diceResultEl.className = 'dice-result fail';
        this.playDefeatSound();
        setTimeout(() => this.goToScene(this.pendingRoll.fail), 1500);
      }
    }, 600);
  }
  
  goToScene(sceneId) {
    this.currentScene = sceneId;
    this.renderScene();
  }
  
  selectCharacter(characterName) {
    this.character = characterName;
    if (this.characterEl) {
      this.characterEl.textContent = characterName;
      this.characterEl.classList.remove('hidden');
    }
  }
  
  restart() {
    this.currentScene = 1;
    this.character = null;
    if (this.characterEl) {
      this.characterEl.textContent = '';
      this.characterEl.classList.add('hidden');
    }
    this.renderScene();
  }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});

