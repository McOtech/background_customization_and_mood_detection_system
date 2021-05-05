import { Component, OnInit } from '@angular/core';
import { Profile } from '../interfaces/profile.interface';
import { Room } from '../interfaces/room.interface';
import { RoomsService } from '../rooms/rooms.service';
import { ProfileService } from './profile.service';
declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile!: Profile;
  numberOfRooms!: number;

  constructor(private readonly profileService: ProfileService, private readonly roomsService: RoomsService) { }

  ngOnInit(): void {
    $('.pointing.menu .item').tab();
    this.getProfile();
    this.roomsService.getRooms().subscribe((rooms: Room[]) => {
      this.numberOfRooms = rooms.length;
    });
  }

  storeProfile(event: any): void {
    event.preventDefault();
    const name: string = event.target.name.value;
    const email: string = event.target.email.value;
    if (name.length > 0 && email.length > 0) {
      this.profileService.storeProfile({email, name})
      .then((profile: Profile) => {
        this.profile = profile;
        alert('Profile Information Saved Successfully');
      })
      .catch(error => {
        alert(error.message);
      });
    } else {
      alert('Name or Email is empty');
    }
  }

  updateProfile(event: any): void {
    event.preventDefault();
    const name: string = event.target.name.value;
    const email: string = event.target.email.value;
    if (name.length > 0 && email.length > 0) {
      this.profileService.updateProfile({ email, name })
      .then((profile: Profile) => {
        this.profile = profile;
        alert('Profile Information Updated Successfully');
      })
      .catch(error => {
        alert(error.message);
      });
    } else {
      alert('Name or Email is empty');
    }
  }

  getProfile(): void {
    this.profileService.getProfile()
    .then((profile: Profile) => {
      this.profile = profile;
    })
    .catch(error => {
      alert(error.message);
    });
  }
}
