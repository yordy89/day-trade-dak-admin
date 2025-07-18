import { toast } from 'react-hot-toast'

export const useSnackbar = () => {
  const showSuccess = (message: string) => {
    toast.success(message)
  }

  const showError = (message: string) => {
    toast.error(message)
  }

  const showInfo = (message: string) => {
    toast(message)
  }

  const showWarning = (message: string) => {
    toast(message, {
      icon: '⚠️',
    })
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}