import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  RegisterRequest, 
  User, 
  UserRole, 
  AuthResponse,
  LoginRequest 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api'; // ⚡ adapte avec ton backend
  
  // BehaviorSubject pour gérer l'état de l'utilisateur connecté
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Charger l'utilisateur depuis localStorage au démarrage
    this.loadUserFromStorage();
  }

  /**
   * Charger l'utilisateur depuis localStorage
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (token && userString) {
      try {
        const user: User = JSON.parse(userString);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        this.clearStorage();
      }
    }
  }

  /**
   * Sauvegarder les données d'authentification
   */
  private saveAuthData(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Nettoyer le storage
   */
  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * Inscription d'un commerçant
   */
  registerCommercant(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  /**
   * Connexion
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signin`, { email, password })
      .pipe(
        tap((response: any) => {
          if (response && response.user && response.token) {
            this.saveAuthData(response.user, response.token);
          }
        }),
        catchError(error => {
          console.error('Erreur de connexion:', error);
          throw error;
        })
      );
  }

  /**
   * Alternative login avec objet LoginRequest
   */
  loginWithCredentials(credentials: LoginRequest): Observable<any> {
    return this.login(credentials.email, credentials.password);
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') && !!this.currentUserSubject.value;
  }

  /**
   * Alias pour isLoggedIn (pour compatibilité)
   */
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtenir le token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserRole): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === role;
  }

  /**
   * Vérifier si l'utilisateur a l'un des rôles spécifiés
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return false;
    }
    return roles.includes(currentUser.role);
  }

  /**
   * Vérifier si l'utilisateur est un commerçant
   */
  isCommercant(): boolean {
    return this.hasRole('commercant');
  }

  /**
   * Vérifier si l'utilisateur est un livreur
   */
  isLivreur(): boolean {
    return this.hasRole('livreur');
  }

  /**
   * Vérifier si l'utilisateur est un super admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('superAdmin');
  }

  /**
   * Mettre à jour les informations de l'utilisateur
   */
  updateCurrentUser(user: User): void {
    const token = this.getToken();
    if (token) {
      this.saveAuthData(user, token);
    }
  }

  /**
   * Obtenir le nom complet de l'utilisateur
   */
  getUserFullName(): string {
    const user = this.currentUserSubject.value;
    if (user) {
      return `${user.prenom} ${user.nom}`;
    }
    return '';
  }

  /**
   * Obtenir les informations de l'utilisateur depuis le serveur
   */
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      tap(user => {
        if (user) {
          this.updateCurrentUser(user);
        }
      })
    );
  }

  /**
   * Rafraîchir le token (si votre API le supporte)
   */
  refreshToken(): Observable<any> {
    const currentToken = this.getToken();
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {}, {
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }
}