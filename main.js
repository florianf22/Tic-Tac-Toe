import 'regenerator-runtime';

class TicTacToe {
  // bringing in DOM elements
  #container = document.querySelector('.container');
  #winnerHeading = document.querySelector('h2');
  #lightBulbIcon = document.querySelector('.fa-lightbulb');
  #scorePlayerOne = document.getElementById('score-player1');
  #scorePlayerTwo = document.getElementById('score-player2');
  #scoreComputer = document.getElementById('score-computer');
  #figures = document.querySelectorAll('.square div');
  #audioWhenPlacingFigure = document.querySelector('.placing-audio');
  #audioWhenWinning = document.querySelector('.winning-audio');
  #controlAudioTag = document.querySelector('.control-audio');
  #playerCount = document.querySelector('.player-count');
  #allSquares = document.querySelectorAll('.square');
  #comuterOrPerson2 = document.querySelector('.comuter-or-person2');

  //   all possible winning sequence
  #winningSequences = [
    [1, 2, 3],
    [1, 4, 7],
    [1, 5, 9],
    [2, 5, 8],
    [3, 5, 7],
    [3, 6, 9],
    [4, 5, 6],
    [7, 8, 9],
  ];

  //   the one that will be winning sequence
  #theWinningSequence = [];

  #identifyIfResetNeeded = false;
  #activePlayer = 0;
  #xArray = [];
  #oArray = [];
  #squaresNotUsed = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  #multiPlayer = true;

  constructor() {
    // adding event listener to the container that inclides all the squares to display either X or 0
    this.#container.addEventListener(
      'click',
      this._displayFiguresAccordingly.bind(this)
    );

    // toggling the ligth mode
    this.#lightBulbIcon.addEventListener('click', () =>
      document.body.classList.toggle('dark')
    );

    // adding volume turn ond turn off functionality
    this.#controlAudioTag.addEventListener(
      'click',
      this._controlAudioTag.bind(this)
    );

    // check for the multiplayer UI
    this.#playerCount.addEventListener(
      'click',
      this._changePlayingMode.bind(this)
    );
  }

  _changePlayingMode() {
    if (this.#multiPlayer) {
      this.#multiPlayer = false;

      this.#comuterOrPerson2.textContent = 'computer';
      this.#scorePlayerTwo.className = 'display-none';
      this.#scoreComputer.className = '';
      const html = '<i class="far fa-user"></i>';
      this.#playerCount.innerHTML = '';
      this.#playerCount.insertAdjacentHTML('beforeend', html);
    } else {
      this.#multiPlayer = true;

      this.#comuterOrPerson2.textContent = 'two';
      this.#scorePlayerTwo.className = '';
      this.#scoreComputer.className = 'display-none';

      const html =
        '<i class="far fa-user user-1"></i> <i class="far fa-user user-2"></i>';
      this.#playerCount.innerHTML = '';
      this.#playerCount.insertAdjacentHTML('beforeend', html);
    }

    this._resetToDefault();
  }

  async _displayFiguresAccordingly(e) {
    await this._playAudioWhenPlacingFigures();

    // check for the reset
    if (this.#identifyIfResetNeeded) {
      this.#identifyIfResetNeeded = false;
      this._resetToDefault();
      return;
    }

    // don't add to figures to the same square
    if (
      this.#xArray.includes(+e.target.closest('.square').dataset.id) ||
      this.#oArray.includes(+e.target.closest('.square').dataset.id)
    ) {
      return;
    }

    if (this.#activePlayer === 0) {
      e.target.querySelectorAll('.x').forEach(x => x.classList.add('shown'));
      // push to the X arrays
      const number = +e.target.dataset.id;
      this.#xArray.push(number);

      // remove from the notUsed Figures array
      const idx = this.#squaresNotUsed.indexOf(number);
      this.#squaresNotUsed.splice(idx, 1);

      this.#activePlayer = 1;
    } else {
      e.target.querySelector('.o').classList.add('shown');
      // push to the O arrays
      const number = +e.target.dataset.id;
      this.#oArray.push(number);

      // remove from the notUsed Figures array
      const idx = this.#squaresNotUsed.indexOf(number);
      this.#squaresNotUsed.splice(idx, 1);

      // change the player
      this.#activePlayer = 0;
    }

    this._checkForTheWinner();

    // check for the multiplayer
    if (!this.#multiPlayer) {
      const randomSquare =
        this.#squaresNotUsed[
          Math.floor(Math.random() * this.#squaresNotUsed.length)
        ];

      if (this.#theWinningSequence.length !== 3)
        setTimeout(() => this._fillRandomSquare(randomSquare), 500);
    }

    // check if none won
    if (this.#squaresNotUsed.length === 0) {
      // console.log('All the squreas are taken');
      setTimeout(this._resetToDefault.bind(this), 500);
    }
  }

  async _fillRandomSquare(randomSquare) {
    await this._playAudioWhenPlacingFigures();

    this.#allSquares.forEach(square => {
      if (+square.dataset.id === randomSquare) {
        square.querySelector('.o').classList.add('shown');
        // push to the O arrays
        this.#oArray.push(randomSquare);

        // remove from the notUsed Figures array
        const idx = this.#squaresNotUsed.indexOf(randomSquare);
        this.#squaresNotUsed.splice(idx, 1);

        // change the player
        this.#activePlayer = 0;
      }
    });

    // true says that it's computer the winner
    this._checkForTheWinner(true);
  }

  async _playAudioWhenPlacingFigures() {
    // stop all the audio playing
    [this.#audioWhenPlacingFigure, this.#audioWhenWinning].forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });

    // play the audio tag
    try {
      await this.#audioWhenPlacingFigure.play();
    } catch {
      console.log('Running Audio interrupted the other audio sound');
    }
  }

  _checkForTheWinner(computer = false) {
    // check if the first player won
    this.#winningSequences.forEach(sequence => {
      if (this._isArrayInArray(this.#xArray, sequence)) {
        this._winOperations(sequence, 'first');
      }
    });

    //   check if the second player won
    this.#winningSequences.forEach(sequence => {
      if (this._isArrayInArray(this.#oArray, sequence)) {
        this._winOperations(sequence, 'second', computer);
      }
    });
  }

  async _winOperations(sequence, player, computer = false) {
    // display the winner in h2
    this.#winnerHeading.textContent = `Winner is the ${player} player! ${
      player === 'first' ? '🥇' : '🥈'
    }`;

    //   add score to player one
    const winnerPlayerBoard =
      player === 'first' ? this.#scorePlayerOne : this.#scorePlayerTwo;

    if (computer) {
      this.#scoreComputer.textContent = +this.#scoreComputer.textContent + 1;
    } else {
      winnerPlayerBoard.textContent = +winnerPlayerBoard.textContent + 1;
    }

    //   remember the winning sequence
    this.#theWinningSequence = sequence;

    //   make it so that winnings sequence opacity is higher
    this._makeWinningSequenceLighther();

    //resetting to initial state
    this.#identifyIfResetNeeded = true;

    // play the audio tag
    [this.#audioWhenPlacingFigure, this.#audioWhenWinning].forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
    try {
      await this.#audioWhenWinning.play();
    } catch {
      console.log('Running Audio interrupted the other audio sound');
    }
  }

  _makeWinningSequenceLighther() {
    if (this.#theWinningSequence) {
      this.#figures.forEach(figure => {
        figure.style.opacity = 0.5;

        if (
          +figure.closest('.square').dataset.id ===
            this.#theWinningSequence[0] ||
          +figure.closest('.square').dataset.id ===
            this.#theWinningSequence[1] ||
          +figure.closest('.square').dataset.id === this.#theWinningSequence[2]
        ) {
          figure.style.opacity = 1;
          figure.classList.add('animation');
          setTimeout(() => figure.classList.remove('animation'), 1001);
        }
      });
    }
  }

  _resetToDefault() {
    const shownClases = document.querySelectorAll('.shown');
    shownClases.forEach(el => el.classList.remove('shown'));

    this.#theWinningSequence = [];
    this.#activePlayer = 0;
    this.#xArray = [];
    this.#oArray = [];

    this.#figures.forEach(figure => (figure.style.opacity = 1));

    this.#winnerHeading.textContent = '';

    this.#squaresNotUsed = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  _isArrayInArray(arr1, arr2) {
    return arr2.every(elem => arr1.includes(elem));
  }

  _controlAudioTag() {
    const iconEl = this.#controlAudioTag.querySelector('.fas');

    if (+this.#controlAudioTag.dataset.volume === 1) {
      [this.#audioWhenPlacingFigure, this.#audioWhenWinning].forEach(sound => {
        sound.volume = 0;
      });

      this.#controlAudioTag.dataset.volume = 0;
      iconEl.classList.value = 'fas fa-volume-mute';
    } else {
      [this.#audioWhenPlacingFigure, this.#audioWhenWinning].forEach(sound => {
        sound.volume = 1;
      });

      this.#controlAudioTag.dataset.volume = 1;
      iconEl.className = 'fas fa-volume-up';
    }
  }
}

const ticTacToe = new TicTacToe();
