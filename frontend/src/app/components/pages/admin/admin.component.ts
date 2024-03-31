import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../shared/services/project.service';
import { PopupService } from '../../../shared/services/popup.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  providers: [PopupService],
})
export class AdminComponent {
  projects: any[] = [];
  projectTags: any[] = [];
  tags: any[] = [];

  projectName = '';
  projectDesc = '';
  projectTag = '';
  projectNameToDelete = '';

  showPopup = false;
  message: string | null = null;
  private subscription = new Subscription();

  constructor(
    private projectService: ProjectService,
    public popupService: PopupService
  ) {}

  showMessage(message: string): void {
    this.popupService.showMessage(message);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.popupService.showPopup$.subscribe((showPopup) => {
        this.showPopup = showPopup;
      })
    );

    this.subscription.add(
      this.popupService.message$.subscribe((message) => {
        this.message = message;
      })
    );

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

  addProject(): void {
    const tagsArray = this.projectTag.split(',').map((tag) => tag.trim());

    const projectData = {
      name: this.projectName,
      description: this.projectDesc,
      tags: tagsArray,
    };

    this.projectService.createProject(projectData).subscribe({
      next: (response : any) => {
        this.showMessage(`Created the project ${response.newProject.name} successfully.`);

        this.popupService.showPopup$.subscribe((showPopup) => {
          if (!showPopup) {
            window.location.reload();
          }
        });

        this.projectName = '';
        this.projectDesc = '';
        this.projectTag = '';
      },
      error: (err) => {
        this.showMessage(`Could not create this project possibly due to an internal server error.`);
        console.error(err);
      },
    });
  }

  deleteProject(): void {
    const project = this.projects.find(
      (p) => p.name === this.projectNameToDelete
    );

    if (project) {
      this.projectService.deleteProject(project.id).subscribe({
        next: () => {
          this.showMessage(`The project ${this.projectNameToDelete} was succesfully deleted from the database.`);

          const projectTag = this.projectTags.find(
            (p) => p.projectId === project.id
          );

          this.deleteProjectTags(project.id);
          this.deleteTags(projectTag.tagId);

          this.projects = this.projects.filter((p) => p.id !== project.id);
          this.projectNameToDelete = '';
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      this.showMessage(`The project ${this.projectNameToDelete} does not exist in the database.`);
    }
  }

  deleteProjectTags(projectId: number): void {
    this.projectService.deleteProjectTags(projectId).subscribe({
      error: (err) => {
        console.error(err);
      },
    });
  }

  deleteTags(projectId: number): void {
    this.projectService.deleteTags(projectId).subscribe({
      error: (err) => {
        console.error(err);
      },
    });
  }
}
