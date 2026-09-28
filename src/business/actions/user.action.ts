import type {
  User,
  UserForgotPasswordForm,
  UserResetPasswordFormData,
  UserSignInForm,
  UserUpdatePasswordForm,
} from '@/types'
import { UserService } from '../services'

export class UserAction {
  static signIn = (formData: UserSignInForm) => UserService.signIn(formData)

  static forgotPassword = (formData: UserForgotPasswordForm) => UserService.forgotPassword(formData)

  static verifyResetToken = (token: User['token']) => UserService.verifyResetToken(token)

  static resetPassword = (formData: UserResetPasswordFormData) =>
    UserService.resetPassword(formData)

  static getProfile = () => UserService.getProfile()

  static updatePassword = (formData: UserUpdatePasswordForm) => UserService.updatePassword(formData)
}
