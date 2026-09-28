import type { CatalogGalleryEvent } from "@/types/general-setting"

export const CATEGORY_DICTIONARY: Record<string, string> = {
  strippers: 'Stripeers', // Si el cliente cambia de nombre, solo lo modificas aquí
  bailarinas: 'Balarinas',

  // Agrega aquí todas las categorías que maneje tu backend
}


// En tu archivo de constantes o directo en el componente
export const EVENT_CATEGORY_DICTIONARY = {
  despedida_vip: 'Despedida VIP'
}


export const getCategoryLabel = (category: CatalogGalleryEvent['category']) => {
  return (EVENT_CATEGORY_DICTIONARY as Record<string, string>)[category!] || category
}
