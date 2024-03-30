import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:5000/api'; 

  constructor(private http: HttpClient) { }

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

  createProject(ProjectData: any): Observable<any[]> {
    return this.http.post<any[]>(this.apiUrl, ProjectData);
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
