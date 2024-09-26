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
      host: 'https://0.peer.mikademy.ca',
      port: 9000,
      path: '/myapp',
    });

    this.peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
    });

    this.peer.on('call', (call: MediaConnection) => {
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
    if (!this.peer || !this.localStream) {
      return;
    }
    const call = this.peer.call(peerId, this.localStream);
    this.handleCall(call);
  }

  handleCall(call: MediaConnection): void {
    call.on('stream', (remoteStream) => {
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