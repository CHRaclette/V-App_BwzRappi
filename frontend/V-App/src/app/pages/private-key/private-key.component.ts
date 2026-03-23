import { Component } from '@angular/core'
import { RouterExtensions } from '@nativescript/angular'
import { Application, Dialogs } from '@nativescript/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'

import { ApiService } from '~/app/shared/api.service'
import { mapReservationToCard } from '~/app/shared/reservation-utils'
import { SessionService } from '~/app/shared/session.service'

@Component({
  selector: 'ns-private-key',
  templateUrl: './private-key.component.html',
})
export class PrivateKeyComponent {
  privateKey = ''
  reservation: any = null
  resultTitle = 'No reservation loaded'
  hasReservation = false

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

  async onSearchTap(): Promise<void> {
    if (!this.privateKey) {
      await Dialogs.alert('Please enter a private key.')
      return
    }

    const response = await this.apiService.request('/reservations/prvKey', {
      query: { privateKey: this.privateKey },
    })

    if (!response.ok || !response.data) {
      this.reservation = null
      this.hasReservation = false
      this.resultTitle = 'No reservation loaded'
      await Dialogs.alert('Invalid private key. Please try again.')
      return
    }

    const mapped = mapReservationToCard(response.data)
    this.reservation = mapped
    this.resultTitle = mapped.roomName
    this.hasReservation = true
  }

  async onDeleteTap(): Promise<void> {
    if (!this.reservation) {
      return
    }

    const confirmed = await Dialogs.confirm('Delete this reservation?')
    if (!confirmed) {
      return
    }

    const response = await this.apiService.request('/reservations', {
      method: 'DELETE',
      query: { privateKey: this.reservation.privateKey },
    })

    if (!response.ok) {
      await Dialogs.alert('Failed to delete reservation.')
      return
    }

    await Dialogs.alert('Reservation deleted.')
    this.reservation = null
    this.resultTitle = 'No reservation loaded'
    this.privateKey = ''
    this.hasReservation = false
  }

  onEditTap(): void {
    if (!this.reservation) {
      return
    }

    this.sessionService.setPendingEditReservation(this.reservation)
    this.routerExtensions.navigate(['/dashboard'])
  }
}
