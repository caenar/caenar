import { AfterViewInit, Component } from '@angular/core';
import { ProjectService } from '../../../shared/services/project.service';

@Component({
  selector: 'app-archive-view',
  templateUrl: './archive-view.component.html',
  styleUrl: './archive-view.component.scss'
})
export class ArchiveViewComponent implements AfterViewInit {
  constructor(projectService: ProjectService){}

  ngAfterViewInit(): void {
      
  }

}
