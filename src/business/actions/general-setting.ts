import type { GeneralSettingUpdateFormData } from '@/types'
import { GeneralSettingService } from '../services'

export class GeneralSettingAction {
  static getData = () => GeneralSettingService.getData()

  static update = (formData: GeneralSettingUpdateFormData) => GeneralSettingService.update(formData)
}
