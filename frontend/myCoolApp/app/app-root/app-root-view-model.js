import { fromObject } from '@nativescript/core'

import { SelectedPageService } from '../shared/selected-page-service'
import { getUser } from '../shared/session-service'

export function AppRootViewModel() {
  const viewModel = fromObject({
    selectedPage: '',
    userName: 'Guest',
    userFootnote: 'Not logged in',
    authenticated: false,
  })

  SelectedPageService.getInstance().selectedPage$.subscribe((selectedPage) => {
    viewModel.selectedPage = selectedPage
  })

  viewModel.refreshUser = function () {
    const user = getUser()
    const authenticated = Boolean(user && user.name)
    viewModel.set('authenticated', authenticated)
    viewModel.set('userName', authenticated ? user.name : 'Guest')
    viewModel.set('userFootnote', authenticated ? 'Logged in' : 'Not logged in')
  }

  viewModel.refreshUser()

  return viewModel
}
