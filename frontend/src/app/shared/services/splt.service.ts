import { Injectable } from '@angular/core';
import splt from 'spltjs';

@Injectable({
  providedIn: 'root'
})
export class SpltService {
  private isInitialized = false;

  initializeSplt() {
    if(!this.isInitialized){
      splt({reveal:true});
      this.isInitialized = true;
    }
  }
}
