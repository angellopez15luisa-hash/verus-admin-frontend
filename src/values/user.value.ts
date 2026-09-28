import type {
  UserForgotPasswordForm,
  UserGetProfileResponse,
  UserResetPasswordForm,
  UserSignInForm,
  UserUpdatePasswordForm,
} from '@/types'

export class UserValue {
  static signInForm: UserSignInForm = {
    email: '',
    password: '',
  }
  static forgotPasswordForm: UserForgotPasswordForm = {
    email: '',
    frontendUrl: window.location.origin,
  }
  static resetPasswordForm: UserResetPasswordForm = {
    newPassword: '',
    confirmPassword: '',
  }
  static getProfile: UserGetProfileResponse = {
    id: 0,
    name: '',
    email: '',
    role: '',
  }

  static updatePasswordForm: UserUpdatePasswordForm = {
    newPassword: '',
    currentPassword: '',
  }
}
