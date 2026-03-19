import { Dialogs, fromObject } from '@nativescript/core'

import { SelectedPageService } from '../shared/selected-page-service'
import { request } from '../shared/api-service'
import { mapReservationToCard } from '../shared/reservation-utils'
import { setPendingEditReservation } from '../shared/session-service'

export function PrivateKeyViewModel() {
  SelectedPageService.getInstance().updateSelectedPage('Private Key')

  const viewModel = fromObject({
    privateKey: '',
    reservation: null,
    resultTitle: 'No reservation loaded',
    hasReservation: false,
  })

  viewModel.fetchByPrivateKey = async function () {
    if (!viewModel.privateKey) {
      Dialogs.alert('Please enter a private key.')
      return
    }

    const response = await request('/reservations/prvKey', {
      query: { privateKey: viewModel.privateKey },
    })

    if (!response.ok || !response.data) {
      viewModel.set('reservation', null)
      viewModel.set('hasReservation', false)
      viewModel.set('resultTitle', 'No reservation loaded')
      Dialogs.alert('Invalid private key. Please try again.')
      return
    }

    const mapped = mapReservationToCard(response.data)
    viewModel.set('reservation', mapped)
    viewModel.set('resultTitle', mapped.roomName)
    viewModel.set('hasReservation', true)
  }

  viewModel.deleteCurrentReservation = async function () {
    if (!viewModel.reservation) {
      return
    }

    const confirmed = await Dialogs.confirm('Delete this reservation?')
    if (!confirmed) {
      return
    }

    const response = await request('/reservations', {
      method: 'DELETE',
      query: { privateKey: viewModel.reservation.privateKey },
    })

    if (!response.ok) {
      Dialogs.alert('Failed to delete reservation.')
      return
    }

    Dialogs.alert('Reservation deleted.')
    viewModel.set('reservation', null)
    viewModel.set('resultTitle', 'No reservation loaded')
    viewModel.set('privateKey', '')
    viewModel.set('hasReservation', false)
  }

  viewModel.queueEditCurrentReservation = function () {
    if (!viewModel.reservation) {
      return false
    }

    setPendingEditReservation(viewModel.reservation)
    return true
  }

  return viewModel
}

