import { NgModule } from '@angular/core'
import { Routes } from '@angular/router'
import { NativeScriptRouterModule } from '@nativescript/angular'
import { DashboardComponent } from '~/app/pages/dashboard/dashboard.component'
import { LoginComponent } from '~/app/pages/login/login.component'
import { PrivateKeyComponent } from '~/app/pages/private-key/private-key.component'
import { PublicKeyComponent } from '~/app/pages/public-key/public-key.component'
import { SignupComponent } from '~/app/pages/signup/signup.component'

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'public-key', component: PublicKeyComponent },
  { path: 'private-key', component: PrivateKeyComponent },
]

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
