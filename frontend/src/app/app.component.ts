import { AfterViewInit, Component } from '@angular/core';
import Lenis from '@studio-freight/lenis';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  title = 'caenar';

  ngAfterViewInit(): void {

    const lenis = new Lenis();
    function raf(time:any) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}
