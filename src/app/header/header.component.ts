import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';
import { RtcService } from '../main-stream/rtc.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user!: User;
  socket!: any
  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private rtc: RtcService
    ) { }

  ngOnInit(): void {
    this.rtc.initRTC();
    this.auth();
    this.rtc.listen('join-room-status').subscribe((roomId: string) => {
      this.rtc.start(roomId);
      this.router.navigate(['/meeting']);
    });
  }

  auth(): void {
    this.userService.auth().subscribe((user: User) => {
      this.user = user;
    });
  }

  logout(): void {
    this.userService.logout().subscribe((user: User) => {
      if (user.status === false) {
        this.router.navigate(['/login']);
      }
    });
  }

  joinRoom(event: any): void {
    event.preventDefault();
    const roomId = event.target.roomId.value;
    this.rtc.emit('join-room', { roomId });
  }

}
