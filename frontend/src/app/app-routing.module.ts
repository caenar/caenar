import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { WorkComponent } from './components/pages/work/work.component';
import { routeGuard } from './shared/services/route-guard.service';
import { AnimationResolver } from './shared/services/animation-resolver.service';
import { AboutComponent } from './components/pages/about/about.component';
import { ContactComponent } from './components/pages/contact/contact.component';

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
