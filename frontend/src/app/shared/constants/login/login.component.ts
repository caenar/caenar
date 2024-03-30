import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../services/authenticate.service';
import { Router } from '@angular/router';
import { PopupService } from '../../services/popup.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';

  showPopup = false;
  message: string | null = null;
  isAuthenticated: boolean = false;
  private subscription = new Subscription();

  constructor(
    private authService: AuthenticateService,
    private router: Router,
    private popup: PopupService,
  ) {}

  showMessage(message: string): void {
    this.popup.showMessage(message);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.popup.showPopup$.subscribe((showPopup) => {
        this.showPopup = showPopup;
      })
    );

    this.subscription.add(
      this.popup.message$.subscribe((message) => {
        this.message = message;
      })
    );

    this.isAuthenticated = this.authService.isAuthenticated();
  }

  login(): void {
    if (!this.isAuthenticated) {
      this.authService.login(this.username, this.password).subscribe({
        next: () => {
          this.authService.saveToken('auth_token');

          this.showMessage('Logged in succesfully!');
          this.popup.showPopup$.subscribe((showPopup) => {
            if (!showPopup) {
              this.router.navigate(['/admin']);
            }
          });
        },
        error: () => {
          this.showMessage('Invalid username or password');
        },
      });
    } else {
      this.showMessage('You are already logged in.');
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
