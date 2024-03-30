import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticateService } from './shared/services/authenticate.service';
import { routeGuard } from './shared/services/route-guard.service';
import { AnimationResolver } from './shared/services/animation-resolver.service';

import { HomeComponent } from './components/pages/home/home.component';
import { WorkComponent } from './components/pages/work/work.component';
import { AboutComponent } from './components/pages/about/about.component';
import { ContactComponent } from './components/pages/contact/contact.component';
import { AdminComponent } from './components/pages/admin/admin.component';
import { LoginComponent } from './shared/constants/login/login.component';
import { authGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [routeGuard],
    resolve: { animation: AnimationResolver },
  },
  { path: 'work', component: WorkComponent, canActivate: [routeGuard] },
  { path: 'about', component: AboutComponent, canActivate: [routeGuard] },
  { path: 'contact', component: ContactComponent, canActivate: [routeGuard] },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [routeGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, routeGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
