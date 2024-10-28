import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Peer, { MediaConnection } from 'peerjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  @ViewChild('myVideo') myVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  id: string = '';

  peer: Peer | undefined;
  localStream: MediaStream | undefined;
  title = 'call-realtime';

  ngOnInit(): void {
    console.log('Hello, call-realtime');
    this.initializePeer();
    this.startVideoStream();
  }

  initializePeer(): void {
    this.peer = new Peer({
      host: '0.peer.mikademy.ca',
      port: 443,
      path: '/myapp',
      config: {
        iceServers: [
          {
            // urls: 'turn:171.233.28.183:3478',
            urls: 'turn:61.28.231.150:3478',
            username: 'coturn',
            credential: 'coturn',
          },
          {
            // urls: 'turn:171.233.28.183:3478',
            urls: 'stun:61.28.231.150:3478',
          },
          // { urls: 'stun:stun.l.google.com:5349' },
          // { urls: 'stun:stun1.l.google.com:3478' },
          // { urls: 'stun:stun1.l.google.com:5349' },
          // { urls: 'stun:stun2.l.google.com:19302' },
          // { urls: 'stun:stun2.l.google.com:5349' },
          // { urls: 'stun:stun3.l.google.com:3478' },
          // { urls: 'stun:stun3.l.google.com:5349' },
          // { urls: 'stun:stun4.l.google.com:19302' },
          // { urls: 'stun:stun4.l.google.com:5349' },
        ],
        sdpSemantics: 'unified-plan',
      },
      debug: 3,
    });

    this.peer.on('open', (id) => {
      this.id = id;
      console.log('My peer ID is: ' + id);
    });

    this.peer.on('call', (call: MediaConnection) => {
      console.log('Incoming call');
      call.answer(this.localStream); // Trả lời cuộc gọi với luồng video của bạn
      this.handleCall(call);
    });
  }

  startVideoStream(): void {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.localStream = stream;
        if (this.myVideo && this.myVideo.nativeElement) {
          this.myVideo.nativeElement.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Failed to get local stream', err);
      });
  }
  callPeer(peerId: string): void {
    console.log('Calling peer', peerId);

    if (!this.peer || !this.localStream) {
      return;
    }
    const call = this.peer.call(peerId, this.localStream);
    this.handleCall(call);
  }

  handleCall(call: MediaConnection): void {
    call.on('stream', (remoteStream) => {
      console.log('Remote stream available');

      if (this.remoteVideo && this.remoteVideo.nativeElement) {
        this.remoteVideo.nativeElement.srcObject = remoteStream;
      }
    });

    call.on('error', (err) => {
      console.error('Call error', err);
    });

    call.on('close', () => {
      console.log('Call closed');
    });
  }
}
