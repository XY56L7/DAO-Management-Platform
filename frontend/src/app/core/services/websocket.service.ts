import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private connected = new Subject<boolean>();

  public connected$ = this.connected.asObservable();

  constructor() {
    this.connect();
  }

  private connect() {
    this.socket = io(environment.wsUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      this.connected.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connected.next(false);
    });

    this.socket.on('error', (error: any) => {});
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Proposal events
  joinProposal(proposalId: string) {
    this.socket?.emit('join-proposal', proposalId);
  }

  leaveProposal(proposalId: string) {
    this.socket?.emit('leave-proposal', proposalId);
  }

  onNewProposal(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('new-proposal', (data: any) => {
        observer.next(data);
      });
    });
  }

  onNewVote(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('new-vote', (data: any) => {
        observer.next(data);
      });
    });
  }

  onProposalStateChange(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('state-change', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Treasury events
  subscribeTreasury() {
    this.socket?.emit('subscribe-treasury');
  }

  onTreasuryUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('treasury-update', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Governance events
  subscribeGovernance() {
    this.socket?.emit('subscribe-governance');
  }

  // Generic emit
  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  // Generic listen
  on(event: string): Observable<any> {
    return new Observable(observer => {
      this.socket?.on(event, (data: any) => {
        observer.next(data);
      });
    });
  }
}
