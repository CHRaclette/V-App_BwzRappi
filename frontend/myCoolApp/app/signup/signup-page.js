import { Application, Frame } from '@nativescript/core'

import { SignupViewModel } from './signup-view-model'

export function onNavigatingTo(args) {
  const page = args.object
  page.bindingContext = new SignupViewModel()
}

export function onDrawerButtonTap(args) {
  const sideDrawer = Application.getRootView()
  if (sideDrawer && typeof sideDrawer.showDrawer === 'function') {
    sideDrawer.showDrawer()
  }
}

export async function onSignupTap(args) {
  const page = args.object.page
  const success = await page.bindingContext.signup()
  if (success) {
    Frame.topmost().navigate({
      moduleName: 'dashboard/dashboard-page',
      clearHistory: true,
    })
  }
}

export function onGoToLoginTap() {
  Frame.topmost().navigate('login/login-page')
}
