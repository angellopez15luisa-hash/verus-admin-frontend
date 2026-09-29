import { z } from 'zod'
import { messageResponseSchema } from './custom.schema'

export const catalogGalleryModelSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({
      invalid_type_error: '* El nombre debe ser una cadena de texto',
    })
    .min(1, { message: '* El nombre es requerido' })
    .min(3, { message: '* El nombre debe tener mas 3 caracteres' })
    .optional(),
  category: z
    .enum(['bailarinas', 'strippers'], {
      required_error: '* La categoría es requerida',
      invalid_type_error: '* Selecciona una categoría válida',
    })
    .or(z.literal(''))
    .optional(),
  image: z.string().optional(),
  active: z.boolean({ message: 'El estado activo debe ser un booleano' }).optional(),
})

export const catalogGalleryEventSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({
      invalid_type_error: '* El nombre debe ser una cadena de texto',
    })
    .min(1, { message: '* El nombre es requerido' })
    .min(3, { message: '* El nombre debe tener mas 3 caracteres' })
    .optional(),
  category: z
    .enum(['despedida_vip'], {
      required_error: '* La categoría es requerida',
      invalid_type_error: '* Selecciona una categoría válida',
    })
    .or(z.literal(''))
    .optional(),
  image: z.string().optional(),
  active: z.boolean({ message: 'El estado activo debe ser un booleano' }).optional(),
})

export const catalogGalleryVideoSchema = z.object({
  id: z.number().optional(),
  title: z
    .string({
      invalid_type_error: '* El nombre debe ser una cadena de texto',
    })
    .min(1, { message: '* El nombre es requerido' })
    .min(3, { message: '* El nombre debe tener mas 3 caracteres' })
    .optional(),
  videoUrl: z
    .string()
    .min(1, { message: '* La url del video es requerido' })
    .url({ message: 'Debe ser una URL válida' })
    .optional(),
  active: z.boolean({ message: 'El estado activo debe ser un booleano' }).optional(),
})

export const catalogGalleryPackageSchema = z.object({
  id: z.number({ message: 'El ID de la Galeria es requerido' }).optional(),
  icon: z
    .string({ message: 'El ícono es requerido' })
    .min(1, { message: 'Selecciona un ícono válido' }),
  title: z
    .string({ message: '* El nombre debe ser texto' })
    .min(1, { message: '* El nombre de la galería es requerido' }),
  description: z
    .string({ message: '* La descripción debe ser texto' })
    .min(1, { message: '* La descripción es requerida' }),
  features: z
    .array(
      z
        .string()
        .min(1, { message: '* La característica no puede estar vacía' })
        .refine((val) => !val.toLowerCase().startsWith('característica'), {
          message: 'Debes personalizar esta característica',
        }),
    )
    .min(3, { message: '* Debes ingresar exactamente 3 características' })
    .max(3, { message: '* Solo se permiten 3 características' }),
  active: z.boolean({ message: 'El estado activo debe ser un booleano' }).default(true),
})

export const informationContactSchema = z.object({
  address: z
    .string({ message: '* La direccion debe ser texto' })
    .min(1, { message: '* La direccion es requerida' }),
  phone: z
    .string({ message: '* El telefono debe ser texto' })
    .min(1, { message: '* El telefono es requerido' }),
  whatsapp: z
    .string({ message: '* El whatsapp debe ser texto' })
    .min(1, { message: '* El whatsapp es requerido' }),
  email: z
    .string({ message: '* El email debe ser texto' })
    .min(1, { message: '* El email es requerida' })
    .email({ message: 'El correo electrónico no es válido' }),
  businessHours: z
    .string({ message: '* El horario de atencion debe ser texto' })
    .min(1, { message: '* El horario de atencion es requerida' }),
})

