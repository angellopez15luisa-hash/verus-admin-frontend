export interface SocialMeta {
  name: string
  placeholder: string
  icon: readonly [string, string]
  colorClass: string
}

export const SOCIAL_CONFIG_MAP: Record<string, SocialMeta> = {
  instagram: {
    name: 'Instagram',
    placeholder: 'https://instagram.com/...',
    icon: ['fab', 'instagram'],
    colorClass: 'text-pink-500',
  },
  facebook: {
    name: 'Facebook',
    placeholder: 'https://facebook.com/...',
    icon: ['fab', 'facebook'],
    colorClass: 'text-blue-500',
  },
  tiktok: {
    name: 'TikTok',
    placeholder: 'https://tiktok.com/@...',
    icon: ['fab', 'tiktok'],
    colorClass: 'text-slate-900 dark:text-white',
  },
  twitter: {
    name: 'Twitter',
    placeholder: 'https://twitter.com/...',
    icon: ['fab', 'twitter'],
    colorClass: 'text-sky-400',
    // name: 'WhatsApp',
    // placeholder: 'https://wa.me/...',
    // icon: ['fab', 'whatsapp'],
    // colorClass: 'text-emerald-500',
  },
  whatsapp: {
    name: 'WhatsApp',
    placeholder: 'https://wa.me/...',
    icon: ['fab', 'whatsapp'],
    colorClass: 'text-emerald-500',
  },
  linkedin: {
    name: 'Linkedin',
    placeholder: 'https://linkedin.com/...',
    icon: ['fab', 'linkedin'],
    colorClass: 'text-emerald-500',
  },
  // whatsapp1: {
  //   name: 'WhatsApp',
  //   placeholder: 'https://wa.me/...',
  //   icon: ['fab', 'whatsapp'],
  //   colorClass: 'text-emerald-500',
  // },
}

export const getSocialMeta = (key: string) => {
  return (
    SOCIAL_CONFIG_MAP[key] || {
      name: key,
      placeholder: '',
      icon: ['fas', 'link'],
      colorClass: 'text-slate-500',
    }
  )
}
