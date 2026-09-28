import type { GeneralSettingResponse, GeneralSettingUpdateFormData, MessageResponse } from '@/types'
import { isAxiosError } from 'axios'
import { GeneralSettingApi } from '../apis'
import { generalSettingDataResponseSchema, messageResponseSchema } from '@/schemas'

export class GeneralSettingService {
  static getData = async (): Promise<GeneralSettingResponse> => {
    try {
      const { data } = await GeneralSettingApi.getData()
      const response = generalSettingDataResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data.generalSetting
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  static update = async (formData: GeneralSettingUpdateFormData): Promise<MessageResponse> => {
    try {
      const { data } = await GeneralSettingApi.update(formData)

      const response = messageResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
