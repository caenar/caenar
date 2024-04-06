import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  caseStudy: any = {};
  tags: any[] = [];

  DATA_PROJECT!: any[];
  DATA_PROJECT_TAGS!: any[];
  DATA_TAGS: any[] = [];

  ngOnInit(): void {
    const projectName = this.route.snapshot.paramMap.get('projectName');

    forkJoin({
      projects: this.projectService.getProjects(),
      projectTags: this.projectService.getProjectTags(),
      tags: this.projectService.getTags(),
    }).subscribe({
      next: (data: any) => {
        console.log(data);
        this.DATA_PROJECT = data.projects.project;
        this.DATA_PROJECT_TAGS = data.projectTags.projectTags;
        this.DATA_TAGS = data.tags.tags;
        
        let folder = 'casestudies';
        
        this.DATA_PROJECT.forEach((project) => {
          const name = project.name.toLowerCase().replace(/\s+/g, '');

          if (projectName === name) {
            this.projectService.getImages(projectName, folder).subscribe({
              next: (imageFiles: string[]) => {
                const imageUrls = imageFiles.map(
                  (fileName) =>
                    `${environment.baseUrl}/${folder}/${projectName}/${fileName}`
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
              },
              error: (err) => console.error(err),
            });
          }
        });
      },
      error: (err) => console.error(err),
    });

  }

}
