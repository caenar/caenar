import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  baseUrl = `http://localhost:5000/api`;

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post(`${this.baseUrl}/login`, {username, password});
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }

  saveToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }
}
