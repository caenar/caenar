import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgIconsModule } from '@ng-icons/core';
import { ionArrowForward, ionArrowUp } from '@ng-icons/ionicons';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/partials/header/header.component';
import { FooterComponent } from './components/partials/footer/footer.component';
import { HomeComponent } from './components/pages/home/home.component';
import { WorkComponent } from './components/pages/work/work.component';
import { AboutComponent } from './components/pages/about/about.component';
import { AdminComponent } from './components/pages/admin/admin.component';
import { ContactComponent } from './components/pages/contact/contact.component';
import { PopupComponent } from './shared/constants/popup/popup.component';
import { LoginComponent } from './shared/constants/login/login.component';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { authGuard } from './shared/guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    PopupComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    WorkComponent,
    AboutComponent,
    ContactComponent,
    AdminComponent,
    LoginComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgIconsModule.withIcons({
      ionArrowForward,
      ionArrowUp,
    }),
  ],
  providers: [
    authGuard,
    { provide: 'authGuard', useClass: authGuard },
    { provide: 'CanActivate', useExisting: 'authGuard' },
    { provide: HTTP_INTERCEPTORS, useClass: authInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
