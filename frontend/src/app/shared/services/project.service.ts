import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = environment.apiUrl;
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getImages(name: any, folder: any): Observable<any[]> {
    const url = `${this.baseUrl}/api/images/${folder}/${name}`;
    return this.http.get<any[]>(url);
  }

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getProjectTags(): Observable<any[]> {
    const url = `${this.apiUrl}/project_tags`;
    return this.http.get<any[]>(url);
  }
  getTags(): Observable<any[]> {
    const url = `${this.apiUrl}/tags`;
    return this.http.get<any[]>(url);
  }

  createProject(projectData: any): Observable<any[]> {
    return this.http.post<any[]>(this.apiUrl, projectData);
  }

  updateProject(projectId: number, projectData: any): Observable<any> {
    const url = `${this.apiUrl}/${projectId}`;
    return this.http.put<any>(url, projectData);
  }

  deleteProject(projectId: number): Observable<any> {
    const url = `${this.apiUrl}/${projectId}`;
    return this.http.delete<any>(url);
  }

  deleteProjectTags(projectId: number): Observable<any> {
    const url = `${this.apiUrl}/${projectId}`;
    return this.http.delete<any>(url);
  }

  deleteTags(projectId: number): Observable<any> {
    const url = `${this.apiUrl}/${projectId}`;
    return this.http.delete<any>(url);
  }
}
