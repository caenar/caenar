import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ComputeStyleService {
  getWidth(selector: string): number[] {
    const elements = document.querySelectorAll('.nav-list .nav-item');
    const maxWidths: number[] = [];

    elements.forEach((element) => {
      const clonedElement = element.cloneNode(true) as HTMLElement;

      clonedElement.style.width = 'max-content';
      clonedElement.style.position = 'absolute';
      clonedElement.style.visibility = 'hidden';
      clonedElement.style.display = 'block';

      document.body.appendChild(clonedElement);

      const maxContentWidth = clonedElement.offsetWidth;
      maxWidths.push(maxContentWidth);

      document.body.removeChild(clonedElement);
    });
    return maxWidths;
  }
}
