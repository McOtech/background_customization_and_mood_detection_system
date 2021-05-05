import { Component, OnInit } from '@angular/core';
import { Room } from '../interfaces/room.interface';
import { RoomsService } from './rooms.service';
declare var $: any;

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  readonly actions = {
    create: 'create', update: 'update'
  };

  rooms: Room[] = [];

  constructor(private readonly roomsService: RoomsService) { }

  ngOnInit(): void {
    this.listRooms();
  }

  storeRoom(event: any): void {
    event.preventDefault();
    const id: string = event.target.id.value;
    const title: string = event.target.title.value;
    const dueDate: number = new Date(event.target.due_date.value).valueOf();
    const action: string = event.target.action.value;
    if (title && title.length > 0) {
      if (action === this.actions.update) {
        this.roomsService.updateRoom({ _id: id, title, dueDate })
        .catch(error => {
          alert(error.message);
        });
      } else {
        this.roomsService.storeRoom({title, dueDate})
        .catch((error) => {
          alert(error.message);
        });
      }
      // this.roomsService.storeRooms()
      // .catch(error => {
      //   alert(error.message);
      // });
      this.clear();
    } else {
      alert('Title cannot be empty!');
    }
  }

  clear(): void {
    $('#action').val(this.actions.create);
    $('#id').val('');
    $('#title').val('');
    $('#due_date').val('');
  }

  listRooms(): void {
    this.roomsService.getRooms().subscribe((rooms: Room[]) => {
      this.rooms = rooms;
    });
  }

  showDate(timestamp: number): Date {
    return new Date(timestamp);
  }

  dateFormat(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
  }

  get dateNow(): number {
    return Date.now().valueOf();
  }

  editRoom(title: string, dueDate: number, id?: string): void {
    $('#action').val(this.actions.update);
    $('#id').val(id);
    $('#title').val(title);
    $('#due_date').val(this.dateFormat(dueDate));
  }

  deleteRoom(id?: string): void {
    this.roomsService.destroyRoom((id === undefined) ? '0' : id)
    .then(state => {
      if (state === true) {
        alert('Room deleted successfully');
      }
    })
    .catch(error => {
      alert(error.message);
    });
  }
}
