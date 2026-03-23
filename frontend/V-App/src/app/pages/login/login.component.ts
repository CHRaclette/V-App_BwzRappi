import { Component, OnInit } from '@angular/core'
import { RouterExtensions } from '@nativescript/angular'
import { Application, Dialogs } from '@nativescript/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'

import { ApiService } from '~/app/shared/api.service'
import { SessionService } from '~/app/shared/session.service'

@Component({
  selector: 'ns-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  username = ''
  password = ''
  error = ''

  constructor(
    private readonly apiService: ApiService,
    private readonly sessionService: SessionService,
    private readonly routerExtensions: RouterExtensions,
  ) {}

  ngOnInit(): void {
    const user = this.sessionService.getUser<{ id?: string | number } | null>()
    if (user && user.id) {
      this.routerExtensions.navigate(['/dashboard'], { clearHistory: true })
    }
  }

  onDrawerButtonTap(): void {
    const sideDrawer = Application.getRootView() as RadSideDrawer
    if (sideDrawer && typeof sideDrawer.showDrawer === 'function') {
      sideDrawer.showDrawer()
    }
  }

  async onLoginTap(): Promise<void> {
    const normalizedUsername = (this.username || '').trim()
    const normalizedPassword = (this.password || '').trim()

    this.username = normalizedUsername
    this.password = normalizedPassword

    if (!normalizedUsername || !normalizedPassword) {
      this.error = 'Username and password are required.'
      await Dialogs.alert(this.error)
      return
    }

    const response = await this.apiService.request('/login', {
      method: 'POST',
      formBody: {
        username: normalizedUsername,
        password: normalizedPassword,
      },
    })

    if (!response.ok || !response.data) {
      let errorMessage = 'Login failed. Please check your credentials and backend connection.'

      if (response.status === 401 || response.status === 403 || response.status === 500) {
        errorMessage = 'Wrong username or password.'
      } else if (response.status === 0) {
        errorMessage =
          'Cannot reach backend. If you use Android emulator, keep backend on and use host access.'
      }

      this.error = errorMessage
      await Dialogs.alert(errorMessage)
      return
    }

    this.sessionService.setUser(response.data)
    this.sessionService.clearPublicKeys()
    this.error = ''
    await Dialogs.alert('Login successful.')
    this.routerExtensions.navigate(['/dashboard'], { clearHistory: true })
  }

  onGoToSignupTap(): void {
    this.routerExtensions.navigate(['/signup'])
  }
}
