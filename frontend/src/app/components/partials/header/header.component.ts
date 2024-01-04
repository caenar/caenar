import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import splt from 'spltjs';
import anime from 'animejs';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('menuAnim', [
      state(
        'closed',
        style({
          visibility: 'hidden',
          clipPath: 'circle(0 at 100% 0)',
        })
      ),
      state(
        'opened',
        style({
          visibility: 'visible',
          clipPath: 'circle(141.2% at 100% 0)',
        })
      ),
      transition('closed <=> opened', animate('500ms ease')),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  private isMenuOpen = false;
  public menuState = 'closed';

  constructor(private el: ElementRef) {}

  openMenu() {
    this.menuState = this.isMenuOpen ? 'closed' : 'opened';
    this.isMenuOpen = !this.isMenuOpen;
    
    const menuSpan = document.getElementById('menuSpan')! as HTMLElement;
    const navContent = document.querySelector('nav');

    if (this.menuState == 'opened') {
      menuSpan.innerText = '[CLOSE]';
      document.addEventListener('click', this.userClickOut.bind(this));
    } else {
      menuSpan.innerText = '[MENU]';
      document.removeEventListener('click', this.userClickOut.bind(this));
    }
  }
  
  @HostListener('document:click', ['$event'])
  userClickOut(event: Event) {
    const menuSpan = document.getElementById('menuSpan')! as HTMLElement;
    if (!this.el.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
      this.menuState = 'closed';
      menuSpan.innerText = '[MENU]';
      document.removeEventListener('click', this.userClickOut.bind(this));
    }
  }

  ngOnInit(): void {
  }
}
