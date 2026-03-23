import { Component, OnInit } from '@angular/core'
import { Application, Dialogs } from '@nativescript/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'

import { ApiService } from '~/app/shared/api.service'
import { mapReservationToCard } from '~/app/shared/reservation-utils'
import { SessionService } from '~/app/shared/session.service'

@Component({
  selector: 'ns-public-key',
  templateUrl: './public-key.component.html',
})
export class PublicKeyComponent implements OnInit {
  publicKey = ''
  usedPublicKeys: string[] = []
  resultTitle = 'No reservation loaded'
  reservation: any = null
  hasReservation = false

  constructor(
    private readonly apiService: ApiService,
    private readonly sessionService: SessionService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.usedPublicKeys = this.sessionService.getPublicKeys()
    await this.loadUserPublicKeys()
  }

  onDrawerButtonTap(): void {
    const sideDrawer = Application.getRootView() as RadSideDrawer
    if (sideDrawer && typeof sideDrawer.showDrawer === 'function') {
      sideDrawer.showDrawer()
    }
  }

  async loadUserPublicKeys(): Promise<void> {
    const user = this.sessionService.getUser<{ id?: string | number } | null>()
    if (!user || !user.id) {
      return
    }

    const response = await this.apiService.request<string[]>('/publicKeys', {
      query: { userId: user.id },
    })

    if (!response.ok || !Array.isArray(response.data)) {
      return
    }

    this.sessionService.setPublicKeys(response.data)
    this.usedPublicKeys = [...response.data]
  }

  async addPublicKeyToUser(publicKey: string): Promise<void> {
    const user = this.sessionService.getUser<{ id?: string | number } | null>()
    if (!user || !user.id) {
      return
    }

    const response = await this.apiService.request('/addPublicKey', {
      method: 'PATCH',
      body: {
        userId: user.id,
        publicKey,
      },
    })

    if (!response.ok) {
      return
    }

    await this.loadUserPublicKeys()
  }

  async onSearchTap(): Promise<void> {
    if (!this.publicKey) {
      await Dialogs.alert('Please enter a public key.')
      return
    }

    const response = await this.apiService.request('/reservations/pubKey', {
      query: { publicKey: this.publicKey },
    })

    if (!response.ok || !response.data) {
      this.reservation = null
      this.hasReservation = false
      this.resultTitle = 'No reservation loaded'
      await Dialogs.alert('Invalid public key. Please try again.')
      return
    }

    const mapped = mapReservationToCard(response.data)
    this.reservation = mapped
    this.resultTitle = mapped.roomName
    this.hasReservation = true

    if (!this.usedPublicKeys.includes(this.publicKey)) {
      await this.addPublicKeyToUser(this.publicKey)
    }
  }

  async onUsedKeyTap(args: any): Promise<void> {
    const key = this.usedPublicKeys[args.index]
    if (!key) {
      return
    }

    this.publicKey = key
    await this.onSearchTap()
  }
}
