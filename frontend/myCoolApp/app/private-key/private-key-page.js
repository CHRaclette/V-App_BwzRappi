import { Application, Frame } from '@nativescript/core'

import { PrivateKeyViewModel } from './private-key-view-model'

export function onNavigatingTo(args) {
  const page = args.object
  page.bindingContext = new PrivateKeyViewModel()
}

export function onDrawerButtonTap(args) {
  const sideDrawer = Application.getRootView()
  if (sideDrawer && typeof sideDrawer.showDrawer === 'function') {
    sideDrawer.showDrawer()
  }
}

export function onSearchTap(args) {
  args.object.page.bindingContext.fetchByPrivateKey()
}

export function onDeleteTap(args) {
  args.object.page.bindingContext.deleteCurrentReservation()
}

export function onEditTap(args) {
  const viewModel = args.object.page.bindingContext
  const queued = viewModel.queueEditCurrentReservation()
  if (!queued) {
    return
  }

  Frame.topmost().navigate('dashboard/dashboard-page')
}

