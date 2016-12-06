import {Component, OnInit} from '@angular/core';
import {Game} from '../../models/game-model';
import {JoinCommand} from '../../models/join-command-model';
import {Player} from '../../models/player-model';
import {PlayMoveCommand} from '../../models/play-move-command-model';
import {GameService} from '../../services/game-service';
import {WebSocketService} from '../../services/websocket-service';

const ROCK: number = 0;
const PAPER: number = 1;
const SCISSORS: number = 2;

const LOSE: number = -1;
const TIE: number = 0;
const WIN: number = 1;

@Component({
  templateUrl: 'game-page.html',
  providers: [GameService,WebSocketService]
})
export class GamePage {

  mainStatus: String = "Joining game...";
  roundStatus: String = "";
  myScoreText: String = "";
  otherPlayerScoreText: String = "";
  round: number = 0;
  player1: boolean = false;
  player1Score: number = 0;
  player2Score: number = 0;
  myMovesPlayed: number = 0;
  canPlayMove: boolean = false;

  constructor(private gameService: GameService) {
    gameService.messages.subscribe(game => {
      if (game) {
        if (game.status == "Awaiting player 2") {
          this.player1 = true;
          this.mainStatus = "Awaiting player 2";
        }
        else if (game.status == "Ready") {
          if (game.player2.moves.length == game.player1.moves.length && game.player1.moves.length > this.round) {
            this.processRound(game);
          }
          this.mainStatus = "Round " + (this.round+1);
          if (this.player1Score >= 3 || this.player2Score >= 3) {
            this.quitGame();
          }
          else {
            if (this.myMovesPlayed <= this.round) {
              console.log("Playing next move...")
              this.myMovesPlayed += 1;
              this.canPlayMove = true;
            }
          }
        }
      }
    });
  }

  rockButtonPressed() {
    this.playMove(ROCK);
  }

  paperButtonPressed() {
    this.playMove(PAPER);
  }

  scissorsButtonPressed() {
    this.playMove(SCISSORS);
  }

  processRound(game: Game) {
    var roundResultPlayer1: number = TIE;
    var roundResultPlayer2: number = TIE;
    var player1Move: number = game.player1.moves[game.player1.moves.length-1];
    var player2Move: number = game.player2.moves[game.player2.moves.length-1];
    if (player1Move != player2Move) {
      if (player1Move == ROCK) {
        if (player2Move == PAPER) {
          roundResultPlayer1 = LOSE;
          roundResultPlayer2 = WIN;
        }
        else {
          roundResultPlayer1 = WIN;
          roundResultPlayer2 = LOSE;
        }
      }
      else if (player1Move == PAPER) {
        if (player2Move == SCISSORS) {
          roundResultPlayer1 = LOSE;
          roundResultPlayer2 = WIN;
        }
        else {
          roundResultPlayer1 = WIN;
          roundResultPlayer2 = LOSE;
        }
      }
      else if (player1Move == SCISSORS) {
        if (player2Move == ROCK) {
          roundResultPlayer1 = LOSE;
          roundResultPlayer2 = WIN;
        }
        else {
          roundResultPlayer1 = WIN;
          roundResultPlayer2 = LOSE;
        }
      }
    }
    if (roundResultPlayer1 == WIN) {
      this.player1Score += 1;
      if (this.player1) {
        this.roundStatus = "You win round " + (this.round + 1);
      }
      else {
        this.roundStatus = "You lose round " + (this.round + 1);
      }
    }
    else if (roundResultPlayer2 == WIN) {
      this.player2Score += 1;
      if (this.player1) {
        this.roundStatus = "You lose round " + (this.round + 1);
      }
      else {
        this.roundStatus = "You win round " + (this.round + 1);
      }
    }
    else {
      this.roundStatus = "Round " + (this.round + 1) + " is a tie";
    }
    this.round += 1;
    let myScore: number = this.player1 ? this.player1Score : this.player2Score;
    let otherScore: number = this.player1 ? this.player2Score : this.player1Score;
    this.myScoreText = "YOU: " + myScore;
    this.otherPlayerScoreText = "PLAYER 2: " + otherScore;
  }

  quitGame() {
    var win: boolean = (this.player1 && this.player1Score >= 3) || (! this.player1 && this.player2Score >= 3);
    if (win) {
      this.roundStatus = "You WIN!";
    }
    else {
      this.roundStatus = "You lose :(";
    }
  }

  playMove(move:number) {
    if (this.canPlayMove) {
      this.canPlayMove = false;
      this.roundStatus = "You played " + this.getMoveStr(move);
      this.gameService.sendCommand(new PlayMoveCommand(move));
    }
  }

  getMoveStr(move: number): String {
    if (move == ROCK) {
      return "ROCK"
    }
    else if (move == PAPER) {
      return "PAPER"
    }
    else {
      return "SCISSORS"
    }
  }


}
