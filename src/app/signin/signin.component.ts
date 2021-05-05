import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  constructor(private readonly userService: UserService, private readonly router: Router) { }

  ngOnInit(): void {
  }

  signIn(event: any): void {
    event.preventDefault();
    const username: string = event.target.username.value;
    const password: string = event.target.password.value;

    if (username.length > 0 && password.length > 0) {
      this.userService.signIn(username, password)
      .then((user: User) => {
        if (user?._id !== undefined) {
          this.router.navigate(['/profile']);
        } else {
          alert('User does not exist!');
        }
      })
      .catch(error => {
        alert(error.message);
      });
    } else {
      alert('Username and Password should not be empty!');
    }
  }
}
