import z from 'zod'
import {
  catalogGalleryEventSchema,
  catalogGalleryModelSchema,
  catalogGalleryPackageSchema,
  catalogGalleryVideoSchema,
  contentFrequentlyQuestionSchema,
  contentItemsTrustsSchema,
  // gallery_imagesSchema,
  // contentHowItWorkSchema,
  // catalogGalleryServiceSchema,
  generalSettingCatalogGalleryServiceSchema,
  generalSettingDataResponseSchema,
  generalSettingResponseSchema,
  generalSettingSchema,
  generalSettingUpdateFormDataSchema,
  generalSettingUpdateSchema,
  imagesServiceSchema,
  informationAditionalSchema,
  informationContactSchema,
  serviceSchema,
  socialLinkSchema,
} from '@/schemas/general-setting.schema'
import { bannerSchema, contentHowItWorkSchema } from '@/schemas'

export type GeneralSetting = z.infer<typeof generalSettingSchema>

export type GeneralSettingForm = z.infer<typeof generalSettingUpdateSchema>

export type GeneralSettingResponse = z.infer<typeof generalSettingResponseSchema>

export type GeneralSettingDataResponse = z.infer<typeof generalSettingDataResponseSchema>

// export type GeneralSettingUpdateFormData = {
//   id: GeneralSetting['id'],
//   data:FormData
// }

// export type CatalogGalleryService = z.infer<typeof catalogGalleryServiceSchema>

export type CatalogGalleryServiceT = {
  id: number
  title: string
  description: string
  image: string
  active: boolean
}

export type CatalogGalleryModel = z.infer<typeof catalogGalleryModelSchema>

export type CatalogGalleryEvent = z.infer<typeof catalogGalleryEventSchema>

export type CatalogGalleryVideo = z.infer<typeof catalogGalleryVideoSchema>

export type CatalogGalleryPackage = z.infer<typeof catalogGalleryPackageSchema>

export type InformationContact = z.infer<typeof informationContactSchema>

export type GeneralSettingUpdateFormData = z.infer<typeof generalSettingUpdateFormDataSchema>

export type GeneralSettingCatalogGalleryServicesForm = z.infer<
  typeof generalSettingCatalogGalleryServiceSchema
>

export type CatalogGalleryModelForm = Omit<CatalogGalleryModel, 'id'>

export type CatalogGalleryEventForm = Omit<CatalogGalleryEvent, 'id'>

export type CatalogGalleryVideoForm = Omit<CatalogGalleryVideo, 'id'>

export type CatalogGalleryPackageForm = Omit<CatalogGalleryPackage, 'id'>

export type InformationContactForm = InformationContact

export type SocialLink = z.infer<typeof socialLinkSchema>

export type Banner = z.infer<typeof bannerSchema>

export type ContentHowItWork = z.infer<typeof contentHowItWorkSchema>

export type ContentFrequentlyQuestion = z.infer<typeof contentFrequentlyQuestionSchema>

export type ContentFrequentlyQuestionForm = Omit<ContentFrequentlyQuestion, 'id'>

export type ContentItemsTrust = z.infer<typeof contentItemsTrustsSchema>

export type ContentItemsTrustForm = Omit<ContentItemsTrust, 'id'>

export type Service = z.infer<typeof serviceSchema>

export type ServiceForm = Omit<Service, 'id'>

export type ImageService = z.infer<typeof imagesServiceSchema>

export type ImageServiceForm = Omit<ImageService, 'id'>

export type InformationAditional = z.infer<typeof informationAditionalSchema>

export type InformationAditionalForm = InformationAditional

// export type GalleryImage = z.infer<typeof gallery_imagesSchema>

// export type GalleryImageForm = Omit<GalleryImage,'id'>
