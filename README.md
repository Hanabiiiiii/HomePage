# Homepage

一个基于 Vue 3 + Vite + TypeScript 开发的个人主页。

整体设计以简洁、轻量和玻璃拟态（Liquid Glass）为核心，加入了深色 / 浅色主题切换、动态背景、音乐播放器、歌词显示、天气信息、一言等功能。

> Personal Homepage · Vue 3 · Vite · TypeScript · Liquid Glass

---

## ✨ Features

### 🎨 主题切换

支持深色与浅色主题：

- 🌙 深色主题
- ☀️ 浅色主题
- 记忆用户上次选择的主题
- 平滑的主题颜色过渡
- 根据主题自动调整文字、阴影与玻璃效果

默认使用深色主题。

---

### 🖼️ 动态背景

主页使用动态背景图片，并通过透明渐变覆盖层适配不同主题。

特点：

- 不直接对原始背景图片进行模糊处理
- 深色 / 浅色主题使用不同的透明覆盖层
- 保持背景图片原始清晰度
- 支持横向 / 纵向图片
- 页面整体保持柔和的视觉效果

---

### 🫧 Liquid Glass

页面大量使用玻璃拟态设计。

主要特点：

- 半透明背景
- `backdrop-filter`
- 柔和高光
- 半透明边框
- 轻量阴影
- 圆角卡片
- 深色 / 浅色主题分别适配

整体效果尽量保持轻薄，不使用过重的黑色内阴影。

---

### 👤 Profile Card

个人信息卡片包含：

- 头像
- 昵称
- 个人简介
- 地理位置
- 当前时间
- 玻璃拟态卡片

文字颜色会随着主题平滑过渡。

---

### 🔗 Website Links

支持展示常用网站与项目链接。

每个链接包含：

- 网站名称
- 网站描述
- 跳转箭头
- Hover 动画

标题和描述会根据当前主题自动调整颜色和阴影。

---

### 🎵 Music Player

内置音乐播放器。

目前支持：

- 播放 / 暂停
- 上一首 / 下一首
- 播放进度调整
- 音量调整
- 静音切换
- 音乐列表
- 当前播放歌曲显示
- 歌词显示
- 歌词自动跟随播放进度
- 歌曲切换时自动加载歌词

播放器采用独立组件设计，音乐逻辑与 UI 样式分离。

---

### 💬 Lyrics

音乐播放器支持 LRC 歌词。

包括：

- LRC 时间轴解析
- 当前歌词自动切换
- 歌词加载状态
- 歌词加载失败提示
- 无歌词提示
- 歌词切换动画

歌词字号与「一言」等页面文字保持接近。

---

### 🌤️ Weather

支持天气信息展示。

天气数据通过独立 API 获取，前端只负责展示。

由于浏览器存在 CORS 限制，天气 API 推荐通过自己的 Worker / 反向代理进行转发。

---

### 💭 Hitokoto

支持一言（Hitokoto）展示。

包含：

- 一言内容
- 来源信息
- 请求状态
- 加载失败处理
- 深色 / 浅色主题自动适配

---

## 🛠️ Tech Stack

| Technology | Description |
| --- | --- |
| Vue 3 | Frontend Framework |
| TypeScript | Programming Language |
| Vite | Build Tool |
| Pinia | State Management |
| SCSS | Styling |
| HTML5 | Page Structure |
| CSS3 | Visual Effects |
| Fetch API | Network Requests |

---

## 📁 Project Structure

```text
Homepage
├── public/
│
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── animations.scss
│   │       ├── global.scss
│   │       └── variables.scss
│   │
│   ├── components/
│   │   ├── Background/
│   │   │   └── BackgroundLayer.vue
│   │   │
│   │   ├── Loading/
│   │   │   └── LoadingScreen.vue
│   │   │
│   │   ├── Music/
│   │   │   └── MusicPlayer.vue
│   │   │
│   │   ├── Profile/
│   │   │   └── ProfileCard.vue
│   │   │
│   │   ├── ThemeToggle/
│   │   │   └── ThemeToggle.vue
│   │   │
│   │   ├── Styles/
│   │   │   └── Music/
│   │   │       └── music.scss
│   │   │
│   │   └── Use/
│   │       └── Music/
│   │           └── Music.ts
│   │
│   ├── config/
│   │   └── site.ts
│   │
│   ├── views/
│   │   └── Home.vue
│   │
│   ├── App.vue
│   └── main.ts
│
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── README.md