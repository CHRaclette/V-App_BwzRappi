import { Application, Frame, action } from '@nativescript/core';
import { DashboardViewModel } from './dashboard-view-model';

function callViewModelMethod(args, methodName, ...methodArgs) {
    const viewModel = args.object.page.bindingContext;
    if (viewModel && typeof viewModel[methodName] === 'function') {
        viewModel[methodName](...methodArgs);
    }
}

export function onNavigatingTo(args) {
    const page = args.object;
    const viewModel = new DashboardViewModel();
    page.bindingContext = viewModel;

    if (!viewModel.ensureAuthenticated()) {
        Frame.topmost().navigate({
            moduleName: 'login/login-page',
            clearHistory: true,
        });
        return;
    }

    viewModel.refreshAll();
}

export function onDrawerButtonTap() {
    const sideDrawer = Application.getRootView();
    if (sideDrawer && typeof sideDrawer.showDrawer === 'function') {
        sideDrawer.showDrawer();
    }
}

export function onRefreshTap(args) {
    callViewModelMethod(args, 'refreshAll');
}

export function onCheckAvailabilityTap(args) {
    callViewModelMethod(args, 'checkRoomAvailability');
}

export function onSaveReservationTap(args) {
    callViewModelMethod(args, 'saveReservation');
}

export function onOpenCreateModalTap(args) {
    callViewModelMethod(args, 'openCreateModal');
}

export function onCloseModalTap(args) {
    callViewModelMethod(args, 'closeReservationModal');
}

export function onReservationItemTap(args) {
    callViewModelMethod(args, 'openReservationActions', args.index);
}

export function onEditReservationTap(args) {
    const reservation = args.object.bindingContext;
    args.object.page.bindingContext.beginEdit(reservation);
}

export function onDeleteReservationTap(args) {
    const reservation = args.object.bindingContext;
    callViewModelMethod(args, 'deleteReservation', reservation.privateKey);
}

export function onOpenRoomPicker(args) {
    const vm = args.object.page.bindingContext;

    if (!vm.rooms || !vm.rooms.length) return;

    action({
        title: 'Select Room',
        cancelButtonText: 'Cancel',
        actions: vm.rooms,
    }).then(result => {
        if (result !== 'Cancel') {
            vm.set('editedLocation', result);
            if (typeof vm.setAvailabilityState === 'function') {
                vm.setAvailabilityState(false, false);
            }
        }
    });
}