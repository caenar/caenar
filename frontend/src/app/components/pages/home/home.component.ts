import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
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
export class HomeComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    Splitting();
    gsap.registerPlugin(ScrollTrigger);

    setTimeout(() => {
      this.introAnimations();
      this.aboutAnimations();
      this.featuredAnimations();
    }, 0);
  }

  introAnimations() {
    const introLine = document.querySelector('.intro-head .line')!;
    var lineWidth = getComputedStyle(introLine).width;

    anime({
      targets: '.intro-head .line',
      width: [0, lineWidth],
      duration: 1500,
      delay: function (el, i) {
        return 20 * 20;
      },
      easing: 'cubicBezier(.24,0,.09,1)',
    });

    anime({
      targets: '.intro-head h1 .word .char',
      translateY: [500, 0],
      duration: 1300,
      delay: anime.stagger(40),
      easing: 'cubicBezier(.24,0,.09,1)',
    });

    anime({
      targets: '.intro-banner video',
      height: [0, 480],
      duration: 1300,
      delay: function (el, li) {
        return 5 * 5;
      },
      easing: 'cubicBezier(.38,0,.13,1)',
    });

    anime({
      targets: '.intro-text p .word',
      translateY: [-300, 0],
      duration: 1500,
      delay: anime.stagger(20),
      easing: 'cubicBezier(.24,0,.09,1)',
    });

    var intro_gsapCommon = {
      trigger: '.intro-inner',
      start: 'center center',
      end: 'bottom center',
      scrub: 1,
    };

    gsap.to('.intro-head', {
      translateY: 700,
      scrollTrigger: {
        ...intro_gsapCommon,
      },
    });

    gsap.to('.intro-banner', {
      clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)',
      scrollTrigger: {
        ...intro_gsapCommon,
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
    });
  }

  aboutAnimations() {
    var header_label = anime({
      targets: '.header-inner .label .word',
      translateY: [100, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(20),
      easing: 'cubicBezier(.24,0,.09,1)',
      autoplay: false,
    });

    ScrollTrigger.create({
      trigger: '.header-inner',
      start: 'top center',
      end: '40% center',
      onUpdate: (self) => {
        header_label.seek(header_label.duration * self.progress);
      },
      scrub: 1
    });

    var header_title = anime({
      targets: '.header-inner .header h1 .word',
      translateY: [100, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(50),
      easing: 'cubicBezier(.24,0,.09,1)',
      autoplay: false,
    });

    ScrollTrigger.create({
      trigger: '.header-inner',
      start: 'top center',
      end: '50% center',
      onUpdate: (self) => {
        header_title.seek(header_title.duration * self.progress);
      },
      scrub: 1
    });

    var header_body = anime({
      targets: '.header-inner .container .body',
      translateY: [100, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(20),
      easing: 'cubicBezier(.24,0,.09,1)',
      autoplay: false,
    });

    ScrollTrigger.create({
      trigger: '.header-inner',
      start: '30% center',
      end: '70% center',
      onUpdate: (self) => {
        header_body.seek(header_body.duration * self.progress);
      },
      scrub: 1
    });
  }

  featuredAnimations() {
    var featured_header = anime({
      targets: '.featured .header h1 .word .char',
      translateY: [100,0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(20),
      easing: 'cubicBezier(.24,0,.09,1)',
      autoplay: false,
    })

    ScrollTrigger.create({
      trigger: '.featured',
      start: 'top center',
      end: '35% center',
      onUpdate: (self) => {
        featured_header.seek(featured_header.duration * self.progress);
      },
      scrub: 1
    })

    var featured_body = anime({
      targets: ['.featured .body p .word', '.featured .header .cta'],
      translateY: [100,0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(20),
      easing: 'cubicBezier(.24,0,.09,1)',
      autoplay: false,
    })

    ScrollTrigger.create({
      trigger: '.featured',
      start: '5% center',
      end: '35% center',
      onUpdate: (self) => {
        featured_body.seek(featured_body.duration * self.progress);
      },
      scrub: 1
    })

    var featured_item = anime({
      targets: '.featured-item',
      translateY: [200,0],
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(30),
      easing: 'cubicBezier(.24,0,.09,1)',
      autoplay: false,
    })

    ScrollTrigger.create({
      trigger: '.featured',
      start: '10% center',
      end: '50% center',
      onUpdate: (self) => {
        featured_item.seek(featured_item.duration * self.progress);
      },
      scrub: 1
    })

    var itemContainer = document.querySelectorAll('.featured-item .item-img-container');

    itemContainer.forEach((item) => {
      const itemImg = item.querySelector('.item-img') as HTMLElement;
      const itemOverlay = item.querySelector('.item-overlay') as HTMLElement;

      item.addEventListener('mouseenter', () => {
        itemImg.style.filter = 'blur(20px)';
        itemImg.style.transform = 'scale(1.050)';
        itemOverlay.style.transform = 'scale(1)';
        itemOverlay.style.setProperty('opacity', '1');
        itemOverlay.style.setProperty('visibility', 'visible');
      });
      
      item.addEventListener('mouseleave', () => {
        itemImg.style.transform = 'scale(1)';
        itemImg.style.filter = 'blur(0px)';
        itemOverlay.style.setProperty('opacity', '0');
        itemOverlay.style.transform = 'scale(0.95)';
        itemOverlay.style.setProperty('visibility', 'hidden');
      });
    });
  }
}
