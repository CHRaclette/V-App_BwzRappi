import { Dialogs, ObservableArray, fromObject } from '@nativescript/core';
import { SelectedPageService } from '../shared/selected-page-service';
import { request } from '../shared/api-service';
import { mapReservationToCard, participantsToApiValue } from '../shared/reservation-utils';
import { getUser } from '../shared/session-service';

function isValidTimeFormat(value) {
    return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(value);
}

export function DashboardViewModel() {
    SelectedPageService.getInstance().updateSelectedPage('Dashboard');

    const viewModel = fromObject({
        reservationCountText: 'You Have No Reservations',
        reservations: new ObservableArray([]),
        rooms: [],
        editedDate: '',
        editedStartTime: '',
        editedEndTime: '',
        editedLocation: '',
        editedComment: '',
        editedParticipants: '',
        roomIsAvailable: false,
        availabilityText: 'Availability not checked',
        availabilityClass: 'text-muted',
        isEditMode: false,
        isReservationModalVisible: false,
        editingPrivateKey: '',
        loading: false,
        isSaving: false,
    });

    viewModel.ensureAuthenticated = function () {
        const user = getUser();
        return user && user.id;
    };

    viewModel.loadRooms = async function () {
        try {
            const response = await request('/rooms');
            if (!response.ok || !Array.isArray(response.data)) throw new Error('Failed to fetch rooms');
            viewModel.rooms = response.data.map(r => r.name).sort();
        } catch (err) {
            console.log('Error loading rooms:', err);
            Dialogs.alert('Failed to load rooms.');
        }
    };

    viewModel.loadReservations = async function () {
        const user = getUser();
        if (!user || !user.id) return;

        try {
            const response = await request('/reservations', { query: { userID: user.id } });
            if (!response.ok || !Array.isArray(response.data)) throw new Error('Failed to fetch reservations');

            viewModel.reservations.splice(0);
            response.data.map(mapReservationToCard).forEach(r => viewModel.reservations.push(r));
            viewModel.set('reservationCountText', viewModel.reservations.length ? `${viewModel.reservations.length} reservations` : 'You Have No Reservations');
        } catch (err) {
            console.log('Error loading reservations:', err);
            Dialogs.alert('Failed to load reservations.');
        }
    };

    viewModel.openCreateModal = function () {
        viewModel.set('editedDate', '');
        viewModel.set('editedStartTime', '');
        viewModel.set('editedEndTime', '');
        viewModel.set('editedLocation', '');
        viewModel.set('editedComment', '');
        viewModel.set('editedParticipants', '');
        viewModel.set('isEditMode', false);
        viewModel.set('editingPrivateKey', '');
        viewModel.set('roomIsAvailable', false);
        viewModel.set('availabilityText', 'Availability not checked');
        viewModel.set('availabilityClass', 'text-muted');
        viewModel.set('isReservationModalVisible', true);
    };

    viewModel.closeReservationModal = function () {
        viewModel.set('isReservationModalVisible', false);
    };

    viewModel.beginEdit = function (reservation) {
        viewModel.set('editedDate', reservation.date || '');
        viewModel.set('editedStartTime', reservation.startTime || '');
        viewModel.set('editedEndTime', reservation.endTime || '');
        viewModel.set('editedLocation', reservation.roomName || '');
        viewModel.set('editedComment', reservation.comments || '');
        viewModel.set('editedParticipants', reservation.participants || '');
        viewModel.set('editingPrivateKey', reservation.privateKey || '');
        viewModel.set('isEditMode', true);
        viewModel.set('roomIsAvailable', true);
        viewModel.set('availabilityText', 'Availability checked');
        viewModel.set('availabilityClass', 'text-success');
        viewModel.set('isReservationModalVisible', true);
    };

    viewModel.setAvailabilityState = function (isAvailable, checked) {
        if (!checked) {
            viewModel.set('roomIsAvailable', false);
            viewModel.set('availabilityText', 'Availability not checked');
            viewModel.set('availabilityClass', 'text-muted');
            return;
        }

        viewModel.set('roomIsAvailable', Boolean(isAvailable));
        viewModel.set('availabilityText', isAvailable ? 'Room is available' : 'Room is not available');
        viewModel.set('availabilityClass', isAvailable ? 'text-success' : 'text-danger');
    };

    viewModel.checkRoomAvailability = async function () {
        const roomName = (viewModel.editedLocation || '').trim();
        const date = (viewModel.editedDate || '').trim();
        const startTime = (viewModel.editedStartTime || '').trim();
        const endTime = (viewModel.editedEndTime || '').trim();

        viewModel.set('editedLocation', roomName);
        viewModel.set('editedDate', date);
        viewModel.set('editedStartTime', startTime);
        viewModel.set('editedEndTime', endTime);

        if (!roomName || !date || !startTime || !endTime) {
            viewModel.setAvailabilityState(false, false);
            Dialogs.alert('Please provide room, date, start time and end time first.');
            return;
        }

        if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
            viewModel.setAvailabilityState(false, false);
            Dialogs.alert('Time must be in HH:MM:SS format.');
            return;
        }

        if (startTime >= endTime) {
            viewModel.setAvailabilityState(false, false);
            Dialogs.alert('Start time must be earlier than end time.');
            return;
        }

        const response = await request('/rooms/available', {
            method: 'POST',
            body: {
                privateKey: viewModel.editingPrivateKey || '',
                roomName,
                date,
                startTime,
                endTime,
            },
        });

        if (!response.ok) {
            viewModel.setAvailabilityState(false, false);
            Dialogs.alert('Could not check room availability.');
            return;
        }

        const isAvailable = response.data === true || response.data === 'true';
        viewModel.setAvailabilityState(isAvailable, true);
    };

    viewModel.saveReservation = async function () {
        if (viewModel.isSaving) {
            return;
        }

        const user = getUser();
        if (!user || !user.id) {
            Dialogs.alert('Please log in again.');
            return;
        }

        const roomName = (viewModel.editedLocation || '').trim();
        const date = (viewModel.editedDate || '').trim();
        const startTime = (viewModel.editedStartTime || '').trim();
        const endTime = (viewModel.editedEndTime || '').trim();

        if (!roomName || !date || !startTime || !endTime) {
            Dialogs.alert('Please fill all required fields.');
            return;
        }

        if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
            Dialogs.alert('Time must be in HH:MM:SS format.');
            return;
        }

        if (startTime >= endTime) {
            Dialogs.alert('Start time must be earlier than end time.');
            return;
        }

        if (!viewModel.roomIsAvailable) {
            Dialogs.alert('Please check availability before saving.');
            return;
        }

        try {
            viewModel.set('isSaving', true);

            const response = await request('/reservations', {
                method: 'PATCH',
                body: {
                    privateKey: viewModel.editingPrivateKey || '',
                    roomName,
                    date,
                    startTime,
                    endTime,
                    comments: viewModel.editedComment || '',
                    participants: participantsToApiValue(viewModel.editedParticipants),
                    userId: String(user.id),
                },
            });

            if (!response.ok) {
                Dialogs.alert(viewModel.isEditMode ? 'Failed to update reservation.' : 'Failed to create reservation.');
                return;
            }

            viewModel.closeReservationModal();
            await viewModel.loadReservations();
            Dialogs.alert(viewModel.isEditMode ? 'Reservation updated.' : 'Reservation created.');
        } finally {
            viewModel.set('isSaving', false);
        }
    };

    viewModel.deleteReservation = async function (privateKey) {
        if (!privateKey) {
            Dialogs.alert('Missing reservation key.');
            return;
        }

        const confirmed = await Dialogs.confirm('Delete this reservation?');
        if (!confirmed) {
            return;
        }

        const response = await request('/reservations', {
            method: 'DELETE',
            query: { privateKey },
        });

        if (!response.ok) {
            Dialogs.alert('Failed to delete reservation.');
            return;
        }

        if (viewModel.editingPrivateKey === privateKey) {
            viewModel.closeReservationModal();
        }

        await viewModel.loadReservations();
        Dialogs.alert('Reservation deleted.');
    };

    viewModel.openReservationActions = async function (index) {
        const reservation = viewModel.reservations.getItem(index);
        if (!reservation) {
            return;
        }

        const result = await Dialogs.action({
            title: 'Reservation',
            cancelButtonText: 'Cancel',
            actions: ['Edit', 'Delete'],
        });

        if (result === 'Edit') {
            viewModel.beginEdit(reservation);
        } else if (result === 'Delete') {
            await viewModel.deleteReservation(reservation.privateKey);
        }
    };

    viewModel.refreshAll = async function () {
        try {
            viewModel.set('loading', true);
            await viewModel.loadRooms();
            await viewModel.loadReservations();
        } finally {
            viewModel.set('loading', false);
        }
    };

    return viewModel;
}