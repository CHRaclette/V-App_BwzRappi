import { Component } from '@angular/core'
import { RouterExtensions } from '@nativescript/angular'
import { Application } from '@nativescript/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'

import { ApiService } from '~/app/shared/api.service'
import { SessionService } from '~/app/shared/session.service'

@Component({
  selector: 'ns-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  username = ''
  password = ''
  confirmPassword = ''
  error = ''

  constructor(
    private readonly apiService: ApiService,
    private readonly sessionService: SessionService,
    private readonly routerExtensions: RouterExtensions,
  ) {}

  onDrawerButtonTap(): void {
    const sideDrawer = Application.getRootView() as RadSideDrawer
    if (sideDrawer && typeof sideDrawer.showDrawer === 'function') {
      sideDrawer.showDrawer()
    }
  }

  async onSignupTap(): Promise<void> {
    const normalizedUsername = (this.username || '').trim()
    const normalizedPassword = (this.password || '').trim()
    const normalizedConfirm = (this.confirmPassword || '').trim()

    this.username = normalizedUsername
    this.password = normalizedPassword
    this.confirmPassword = normalizedConfirm

    if (!normalizedUsername || !normalizedPassword || !normalizedConfirm) {
      this.error = 'All fields are required.'
      return
    }

    if (normalizedPassword !== normalizedConfirm) {
      this.error = 'Passwords do not match.'
      return
    }

    const response = await this.apiService.request('/signup', {
      method: 'POST',
      formBody: {
        username: normalizedUsername,
        password: normalizedPassword,
      },
    })

    if (!response.ok || !response.data) {
      this.error = 'Sign up failed. Please try another username.'
      return
    }

    this.sessionService.setUser(response.data)
    this.sessionService.clearPublicKeys()
    this.error = ''
    this.routerExtensions.navigate(['/dashboard'], { clearHistory: true })
  }

  onGoToLoginTap(): void {
    this.routerExtensions.navigate(['/login'])
  }
}
