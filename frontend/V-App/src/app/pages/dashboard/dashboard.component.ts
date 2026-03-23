import { Component, OnInit } from '@angular/core'
import { RouterExtensions } from '@nativescript/angular'
import { action, Application, Dialogs } from '@nativescript/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'

import { ApiService } from '~/app/shared/api.service'
import { mapReservationToCard, participantsToApiValue } from '~/app/shared/reservation-utils'
import { SessionService } from '~/app/shared/session.service'

function isValidTimeFormat(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(value)
}

@Component({
  selector: 'ns-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  reservationCountText = 'You Have No Reservations'
  reservations: any[] = []
  rooms: string[] = []

  editedDate = ''
  editedStartTime = ''
  editedEndTime = ''
  editedLocation = ''
  editedComment = ''
  editedParticipants = ''

  roomIsAvailable = false
  availabilityText = 'Availability not checked'
  availabilityClass = 'text-muted'

  isEditMode = false
  isReservationModalVisible = false
  editingPrivateKey = ''
  loading = false
  isSaving = false

  constructor(
    private readonly apiService: ApiService,
    private readonly sessionService: SessionService,
    private readonly routerExtensions: RouterExtensions,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.ensureAuthenticated()) {
      this.routerExtensions.navigate(['/login'], { clearHistory: true })
      return
    }

    await this.refreshAll()

    const pending = this.sessionService.getPendingEditReservation<any>()
    if (pending && pending.privateKey) {
      this.beginEdit(pending)
      this.sessionService.clearPendingEditReservation()
    }
  }

  onDrawerButtonTap(): void {
    const sideDrawer = Application.getRootView() as RadSideDrawer
    if (sideDrawer && typeof sideDrawer.showDrawer === 'function') {
      sideDrawer.showDrawer()
    }
  }

  ensureAuthenticated(): boolean {
    const user = this.sessionService.getUser<{ id?: string | number } | null>()
    return Boolean(user && user.id)
  }

  async loadRooms(): Promise<void> {
    try {
      const response = await this.apiService.request<any[]>('/rooms')
      if (!response.ok || !Array.isArray(response.data)) {
        throw new Error('Failed to fetch rooms')
      }
      this.rooms = response.data.map((room: any) => room.name).sort()
    } catch (err) {
      console.log('Error loading rooms:', err)
      await Dialogs.alert('Failed to load rooms.')
    }
  }

  async loadReservations(): Promise<void> {
    const user = this.sessionService.getUser<{ id?: string | number } | null>()
    if (!user || !user.id) {
      return
    }

    try {
      const response = await this.apiService.request<any[]>('/reservations', {
        query: { userID: user.id },
      })
      if (!response.ok || !Array.isArray(response.data)) {
        throw new Error('Failed to fetch reservations')
      }

      this.reservations = response.data.map((reservation) => mapReservationToCard(reservation))
      this.reservationCountText = this.reservations.length
        ? `${this.reservations.length} reservations`
        : 'You Have No Reservations'
    } catch (err) {
      console.log('Error loading reservations:', err)
      await Dialogs.alert('Failed to load reservations.')
    }
  }

  openCreateModal(): void {
    this.editedDate = ''
    this.editedStartTime = ''
    this.editedEndTime = ''
    this.editedLocation = ''
    this.editedComment = ''
    this.editedParticipants = ''
    this.isEditMode = false
    this.editingPrivateKey = ''
    this.setAvailabilityState(false, false)
    this.isReservationModalVisible = true
  }

  closeReservationModal(): void {
    this.isReservationModalVisible = false
  }

  beginEdit(reservation: any): void {
    this.editedDate = reservation.date || ''
    this.editedStartTime = reservation.startTime || ''
    this.editedEndTime = reservation.endTime || ''
    this.editedLocation = reservation.roomName || ''
    this.editedComment = reservation.comments || ''
    this.editedParticipants = reservation.participants || ''
    this.editingPrivateKey = reservation.privateKey || ''
    this.isEditMode = true
    this.roomIsAvailable = true
    this.availabilityText = 'Availability checked'
    this.availabilityClass = 'text-success'
    this.isReservationModalVisible = true
  }

  setAvailabilityState(isAvailable: boolean, checked: boolean): void {
    if (!checked) {
      this.roomIsAvailable = false
      this.availabilityText = 'Availability not checked'
      this.availabilityClass = 'text-muted'
      return
    }

    this.roomIsAvailable = Boolean(isAvailable)
    this.availabilityText = isAvailable ? 'Room is available' : 'Room is not available'
    this.availabilityClass = isAvailable ? 'text-success' : 'text-danger'
  }

  async checkRoomAvailability(): Promise<void> {
    const roomName = (this.editedLocation || '').trim()
    const date = (this.editedDate || '').trim()
    const startTime = (this.editedStartTime || '').trim()
    const endTime = (this.editedEndTime || '').trim()

    this.editedLocation = roomName
    this.editedDate = date
    this.editedStartTime = startTime
    this.editedEndTime = endTime

    if (!roomName || !date || !startTime || !endTime) {
      this.setAvailabilityState(false, false)
      await Dialogs.alert('Please provide room, date, start time and end time first.')
      return
    }

    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      this.setAvailabilityState(false, false)
      await Dialogs.alert('Time must be in HH:MM:SS format.')
      return
    }

    if (startTime >= endTime) {
      this.setAvailabilityState(false, false)
      await Dialogs.alert('Start time must be earlier than end time.')
      return
    }

    const response = await this.apiService.request('/rooms/available', {
      method: 'POST',
      body: {
        privateKey: this.editingPrivateKey || '',
        roomName,
        date,
        startTime,
        endTime,
      },
    })

    if (!response.ok) {
      this.setAvailabilityState(false, false)
      await Dialogs.alert('Could not check room availability.')
      return
    }

    const isAvailable = response.data === true || response.data === 'true'
    this.setAvailabilityState(isAvailable, true)
  }

  async saveReservation(): Promise<void> {
    if (this.isSaving) {
      return
    }

    const user = this.sessionService.getUser<{ id?: string | number } | null>()
    if (!user || !user.id) {
      await Dialogs.alert('Please log in again.')
      return
    }

    const roomName = (this.editedLocation || '').trim()
    const date = (this.editedDate || '').trim()
    const startTime = (this.editedStartTime || '').trim()
    const endTime = (this.editedEndTime || '').trim()

    if (!roomName || !date || !startTime || !endTime) {
      await Dialogs.alert('Please fill all required fields.')
      return
    }

    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      await Dialogs.alert('Time must be in HH:MM:SS format.')
      return
    }

    if (startTime >= endTime) {
      await Dialogs.alert('Start time must be earlier than end time.')
      return
    }

    if (!this.roomIsAvailable) {
      await Dialogs.alert('Please check availability before saving.')
      return
    }

    try {
      this.isSaving = true

      const response = await this.apiService.request('/reservations', {
        method: 'PATCH',
        body: {
          privateKey: this.editingPrivateKey || '',
          roomName,
          date,
          startTime,
          endTime,
          comments: this.editedComment || '',
          participants: participantsToApiValue(this.editedParticipants),
          userId: String(user.id),
        },
      })

      if (!response.ok) {
        await Dialogs.alert(
          this.isEditMode ? 'Failed to update reservation.' : 'Failed to create reservation.',
        )
        return
      }

      this.closeReservationModal()
      await this.loadReservations()
      await Dialogs.alert(this.isEditMode ? 'Reservation updated.' : 'Reservation created.')
    } finally {
      this.isSaving = false
    }
  }

  async deleteReservation(privateKey: string): Promise<void> {
    if (!privateKey) {
      await Dialogs.alert('Missing reservation key.')
      return
    }

    const confirmed = await Dialogs.confirm('Delete this reservation?')
    if (!confirmed) {
      return
    }

    const response = await this.apiService.request('/reservations', {
      method: 'DELETE',
      query: { privateKey },
    })

    if (!response.ok) {
      await Dialogs.alert('Failed to delete reservation.')
      return
    }

    if (this.editingPrivateKey === privateKey) {
      this.closeReservationModal()
    }

    await this.loadReservations()
    await Dialogs.alert('Reservation deleted.')
  }

  async onReservationItemTap(args: any): Promise<void> {
    const reservation = this.reservations[args.index]
    if (!reservation) {
      return
    }

    const result = await Dialogs.action({
      title: 'Reservation',
      cancelButtonText: 'Cancel',
      actions: ['Edit', 'Delete'],
    })

    if (result === 'Edit') {
      this.beginEdit(reservation)
    } else if (result === 'Delete') {
      await this.deleteReservation(reservation.privateKey)
    }
  }

  async onOpenRoomPicker(): Promise<void> {
    if (!this.rooms.length) {
      return
    }

    const result = await action({
      title: 'Select Room',
      cancelButtonText: 'Cancel',
      actions: this.rooms,
    })

    if (result !== 'Cancel') {
      this.editedLocation = result
      this.setAvailabilityState(false, false)
    }
  }

  async refreshAll(): Promise<void> {
    try {
      this.loading = true
      await this.loadRooms()
      await this.loadReservations()
    } finally {
      this.loading = false
    }
  }
}
