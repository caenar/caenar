import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ProjectService } from '../../../shared/services/project.service';
import { PopupService } from '../../../shared/services/popup.service';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  providers: [PopupService],
})
export class AdminComponent implements AfterViewInit, OnDestroy {
  projects: any[] = [];
  projectTags: any[] = [];
  tags: any[] = [];
  projectNameToDelete = '';

  updateProjectName: string = '';
  updateProjectDesc: string = '';
  updateProjectBg: string = '';
  updateProjectTag: string = '';
  updateIsArchived: boolean = false;

  createProjectName: string = '';
  createProjectDesc: string = '';
  createProjectBg: string = '';
  createProjectTag: string = '';
  createIsArchived: boolean = false;

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

  ngAfterViewInit(): void {
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
    forkJoin({
      projects: this.projectService.getProjects(),
      projectTags: this.projectService.getProjectTags(),
      tags: this.projectService.getTags(),
    }).subscribe({
      next: (data: any) => {
        this.projects = data.projects.project;
        this.projectTags = data.projectTags.projectTags;
        this.tags = data.tags.tags;
      },
      error: (err) => console.error(err),
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isOverlayOpen: boolean = false;
  projectToUpdate: any;

  editProject(projectToUpdate: any): void {
    let tagArray: any = [];
    this.projectTags.forEach((p) => {
      if (p.projectId === projectToUpdate.id) {
        this.tags.forEach((tag) => {
          if (tag.id === p.tagId) {
            tagArray.push(tag);
          }
        });
      }
    });

    const tagNames = tagArray.map((obj: any) => obj.name).join(', ');
    this.updateProjectName = projectToUpdate.name;
    this.updateProjectDesc = projectToUpdate.description;
    this.updateProjectBg = projectToUpdate.background;
    this.updateProjectTag = tagNames;
    this.updateIsArchived = projectToUpdate.is_archived;

    this.projectToUpdate = {
      id: projectToUpdate.id,
      name: projectToUpdate.name,
      description: projectToUpdate.description,
      background: projectToUpdate.background,
      tags: tagNames,
      is_archived: projectToUpdate.is_archived,
    };

    this.isOverlayOpen = true;
  }

  updateProject(): void {
    const tagsArray = this.updateProjectTag
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    const projectData = {
      name: this.updateProjectName,
      description: this.updateProjectDesc,
      background: this.updateProjectBg,
      tags: tagsArray,
      is_archived: this.updateIsArchived,
    };

    this.projectService
      .updateProject(this.projectToUpdate.id, projectData)
      .subscribe({
        next: () => {
          this.isOverlayOpen = false;
          this.showMessage(
            `Updated the project ${this.updateProjectName} successfully.`
          );
          this.popupService.showPopup$.subscribe((showPopup) => {
            if (!showPopup) {
              window.location.reload();
            }
          });
          this.updateProjectName = '';
          this.updateProjectDesc = '';
          this.updateProjectBg = '';
          this.updateProjectName = '';
          this.updateIsArchived = false;
        },
        error: (err) => {
          this.showMessage(`Could not update this project.`);
          console.error(err);
        },
      });
  }

  addProject(): void {
    const tagsArray = this.createProjectTag
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    if (
      this.createProjectName === '' ||
      this.createProjectDesc === '' ||
      this.createProjectBg === '' ||
      tagsArray.length === 0
    ) {
      this.showMessage('Hey, you need to fill in all of those.');
    } else {
      const projectData = {
        name: this.createProjectName,
        description: this.createProjectDesc,
        background: this.createProjectBg,
        tags: tagsArray,
        is_archived: this.createIsArchived,
      };
      this.projectService.createProject(projectData).subscribe({
        next: (response: any) => {
          this.showMessage(
            `Created the project ${response.newProject.name} successfully.`
          );
          this.popupService.showPopup$.subscribe((showPopup) => {
            if (!showPopup) {
              window.location.reload();
            }
          });
          this.createProjectName = '';
          this.createProjectDesc = '';
          this.createProjectBg = '';
          this.createProjectName = '';
          this.createIsArchived = false;
        },
        error: (err) => {
          this.showMessage(`Could not create this project.`);
          console.error(err);
        },
      });
    }
  }

  deleteProject(): void {
    if (this.projectNameToDelete === '') {
      this.showMessage('You need to fill up the field, bro.');
    } else {
      const project = this.projects.find(
        (p) => p.name === this.projectNameToDelete
      );
      if (project) {
        this.projectService.deleteProject(project.id).subscribe({
          next: () => {
            this.showMessage(
              `The project ${this.projectNameToDelete} was succesfully deleted from the database.`
            );
            const projectTag = this.projectTags.find(
              (p) => p.projectId === project.id
            );
            this.deleteProjectTags(project.id);
            this.deleteTags(projectTag.tagId);
            this.projects = this.projects.filter((p) => p.id !== project.id);
            this.projectNameToDelete = '';
          },
        });
      } else {
        this.showMessage(
          `The project ${this.projectNameToDelete} does not exist in the database.`
        );
      }
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
