import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private showPopupSubject = new Subject<boolean>();
  private messageSubject = new Subject<string | null>();

  showPopup$ = this.showPopupSubject.asObservable();
  message$ = this.messageSubject.asObservable();

  showMessage(message: string): void {
    this.messageSubject.next(message);
    this.showPopupSubject.next(true);
  }

  closePopup(): void {
      this.showPopupSubject.next(false);
      this.messageSubject.next(null);
  }
}
