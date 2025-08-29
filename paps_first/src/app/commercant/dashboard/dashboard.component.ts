import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, UserRole } from '../../auth/components/models/auth.model';
import { AuthService } from '../../auth/components/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe((user: User | null) => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Check if user has specific role
  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: UserRole[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  // Check if user is commercant
  isCommercant(): boolean {
    return this.hasRole('commercant');
  }

  // Check if user is livreur
  isLivreur(): boolean {
    return this.hasRole('livreur');
  }

  // Check if user is super admin
  isSuperAdmin(): boolean {
    return this.hasRole('superAdmin');
  }

  // Get user display name
  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.prenom} ${this.currentUser.nom}`;
    }
    return this.authService.getUserFullName();
  }

  // Logout function
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

export default DashboardComponent;