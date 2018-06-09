function Canvas() {
  this.isRunning = false;
  this.requestAnimation = {};
  this.score = null;
  this.life = null;
  this.$el;
  this.c;
  this.lines = [];
  this.keysLabel = [];
  this.keysBar = [];
  this.timerMax = 50;
  this.timer = null;
  this.step = 6;
  this.mode = ['easy', 'normal', 'difficult'];
  this.selectedMode = 1;
  this.nbLines = {
    easy: 3,
    normal: 4,
    difficult: 5,
  };
  this.keys = {
    Z: {
      label: 'Z',
      code: 90,
    },
    Q: {
      label: 'Q',
      code: 81,
    },
    S: {
      label: 'S',
      code: 83,
    },
    D: {
      label: 'D',
      code: 68,
    },
    E: {
      label: 'E',
      code: 69,
    },
  };
  this.keysLabelByMode = {
    easy: [this.keys['Z'], this.keys['Q'], this.keys['D']],
    normal: [this.keys['Z'], this.keys['Q'], this.keys['S'], this.keys['D']],
    difficult: [
      this.keys['Z'],
      this.keys['E'],
      this.keys['Q'],
      this.keys['S'],
      this.keys['D'],
    ],
  };

  this.displayChooseLevelScreen = (bool) => {
    if (this.isRunning) {
      return;
    }
    var startTemplate = `<div class="start">
      <div class="start-container">
        <h1 class="start-title">Keyboard Hero</h1>
        ${
          bool
            ? `<p class="lead">Votre score est de ${
                this.score.points
              } points.</p>`
            : ``
        }
        <h2>Choisissez votre niveau.</h2>
        <div class="start-buttonContainer">
        </div>
      </div>
    </div>`;

    document.body.innerHTML = startTemplate;
    const buttonContainer = document.querySelector('.start-buttonContainer');

    this.mode.forEach((mode, i) => {
      let button = new Button(i, mode, this.nbLines);
      buttonContainer.appendChild(button.$el);
    });
  };

  this.init = () => {
    if (!this.isRunning) {
      return;
    }
    this.lines = [];
    this.keysLabel = [];
    this.keysBar = [];
    document.querySelector('.start').remove();
    this.score = new Score();
    this.life = new Life();
    this.timer = this.timerMax;
    this.$el = document.createElement('canvas');
    this.$el.height = innerHeight;
    this.$el.width = innerWidth;
    this.c = this.$el.getContext('2d');
    document.body.appendChild(this.$el);
    for (let i = 0; i < this.nbLines[this.mode[this.selectedMode]]; i++) {
      this.lines.push(
        new Line(i, this.nbLines[this.mode[this.selectedMode]], this.c),
      );
      this.keysLabel.push(
        new Key(
          i,
          this.keysLabelByMode[this.mode[this.selectedMode]][i].label,
          this.keysLabelByMode[this.mode[this.selectedMode]][i].code,
          this.nbLines[this.mode[this.selectedMode]],
          this.c,
        ),
      );
    }

    this.distribute();

    window.addEventListener('keyup', this.keyCheck);
    window.addEventListener('keydown', this.keyHighlighting);
    window.addEventListener('resize', this.windowRisizing);
  };

  this.windowRisizing = () => {
    this.$el.height = innerHeight;
    this.$el.width = innerWidth;

    this.lines.forEach((line) => {
      line.width = this.$el.width / this.nbLines[this.mode[this.selectedMode]];
      line.x =
        (this.$el.width / this.nbLines[this.mode[this.selectedMode]]) *
        line.index;
    });
    this.keysBar.forEach((keybar) => {
      keybar.width =
        this.$el.width / this.nbLines[this.mode[this.selectedMode]];
      keybar.x =
        (this.$el.width / this.nbLines[this.mode[this.selectedMode]]) *
        keybar.belongsToline;
    });
    this.keysLabel.forEach((keyLabel) => {
      keyLabel.width =
        this.$el.width / this.nbLines[this.mode[this.selectedMode]];
      keyLabel.x =
        (this.$el.width / this.nbLines[this.mode[this.selectedMode]]) *
        keyLabel.index;
    });
  };

  this.keyCheck = (e) => {
    let currentKey = this.keysLabel.find((label) => label.code === e.keyCode);

    currentKey.setColors(false, false);

    let goodPosition = this.keysBar.filter((bar) =>
      bar.checkPosition(currentKey.index),
    );

    if (goodPosition.length <= 0) {
      currentKey.setColors('white', 'red');
      return;
    }

    goodPosition.forEach((item, i) => {
      currentKey.setColors('white', 'green');

      this.timerMax -= 0.5 / 2;
      this.step += 0.5 / 15;
      this.score.increments();
    });
    this.keysBar = this.keysBar.filter(
      (bar) => !bar.checkPosition(currentKey.index),
    );
  };

  this.keyHighlighting = (e) => {
    this.keysLabel
      .find((label) => label.code === e.keyCode)
      .setColors('black', 'white');
  };

  this.distribute = () => {
    if (!this.isRunning) {
      cancelAnimationFrame(this.requestAnimation['distribute']);
      return;
    }
    this.requestAnimation['distribute'] = requestAnimationFrame(
      this.distribute,
    );

    this.timer--;
    if (this.timer > 0) {
      return;
    }
    var randomLine = Math.floor(Math.random() * this.lines.length);
    this.keysBar.push(
      new KeyBar(
        this.lines[randomLine].index,
        this.lines[randomLine].x,
        this.lines[randomLine].width,
        this.c,
      ),
    );
    this.timer = this.timerMax;
  };

  this.play = () => {
    if (!this.isRunning) {
      cancelAnimationFrame(this.requestAnimation['play']);
      return;
    }

    this.requestAnimation['play'] = requestAnimationFrame(this.play);

    this.c.clearRect(0, 0, this.$el.width, this.$el.height);

    this.lines.forEach((line, i) => {
      line.draw();
    });

    this.keysBar = this.keysBar.filter((element, i) => {
      element.y += this.step;
      if (element.y <= this.$el.height) {
        return true;
      } else {
        this.score.resetGoodCombination();
        this.life.decrements();
        return false;
      }
    });

    this.keysBar.forEach(function(element) {
      element.draw();
    });

    this.keysLabel.forEach((key, i) => {
      key.draw();
    });
  };

  this.stop = () => {
    this.isRunning = false;
  };
}