export const informationAditionalSchema = z.object({
  text_verify: z
    .string({ message: '* El texto de verficacion debe ser texto' })
    .min(1, { message: '* El texto de verificacion es requerido' }),
  text_button_verify: z
    .string({ message: '* El texto del boton de verifcacion debe ser texto' })
    .min(1, { message: '* El texto del boton de verificacion es requerido' }),
  iframe_map_contact: z
    .string({ message: '* El iframe debe ser texto' })
    .min(1, { message: '* El iframe es requerido' })
    .refine((val) => val.trim().startsWith('<iframe') && val.trim().endsWith('</iframe>'), {
      message: '* El código debe ser un elemento iframe válido de Google Maps',
    }),
  title_seo: z
    .string({ message: 'El título SEO debe ser texto' })
    .min(1, { message: 'El título SEO es requerido' })
    .max(60, { message: 'El título SEO no debe exceder los 60 caracteres' }),
  description_seo: z
    .string({ message: 'La descripción SEO debe ser texto' })
    .min(1, { message: 'La descripción SEO es requerida' })
    .max(160, {
      message: 'La descripción SEO no debe exceder los 160 caracteres',
    }),
  keywords_seo: z
    .string({ message: 'Las keywords deben ser texto' })
    .min(1, { message: 'Las keywords son requeridas' }),
  ogTitle_title_seo: z
    .string({ message: 'El Open Graph title debe ser texto' })
    .min(1, { message: 'El Open Graph title es requerido' }),
  ogDescription_seo: z
    .string({ message: 'El Open Graph description debe ser texto' })
    .min(1, { message: 'El Open Graph description es requerido' }),
  twitterCard_seo: z.string(),
  image: z
    .string({ message: 'La imagen de Twitter debe ser texto' })
    .min(1, { message: 'La imagen de Twitter es requerida' })
    .url({ message: 'Debe ser una URL válida' }),
})

export const socialLinkSchema = z.object({
  key: z.string(),
  url: z
    .string()
    .min(1, { message: '* La URL es requerida' })
    .url({ message: '* Debe ser una URL válida' }),
})

export const bannerSchema = z.object({
  id: z.number(),
  image: z.string().min(1, '* La imagen es obligatoria'),
  active: z.boolean(),
})

export const textHeaderSectionSchema = z.object({
  title: z
    .string({ message: '* El titulo debe ser texto' })
    .min(1, { message: '* El titulo es requerido' })
    .optional(),
  description: z
    .string({ message: '* La descripcion debe ser texto' })
    .min(1, { message: '* La descripcion es requerida' })
    .optional(),
  section: z.string().optional(),
})

// export const gallery_imagesSchema = z.object({
//   id: z.number().optional(),
//   name: z
//     .string({ message: "* El nombre debe ser texto" })
//     .min(1, { message: "* El nombre es requerido" }),
//   image: z.string(),
//   isActive: z.boolean(),
// });

export const serviceSchema = z.object({
  id: z.number().optional(),
  title: z
    .string({ message: 'El titulo debe ser texto' })
    .min(1, { message: '* El titulo es requerido' }),
  text_short: z
    .string({ message: 'El texto corto debe ser texto' })
    .min(1, { message: '* El texto corto es requerido' }),
  description_short: z
    .string({ message: 'La descripcion corta debe ser texto' })
    .min(1, { message: '* La descripcion corta es requerido' }),
  description_long: z
    .string({ message: 'La desripcion larga debe ser texto' })
    .min(1, { message: '* La descripcion larga es requerida' }),
  image: z.string(),
  video: z
    .string({ message: '* La URL del video debe ser texto' })
    .min(1, { message: '* La URL del video es requerido' }),
  slug: z
    .string({ message: '* El slug debe ser texto' })
    .min(1, { message: 'El slug es requerido' }),
  icon_risk: z
    .string({ message: '* La clase del icono debe ser texto' })
    .min(1, { message: '* La clase del icono icono es requerido' }),
  title_risk: z
    .string({ message: '* El titulo de riesgo debe ser texto' })
    .min(1, { message: '* El titulo de riesgo es requerido' }),
  description_risk: z
    .string({ message: '* La descripcion de riesgo debe ser texto' })
    .min(1, { message: '* La descripcion de riesgo es requerido' }),
  isActive: z.boolean(),
  // which_includes: z
  // .string()
  // .transform((val) => val.replace(/<(.|\n)*?>/g, '').trim()) // Limpia las etiquetas HTML para contar solo texto real
  // .refine((val) => val.length > 0, {
  //   message: '* El texto es requerido',
  // })
  which_includes: z
    .string({ message: 'La desripcion larga debe ser texto' })
    .min(1, { message: '* El contenido es requerido' }),
  specific_process: z
    .string({ message: 'La descripcion larga debe ser texto' })
    .min(1, { message: '* El contenido es requerido' }),
  // gallery_images: z.array(gallery_imagesSchema),
})

export const imagesServiceSchema = z.object({
  id: z.number().optional(),
  name: z
    .string({ message: '* El nombre debe ser texto' })
    .min(1, { message: '* El nombre es requerido' }),
  image: z.string(),
  isActive: z.boolean(),
  service_id: z.number().optional(),
})

