import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  constructor(private readonly userService: UserService, private readonly router: Router) { }

  ngOnInit(): void {
  }

  signUp(event: any): void {
    event.preventDefault();
    const username: string = event.target.username.value;
    const password: string = event.target.password.value;
    const confirmPassword: string = event.target.confirmPassword.value;

    if (username.length > 0 && password.length > 0 && confirmPassword.length > 0) {
      this.userService.signUp(username, password, confirmPassword)
      .then((user: User) => {
        this.router.navigate(['/login']);
      })
      .catch(error => {
        alert(error.message);
      });
    } else {
      alert('Username and Password should not be empty!');
    }
  }

}
