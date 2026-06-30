import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { ApiErrorResponse, LoginApiPayload, LoginApiResponse, LoginCredentials } from '../models/user.model';

const STORAGE_KEY = 'ford_dashboard_auth';

export interface LoginResult {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // API real do desafio: https://github.com/JMarcelloDias/Api-Sprint7
  private readonly apiUrl = 'http://localhost:3001/login';

  private readonly loggedInSubject = new BehaviorSubject<boolean>(this.hasSession());
  readonly isLoggedIn$ = this.loggedInSubject.asObservable();

  private currentUser: LoginApiResponse | null = this.getStoredUser();

  constructor(private http: HttpClient) {}

  /**
   * Autentica o usuário consultando POST /login.
   * A API valida nome/senha no back-end (admin / 123456) e retorna:
   *  - 200 com { id, nome, email } em caso de sucesso
   *  - 400/401 com { message } em caso de falha
   *
   * Operadores RxJS usados: map, catchError.
   */
  login(credentials: LoginCredentials): Observable<LoginResult> {
    const payload: LoginApiPayload = {
      nome: credentials.username,
      senha: credentials.password
    };

    return this.http.post<LoginApiResponse>(this.apiUrl, payload).pipe(
      map((user) => {
        this.setSession(user);
        return { success: true, message: 'Login realizado com sucesso.' };
      }),
      catchError((error: HttpErrorResponse) => {
        const apiMessage = (error.error as ApiErrorResponse)?.message;
        const message = apiMessage
          ?? 'Não foi possível conectar à API em http://localhost:3001. Verifique se ela está rodando.';
        return of({ success: false, message });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser = null;
    this.loggedInSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.loggedInSubject.value;
  }

  getCurrentUser(): LoginApiResponse | null {
    return this.currentUser;
  }

  private setSession(user: LoginApiResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUser = user;
    this.loggedInSubject.next(true);
  }

  private hasSession(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  }

  private getStoredUser(): LoginApiResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
