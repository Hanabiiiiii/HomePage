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
  /* =================================
     Site
     ================================= */

  title:
    '花火の主页',

  avatar:
    '/icon/logo.gif',

  background: {
    desktop:
      '/images/background.png',

    mobile:
      '/images/background-mobile.png',
  },

  /* =================================
     Weather
     ================================= */

  weather: {
    api:
      'https://weather.fwneko.com/api/weather',

    city:
      'Tokyo',

    countryCode:
      'JP',
  },

  /* =================================
     Music
     ================================= */

  music: {
    api:
      'https://api.qijieya.cn/meting/',

    server:
      'netease',

    type:
      'playlist',

    id:
      '9812150531',

    autoplay:
      false,

    tracks:
      [] as MusicTrack[],
  },

  /* =================================
     Hitokoto
     ================================= */

  hitokoto: {
    api:
      'https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i&c=j&c=k',

    cacheKey:
      'homepage-hitokoto-cache',

    cacheLimit:
      10,
  },

  /* =================================
     Profile
     ================================= */

  profile: {
    name:
      'fwneko.com',

    subtitle:
      'Ciallo～(∠・ω< )⌒☆',

    /*
     * Weather API 请求失败时使用。
     */
    location:
      'China',
  },

  /* =================================
     Site Links
     ================================= */

  links: [
    {
      title:
        '个人博客',
      url:
        'https://blog.fwneko.com',
      description:
        '记录技术与生活',
      icon:
        '🏠',
    },

    {
      title:
        '站点监测',

      url:
        'https://status.fwneko.com/',

      description:
        'Upkuma站点服务监测',

      icon:
        '🔭',
    },

    {
      title:
        '网址集',
      url:
        'https://status.fwneko.com/',
      description:
        '搜集的一些好玩的网站',
      icon:
        '📚',
    },

    {
      title:
        '网盘',
      url:
        'https://pan.fwneko.com',
      description:
        '自建OpenList网盘',
      icon:
        '☁️',
    },

    {
      title:
        '媒体',

      url:
        'https://tv.fwneko.com',

      description:
        'JellyFin媒体库',

      icon:
        '📺',
    },
    {
      title:
        '媒体',

      url:
        'https://tv.fwneko.com',

      description:
        'JellyFin媒体库',

      icon:
        '📺',
    },
  ] satisfies SiteLink[],

  /* =================================
     Social Links
     ================================= */

  socials: [
    {
      title:
        'GitHub',
      url:
        'https://github.com/Hanabiiiiii',
      icon:
        '/icon/github.svg',
    },
    {
      title:
        'Email',
      url:
        'mailto:hanabimiao@qq.com',
      icon:
        '/icon/email.svg',
    },
    {
      title:
        'Bilibili',
      url:
        'https://space.bilibili.com/355164841/bangumi',
      icon:
        '/icon/bilibili.svg',
    },
    {
      title:
        'QQ',
      url:
        'tencent://Message/?Uin=2291644503&websiteName=qzone.qq.com&Menu=yes',
      icon:
        '/icon/qq.svg',
    },
    {
      title:
        'Telegram',
      url:
        'https://t.me/baka255',
      icon:
        '/icon/telegram.svg',
    },
    {
      title:
        'X',
      url:
        'https://x.com/hanabinyaa',
      icon:
        '/icon/x.svg',
    },
  ] satisfies SocialLink[],
}