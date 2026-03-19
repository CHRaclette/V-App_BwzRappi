import { Application } from '@nativescript/core'

import { PublicKeyViewModel } from './public-key-view-model'

export function onNavigatingTo(args) {
  const page = args.object
  const viewModel = new PublicKeyViewModel()
  page.bindingContext = viewModel
  viewModel.loadUserPublicKeys()
}

export function onDrawerButtonTap(args) {
  const sideDrawer = Application.getRootView()
  if (sideDrawer && typeof sideDrawer.showDrawer === 'function') {
    sideDrawer.showDrawer()
  }
}

export function onSearchTap(args) {
  args.object.page.bindingContext.fetchByPublicKey()
}

export function onUsedKeyTap(args) {
  args.object.page.bindingContext.selectUsedPublicKey(args.index)
}
