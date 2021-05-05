import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { ACTION_LOGIN, ACTION_LOGOUT } from '../store/actions/index.actions';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private authStatus = false;
  constructor(private store: Store, private readonly http: HttpClient) { }

  auth(): Observable<User> {
    return this.store.select<User>((reducer: any): User => reducer.userReducer);
  }

  isAuthenticated(): Promise<boolean> {
    return (new Promise((resolve, reject) => {
      try {
        this.http.post<boolean>('/api/auth_status', {}, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .subscribe((status: boolean) => {
          if (status === true) {
            this.findUser(status);
          }
          resolve(status);
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

  findUser(status: boolean): void {
    this.http.get<User>(`/api/users`)
    .subscribe((user: User) => {
      const authenticatedUser: User = { ...user, status };
      this.store.dispatch({type: ACTION_LOGIN, ...authenticatedUser});
    });
  }

  setLoggedIn(status?: boolean): any {
    if (status === undefined) {
      const request = this.http.post<boolean>(`/api/auth_status`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .subscribe((serverAuthStatus: boolean) => {
        this.authStatus = !!serverAuthStatus;
        if (!!!serverAuthStatus) {
          this.store.dispatch({type: ACTION_LOGOUT});
        }
      });
      // this.store.select<User>((reducer: any): User => reducer.userReducer).subscribe((user: User) => {
      //   this.authStatus = (user.status as boolean);
      // });
    } else {
      this.authStatus = status;
    }
  }

  get isLoggedIn(): boolean {
    return this.authStatus;
  }

  signUp(username: string, password: string, confirmPassword: string): Promise<User> {
    return (new Promise((resolve, reject) => {
      try {
        if (password === confirmPassword) {
          const request = this.http.post<User>(`/api/register`, {
            username, password
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          request.subscribe((user: User) => {
            if (!!user?._id) {
              this.store.select<User>((reducer: any): User => reducer.userReducer).subscribe((storedUser: User) => {
                resolve(storedUser);
              });
            } else {
              const err: any = user;
              reject(err.error);
            }
          }, (error: any) => {
            if (!!error) {
              reject(error);
            }
          });
        } else {
          reject({ message: 'Password don\'t match!' });
        }
      } catch (error) {
        reject(error);
      }
    }));
  }

  signIn(username: string, password: string): Promise<User> {
    return (new Promise((resolve, reject) => {
      try {
        const request = this.http.post<User>(`/api/login`, {
          username, password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        request.subscribe((user: User) => {
          if (!!user?._id) {
            const authenticatedUser: User = { ...user, status: true };
            this.store.dispatch({type: ACTION_LOGIN, ...authenticatedUser});
            this.store.select<User>((reducer: any): User => reducer.userReducer).subscribe((storedUser: User) => {
              this.authStatus = (user.status as boolean);
              resolve(storedUser);
            });
          } else {
            const err: any = user;
            reject(err.error);
          }
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

  logout(): Observable<User> {
    try {
      const request = this.http.post(`/api/logout`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      request.subscribe((response: any) => {
        if (response?.status === true) {
          this.store.dispatch({type: ACTION_LOGOUT});
          this.authStatus = false;
        }
      });
      return this.store.select<User>((reducer: any): User => reducer.userReducer);
    } catch (error) {
      return error;
    }

  }
}
