import { Component, OnInit } from '@angular/core';
import { workItem } from '../../../shared/models/workItem.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss'
})
export class WorkComponent implements OnInit {
  workItems!: workItem[];

  constructor(private http: HttpClient){}

  ngOnInit(): void {
      this.fetchWorkItems();
      
    }
    
    fetchWorkItems(){
      this.http.get<workItem[]>(`http://localhost:3000/api/data`)
      .subscribe(data => {
        this.workItems = data;
        console.log(this.workItems);
    });
  }
}