export const contentHowItWorkSchema = z.object({
  id: z.number().optional(),
  title: z
    .string({ message: '* El titulo debe ser texto' })
    .min(1, { message: '* El titulo es requerido' })
    .optional(),
  description: z
    .string({ message: '* La descripcion debe ser texto' })
    .min(1, { message: '* La descripcion es requerida' })
    .optional(),
})

export const contentFrequentlyQuestionSchema = z.object({
  id: z.number().optional(),
  question: z
    .string({ message: '* El titulo debe ser texto' })
    .min(1, { message: '* El titulo es requerido' }),
  answer: z
    .string({ message: '* La descripcion debe ser texto' })
    .min(1, { message: '* La descripcion es requerida' }),
  isActive: z.boolean(),
  service_id: z.number(),
})

export const contentItemsTrustsSchema = z.object({
  id: z.number().optional(),
  title: z
    .string({ message: '* El titulo debe ser texto' })
    .min(1, { message: '* El titulo es requerido' }),
  subtitle: z
    .string({ message: '* El subtitulo debe ser texto' })
    .min(1, { message: '* El subtitulo es requerido' }),
  description: z
    .string({ message: '* La descripcion debe ser texto' })
    .min(1, { message: '* La descripcion es requerida' }),
  image: z.string(),
  isActive: z.boolean(),
})

