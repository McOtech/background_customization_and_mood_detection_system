import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Room } from '../interfaces/room.interface';
import { ACTION_DESTROY_ROOM, ACTION_STORE_ROOM, ACTION_STORE_ROOMS, ACTION_UPDATE_ROOM } from '../store/actions/index.actions';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  constructor(private readonly store: Store, private readonly http: HttpClient) { }

  getRooms(): Observable<Room[]> {
    this.http.get<Room[]>('/api/rooms')
    .subscribe((rooms: Room[]) => {
      this.store.dispatch({type: ACTION_STORE_ROOMS, rooms});
    });
    return this.store.select<Room[]>((reducers: any): Room[] => reducers.roomReducer);
  }

  getRoom(id: string): Promise<Room> {
    return (new Promise((resolve, reject) => {
      try {
        // this.http.get<Room>(`/rooms/${id}`)
        // .subscribe((room: Room) => {

        // });
        this.getRooms().subscribe((rooms: Room[]) => {
          const room: Room = rooms.find(rm => rm._id === id) as Room;
          resolve(room);
        });
      } catch (error) {
        reject(error);
      }
    }));
  }

  storeRoom({ title, dueDate }: Room): Promise<Room> {
    return (new Promise((resolve, reject) => {
      try {
        this.http.post<Room>('/api/rooms', {
          title, dueDate
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .subscribe((room: Room) => {
          this.store.dispatch({type: ACTION_STORE_ROOM, ...room});
          resolve(room);
        }, (error: any) => {
          if (!!error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    }));
  }

  // storeRooms(): Promise<boolean> {
  //   return (new Promise((resolve, reject) => {
  //     try {
  //       const rooms: Room[] = [];
  //       this.store.dispatch({type: ACTION_STORE_ROOMS, ...rooms});
  //       resolve(true);
  //     } catch (error) {
  //       reject(error);
  //     }
  //   }));
  // }

  updateRoom({_id, title, dueDate}: Room): Promise<Room> {
    return (new Promise((resolve, reject) => {
      try {
        this.http.put<Room>(`/api/rooms/${_id}`, {
          title, dueDate
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .subscribe((room: Room) => {
          this.store.dispatch({type: ACTION_UPDATE_ROOM, ...room});
          resolve(room);
        }, (error: any) => {
          if (!!error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    }));
  }

  destroyRoom(id: string): Promise<boolean> {
    return (new Promise((resolve, reject) => {
      try {
        this.http.delete<Room>(`/api/rooms/${id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .subscribe((room: Room) => {
          this.store.dispatch({type: ACTION_DESTROY_ROOM, _id: room._id});
          resolve(true);
        }, (error: any) => {
          if (!!error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    }));
  }
}
