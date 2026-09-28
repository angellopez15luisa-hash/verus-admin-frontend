import type {
  CatalogGalleryEventForm,
  CatalogGalleryModelForm,
  CatalogGalleryPackageForm,
  CatalogGalleryVideoForm,
  ContentFrequentlyQuestionForm,
  ContentItemsTrustForm,
  // GalleryImageForm,
  GeneralSettingCatalogGalleryServicesForm,
  GeneralSettingForm,
  ImageServiceForm,
  InformationAditional,
  InformationAditionalForm,
  InformationContact,
  InformationContactForm,
  ServiceForm,
} from '@/types/general-setting'

export class GeneralSettingValue {
  static updateForm: GeneralSettingForm = {
    id: 0,
    title1Start: '',
    title2Start: '',
    descriptionStart: '',
    textButtonLeftStart: '',
    textButtonRightStart: '',
    socialLinks: [],
    banners: [],
    textHeaderSections: [],
    services: [],
    imagesService:[],
    contentHowItWorks: [],
    contentFrequentlyQuestions: [],
    contentItemsTrusts: [],
    informationContact: {} as InformationContact,
    informationAditional: {} as InformationAditional,
    titleAron: '',
    subtitleAron: '',
    titleEditorAron: '',
    descriptionEditorAron: '',
    listLabelsEditorAron: [],
    textHtmlEditorAron: '',
    galeryImagesAron: [],
    titleHeaderServices: '',
    descriptionHeaderServices: '',
    catalogGalleryServices: [],
    titleHeaderModels: '',
    descriptionHeaderModels: '',
    catalogGalleryModels: [],
    titleHeaderPackages: '',
    descriptionHeaderPackages: '',
    catalogGalleryPackages: [],
  }

  static updateCatalogGalleryService: GeneralSettingCatalogGalleryServicesForm = {
    image: '',
    active: false,
    title: '',
    description: '',
  }

  static catalogGalleryModelForm: CatalogGalleryModelForm = {
    image: '',
    active: false,
    name: '',
    category: '',
  }

  static catalogGalleryEventForm: CatalogGalleryEventForm = {
    image: '',
    active: false,
    name: '',
    category: '',
  }

  static catalogGalleryVideoForm: CatalogGalleryVideoForm = {
    title: '',
    videoUrl: '',
    active: false,
  }

  static catalogGalleryPackageForm: CatalogGalleryPackageForm = {
    icon: '',
    active: false,
    description: '',
    title: '',
    features: [],
  }

  static informationContactForm: InformationContactForm = {
    address: '',
    phone: '',
    email: '',
    businessHours: '',
    whatsapp: ""
  }

  static informationAditionalForm: InformationAditionalForm = {
    text_verify: "",
    text_button_verify: "",
    iframe_map_contact: ""
  }

  static contentFrequentlyQuestionForm: ContentFrequentlyQuestionForm = {
    question: '',
    answer: '',
    isActive: true,
    service_id: 0
  }

  static contentItemsTrustForm: ContentItemsTrustForm = {
    title: '',
    subtitle: '',
    description: '',
    image: '',
    isActive: true,
  }

  static serviceForm: ServiceForm = {
    title: '',
    text_short: '',
    description_short: '',
    description_long: '',
    image: '',
    video: '',
    slug: '',
    icon_risk: '',
    title_risk: '',
    description_risk: '',
    // gallery_images: [],
    isActive: false,
    which_includes: '',
    specific_process: ''
  }

  static imagesServiceForm: ImageServiceForm = {
    name: "",
    image: "",
    isActive: false,
    service_id: 0
  }

  // static galleryImageForm: GalleryImageForm = {
  //   image: '',
  //   isActive: false,
  //   name: '',
  // }
}
