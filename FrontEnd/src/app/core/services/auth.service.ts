import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, of, tap } from 'rxjs';
import { LoginCredentials, User } from '../models/user.model';

const STORAGE_KEY = 'ford_dashboard_auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:3000/users';

  // Credenciais fixas exigidas pela regra de negócio do desafio.
  private readonly VALID_USERNAME = 'admin';
  private readonly VALID_PASSWORD = '123456';

  // BehaviorSubject mantém o estado de autenticação reativo em toda a aplicação.
  private readonly loggedInSubject = new BehaviorSubject<boolean>(this.hasSession());
  readonly isLoggedIn$ = this.loggedInSubject.asObservable();

  private currentUser: Pick<User, 'username' | 'name'> | null = this.getStoredUser();

  constructor(private http: HttpClient) {}

  /**
   * Realiza a tentativa de login.
   * Regra do desafio: a validação consulta o back-end (GET /users) para simular
   * uma busca real de credenciais, mas o acesso só é liberado quando o usuário
   * e a senha digitados forem exatamente admin / 123456.
   *
   * Operadores RxJS usados: map, tap, catchError.
   */
  login(credentials: LoginCredentials): Observable<boolean> {
    const isHardcodedValid =
      credentials.username === this.VALID_USERNAME &&
      credentials.password === this.VALID_PASSWORD;

    return this.http.get<User[]>(this.apiUrl).pipe(
      map((users) => {
        // Mesmo consultando o back-end, a regra de negócio exige que o acesso
        // só seja concedido com as credenciais fixas do desafio.
        const backendUserExists = users?.some(
          (u) => u.username === credentials.username
        );
        return isHardcodedValid && (backendUserExists || users?.length === 0 || !!users);
      }),
      // Caso o back-end esteja fora do ar, ainda permitimos o acesso fixo,
      // para que o front-end não fique bloqueado por uma falha de integração.
      catchError(() => of(isHardcodedValid)),
      tap((success) => {
        if (success) {
          this.setSession(credentials.username);
        }
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

  getCurrentUser(): Pick<User, 'username' | 'name'> | null {
    return this.currentUser;
  }

  private setSession(username: string): void {
    const user = { username, name: 'Administrador' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUser = user;
    this.loggedInSubject.next(true);
  }

  private hasSession(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  }

  private getStoredUser(): Pick<User, 'username' | 'name'> | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
