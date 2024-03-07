import { AfterViewInit, Component, ElementRef, Renderer2 } from '@angular/core';

import anime from 'animejs';
import 'splitting/dist/splitting.css';
import Splitting from 'splitting';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit {
  constructor(
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    Splitting();
    gsap.registerPlugin(ScrollTrigger);

    setTimeout(() => {
      this.introAnimations();
    }, 0);

    let projectLinks = ['/work', '/work', '/work', '/work'];

    const cursor = document.getElementById('curs')!;
    const container = document.querySelectorAll(
      '.featured .container .item .img-container .img'
    );

    let event: MouseEvent;
    document.addEventListener('mousemove', (e) => {
      event = e;
      moveCursor();
    });
    document.addEventListener('scroll', () => {
      moveCursor();
    });
    
    container.forEach((element) => {
      element.addEventListener('mouseenter', () => {
        cursor.style.visibility = 'visible';
        cursorIn.play();
      });
      element.addEventListener('mouseleave', () => {
        cursorOut.play();
      });
      element.addEventListener('click', () => {
        this.router.navigateByUrl('/work');
      });
    }); 
    
    let commonProps = {
      duration: 500,
      easing: 'cubicBezier(.39,0,.16,1.01)',
      autoplay: false,
    };

    let cursorIn = anime({
      targets: cursor,
      opacity: [0,1],
      scale: [1.2, 1],
      ...commonProps,
    });
    let cursorOut = anime({
      targets: cursor,
      opacity: [1, 0],
      scale: [1, 1.2],
      ...commonProps,
    });

    function moveCursor() {
      cursor.style.left = event.clientX + window.pageXOffset + 'px';
      cursor.style.top = event.clientY + window.pageYOffset + 'px';
    }
  }

  introAnimations() {
    let mm = gsap.matchMedia();

    gsap.set('.intro-inner .video-container', {
      position: 'absolute',
      top: 0,
      padding: 0,
      height: '100vh',
      width: '100%',
      opacity: 0.3,
    });

    gsap.set('.intro-inner', {
      backgroundColor: '#111111',
    });
    mm.add('(min-width: 1200px)', () => {
      gsap.to('.intro-inner', {
        backgroundColor: '#fff5dc',
        scrollTrigger: {
          trigger: '.intro-inner',
          start: '30% center',
          end: '60% center',
          scrub: 1,
        },
      });
    });

    mm.add('(min-width: 1200px)', () => {
      gsap.to('.intro-inner .video-container', {
        top: '50%',
        padding: '2rem 5rem 2rem 5rem',
        opacity: 1,
        scrollTrigger: {
          trigger: '.intro-inner',
          start: '30% center',
          end: '60% center',
          scrub: 1,
        },
      });
    });

    gsap.set(['.intro-inner .title', '.intro-inner .text-wrapper p'], {
      color: '#fefbff',
    });
    mm.add('(min-width: 1200px)', () => {
      gsap.to(['.intro-inner .title', '.intro-inner .text-wrapper p'], {
        color: '#111111',
        scrollTrigger: {
          trigger: '.intro-inner',
          start: '30% center',
          end: '60% center',
          scrub: 1,
        },
      });
    });
  }
}
