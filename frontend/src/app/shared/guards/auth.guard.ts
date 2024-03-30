import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivate,
} from '@angular/router';
import { AuthenticateService } from '../services/authenticate.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class authGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthenticateService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isAuthenticated = !!this.auth.getToken();

    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
