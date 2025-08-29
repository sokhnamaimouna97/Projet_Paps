import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import LoginComponent from './auth/components/login/login.component';
import { authGuard } from './auth/guard/auth.guard';
import { HomeComponent } from 'src/home/home.component';
import RegisterComponent from './auth/components/register/register.component';


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
   {
    path: 'register',
    component: RegisterComponent
  },
{
    path: 'commercant',
    // ✅ Use loadComponent for standalone components, not loadChildren
    loadComponent: () => import('./commercant/dashboard/dashboard.component')
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard] // ou [AuthGuard] si c’est une classe
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
