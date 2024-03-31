import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../shared/services/project.service';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss',
})
export class WorkComponent implements OnInit {
  projects!: any[];
  projectTags!: any[];
  tags!: any[];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe({
      next: (data: any) => {
        this.projects = data.project;
        console.log(this.projects);
      },
      error: (error) => console.error(error),
    });
    this.projectService.getProjectTags().subscribe({
      next: (data: any) => {
        this.projectTags = data.projectTags;
        console.log(this.projectTags);
      },
      error: (error) => console.error(error),
    });
    this.projectService.getTags().subscribe({
      next: (data: any) => {
        this.tags = data.tags;
        console.log(this.tags);
      },
      error: (error) => console.error(error),
    });
  }
}
