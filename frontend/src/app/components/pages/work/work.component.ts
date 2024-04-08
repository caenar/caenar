import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProjectService } from '../../../shared/services/project.service';
import anime from 'animejs';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss',
})
export class WorkComponent implements OnInit {
  DATA_PROJECTS!: any[];
  DATA_PROJECT_TAGS!: any[];
  DATA_TAGS!: any[];
  DATA_FILES: any[] = [];

  constructor(private projectService: ProjectService) {}

  projects: any[] = [];
  caseStudy: any = {};

  name!: string;
  description!: string;
  background!: string;
  assets!: string[];
  tags: string[] = [];

  selectedTag: string = 'all';
  filteredProjects: any[] = [];

  ngOnInit(): void {
    forkJoin({
      projects: this.projectService.getProjects(),
      projectTags: this.projectService.getProjectTags(),
      tags: this.projectService.getTags(),
    }).subscribe({
      next: (data: any) => {
        this.DATA_PROJECTS = data.projects.project;
        this.DATA_PROJECT_TAGS = data.projectTags.projectTags;
        this.DATA_TAGS = data.tags.tags;

        let folder = 'casestudies';
        this.DATA_PROJECTS.forEach((project) => {
          const projectName = project.name.toLowerCase().replace(/\s+/g, '');

          this.projectService.getImages(projectName, folder).subscribe({
            next: (imageFiles: string[]) => {
              const imageUrls = imageFiles.map(
                (fileName) =>
                  `${environment.baseUrl}/${folder}/${projectName}/${fileName}`
              );
              this.name = project.name;
              this.description = project.description;
              this.background = project.background;

              this.DATA_PROJECT_TAGS.forEach((proTag) => {
                if (proTag.projectId === project.id) {
                  this.DATA_TAGS.forEach((tag) => {
                    if (tag.id === proTag.tagId) {
                      this.tags.push(tag.name);
                    }
                  });
                }
              });
              this.caseStudy = {
                name: this.name,
                description: this.description,
                background: this.background,
                tags: this.tags,
                assets: imageUrls,
              };
              this.projects.push(this.caseStudy);
              this.tags = [];
            },
            error: (err) => console.error(err),
          });
        });
        this.filteredProjects = this.projects;
      },
      error: (err) => console.error(err),
    });
  }

  filter(tagName: string): void {
    this.selectedTag = tagName;
    if (tagName === 'all') {
      this.filteredProjects = this.projects;
    } else {
      this.filteredProjects = this.projects.filter((project) =>
        project.tags.includes(tagName)
      );
    }
    const container = document.querySelector('.container') as HTMLElement;

    anime({
      targets: container,
      opacity: [0, 1],
      translateY: ['80px', '0px'],
      duration: 1100,
      easing: 'cubicBezier(.39,0,.16,1.01)',
    });
  }

  createProjectName(projectName: string): string {
    return '/work/' + projectName.toLowerCase().replace(/\s+/g, '');
  }
}
