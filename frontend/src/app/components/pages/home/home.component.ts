import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { SpltService } from '../../../shared/services/splt.service';
import anime from 'animejs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {

  constructor(private spltService: SpltService, private el: ElementRef) {}
  ngOnInit(): void {
    this.spltService.initializeSplt();

    anime({
      targets: '#i8 #r',
      translateY: [80,0],
      duration: 700,
      easing: 'cubicBezier(.34,0,.33,1)',
      delay: anime.stagger(50)
    });
  }
}
