import { Frame, Application } from '@nativescript/core';

import { AppRootViewModel } from './app-root-view-model'
import { clearSession, getUser } from '../shared/session-service'

export function onLoaded(args) {
  const drawerComponent = args.object
  const viewModel = new AppRootViewModel()
  drawerComponent.bindingContext = viewModel
  viewModel.refreshUser()

  // Ensure the main frame always has an initial page on startup.
  const mainFrame = drawerComponent.getViewById('mainFrame')
  if (mainFrame && !mainFrame.currentPage) {
    mainFrame.navigate({ moduleName: 'login/login-page', clearHistory: true })
  }
}

export function onNavigationItemTap(args) {
  const component = args.object
  const componentRoute = component.route
  const componentTitle = component.title
  const bindingContext = component.bindingContext

  bindingContext.set('selectedPage', componentTitle)

  if (componentTitle === 'Dashboard' && !getUser()) {
    Frame.topmost().navigate({
      moduleName: 'login/login-page',
      transition: {
        name: 'fade',
      },
      clearHistory: true,
    })
  } else {
    Frame.topmost().navigate({
      moduleName: componentRoute,
      transition: {
        name: 'fade',
      },
    })
  }

  const drawerComponent = Application.getRootView()
  bindingContext.refreshUser()
  drawerComponent.closeDrawer()
}

export function onLogoutTap(args) {
  clearSession()

  const drawerComponent = Application.getRootView()
  const bindingContext = drawerComponent.bindingContext
  bindingContext.set('selectedPage', 'Login')
  bindingContext.refreshUser()

  Frame.topmost().navigate({
    moduleName: 'login/login-page',
    transition: {
      name: 'fade',
    },
    clearHistory: true,
  })

  drawerComponent.closeDrawer()
}