export const generalSettingSchema = z.object({
  id: z.number().optional(),
  title1Start: z
    .string({
      invalid_type_error: '* El titulo debe ser una cadena de texto',
    })
    .min(1, { message: '* El titulo es requerido' })
    .min(5, { message: '* El titulo debe tener mas 5 caracteres' })
    .optional(),
  title2Start: z
    .string({
      invalid_type_error: '* El titulo debe ser una cadena de texto',
    })
    .min(1, { message: '* El titulo es requerido' })
    .min(5, { message: '* El titulo debe tener mas 5 caracteres' })
    .optional(),
  descriptionStart: z
    .string({
      invalid_type_error: '* La descripcion debe ser una cadena de texto',
    })
    .min(1, { message: '* La descripcion es requerida' })
    .min(5, { message: '* La descripcion debe tener mas 8 caracteres' })
    .optional(),
  textButtonLeftStart: z
    .string({
      invalid_type_error: '* El texto del boton debe ser una cadena de texto',
    })
    .min(1, { message: '* El texto del boton es requerido' })
    .optional(),
  textButtonRightStart: z
    .string({
      invalid_type_error: '* El texto del boton debe ser una cadena de texto',
    })
    .min(1, { message: '* El texto del boton es requerido' })
    .optional(),
  // En general-setting.ts
  socialLinks: z.array(socialLinkSchema).optional(),
  banners: z
    .array(bannerSchema)
    // .refine((banners) => !banners || banners.some((banner) => banner.active), {
    //   message: '* Debe haber al menos un banner activo.',
    // })
    .optional(),
  textHeaderSections: z.array(textHeaderSectionSchema).optional(),
  services: z.array(serviceSchema).optional(),
  imagesService: z.array(imagesServiceSchema).optional(),
  contentHowItWorks: z.array(contentHowItWorkSchema).optional(),
  contentFrequentlyQuestions: z.array(contentFrequentlyQuestionSchema).optional(),
  contentItemsTrusts: z.array(contentItemsTrustsSchema).optional(),
  informationContact: informationContactSchema.optional(),
  informationAditional: informationAditionalSchema.optional(),
  // --- NUEVOS CAMPOS DE LA SECCIÓN ARON ---
  titleAron: z
    .string({ invalid_type_error: '* El título de Aron debe ser texto' })
    .min(1, { message: '* El título de Aron es requerido' })
    .optional(),

  subtitleAron: z
    .string({ invalid_type_error: '* El subtítulo de Aron debe ser texto' })
    .min(1, { message: '* El subtítulo de Aron es requerido' })
    .optional(),
  titleEditorAron: z
    .string({ invalid_type_error: '* El titulo debe ser texto' })
    .min(1, { message: '* El titulo es requerida' })
    .optional(),
  descriptionEditorAron: z
    .string({ invalid_type_error: '* La descripción debe ser texto' })
    .min(1, { message: '* La descripción es requerida' })
    .optional(),

  listLabelsEditorAron: z
    .array(
      z.object({
        id: z.number({ message: '* El ID de la viñeta es requerido' }).optional(),
        text: z
          .string({ message: '* El texto de la viñeta es requerido' })
          .min(1, { message: '* La viñeta no puede estar vacía' })
          .optional(),
      }),
    )
    .min(1, { message: '* Debe haber al menos una viñeta' })
    .optional(),

  textHtmlEditorAron: z
    .string({ invalid_type_error: '* El contenido HTML debe ser texto' })
    .min(1, { message: '* El contenido HTML es requerido' })
    .optional(),

  galeryImagesAron: z
    .array(
      z.object({
        id: z.number({ message: '* El ID de la imagen es requerido' }).optional(),
        url: z
          .string({ message: '* La URL de la imagen debe ser texto' })
          .min(1, { message: '* La URL de la imagen es requerida' })
          .optional(),
      }),
    )
    .min(1, { message: '* Debe haber al menos una imagen en la galería' })
    .optional(),
  // --- NUEVOS CAMPOS DE LA SECCIÓN SERVICIOS ---
  titleHeaderServices: z
    .string({ invalid_type_error: '* El título del Servicio debe ser texto' })
    .min(1, { message: '* El título del Servicio es requerido' })
    .optional(),

  descriptionHeaderServices: z
    .string({ invalid_type_error: '* La descripción debe ser texto' })
    .min(1, { message: '* La descripción es requerida' })
    .optional(),

  catalogGalleryServices: z
    .array(
      z
        .object({
          id: z.number(),
          title: z.string(),
          description: z.string(),
          image: z.string(),
          active: z.boolean({ message: 'El estado activo debe ser un booleano' }),
        })
        .optional(),
    )
    .optional(),

  titleHeaderModels: z
    .string({ invalid_type_error: '* El título del Modelo debe ser texto' })
    .min(1, { message: '* El título del Modelo es requerido' })
    .optional(),
  descriptionHeaderModels: z
    .string({ invalid_type_error: '* La descripción debe ser texto' })
    .min(1, { message: '* La descripción es requerida' })
    .optional(),
  catalogGalleryModels: z
    .array(catalogGalleryModelSchema)
    .min(1, { message: 'Debe haber al menos una imagen en la galería' })
    .optional(),

  titleHeaderGalleryEvents: z
    .string({ invalid_type_error: '* El título debe ser texto' })
    .min(1, { message: '* El título es requerido' })
    .optional(),
  descriptionHeaderGalleryEvents: z
    .string({ invalid_type_error: '* La descripción debe ser texto' })
    .min(1, { message: '* La descripción es requerida' })
    .optional(),
  catalogGalleryEvents: z
    .array(catalogGalleryEventSchema)
    .min(1, { message: 'Debe haber al menos una imagen en la galería' })
    .optional(),

  titleHeaderGalleryVideos: z
    .string({ invalid_type_error: '* El título debe ser texto' })
    .min(1, { message: '* El título es requerido' })
    .optional(),
  descriptionHeaderGalleryVideos: z
    .string({ invalid_type_error: '* La descripción debe ser texto' })
    .min(1, { message: '* La descripción es requerida' })
    .optional(),
  catalogGalleryVideos: z
    .array(catalogGalleryVideoSchema)
    .min(1, { message: 'Debe haber al menos una imagen en la galería' })
    .optional(),

  titleHeaderPackages: z
    .string({ invalid_type_error: 'El título debe ser texto' })
    .min(1, { message: '* El título es requerido' })
    .optional(),
  descriptionHeaderPackages: z
    .string({ invalid_type_error: 'La descripción debe ser texto' })
    .min(1, { message: '* La descripción es requerida' })
    .optional(),
  catalogGalleryPackages: z
    .array(catalogGalleryPackageSchema)
    .min(1, { message: 'Debe haber al menos una imagen en la galería' })
    .optional(),

  titleHeaderContact: z
    .string({ invalid_type_error: '* El título debe ser texto' })
    .min(1, { message: '* El título es requerido' })
    .optional(),
  descriptionHeaderContact: z
    .string({ invalid_type_error: '* La descripción debe ser texto' })
    .min(1, { message: '* La descripción es requerida' })
    .optional(),
})

