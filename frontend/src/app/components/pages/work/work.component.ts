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
  tags: any[] = [];
  projects: any[] = [];
  filteredProjects: any[] = [];
  selectedTag: string = 'all';
  ACTIVE_TAGS: any[] = [];
  uniqueTagNames = new Set<string>();

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      projects: this.projectService.getProjects(),
      projectTags: this.projectService.getProjectTags(),
      tags: this.projectService.getTags(),
    }).subscribe({
      next: (data: any) => {
        this.processData(data);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  archivedProject: any[] = [];
  processData(data: any): void {
    const { projects, projectTags, tags } = data;
    let projectTagArray: any[] = [];

    projects.project.forEach((project: any) => {
      if (!project.is_archived) {
        
        const projectName = project.name.toLowerCase().replace(/\s+/g, '');
        this.projectService.getImages(projectName, 'projects').subscribe({
          next: (imageFiles: string[]) => {
            const imageUrls = imageFiles.map(
              (fileName) =>
                `${environment.baseUrl}/projects/${projectName}/${fileName}`
            );
            projectTags.projectTags.forEach((proTag: any) => {
              tags.tags.forEach((tag: any) => {
                if (tag.id === proTag.tagId && project.id === proTag.projectId)
                  projectTagArray.push(tag);
              });
            });
            this.processTags(projectTagArray);
            this.projects.push({
              id: project.id,
              name: project.name,
              description: project.description,
              background: project.background,
              tags: [...this.tags],
              assets: imageUrls,
            });
            this.projects.sort((a, b) => {
              const nameA = a.id;
              const nameB = b.id;
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            });
            this.tags = [];
            projectTagArray = [];
          },
          error: (err) => console.error(err),
        });
      } else {
        this.archivedProject.push(project);
      }
    });
    this.filteredProjects = this.projects;
  }

  processTags(projectTags: any[]): void {
    projectTags.forEach((tag: any) => {
      this.tags.push(tag.name);
      if (!this.uniqueTagNames.has(tag.name)) {
        this.ACTIVE_TAGS.push(tag);
        this.uniqueTagNames.add(tag.name);
      }
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
    this.animateContainer();
  }

  animateContainer(): void {
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
