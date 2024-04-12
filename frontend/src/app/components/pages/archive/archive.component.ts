import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ProjectService } from '../../../shared/services/project.service';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import anime from 'animejs';
import Masonry from 'masonry-layout';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss',
})
export class ArchiveComponent implements OnInit, AfterViewInit {
  constructor(private projectService: ProjectService) {}

  @ViewChild('gridAll') gridAll!: ElementRef;
  @ViewChildren('gridFiltered') gridFiltered!: QueryList<ElementRef>;

  projects: any[] = [];
  others: any[] = [];
  allImages: any[] = [];

  filterName: any;
  containerTop!: any;

  ngOnInit(): void {
    this.loadData();
    this.filteredProjects = this.others;
  }
  ngAfterViewInit(): void {
    this.waitForDataLoad().then(() => {
      this.preloadImages(this.allImages).then(() => {
        var msnry = new Masonry(this.gridAll.nativeElement, {
          columnWidth: '.grid-sizer',
          itemSelector: '.grid-item',
          gutter: 0,
          stagger: 30,
        });

        this.gridFiltered.changes.subscribe(() => {
          if (this.gridFiltered.length > 0) {
            this.gridFiltered.forEach((grid: any) => {
              var msnry = new Masonry(grid.nativeElement, {
                columnWidth: '.grid-sizer',
                itemSelector: '.grid-item',
                gutter: 0,
                stagger: 30,
              });
            });
          }
          if (this.selectedTag === 'all') {
            var msnry = new Masonry(this.gridAll.nativeElement, {
              columnWidth: '.grid-sizer',
              itemSelector: '.grid-item',
              gutter: 0,
              stagger: 30,
            });
          }
        });
      });
    });
  }

  waitForDataLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (this.projects.length > 0 && this.allImages.length > 0) {
        resolve();
      } else {
        setTimeout(() => {
          this.waitForDataLoad().then(resolve);
        }, 500);
      }
    });
  }

  preloadImages(images: string[]): Promise<any[]> {
    const promises = images.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      });
    });
    return Promise.all(promises);
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
      error: (err) => console.error(err),
    });
  }

  tags: any[] = [];
  processData(data: any): void {
    const { projects, projectTags, tags } = data;
    projects.project.forEach((project: any) => {
      if (project.is_archived) {
        projectTags.projectTags.forEach((proTag: any) => {
          tags.tags.forEach((tag: any) => {
            if (proTag.tagId === tag.id && proTag.projectId === project.id) {
              if (this.tags !== tag.name) {
                this.tags.push(tag.name);
              }
            }
          });
        });
        this.projects.push({
          name: project.name,
          background: project.background,
          industry: project.industry,
          year: project.year,
          tags: this.tags,
        });
      }
      this.tags = [];
    });
    this.getOthers();
  }

  getOthers(): void {
    const names: string[] = [
      // 'videos',
      'brochures',
      'apparel',
      'cards',
      'headers',
      'posters',
      'profiles',
      'thumbnails',
      'renders',
    ];
    names.forEach((name) => {
      this.projectService.getImages(name, 'archive').subscribe({
        next: (files: string[]) => {
          const filePaths = files.map(
            (file) => `${environment.baseUrl}/archive/${name}/${file}`
          );
          this.allImages.push(...filePaths);
        },
      });
      this.projectService.getImages(name, 'archive').subscribe({
        next: (files: string[]) => {
          const filePath = files.map(
            (file) => `${environment.baseUrl}/archive/${name}/${file}`
          );
          this.others.push({
            name: name,
            files: filePath,
          });
        },
      });
    });
  }

  selectedTag: any = 'all';
  filteredProjects!: any[];
  filter(tagName: any): void {
    this.selectedTag = tagName;

    setTimeout(() => {
      window.scrollTo({
        top: 1900,
        behavior: 'smooth',
      });
    }, 200);

    if (tagName === 'all') {
      this.filteredProjects = this.others;
    } else {
      this.filteredProjects = this.others.filter((project) =>
        project.name.includes(tagName)
      );
    }
    this.animateContainer();
  }

  animateContainer(): void {
    const container = document.querySelector(
      '.sec-container .others .media-container'
    ) as HTMLElement;
    anime({
      targets: container,
      opacity: [0, 1],
      translateY: ['80px', '0px'],
      duration: 1100,
      easing: 'cubicBezier(.39,0,.16,1.01)',
    });
  }

  isImage(image: any): boolean {
    return (
      image.toLowerCase().endsWith('.png') ||
      image.toLowerCase().endsWith('.jpg')
    );
  }

  createLink(projectName: string): string {
    return (
      '/archive/' +
      projectName
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
    );
  }
}
