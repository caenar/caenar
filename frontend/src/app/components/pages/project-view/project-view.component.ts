import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { environment } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.scss',
})
export class ProjectViewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  projectName: any = '';
  currentProjectIndex: number = 0;
  caseStudy: any = {
    client: '',
    name: '',
    description: '',
    background: '',
    industry: '',
    year: 0,
    tags: '',
    assets: '',
  };
  nextProject: any = {
    name: '',
    assets: '',
    link: '',
  };
  tags: any[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.projectName = params.get('projectName');
      if (this.projectName) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    forkJoin({
      projects: this.projectService.getProjects(),
      projectTags: this.projectService.getProjectTags(),
      tags: this.projectService.getTags(),
    }).subscribe({
      next: (data) => {
        this.processData(data);
      },
      error: (err) => console.error(err),
    });
  }

  sortedProjects: any[] = [];
  processData(data: any): void {
    const folder = 'projects';
    const { projects, projectTags, tags } = data;

    projects.project.forEach((project: any) => {
      if (!project.is_archived) {
        this.sortedProjects.push(project);
        this.sortedProjects.sort((a, b) => {
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
      }
    });

    this.sortedProjects.forEach((project: any, index: number) => {
      const name = project.name.toLowerCase().replace(/\s+/g, '');
      
      if (this.projectName === name) {
        this.currentProjectIndex = index + 1;
        this.projectService.getImages(this.projectName, folder).subscribe({
          next: (imageFiles: string[]) => {
            const imageUrls = imageFiles.map(
              (fileName) =>
                `${environment.baseUrl}/${folder}/${this.projectName}/${fileName}`
            );
            projectTags.projectTags.forEach((proTag: any) => {
              tags.tags.forEach((tag: any) => {
                if (
                  tag.id === proTag.tagId &&
                  proTag.projectId === project.id
                ) {
                  this.tags.push(tag.name);
                }
              });
            });
            this.caseStudy = {
              client: project.client,
              name: project.name,
              description: project.description,
              background: project.background,
              industry: project.industry,
              year: project.year,
              tags: this.tags,
              assets: imageUrls,
            };
            this.tags = [];
          },
        });
      }

      if (this.currentProjectIndex === index) {
        this.projectService.getImages(name, folder).subscribe({
          next: (imageFiles: string[]) => {
            const imageUrls = imageFiles.map(
              (fileName) =>
                `${environment.baseUrl}/${folder}/${name}/${fileName}`
            );

            this.nextProject = {
              name: project.name,
              assets: imageUrls,
              link: `/work/${name}`,
            };
          },
        });
      }
    });
  }

  onPreview(event: MouseEvent): void {
    const parent = event.target as HTMLElement;
    const target = parent.querySelector('img') as HTMLElement;
    const text = document.querySelector('.next-project .link') as HTMLElement;
    text.style.opacity = '0.5';

    target.style.transform = 'translateY(0%)';
    event.target?.addEventListener('mouseleave', () => {
      target.style.transform = 'translateY(50%)';
      text.style.opacity = '1';
    });
  }

  isImage(image: any): boolean {
    return image.toLowerCase().endsWith('.png');
  }
}
