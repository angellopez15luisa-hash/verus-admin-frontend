import api from '@/lib/axios'
import type {
  MessageResponse,
  User,
  UserForgotPasswordForm,
  UserResetPasswordFormData,
  UserSignInForm,
  UserSignInResponseData,
} from '@/types'
import type { UserGetProfileResponseData, UserUpdatePasswordForm } from '@/types/user.type'

export class UserApi {
  static signIn = (formData: UserSignInForm) =>
    api.post<UserSignInResponseData>(`/users/sign-in`, formData)

  static forgotPassword = (formData: UserForgotPasswordForm) =>
    api.post<MessageResponse>(`/users/forgot-password`, formData)

  static verifyResetToken = (token: User['token']) =>
    api.get<MessageResponse>(`/users/verify-reset-token/${token}`)

  static resetPassword = (formData: UserResetPasswordFormData) =>
    api.post<MessageResponse>(`/users/reset-password/${formData.token}`, formData.data)

  static getProfile = () => api.get<UserGetProfileResponseData>(`/users/profile`)

  static updatePassword = (formData: UserUpdatePasswordForm) =>
    api.post<MessageResponse>(`/users/update-password`, formData)
}
