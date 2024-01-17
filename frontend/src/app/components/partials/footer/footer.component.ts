import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  backToTop(){
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}
