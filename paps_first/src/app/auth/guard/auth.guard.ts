import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../components/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    console.log('Utilisateur connecté ✅');
    return true;
  } else {
    console.log('Utilisateur non connecté ❌ → redirection vers login');
    router.navigate(['/login']);
    return false;
  }
};
