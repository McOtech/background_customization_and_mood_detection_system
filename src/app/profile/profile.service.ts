import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Profile } from '../interfaces/profile.interface';
import { ACTION_DESTROY_PROFILE, ACTION_STORE_PROFILE, ACTION_UPDATE_PROFILE } from '../store/actions/index.actions';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private readonly store: Store, private readonly http: HttpClient) { }

  getProfile(): Promise<Profile> {
    return (new Promise((resolve, reject) => {
      try {
        this.http.get<Profile>('/api/profiles')
        .subscribe((profile: Profile) => {
          this.store.dispatch({type: ACTION_STORE_PROFILE, ...profile});
          this.store.select<Profile>((reducers: any): Profile => reducers.profileReducer).subscribe((profile: Profile) => {
            resolve(profile);
          });
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

  storeProfile({ email, name }: Profile): Promise<Profile> {
    return (new Promise((resolve, reject) => {
      try {
        this.http.post<Profile>('/api/profiles', {
          name, email
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .subscribe((profile: Profile) => {
          this.store.dispatch({type: ACTION_STORE_PROFILE, ...profile});
          resolve(profile);
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

  updateProfile({ email, name }: Profile): Promise<Profile> {
    return (new Promise((resolve, reject) => {
      try {
        this.http.put<Profile>('/api/profiles', {
          name, email
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .subscribe((profile: Profile) => {
          this.store.dispatch({type: ACTION_UPDATE_PROFILE, ...profile});
          resolve(profile);
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

  // destroyProfile(id: string): Promise<boolean> {
  //   return (new Promise((resolve, reject) => {
  //     try {
  //       this.http.delete<Profile>('/api/profiles', {
  //         headers: {
  //           'Content-Type': 'application/json'
  //         }
  //       })
  //       .subscribe((profile: Profile) => {
  //         this.store.dispatch({type: ACTION_DESTROY_PROFILE, _id: profile._id});
  //         resolve(true);
  //       });
  //     } catch (error) {
  //       reject(error);
  //     }
  //   }));
  // }
}
