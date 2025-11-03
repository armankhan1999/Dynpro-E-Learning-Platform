import { toast } from 'sonner'

/**
 * Toast utility functions for consistent notifications across the app
 */

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    })
  },

  loading: (message: string) => {
    return toast.loading(message)
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    })
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
}

// Predefined toast messages for common actions
export const toastMessages = {
  // Success messages
  created: (entity: string) => `${entity} created successfully`,
  updated: (entity: string) => `${entity} updated successfully`,
  deleted: (entity: string) => `${entity} deleted successfully`,
  saved: (entity: string) => `${entity} saved successfully`,
  uploaded: (entity: string) => `${entity} uploaded successfully`,
  enrolled: 'Enrollment successful',
  unenrolled: 'Unenrolled successfully',
  submitted: 'Submitted successfully',
  published: 'Published successfully',
  archived: 'Archived successfully',

  // Error messages
  createError: (entity: string) => `Failed to create ${entity}`,
  updateError: (entity: string) => `Failed to update ${entity}`,
  deleteError: (entity: string) => `Failed to delete ${entity}`,
  loadError: (entity: string) => `Failed to load ${entity}`,
  uploadError: (entity: string) => `Failed to upload ${entity}`,
  networkError: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action',

  // Info messages
  processing: 'Processing...',
  uploading: 'Uploading...',
  saving: 'Saving...',
  loading: 'Loading...',
}
