import z from 'zod'
import { messageResponseSchema } from './custom.schema'

export const userSchema = z.object({
  id: z.number(),
  name: z
    .string({
      invalid_type_error: 'El name debe ser una cadena de texto',
    })
    .min(1, { message: 'El name es requerido' }),
  email: z
    .string({
      invalid_type_error: '* El email debe ser una cadena de texto',
    })
    .min(1, { message: '* El email es requerido' })
    .email({ message: '* El email debe tener un formato valido' }),
  password: z
    .string({
      invalid_type_error: '* El password debe ser una cadena de texto',
    })
    .min(1, { message: '* El password es requerido' })
    .min(8, { message: '* El password debe tener al menos 8 caracteres' })
    .max(15, { message: '* El password debe tener maximo 20 caracteres' }),
  role: z.string(),
  resetPasswordToken: z.string(),
  resetPasswordExpires: z.date(),
  frontendUrl: z
    .string({ message: 'El frontendUrl debe ser una cadena de texto' })
    .min(1, 'El frontendUrl es obligatorio'),
  token: z
    .string({ invalid_type_error: 'El token debe ser una cadena de texto' })
    .min(1, { message: 'El token es requerido' }),
  newPassword: z
    .string({
      invalid_type_error: '* El nuevo password debe ser una cadena de texto',
    })
    .min(1, { message: '* El new password es obligatorio' })
    .min(8, { message: '* El password debe tener al menos 8 caracteres' }),
  confirmPassword: z
    .string({
      message: '* Debes confirmar tu contraseña',
    })
    .min(1, '* Debes confirmar tu contraseña'),
  currentPassword: z
    .string({
      invalid_type_error: '* El nuevo password debe ser una cadena de texto',
    })
    .min(1, { message: '* El new password es obligatorio' })
    .min(8, 'El password actual debe tener al menos 8 caracteres'),
})

export const userSignInSchema = userSchema.pick({
  email: true,
  password: true,
})

export const userSignInResponseDataSchema = messageResponseSchema
  .omit({
    message: true,
  })
  .extend({
    ...userSchema.pick({
      token: true,
    }).shape,
  })

export const userForgotPasswordSchema = userSchema.pick({
  email: true,
  frontendUrl: true,
})

export const userResetPasswordSchema = userSchema
  .pick({
    newPassword: true,
    confirmPassword: true,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '* Los passwords no coinciden',
    path: ['confirmPassword'],
  })

export const userResetPasswordFormDataSchema = userSchema
  .pick({
    token: true,
  })
  .extend({
    data: z.object({
      ...userSchema.pick({
        newPassword: true,
      }).shape,
    }),
  })

export const userGetProfileResponseDataSchema = messageResponseSchema
  .omit({
    message: true,
  })
  .extend({
    user: z.object({
      ...userSchema.pick({
        id: true,
        name: true,
        email: true,
        role: true,
      }).shape,
    }),
  })

export const userGetProfileResponseSchema = userSchema.pick({
  id: true,
  name: true,
  email: true,
  role: true,
})


export const userUpdatePasswordSchema = userSchema
  .pick({
    currentPassword: true,
    newPassword: true,
    confirmPassword: true,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '* Los passwords no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: '* El nuevo password debe ser diferente a la actual',
    path: ['newPassword'],
  })