export const catalogGalleryServiceSchema = z.object({
  id: z.number(),
  title: z
    .string({ message: '* El titulo del servicio debe ser texto' })
    .min(1, { message: '* El titulo del servicio es requerida' }),
  description: z
    .string({ message: '* La descripcion del servicio debe ser texto' })
    .min(1, { message: '* La descripcion del servicio es requerida' }),
  image: z
    .string({ message: '* La imagen es requerida' })
    .min(1, { message: '* La imagen no puede estar vacía' }),
  active: z.boolean({ message: 'El estado activo debe ser un booleano' }),
})

export const generalSettingCatalogGalleryServiceSchema = z.object({
  title: z
    .string({ message: '* El titulo del servicio debe ser texto' })
    .min(1, { message: '* El titulo del servicio es requerida' }),
  description: z
    .string({ message: '* La descripcion del servicio debe ser texto' })
    .min(1, { message: '* La descripcion del servicio es requerida' }),
  image: z
    .string({ message: '* La imagen es requerida' })
    .min(1, { message: '* La imagen no puede estar vacía' }),
  active: z.boolean({ message: 'El estado activo debe ser un booleano' }),
})

export const generalSettingUpdateSchema = generalSettingSchema.pick({
  id: true,
  title1Start: true,
  title2Start: true,
  descriptionStart: true,
  textButtonLeftStart: true,
  textButtonRightStart: true,
  socialLinks: true,
  banners: true,
  textHeaderSections: true,
  services: true,
  imagesService: true,
  contentHowItWorks: true,
  contentFrequentlyQuestions: true,
  contentItemsTrusts: true,
  informationContact: true,
  informationAditional: true,
  titleAron: true,
  subtitleAron: true,
  titleEditorAron: true,
  descriptionEditorAron: true,
  listLabelsEditorAron: true,
  textHtmlEditorAron: true,
  galeryImagesAron: true,
  titleHeaderServices: true,
  descriptionHeaderServices: true,
  catalogGalleryServices: true,
  titleHeaderModels: true,
  descriptionHeaderModels: true,
  catalogGalleryModels: true,
  titleHeaderGalleryEvents: true,
  descriptionHeaderGalleryEvents: true,
  catalogGalleryEvents: true,
  titleHeaderGalleryVideos: true,
  descriptionHeaderGalleryVideos: true,
  catalogGalleryVideos: true,
  titleHeaderPackages: true,
  descriptionHeaderPackages: true,
  catalogGalleryPackages: true,
  titleHeaderContact: true,
  descriptionHeaderContact: true,
})

export const sectionModelsSchema = generalSettingSchema.pick({
  titleHeaderModels: true,
  descriptionHeaderModels: true,
  catalogGalleryModels: true,
})
export const validateSectionModelsSchema = sectionModelsSchema
// export const generalSettingUpdateSchema = z.object({
//    titleStart: z.string(),
//   descriptionStart:z.string(),
//   socialLinks:z.record(z.string(), z.unknown())
// })
export const generalSettingResponseSchema = generalSettingSchema.pick({
  id: true,
  title1Start: true,
  title2Start: true,
  descriptionStart: true,
  textButtonLeftStart: true,
  textButtonRightStart: true,
  socialLinks: true,
  banners: true,
  textHeaderSections: true,
  services: true,
  imagesService: true,
  contentHowItWorks: true,
  contentFrequentlyQuestions: true,
  contentItemsTrusts: true,
  informationContact: true,
  informationAditional: true,
  titleAron: true,
  subtitleAron: true,
  titleEditorAron: true,
  descriptionEditorAron: true,
  listLabelsEditorAron: true,
  textHtmlEditorAron: true,
  galeryImagesAron: true,
  titleHeaderServices: true,
  descriptionHeaderServices: true,
  catalogGalleryServices: true,
  titleHeaderModels: true,
  descriptionHeaderModels: true,
  catalogGalleryModels: true,
  titleHeaderGalleryEvents: true,
  descriptionHeaderGalleryEvents: true,
  catalogGalleryEvents: true,
  titleHeaderGalleryVideos: true,
  descriptionHeaderGalleryVideos: true,
  catalogGalleryVideos: true,
  titleHeaderPackages: true,
  descriptionHeaderPackages: true,
  catalogGalleryPackages: true,
  titleHeaderContact: true,
  descriptionHeaderContact: true,
})

export const generalSettingDataResponseSchema = z.object({
  generalSetting: generalSettingResponseSchema,
  success: messageResponseSchema.shape.success,
})

export const generalSettingUpdateFormDataSchema = z.object({
  id: generalSettingSchema.shape.id,
  data: generalSettingUpdateSchema.omit({ id: true }),
})
