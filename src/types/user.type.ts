import z from 'zod'
import type {
  userSchema,
  userGetProfileResponseDataSchema,
  userGetProfileResponseSchema,
  userResetPasswordFormDataSchema,
  userSignInResponseDataSchema
} from '@/schemas'

export type User = z.infer<typeof userSchema>

export type UserSignInForm = Pick<User, 'email' | 'password'>

export type UserForgotPasswordForm = Pick<User, 'email' | 'frontendUrl'>

export type UserResetPasswordForm = Pick<User, 'newPassword' | 'confirmPassword'>

export type UserSignInResponseData = z.infer<typeof userSignInResponseDataSchema>

export type UserResetPasswordFormData = z.infer<typeof userResetPasswordFormDataSchema>

export type UserGetProfileResponseData = z.infer<typeof userGetProfileResponseDataSchema>

export type UserGetProfileResponse = z.infer<typeof userGetProfileResponseSchema>

export type UserUpdatePasswordForm = Pick<User, 'currentPassword' | 'newPassword'>