function Button(_i, _mode, _nbKey) {
  this.modeIndex = _i;
  this.mode = _mode;
  this.nbKey = _nbKey;
  this.$el = document.createElement('button');
  this.$el.className = `btn start-${this.mode}Button`;
  this.$el.textContent = `${this.nbKey[this.mode]} touches`;

  this.$el.addEventListener('click', () => {
    game.selectedMode = this.modeIndex;
    game.isRunning = true;
    game.init();
    game.play();
  });
}

function Line(_i, _nbLines, _CanvasContext) {
  this.c = _CanvasContext;
  this.index = _i;
  this.x = (innerWidth / _nbLines) * this.index;
  this.y = 0;
  this.width = innerWidth / _nbLines;
  this.height = innerHeight;
  this.color = '#333741';

  this.draw = () => {
    this.c.fillStyle = this.color;
    this.c.strokeStyle = 'black';
    this.c.fillRect(this.x, this.y, this.width, this.height);
    this.c.strokeRect(this.x, this.y, this.width, this.height);
  };
}

function Key(_line, _key, _code, _nbLines, _CanvasContext) {
  this.c = _CanvasContext;
  this.index = _line;
  this.label = _key;
  this.code = _code;
  this.width = innerWidth / _nbLines;
  this.height = 50;
  this.x = (innerWidth / _nbLines) * this.index;
  this.y = innerHeight - this.height * 3;
  this.isPressed = false;
  this.colors = { text: 'white', background: 'rgba(0,0,0,0.2)' };

  this.draw = () => {
    this.c.fillStyle = this.colors.background;
    this.c.fillRect(this.x, this.y, this.width, this.height);
    this.c.font = '26px Georgia';
    this.c.fillStyle = this.colors.text;

    this.c.fillText(
      this.label,
      this.x + this.width / 2,
      this.y + 8 + this.height / 2,
      this.width,
    );
  };

  this.setColors = (_text, _background) => {
    if (!_background || typeof _background !== 'string') {
      _background = 'rgba(0, 0, 0, 0.2)';
    }
    if (!_text || typeof _text !== 'string') {
      _text = 'white';
    }
    this.colors = { text: _text, background: _background };
    let timeout = null;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      this.colors = { text: 'white', background: 'rgba(0,0,0,0.2)' };
    }, 500);
  };
}

/*
*
*/
function KeyBar(_line, _x, _width, _CanvasContext) {
  this.belongsToline = _line;
  this.c = _CanvasContext;
  this.y = 0;
  this.x = _x;
  this.width = _width;
  this.colors = ['#C64C54', '#FABF50', '#79B6B8', '#994D7E', '#F79781'];

  this.draw = () => {
    this.c.fillStyle = this.colors[this.belongsToline];
    this.c.fillRect(this.x, this.y, this.width, 50);
  };

  this.checkPosition = (keyIndex) => {
    const higherLimit = innerHeight - 50 * 3.5;
    const lowerLimit = innerHeight - 50 * 1.5;

    if (
      this.y > higherLimit &&
      this.y < lowerLimit &&
      this.belongsToline === keyIndex
    ) {
      return true;
    }

    return false;
  };
}

function Score() {
  this.points = 0;
  this.nbGoodCombination = 0;
  this.multiplicator = 1;
  this.$el = document.createElement('div');
  this.$el.className = 'score';
  const h1 = document.createElement('h2');
  h1.textContent = 'Points : ';
  this.span = document.createElement('span');
  this.span.textContent = `${this.points} x${this.multiplicator}`;

  document.body.appendChild(this.$el);
  this.$el.appendChild(h1);
  h1.appendChild(this.span);

  this.increments = () => {
    this.nbGoodCombination += 1;
    this.multiplicator = Math.floor((this.nbGoodCombination + 10) / 10);
    this.points += 50 * this.multiplicator;
    this.span.textContent = `${this.points} x${this.multiplicator}`;
  };

  this.resetGoodCombination = () => {
    this.nbGoodCombination = 0;
    this.multiplicator = Math.floor((this.nbGoodCombination + 10) / 10);
    this.span.textContent = `${this.points} x${this.multiplicator}`;
  };
}

function Life() {
  this.lifes = 5;
  this.$el = document.createElement('div');
  this.$el.className = 'life';
  const h1 = document.createElement('h2');
  h1.textContent = 'Vies : ';
  this.span = document.createElement('span');
  this.span.textContent = this.lifes;

  document.body.appendChild(this.$el);
  this.$el.appendChild(h1);
  h1.appendChild(this.span);

  this.decrements = () => {
    this.lifes--;
    this.span.textContent = this.lifes;

    if (this.lifes <= 0) {
      game.stop();
      game.displayChooseLevelScreen(true);
    }
  };
}

{
  var game = new Canvas();
  game.displayChooseLevelScreen();
}
