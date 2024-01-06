import { Injectable } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteGuardService {}

export const routeGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | boolean
  | UrlTree
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree> => {
  return new Promise((resolve) => {
    const content = document.querySelector('.open-wrap')! as HTMLElement;
    const contentElement = document.querySelectorAll('.open-wrap > div')!;

    content.style.display = 'grid';
    contentElement.forEach((element, index) => {
      if (element instanceof HTMLElement) {
        setTimeout(() => {
          element.style.top = '0';
        }, index * 200);
      }
    });

    if (document.readyState === 'complete') {
      setTimeout(() => {
        resolve(true);
        contentElement.forEach((element, index) => {
          if (element instanceof HTMLElement) {
            setTimeout(() => {
              element.style.top = '-100%';
            }, index * 200);
          }
        });
        setTimeout(() => {
          content.style.display = 'none';
        }, 1400);
      }, 1400);
      
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        // setTimeout(() => {
          resolve(true);
          contentElement.forEach((element, index) => {
            if (element instanceof HTMLElement) {
              setTimeout(() => {
                element.style.top = '-100%';
              }, index * 200);
            }
          });
          setTimeout(() => {
            content.style.display = 'none';
          }, 1400);
        // }, 1400);
      });
    }

  });
};
