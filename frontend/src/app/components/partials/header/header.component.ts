import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationEvent,
} from '@angular/animations';
import { NavigationStart, Router } from '@angular/router';
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
  private startHidingListener!: () => void;

  constructor(private router: Router, public routeGS: RouteGuardService) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeMenu();
      }
    });
    Splitting();

    this.startHidingListener = this.hideHeader();
    this.startHidingListener();
  }

  hideHeader() {
    var prevScrollPos = window.scrollY;
    var headerSafeZone = 100;

    const startHiding = () => {
      const currentScrollPos = window.scrollY;
      if (currentScrollPos > headerSafeZone) {
        document.querySelector('header')!.style.top = '-10%';
      } else {
        document.querySelector('header')!.style.top = '0';
      }
      if (prevScrollPos > currentScrollPos && prevScrollPos > headerSafeZone) {
        document.querySelector('header')!.style.top = '0';
      }
      prevScrollPos = currentScrollPos;
    };
    window.addEventListener('scroll', startHiding);
    return startHiding;
  }

  openMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuState = this.isMenuOpen ? 'opened' : 'closed';

    const menuSpan = document.querySelector(
      'header .container .menu-button span'
    ) as HTMLElement;
    menuSpan.innerText = this.isMenuOpen ? '[CLOSE]' : '[MENU]';

    if(this.isMenuOpen){
      window.removeEventListener('scroll', this.startHidingListener);
    } else {
      window.addEventListener('scroll', this.startHidingListener);
    }
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
