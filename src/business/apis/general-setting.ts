import api from '@/lib/axios'
import type {
  GeneralSettingDataResponse,
  GeneralSettingUpdateFormData,
  MessageResponse
} from '@/types'

export class GeneralSettingApi {
  static getData = () => api.get<GeneralSettingDataResponse>(`/general-settings`)

  static update = (formData: GeneralSettingUpdateFormData) =>
    api.patch<MessageResponse>(`/general-settings/${formData.id}`, formData.data)
}
