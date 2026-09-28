import type { UserGetProfileResponse } from '@/types/user.type'
import { UserValue } from '@/values'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { userGetProfileResponseSchema } from '@/schemas/user.schema'
import { UserAction } from '@/business/actions'
import { ENV } from '@/helpers'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserGetProfileResponse>(UserValue.getProfile)
  const isAuthenticated = ref<boolean>(false)

  const checkAuth = async (): Promise<void> => {
    try {
      const data = await UserAction.getProfile()
      const response = userGetProfileResponseSchema.safeParse(data)
      if (response.success) {
        user.value = response.data
        isAuthenticated.value = true
      }
    } catch {
      isAuthenticated.value = false
    }
  }

  const logout = () => {
    user.value = UserValue.getProfile
    isAuthenticated.value = false
    localStorage.removeItem(ENV.TOKEN)
  }

  return {
    checkAuth,
    logout,
    user,
    isAuthenticated: computed(() => isAuthenticated.value),
  }
})
