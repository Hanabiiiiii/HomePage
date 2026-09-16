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

export interface BackgroundSource {
  /**
   * 随机图 API 地址（优先加载）。
   * 留空字符串则跳过 API，直接使用本地图片。
   */
  api: string

  /**
   * API 加载超时时间（毫秒）。
   * 超过该时间图片仍未加载完成，则回退到本地图片。
   * 设置为 0 或负数表示不启用超时。
   */
  apiTimeout: number

  /**
   * 本地回退图片。
   * API 超时或加载失败时，会从对应数组中随机取一张。
   */
  local: {
    desktop: string[]
    mobile: string[]
  }
}

export const siteConfig = {
  /* =================================
     Site
     ================================= */

  title:
    '花火の主页',

  avatar:
    '/icon/logo.gif',

  /* =================================
     Background
     ================================= */

  background: {
    /* 随机图 API：优先加载，加载成功即作为背景 */
    api:
      'https://random.fwneko.com/api/random?type=auto',

    /* API 超时时间（毫秒），超时后回退到本地图片 */
    apiTimeout:
      45000,

    /*
     * 本地回退图片：API 超时或加载失败时随机取一张。
     *
     * 命名示例：
     *   background1.png
     *   background2.jpg
     *   background3.gif
     *   background4.webp
     *
     * 直接往数组里继续添加即可，加载时会随机选取。
     */
    local: {
      desktop: [
        '/images/desktop/background1.jpg',
        '/images/desktop/background2.png',
        '/images/desktop/background3.png',
        '/images/desktop/background4.png',
        '/images/desktop/background5.png',
        '/images/desktop/background6.png',
        '/images/desktop/background7.jpg',
        '/images/desktop/background8.jpg',
        '/images/desktop/background9.jpg',
        '/images/desktop/background10.jpg',
        '/images/desktop/background11.png',
        '/images/desktop/background12.jpg',
      ],

      mobile: [
        '/images/mobile/background1.png',
        '/images/mobile/background2.png',
        '/images/mobile/background3.png',
        '/images/mobile/background4.png',
        '/images/mobile/background5.png',
      ],
    },
  } satisfies BackgroundSource,

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
     * Weather API 
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
        '摸鱼の客栈',
      url:
        'https://blog.fwneko.com',
      description:
        '记录没人看的技术和碎碎念',
      icon:
        '📖',
    },

    {
      title:
        '状态监控',

      url:
        'https://status.fwneko.com/',

      description:
        'Upkuma站点服务监测',

      icon:
        '🔬',
    },

    {
      title:
        '网址集',
      url:
        'https://status.fwneko.com/',
      description:
        '一些好玩的网站',
      icon:
        '📚',
    },

    {
      title:
        '网盘',
      url:
        'https://pan.fwneko.com',
      description:
        '自建Openlist网盘',
      icon:
        '💿',
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
        '花火火の随机图片API',
      url:
        'https://random.fwneko.com',
      description:
        '一个轻量、简单、易维护的二次元随机图片 API',
      icon:
        '🖼️',
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
        'tencent://Message/?Uin=2131369826&websiteName=qzone.qq.com&Menu=yes',
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