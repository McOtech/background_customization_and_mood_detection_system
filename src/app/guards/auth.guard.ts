import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private readonly userService: UserService, private readonly router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return (new Promise((resolve, reject) => {
        this.userService.isAuthenticated()
        .then((status: boolean) => {
          resolve(status);
        })
        .catch(error => {
          reject(error);
        });
      }));
      // if (this.userService.isLoggedIn) {
      //   return true;
      // } else {
      //   this.router.navigate(['/login']);
      //   return false;
      // }
  }
}
