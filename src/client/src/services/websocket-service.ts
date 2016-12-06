import {Injectable} from '@angular/core';
import {Observable, Observer, Subject} from 'rxjs/Rx';

@Injectable()
export class WebSocketService {

    subject: Subject<MessageEvent>;
    webSocket: WebSocket;

    connect(url, onOpen): Subject<MessageEvent> {
        if(!this.subject) {
            this.subject = this.create(url, onOpen);
        }
        return this.subject;
    }

    create(url, onOpen): Subject<MessageEvent> {

        console.log("Creating websocket...");

        this.webSocket = new WebSocket(url, 'rps');

        let observable = Observable.create((obs: Observer<MessageEvent>) => {
            this.webSocket.onopen = onOpen;
            this.webSocket.onmessage = obs.next.bind(obs);
            this.webSocket.onerror = obs.error.bind(obs);
            this.webSocket.onclose = obs.complete.bind(obs);

            return this.webSocket.close.bind(this.webSocket);
        });

        let observer = {
            open: (data:Object) => {

            },
            next: (data: Object) => {
                console.log("RECEIVED DATA: " + JSON.stringify(data));
                if (this.webSocket.readyState === WebSocket.OPEN) {
                    this.webSocket.send(JSON.stringify(data));
                }
            },
        };

        return Subject.create(observer, observable);
    }

    sendMessage(message: String) {
        this.webSocket.send(message);
    }
}