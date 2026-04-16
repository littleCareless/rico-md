/**
 * 代码高亮主题定义 - 6 个热门主题
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
  'solarized': {
    name: 'Solarized',
    description: '护眼暖色调',
    bg: '#fdf6e3',
    headerBg: '#eee8d5',
    textColor: '#586e75',
    borderColor: '#d3cbb7'
  },
  'night-owl': {
    name: 'Night Owl',
    description: '高对比度深色',
    bg: '#011627',
    headerBg: '#01101d',
    textColor: '#d6deeb',
    borderColor: '#001122'
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
