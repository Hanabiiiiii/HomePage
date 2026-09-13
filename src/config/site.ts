export interface SiteLink {
  title: string
  url: string
  description?: string
  icon?: string
}

export interface SocialLink {
  title: string
  url: string
  icon?: string
}

export interface MusicTrack {
  title: string
  artist?: string
  url: string
}

export const siteConfig = {
  title: 'My Home',
  description: '记录生活，分享技术，持续探索未知。',
  avatar: '/images/logo.gif',

  background: {
    desktop: '/images/background.png',
    mobile: '/images/background-mobile.webp',
  },

  weather: {
    api: 'https://weather.fwneko.com/api/weather',
    city: 'Tokyo',
    countryCode: 'JP',
  },

  music: {
    api: 'https://api.qijieya.cn/meting/',
    server: 'netease',
    type: 'playlist',
    id: '9812150531',
    autoplay: false,
    tracks: [] as MusicTrack[],
  },

  hitokoto: {
    api: 'https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i&c=j&c=k',
    cacheKey: 'homepage-hitokoto-cache',
    cacheLimit: 10,
  },

  profile: {
    name: 'Your Name',
    subtitle: 'Keep coding, keep creating.',
    location: 'Japan',
  },

  links: [
    {
      title: '个人博客',
      url: 'https://blog.fwneko.com',
      description: '记录技术与生活',
      icon: '🏠',
    },
    {
      title: '网盘',
      url: 'https://pan.fwneko.com',
      description: '自建OpenList网盘',
      icon: '☁️',
    },
    {
      title: '媒体',
      url: 'https://tv.fwneko.com',
      description: 'JellyFin媒体库',
      icon: '📺',
    },
        {
      title: '站点监测',
      url: 'https://status.fwneko.com/',
      description: 'Upkuma站点服务监测',
      icon: '🔭',
    },
  ] satisfies SiteLink[],

  socials: [
    {
      title: 'GitHub',
      url: 'https://github.com/Hanabiiiiii',
      icon: '⌘',
    },
    {
      title: 'Email',
      url: 'mailto:hanabimiao@qq.com',
      icon: '✉',
    },
  ] satisfies SocialLink[],
}
