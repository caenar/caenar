// animation-resolver.service.ts
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnimationResolver implements Resolve<boolean> {
  resolve(): Observable<boolean> | Promise<boolean> | boolean {
    const content = document.querySelector('.open-wrap') as HTMLElement;
    const contentElement = document.querySelectorAll('.open-wrap > div');
    contentElement.forEach((element, index) => {
      if (element instanceof HTMLElement) {
        setTimeout(() => {
          element.style.top = '-100%';
        }, index * 200);
      }
    });

    setTimeout(() => {
      content.style.display = 'none';
    }, 1800);

    return true;
  }
}
