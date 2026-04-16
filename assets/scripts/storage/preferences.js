/**
 * 用户偏好持久化管理
 * @module preferences
 *
 * localStorage key 保持不变以兼容现有用户数据：
 * - starredStyles: 收藏的主题列表
 * - currentStyle: 当前选中的主题 key
 * - markdownInput: 编辑器内容
 */

/** @type {string} */
const KEY_STYLE = 'currentStyle';
/** @type {string} */
const KEY_CONTENT = 'markdownInput';

let _saveTimer = null;

/**
 * 加载用户偏好
 * @returns {{ currentStyle: string, content: string|null }}
 */
export function loadPreferences() {
  try {
    const currentStyle = localStorage.getItem(KEY_STYLE) || 'wechat-default';
    const content = localStorage.getItem(KEY_CONTENT);
    return { currentStyle, content };
  } catch (_e) {
    return { currentStyle: 'wechat-default', content: null };
  }
}

/**
 * 保存用户偏好
 * @param {string} currentStyle - 当前主题
 * @param {string} content - 编辑器内容
 */
export function savePreferences(currentStyle, content) {
  try {
    localStorage.setItem(KEY_STYLE, currentStyle);
    localStorage.setItem(KEY_CONTENT, content);
  } catch (_e) {
    console.error('保存偏好失败');
  }
}

/**
 * 防抖保存编辑器内容
 * @param {string} content
 * @param {number} [delay=1000] - 防抖延迟（毫秒）
 */
export function debounceSaveContent(content, delay = 1000) {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY_CONTENT, content);
    } catch (_e) {
      console.error('自动保存失败');
    }
  }, delay);
}
