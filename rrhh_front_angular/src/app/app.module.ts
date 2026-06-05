import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

registerLocaleData(localeEs);

import { SharedModule } from './_metronic/shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './_metronic/layout/layout/layout.component';
import { HeaderComponent } from './_metronic/layout/components/header/header.component';
import { SidebarComponent } from './_metronic/layout/components/sidebar/sidebar.component';
import { FooterComponent } from './_metronic/layout/components/footer/footer.component';
import { ToolbarComponent } from './_metronic/layout/components/toolbar/toolbar.component';
import { AuthInterceptor } from './_metronic/shared/interceptors/auth.interceptor';
import { ErrorInterceptor } from './_metronic/shared/interceptors/error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    ToolbarComponent,
  ],
  imports: [BrowserModule, HttpClientModule, SharedModule, AppRoutingModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
