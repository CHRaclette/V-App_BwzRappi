import { Dialogs, fromObject } from '@nativescript/core'

import { SelectedPageService } from '../shared/selected-page-service'
import { request } from '../shared/api-service'
import { clearPublicKeys, setUser } from '../shared/session-service'

export function SignupViewModel() {
  SelectedPageService.getInstance().updateSelectedPage('Sign Up')

  const viewModel = fromObject({
    username: '',
    password: '',
    confirmPassword: '',
    error: '',
  })

  viewModel.signup = async function () {
    if (!viewModel.username || !viewModel.password || !viewModel.confirmPassword) {
      viewModel.set('error', 'All fields are required.')
      return false
    }

    if (viewModel.password !== viewModel.confirmPassword) {
      viewModel.set('error', 'Passwords do not match.')
      return false
    }

    const response = await request('/signup', {
      method: 'POST',
      formBody: {
        username: viewModel.username,
        password: viewModel.password,
      },
    })

    if (!response.ok || !response.data) {
      viewModel.set('error', 'Sign up failed. Please try another username.')
      return false
    }

    setUser(response.data)
    clearPublicKeys()
    viewModel.set('error', '')
    Dialogs.alert('Sign up successful.')
    return true
  }

  return viewModel
}
