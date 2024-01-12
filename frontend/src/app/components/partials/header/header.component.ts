import { Component, ElementRef, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationEvent,
} from '@angular/animations';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { RouteGuardService } from '../../../shared/services/route-guard.service';

import anime from 'animejs';
import 'splitting/dist/splitting.css';
import Splitting from 'splitting';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    trigger('menuAnim', [
      state(
        'closed',
        style({
          visibility: 'hidden',
          transform: 'translateY(-100%)',
        })
      ),
      state(
        'opened',
        style({
          visibility: 'visible',
          transform: 'translateY(0)',
        })
      ),
      transition(
        'closed <=> opened',
        animate('900ms cubic-bezier(.66,-0.01,.07,1)')
      ),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  private isMenuOpen = false;
  public menuState = 'closed';

  constructor(private el: ElementRef, private router: Router, public routeGS: RouteGuardService) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if(event instanceof NavigationStart) {
        this.closeMenu();
      }
    })
    Splitting();
  }

  openMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuState = this.isMenuOpen ? 'opened' : 'closed';

    const menuSpan = document.querySelector(
      'header .container .menu-button span'
    ) as HTMLElement;
    menuSpan.innerText = this.isMenuOpen ? '[CLOSE]' : '[MENU]';
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.menuState = 'closed';

    const menuSpan = document.querySelector(
      'header .container .menu-button span'
    ) as HTMLElement;
    menuSpan.innerText = '[MENU]';
  }

  onAnimationStart(event: AnimationEvent) {
    var CommonProps = {
      duration: 800,
      easing: 'cubicBezier(.66,-0.01,.07,1)',
      autoplay: false,
    };

    var itemAnimationsIn = anime({
      targets: '.nav-list .nav-item .word .char',
      translateY: [400, 0],
      delay: function (el, i) {
        return i * 20;
      },
      ...CommonProps,
    });
    var itemAnimationsOut = anime({
      targets: '.nav-list .nav-item .word .char',
      translateY: [0, -800],
      ...CommonProps,
    });

    var linkAnimationsIn = anime({
      targets: '.nav-links .nav-item .word',
      opacity: [0, 1],
      delay: function (el, i) {
        return 20 * 20;
      },
      ...CommonProps,
    });
    var linkAnimationsOut = anime({
      targets: '.nav-links .nav-item .word',
      opacity: [1, 0],
      ...CommonProps,
    });

    if (event.fromState === 'closed' && event.toState === 'opened') {
      itemAnimationsIn.play();
      linkAnimationsIn.play();
    } else if (event.fromState === 'opened' && event.toState === 'closed') {
      itemAnimationsOut.play();
      linkAnimationsOut.play();
    }
  }
}
