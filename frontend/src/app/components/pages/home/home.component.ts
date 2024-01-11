import { Component, ElementRef, OnInit } from '@angular/core';
import anime from 'animejs';
import 'splitting/dist/splitting.css';
import Splitting from 'splitting';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    Splitting();
    gsap.registerPlugin(ScrollTrigger);

    var introCommonProps = {
      trigger: '.intro-inner',
      start: 'center center',
      end: 'bottom center',
      scrub: 1,
    }

    gsap.to('.intro-head', {
      translateY: 700,
      scrollTrigger: {
        ...introCommonProps
      },
    });
    
    gsap.to('.intro-banner', {
      clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)',
      scrollTrigger: {
        ...introCommonProps
      },
    });

    gsap.to('.intro-text p', {
      opacity: 0,
      scrollTrigger: {
        trigger: '.intro-inner',
        start: 'center center',
        end: '70% center',
        scrub: 1,
      },
    })
  }
}
