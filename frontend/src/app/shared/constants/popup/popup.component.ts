import {
  Component,
  OnDestroy,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PopupService } from '../../services/popup.service';
import anime from 'animejs';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnDestroy, OnChanges {
  showPopup = false;
  isOpen = false;

  @ViewChild('overlay') overlay!: ElementRef;
  @ViewChild('popupBox') popupBox!: ElementRef;
  @ViewChild('popup') popup!: ElementRef;

  @Input() message: string | null = null;
  private subscription = new Subscription();

  constructor(private popupService: PopupService, private elementRef: ElementRef) {
    this.subscription.add(
      this.popupService.showPopup$.subscribe((showPopup) => {
        this.showPopup = showPopup;
      })
    );
    this.subscription.add(
      this.popupService.message$.subscribe((message) => {
        this.message = message;
      })
    );
  }

  ngOnChanges(): void {
    setTimeout(() => {
      if (this.showPopup) {
        this.animatePopupIn();
      }
    }, 0);
  }

  private animatePopupIn(): void {
    anime({
      targets: this.overlay.nativeElement,
      opacity: [0, 1],
      duration: 300,
      easing: 'easeInOutQuad',
    });
    anime({
      targets: this.popupBox.nativeElement,
      opacity: [0, 1],
      duration: 500,
      easing: 'easeInOutQuad',
    });
    anime({
      targets: this.popup.nativeElement,
      opacity: [0, 1],
      scale: [0.9,1],
      duration: 100,
      delay: 100,
      easing: 'easeInOutQuad',
    });
  }
  
  private animatePopupOut(): void {
    anime({
      targets: this.overlay.nativeElement,
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInOutQuad',
    });
    anime({
      targets: this.popupBox.nativeElement,
      opacity: [1, 0],
      duration: 500,
      easing: 'easeInOutQuad',
    });
    anime({
      targets: this.popup.nativeElement,
      opacity: [1,0],
      scale: [1,0.9],
      duration: 100,
      easing: 'easeInOutQuad',
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closePopup(): void {
    this.animatePopupOut();
    setTimeout(() => {
      this.popupService.closePopup();
    }, 500);
  }
}
