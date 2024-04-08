import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { environment } from '../../../../environments/environment';
import { filter, forkJoin, switchMap } from 'rxjs';

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

  projectName: any;
  nextProject: any = {};
  currentProjectIndex: number = 0;
  caseStudy: any = {};
  tags: any[] = [];

  DATA_PROJECT!: any[];
  DATA_PROJECT_TAGS!: any[];
  DATA_TAGS: any[] = [];

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          this.projectName = params.get('projectName');

          return forkJoin({
            projects: this.projectService.getProjects(),
            projectTags: this.projectService.getProjectTags(),
            tags: this.projectService.getTags(),
          });
        })
      )
      .subscribe({
        next: (data: any) => {
          this.DATA_PROJECT = data.projects.project;
          this.DATA_PROJECT_TAGS = data.projectTags.projectTags;
          this.DATA_TAGS = data.tags.tags;

          let folder = 'projects';

          this.DATA_PROJECT.forEach((project, index) => {
            const name = project.name.toLowerCase().replace(/\s+/g, '');
            if (this.projectName === name) {
              this.currentProjectIndex = index + 1;
              this.projectService
                .getImages(this.projectName, folder)
                .subscribe({
                  next: (imageFiles: string[]) => {
                    const imageUrls = imageFiles.map(
                      (fileName) =>
                        `${environment.baseUrl}/${folder}/${this.projectName}/${fileName}`
                    );
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
                      name: project.name,
                      description: project.description,
                      background: project.background,
                      tags: this.tags,
                      assets: imageUrls,
                    };
                    this.tags = [];
                  },
                  error: (err) => console.error(err),
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
                  };
                },
                error: (err) => console.error(err),
              });
            }
          });
        },
        error: (err) => console.error(err),
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

  createProjectName(projectName: string): string {
    return '/work/' + projectName.toLowerCase().replace(/\s+/g, '');
  }
}
