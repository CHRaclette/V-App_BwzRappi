import { Dialogs, fromObject } from '@nativescript/core'
import { SelectedPageService } from '../shared/selected-page-service'
import { request } from '../shared/api-service'
import { clearPublicKeys, setUser } from '../shared/session-service'

export function LoginViewModel() {
  SelectedPageService.getInstance().updateSelectedPage('Login')

  const viewModel = fromObject({
    username: '',
    password: '',
    error: '',
  })

  viewModel.login = async function () {
    const normalizedUsername = (viewModel.username || '').trim()
    const normalizedPassword = (viewModel.password || '').trim()

    viewModel.set('username', normalizedUsername)
    viewModel.set('password', normalizedPassword)

    if (!normalizedUsername || !normalizedPassword) {
      viewModel.set('error', 'Username and password are required.')
      Dialogs.alert('Username and password are required.')
      return false
    }

    const response = await request('/login', {
      method: 'POST',
      formBody: {
        username: normalizedUsername,
        password: normalizedPassword,
      },
    })

    if (!response.ok || !response.data) {
      let errorMessage = 'Login failed. Please check your credentials and backend connection.'

      if (response.status === 401 || response.status === 403 || response.status === 500) {
        errorMessage = 'Wrong username or password.'
      } else if (response.status === 0) {
        errorMessage = 'Cannot reach backend. If you use Android emulator, keep backend on and use host access.'
      }

      viewModel.set('error', errorMessage)
      Dialogs.alert(errorMessage)
      return false
    }

    setUser(response.data)
    clearPublicKeys()
    viewModel.set('error', '')
    Dialogs.alert('Login successful.')
    return true
  }

  return viewModel
}
