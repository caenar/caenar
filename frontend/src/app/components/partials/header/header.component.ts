import { Component, OnInit } from '@angular/core';
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
import { ComputeStyleService } from '../../../shared/services/compute-style.service';

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

  constructor(
    private router: Router,
    public routeGS: RouteGuardService,
    private computedStyle: ComputeStyleService
  ) {}

  routerLink!: string;
  itemWidth: number[] = [];

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeMenu();
      }
      if (event instanceof NavigationEnd) {
        this.routerLink = this.router.url;
      }
    });
    Splitting();

    const selector = '.nav-list .nav-item';
    this.itemWidth = this.computedStyle.getWidth(selector);

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

  currentRouterLink: any;
  cursorMoveCounter: number = 1;
  openMenu() {
    this.currentRouterLink = this.routerLink;

    this.isMenuOpen = !this.isMenuOpen;
    this.menuState = this.isMenuOpen ? 'opened' : 'closed';

    const menuSpan = document.querySelector(
      'header .container .menu-button span'
    ) as HTMLElement;
    menuSpan.innerText = this.isMenuOpen ? '[CLOSE]' : '[MENU]';

    if (this.isMenuOpen) {
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
        duration: 700,
        easing: 'cubicBezier(.39,0,.16,1.01)',
        autoplay: false,
      };

      var itemAnimationsIn = anime({
        targets: '.nav-list .nav-item .word .char',
        translateY: [500, 0],
        delay: function (el, i) {
          return i * 20;
        },
        ...CommonProps,
      });
      var itemAnimationsOut = anime({
        targets: '.nav-list .nav-item .word .char',
        translateY: [0, -500],
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
      
      var selectorLeftIn = anime({
        targets: '.nav-list .selector-left',
        translateX: [-50,0],
        opacity: 1,
        ...CommonProps,
      });
      var selectorLeftOut = anime({
        targets: '.nav-list .selector-left',
        translateX: [0,-50],
        opacity: 0,
        duration: 500,
        easing: 'cubicBezier(.73,0,0,.99)',
        autoplay: false,
      })
      var selectorRightIn = anime({
        targets: '.nav-list .selector-right',
        translateX: [50,0],
        opacity: 1,
        ...CommonProps,
      });
      var selectorRightOut = anime({
        targets: '.nav-list .selector-right',
        translateX: [0,50],
        opacity: 0,
        duration: 500,
        easing: 'cubicBezier(.73,0,0,.99)',
        autoplay: false,
      })

      if (event.fromState === 'closed' && event.toState === 'opened') {
        setTimeout(() => {
          itemAnimationsIn.play();
        }, 150);
        setTimeout(() => {
          selectorLeftIn.play();
          selectorRightIn.play();
          // selectorsAnimIn.play();
        }, 500);
        linkAnimationsIn.play();
      } else if (event.fromState === 'opened' && event.toState === 'closed') {
        itemAnimationsOut.play();
        linkAnimationsOut.play();
        selectorLeftOut.play();
        selectorRightOut.play();
      }
    }

  itemsTop: number[] = [];
  itemsRight: number[] = [];
  currentLink: any;
  getItemInfoCounter: number = 0;
  getItemInfo(event: AnimationEvent) {
    if (event.toState === 'opened') {
      if (this.getItemInfoCounter !== 1) {
        ++this.getItemInfoCounter;
        var navItems = document.querySelectorAll('.nav-list .nav-item')!;

        var navLinks: string[] = [];

        navItems.forEach((element, index) => {
          navLinks.push(element.getAttribute('routerLink')!);
          console.log(navLinks[index]);

          if (navLinks[index] === this.currentRouterLink) {
            this.currentLink = navItems[index];
            console.log(this.currentLink);
          }

          if (this.itemsTop.length !== 4) {
            this.itemsTop.push(element.getBoundingClientRect().top);
            this.itemsRight.push(element.getBoundingClientRect().right);
            console.log(this.itemsTop[index]);
            console.log(this.itemsRight[index]);
          } else {
            console.log('could not get item top position');
          }
        });

        this.setActiveLink();
      }
    }
  }

  hasHovered = false;
  setActiveLink() {
    var firstSelector = document.querySelector(
      '.nav-list .selector-left'
    )! as HTMLElement;
    var secondSelector = document.querySelector(
      '.nav-list .selector-right'
    )! as HTMLElement;
    var navItems = document.querySelectorAll('.nav-list .nav-item')!;

    const SELECTOR_OFFSET = 65;
    navItems.forEach((element, index) => {
      const topDifference = this.itemsTop[index] - this.itemsTop[0];
      
      element.addEventListener('mouseenter', () => {
        navItems.forEach((item) => item.classList.add('unhovered-item'));

        element.classList.remove('unhovered-item');

        this.hasHovered = false;
        if (element === navItems[0]) {
          firstSelector.style.top = '0px';
          secondSelector.style.top = '0px';
          secondSelector.style.left = `${
            this.itemsRight[0] - SELECTOR_OFFSET
          }px`;
        } else {
          firstSelector.style.top = `${topDifference}px`;
          secondSelector.style.top = `${topDifference}px`;
          secondSelector.style.left = `${
            this.itemsRight[index] - SELECTOR_OFFSET
          }px`;
        }
      });
      element.addEventListener('mouseleave', () => {
        navItems.forEach((item) => item.classList.remove('unhovered-item'));

        this.hasHovered = true;
        if (this.hasHovered) {
          firstSelector.style.top = `0px`;
          secondSelector.style.top = `0px`;
          secondSelector.style.left = `${
            this.itemsRight[0] - SELECTOR_OFFSET
          }px`;
        }
      });
    });
  }
}
