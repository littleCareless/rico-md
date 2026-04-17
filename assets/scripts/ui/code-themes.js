/**
 * 代码高亮主题定义 - 16 个热门主题
 * @module code-themes
 *
 * 每个主题定义代码块的背景色、文字色、macOS 装饰栏背景色。
 * 这些颜色值会被应用为内联样式（微信兼容）。
 */

export const CODE_THEMES = {
  'github-light': {
    name: 'GitHub Light',
    description: '浅色经典风格',
    bg: '#f6f8fa',
    headerBg: '#e8ecf0',
    textColor: '#24292e',
    borderColor: '#d1d5da'
  },
  'github-dark': {
    name: 'GitHub Dark',
    description: 'GitHub 深色模式',
    bg: '#0d1117',
    headerBg: '#010409',
    textColor: '#c9d1d9',
    borderColor: '#30363d'
  },
  'one-dark': {
    name: 'One Dark',
    description: 'VS Code 深色风格',
    bg: '#282c34',
    headerBg: '#21252b',
    textColor: '#abb2bf',
    borderColor: '#181a1f'
  },
  'monokai': {
    name: 'Monokai',
    description: '经典编辑器深色',
    bg: '#272822',
    headerBg: '#1e1f1c',
    textColor: '#f8f8f2',
    borderColor: '#1a1b18'
  },
  'dracula': {
    name: 'Dracula',
    description: '紫色调深色主题',
    bg: '#282a36',
    headerBg: '#21222c',
    textColor: '#f8f8f2',
    borderColor: '#191a21'
  },
  'solarized-light': {
    name: 'Solarized Light',
    description: '护眼暖色调',
    bg: '#fdf6e3',
    headerBg: '#eee8d5',
    textColor: '#586e75',
    borderColor: '#d3cbb7'
  },
  'solarized-dark': {
    name: 'Solarized Dark',
    description: 'Solarized 深色版',
    bg: '#002b36',
    headerBg: '#001f27',
    textColor: '#93a1a1',
    borderColor: '#073642'
  },
  'night-owl': {
    name: 'Night Owl',
    description: '高对比度深色',
    bg: '#011627',
    headerBg: '#01101d',
    textColor: '#d6deeb',
    borderColor: '#001122'
  },
  'nord': {
    name: 'Nord',
    description: '北极蓝调主题',
    bg: '#2e3440',
    headerBg: '#242933',
    textColor: '#d8dee9',
    borderColor: '#3b4252'
  },
  ' Gruvbox Light': {
    name: 'Gruvbox Light',
    description: '复古暖色调',
    bg: '#fbf1c7',
    headerBg: '#ebdbb2',
    textColor: '#3c3836',
    borderColor: '#d5c4a1'
  },
  'gruvbox-dark': {
    name: 'Gruvbox Dark',
    description: '复古深色调',
    bg: '#282828',
    headerBg: '#1d2021',
    textColor: '#ebdbb2',
    borderColor: '#3c3836'
  },
  'catppuccin-mocha': {
    name: 'Catppuccin Mocha',
    description: '柔和深色主题',
    bg: '#1e1e2e',
    headerBg: '#181825',
    textColor: '#cdd6f4',
    borderColor: '#313244'
  },
  'catppuccin-latte': {
    name: 'Catppuccin Latte',
    description: '柔和浅色主题',
    bg: '#eff1f5',
    headerBg: '#e6e9ef',
    textColor: '#4c4f69',
    borderColor: '#ccd0da'
  },
  'tokyo-night': {
    name: 'Tokyo Night',
    description: '东京夜景风格',
    bg: '#1a1b26',
    headerBg: '#16161e',
    textColor: '#c0caf5',
    borderColor: '#24283b'
  },
  'oxocarbon': {
    name: 'Oxocarbon',
    description: 'IBM 碳黑风格',
    bg: '#262626',
    headerBg: '#1a1a1a',
    textColor: '#eeeeee',
    borderColor: '#333333'
  },
  'vitesse-dark': {
    name: 'Vitesse Dark',
    description: '极速深色主题',
    bg: '#1a1b26',
    headerBg: '#16161e',
    textColor: '#c0caf5',
    borderColor: '#24283b'
  }
};

/** 默认代码主题 */
export const DEFAULT_CODE_THEME = 'one-dark';

/**
 * 获取代码主题配置
 * @param {string} key - 主题 key
 * @returns {Object} 主题配置
 */
export function getCodeTheme(key) {
  return CODE_THEMES[key] || CODE_THEMES[DEFAULT_CODE_THEME];
}

/**
 * 获取所有代码主题列表
 * @returns {Array<{key: string, name: string, description: string}>}
 */
export function getCodeThemeList() {
  return Object.entries(CODE_THEMES).map(([key, val]) => ({
    key,
    name: val.name,
    description: val.description
  }));
}
