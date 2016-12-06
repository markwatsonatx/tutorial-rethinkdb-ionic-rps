import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs/Rx';
import {Command} from '../models/command-model';
import {JoinCommand} from '../models/join-command-model';
import {Game} from '../models/game-model';
import {WebSocketService} from './websocket-service';

//const WEB_SOCKET_SERVER_URL = 'ws://web:8080/';
const WEB_SOCKET_SERVER_PORT = 8080;

@Injectable()
export class GameService {

    messages: Subject<Game>;

    constructor(private webSocketService: WebSocketService) {

        var url = 'ws://' + window.location.hostname + ':' + WEB_SOCKET_SERVER_PORT;
        console.log("Connecting to " + url + "...");

        this.messages = <Subject<Game>>webSocketService
            .connect(url, () => this.onWebSocketOpen())
            .map((response: MessageEvent): Game => {
                var game:Game = JSON.parse(response.data);
                return game;
            });
    }

    onWebSocketOpen() {
        this.sendCommand(new JoinCommand());
    }

    sendCommand(command: Command) {
        this.webSocketService.sendMessage(JSON.stringify(command));
    }

}