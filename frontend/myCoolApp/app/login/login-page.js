import { Application, Frame } from '@nativescript/core'

import { LoginViewModel } from './login-view-model'
import { getUser } from '../shared/session-service'

export function onNavigatingTo(args) {
  const page = args.object
  const user = getUser()
  if (user && user.id) {
    Frame.topmost().navigate({
      moduleName: 'dashboard/dashboard-page',
      clearHistory: true,
    })
    return
  }
  page.bindingContext = new LoginViewModel()
}

export function onDrawerButtonTap(args) {
  const sideDrawer = Application.getRootView()
  if (sideDrawer && typeof sideDrawer.showDrawer === 'function') {
    sideDrawer.showDrawer()
  }
}

export async function onLoginTap(args) {
  const page = args.object.page
  if (!page.bindingContext || typeof page.bindingContext.login !== 'function') {
    page.bindingContext = new LoginViewModel()
  }

  const success = await page.bindingContext.login()
  if (success) {
    Frame.topmost().navigate({
      moduleName: 'dashboard/dashboard-page',
      clearHistory: true,
    })
  }
}

export function onGoToSignupTap() {
  Frame.topmost().navigate('signup/signup-page')
}

