// D&D Adventure Game Engine

class Game {
  constructor() {
    this.gameData = null;
    this.currentScene = 1;
    this.pendingRoll = null;
    
    // DOM elements
    this.titleEl = document.querySelector('.game-title');
    this.mainEl = document.querySelector('.game-main');
    this.imageEl = document.querySelector('.scene-image');
    this.textEl = document.querySelector('.scene-text');
    this.choicesEl = document.querySelector('.choices-container');
    this.diceContainerEl = document.querySelector('.dice-container');
    this.diceEl = document.querySelector('.dice');
    this.diceValueEl = document.querySelector('.dice-value');
    this.diceResultEl = document.querySelector('.dice-result');
    this.restartBtn = document.querySelector('.restart-btn');
    
    this.init();
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
    } else if (image.startsWith('http') || image.startsWith('/')) {
      // URL - show as image
      this.imageEl.innerHTML = `<img src="${image}" alt="Scene illustration">`;
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
        // Simple goto
        btn.addEventListener('click', () => this.goToScene(actionValue));
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
        setTimeout(() => this.goToScene(this.pendingRoll.succeed), 1500);
      } else {
        this.diceResultEl.textContent = `You rolled ${result}... Failed! 😢`;
        this.diceResultEl.className = 'dice-result fail';
        setTimeout(() => this.goToScene(this.pendingRoll.fail), 1500);
      }
    }, 600);
  }
  
  goToScene(sceneId) {
    this.currentScene = sceneId;
    this.renderScene();
  }
  
  restart() {
    this.currentScene = 1;
    this.renderScene();
  }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});

