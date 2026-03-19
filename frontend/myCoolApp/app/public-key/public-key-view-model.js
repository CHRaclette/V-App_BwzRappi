import { Dialogs, ObservableArray, fromObject } from '@nativescript/core'

import { SelectedPageService } from '../shared/selected-page-service'
import { request } from '../shared/api-service'
import { getPublicKeys, getUser, setPublicKeys } from '../shared/session-service'
import { mapReservationToCard } from '../shared/reservation-utils'

export function PublicKeyViewModel() {
  SelectedPageService.getInstance().updateSelectedPage('Public Key')

  const viewModel = fromObject({
    publicKey: '',
    usedPublicKeys: new ObservableArray(getPublicKeys()),
    resultTitle: 'No reservation loaded',
    reservation: null,
    hasReservation: false,
  })

  viewModel.loadUserPublicKeys = async function () {
    const user = getUser()
    if (!user || !user.id) {
      return
    }

    const response = await request('/publicKeys', {
      query: { userId: user.id },
    })

    if (!response.ok || !Array.isArray(response.data)) {
      return
    }

    setPublicKeys(response.data)
    viewModel.usedPublicKeys.splice(0)
    response.data.forEach((key) => viewModel.usedPublicKeys.push(key))
  }

  viewModel.addPublicKeyToUser = async function (publicKey) {
    const user = getUser()
    if (!user || !user.id) {
      return
    }

    const response = await request('/addPublicKey', {
      method: 'PATCH',
      body: {
        userId: user.id,
        publicKey,
      },
    })

    if (!response.ok) {
      return
    }

    await viewModel.loadUserPublicKeys()
  }

  viewModel.fetchByPublicKey = async function () {
    if (!viewModel.publicKey) {
      Dialogs.alert('Please enter a public key.')
      return
    }

    const response = await request('/reservations/pubKey', {
      query: { publicKey: viewModel.publicKey },
    })

    if (!response.ok || !response.data) {
      viewModel.set('reservation', null)
      viewModel.set('hasReservation', false)
      viewModel.set('resultTitle', 'No reservation loaded')
      Dialogs.alert('Invalid public key. Please try again.')
      return
    }

    const mapped = mapReservationToCard(response.data)
    viewModel.set('reservation', mapped)
    viewModel.set('resultTitle', mapped.roomName)
    viewModel.set('hasReservation', true)

    if (viewModel.usedPublicKeys.indexOf(viewModel.publicKey) === -1) {
      await viewModel.addPublicKeyToUser(viewModel.publicKey)
    }
  }

  viewModel.selectUsedPublicKey = function (index) {
    const key = viewModel.usedPublicKeys.getItem(index)
    if (!key) {
      return
    }

    viewModel.set('publicKey', key)
    viewModel.fetchByPublicKey()
  }

  return viewModel
}
