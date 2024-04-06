import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.scss',
})
export class ProjectViewComponent implements OnInit {
  project!: any;
  projectData!: any[];

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const projectName = this.route.snapshot.paramMap.get('projectName');

    this.projectService.getProjects().subscribe({
      next: (data: any) => {
        this.projectData = data.project;
        console.log(this.projectData);

        this.projectData.forEach((proj) => {
          const name = proj.name.toLowerCase().replace(/\s+/g, '');
          if (name === projectName) {
            this.project = proj;
            console.log(this.project);
          }
        });
      },
      error: (err) => console.error(err),
    });
  }
}
