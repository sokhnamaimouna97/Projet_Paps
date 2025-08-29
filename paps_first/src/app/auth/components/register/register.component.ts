import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { RegisterRequest } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required, Validators.pattern(/^(\+221|0)?[0-9]{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      nom_boutique: ['', [Validators.required, Validators.minLength(3)]],
      adress: ['', [Validators.required, Validators.minLength(10)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Vérifie si les mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // Vérifie si un champ est invalide
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Message d’erreur par champ
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return 'Ce champ est requis';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength']['requiredLength'];
        return `Minimum ${requiredLength} caractères`;
      }
      if (field.errors['email']) {
        return 'Email invalide';
      }
      if (field.errors['pattern'] && fieldName === 'telephone') {
        return 'Numéro de téléphone invalide (ex: +221777123456)';
      }
      if (field.errors['passwordMismatch']) {
        return 'Les mots de passe ne correspondent pas';
      }
    }
    return '';
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      const registerData: RegisterRequest = {
        prenom: this.registerForm.value.prenom,
        nom: this.registerForm.value.nom,
        telephone: this.registerForm.value.telephone,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        nom_boutique: this.registerForm.value.nom_boutique,
        adress: this.registerForm.value.adress
      };

      this.authService.registerCommercant(registerData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.success = 'Inscription réussie ! Vous avez 30 jours gratuits.';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;
          if (error.status === 409) {
            this.error = 'Cet email est déjà utilisé. Essayez de vous connecter.';
          } else {
            this.error = error.error?.message || 'Erreur lors de l\'inscription';
          }
        }
      });
    } else {
      // Marquer tous les champs pour afficher les erreurs
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}

export default RegisterComponent;
