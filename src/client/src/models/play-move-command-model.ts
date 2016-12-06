import {Command} from './command-model';

export class PlayMoveCommand extends Command {

    move: number;

    constructor(move:number) {
        super("playMove");
        this.move = move;
    }
}