import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationEvent,
  AnimationPlayer,
  AnimationBuilder,
} from '@angular/animations';
import splt from 'spltjs';
import anime from 'animejs';

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

  ngOnInit(): void {
    splt({reveal:true})
    document.addEventListener('click', this.userClickOut.bind(this));
  }

  openMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuState = this.isMenuOpen ? 'opened' : 'closed';
    const menuSpan = document.getElementById('menuSpan')! as HTMLElement;
    menuSpan.innerText = this.isMenuOpen ? '[CLOSE]' : '[MENU]';
  }

  onAnimationStart(event: AnimationEvent) {

    const commonProps = {
      duration: 550,
      easing: 'cubicBezier(.34,0,.33,1)',
      autoplay: false
    }
    var itemAnimationsIn = anime({
      targets: '.nav-items #r',
      delay: function(el, i){
        return i * 30;
      },
      translateY: [80,0],
      rotate: [50, 0],
      ...commonProps,
    });
    var itemAnimationsOut = anime({
      targets: '.nav-items #r',
      translateY: [0,80],
      rotate: [0, 50],
      ...commonProps,
    });
    var linkAnimationsIn = anime({
      targets: '.nav-links a',
      delay: function(el, i){
        return i * 50;
      },
      rotate: [10, 0],
      translateY: [50,0],
      ...commonProps,
    });
    var linkAnimationsOut = anime({
      targets: '.nav-links a',
      rotate: [0, 10],
      translateY: [0,50],
      ...commonProps,
    });

    if (event.fromState === 'closed' && event.toState === 'opened') {
      itemAnimationsIn.play();
      linkAnimationsIn.play();
      console.log("open to closed")
    } else if (event.fromState === 'opened' && event.toState === 'closed') {
      itemAnimationsOut.play();
      linkAnimationsOut.play();
      console.log("closed to open")
    }
  }
  
  onAnimationDone(event: AnimationEvent) {
    if (event.fromState === 'closed' && event.toState === 'opened') {

      console.log("1 closed to open")
    } else if (event.fromState === 'opened' && event.toState === 'closed') {

      console.log("1 open to close")
    }
  }

  @HostListener('document:click', ['$event'])
  userClickOut(event: Event) {
    const menuSpan = document.getElementById('menuSpan')! as HTMLElement;
    if (!this.el.nativeElement.contains(event.target)) {
      menuSpan.innerText = '[MENU]';
      this.menuState = 'closed';
      this.isMenuOpen = false;
    }
  }
}