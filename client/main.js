/* client/main.js */
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

let score = 0;
let bestScore = 0;

class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Загрузка ресурсов. 
    // Изображения надо где-то хранить: если у вас нет своих, 
    // можете создать обычные «заглушки» (pipe.png, bird.png и т.п.) 
    // или скачать из интернета.
    this.load.image('bird', 'https://via.placeholder.com/34x24?text=Bird'); 
    this.load.image('pipe', 'https://via.placeholder.com/50x300?text=Pipe');
    this.load.image('bg', 'https://via.placeholder.com/400x600?text=Background');
  }

  create() {
    this.scene.start('MenuScene');
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg')
      .setOrigin(0.5)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Нажмите, чтобы начать', {
      fontSize: '24px',
      color: '#fff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    score = 0;

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg')
      .setOrigin(0.5)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    this.bird = this.physics.add.sprite(50, GAME_HEIGHT / 2, 'bird');
    this.bird.body.gravity.y = 800;

    this.input.on('pointerdown', this.flap, this);

    this.pipes = this.physics.add.group();
    this.pipeTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnPipes,
      callbackScope: this,
      loop: true
    });

    this.physics.add.overlap(this.bird, this.pipes, this.gameOver, null, this);

    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '20px',
      color: '#000'
    });
  }

  update() {
    if (this.bird.y <= 0 || this.bird.y >= GAME_HEIGHT) {
      this.gameOver();
    }

    // Удаляем трубы, которые ушли влево
    this.pipes.getChildren().forEach(pipe => {
      if (pipe.x < -50) pipe.destroy();
    });
  }

  flap() {
    this.bird.body.velocity.y = -300;
  }

  spawnPipes() {
    const gap = 120;
    const pipeMidY = Phaser.Math.Between(100, GAME_HEIGHT - 100);

    const pipeTop = this.pipes.create(GAME_WIDTH, pipeMidY - gap / 2, 'pipe');
    pipeTop.setOrigin(0.5, 1);
    pipeTop.setFlipY(true);
    pipeTop.body.velocity.x = -200;

    const pipeBottom = this.pipes.create(GAME_WIDTH, pipeMidY + gap / 2, 'pipe');
    pipeBottom.setOrigin(0.5, 0);
    pipeBottom.body.velocity.x = -200;

    // "зона" для счёта
    const scoringZone = this.add.zone(GAME_WIDTH, 0, 10, GAME_HEIGHT);
    this.physics.world.enable(scoringZone);
    scoringZone.body.velocity.x = -200;
    this.physics.add.overlap(this.bird, scoringZone, () => {
      score++;
      this.scoreText.setText('Score: ' + score);
      scoringZone.destroy();
    });
  }

  gameOver() {
    if (score > bestScore) {
      bestScore = score;
    }
    this.scene.start('GameOverScene');
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5)
      .setOrigin(0);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'Game Over', {
      fontSize: '24px',
      color: '#fff'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Score: ${score}\nBest: ${bestScore}`, {
      fontSize: '18px',
      color: '#fff',
      align: 'center'
    }).setOrigin(0.5);

    // Кнопка "Ещё раз"
    const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 'Ещё раз', {
      fontSize: '18px',
      color: '#000',
      backgroundColor: '#ccc',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    retryText.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Кнопка "Выйти" и отправка результата
    const exitText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'Выйти', {
      fontSize: '18px',
      color: '#000',
      backgroundColor: '#ccc',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    exitText.on('pointerdown', () => {
      // Если игра открыта внутри Telegram, отправим счёт
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify({ score }));
      }
      // Закроем WebApp
      window.Telegram?.WebApp?.close();
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [PreloadScene, MenuScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
