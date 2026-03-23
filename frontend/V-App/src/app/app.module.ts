import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptFormsModule, NativeScriptModule } from '@nativescript/angular'
import { NativeScriptUISideDrawerModule } from 'nativescript-ui-sidedrawer/angular'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { LoginComponent } from './pages/login/login.component'
import { PrivateKeyComponent } from './pages/private-key/private-key.component'
import { PublicKeyComponent } from './pages/public-key/public-key.component'
import { SignupComponent } from './pages/signup/signup.component'

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    NativeScriptModule,
    NativeScriptFormsModule,
    NativeScriptUISideDrawerModule,
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    PublicKeyComponent,
    PrivateKeyComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
