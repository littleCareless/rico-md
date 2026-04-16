/**
 * Markdown 引擎 - markdown-it 初始化 + CJK 强调符号补丁
 * @module markdown-engine
 *
 * 重要：CJK 补丁必须在 markdown-it 实例创建后立即应用，
 * 否则中文 **粗体** 和 *斜体* 可能无法正确渲染。
 */

/** 强调标记字符集 */
const EMPHASIS_MARKERS = new Set([
  0x2A, // *
  0x5F, // _
  0x7E  // ~
]);

/**
 * 判断字符码是否为 CJK 字符
 * @param {number} charCode
 * @returns {boolean}
 */
function isCjkLetter(charCode) {
  if (!charCode || charCode < 0) return false;
  return (
    (charCode >= 0x3400 && charCode <= 0x4DBF) ||  // CJK Unified Ideographs Extension A
    (charCode >= 0x4E00 && charCode <= 0x9FFF) ||  // CJK Unified Ideographs
    (charCode >= 0xF900 && charCode <= 0xFAFF) ||  // CJK Compatibility Ideographs
    (charCode >= 0xFF01 && charCode <= 0xFF60) ||  // Full-width ASCII variants
    (charCode >= 0xFF61 && charCode <= 0xFF9F) ||  // Half-width Katakana
    (charCode >= 0xFFA0 && charCode <= 0xFFDC)     // Full-width Latin letters
  );
}

/**
 * 创建安全的引导标点符号检查器
 * 用于 CJK 语境下正确处理强调标记
 * @returns {Function} (charCode, marker) => boolean
 */
function createSafeLeadingPunctuationChecker() {
  const fallbackChars = '「『《〈（【〔〖［｛﹁﹃﹙﹛﹝"\'（';
  const fallbackSet = new Set(fallbackChars.split('').map(c => c.codePointAt(0)));

  let unicodeRegex = null;
  try {
    unicodeRegex = new RegExp('[\\p{Ps}\\p{Pi}]', 'u');
  } catch (_e) {
    unicodeRegex = null;
  }

  return (charCode, marker) => {
    if (!EMPHASIS_MARKERS.has(marker)) return false;
    if (unicodeRegex && unicodeRegex.test(String.fromCharCode(charCode))) return true;
    return fallbackSet.has(charCode);
  };
}

/**
 * 对 markdown-it 应用 CJK scanDelims 补丁
 * 修复中文文本中 **粗体** 和 *斜体* 的渲染问题
 * @param {Object} md - markdown-it 实例
 */
function patchMarkdownScanner(md) {
  if (!md || !md.inline || !md.inline.State) return;

  const utils = md.utils;
  const StateInline = md.inline.State;
  const allowLeadingPunctuation = createSafeLeadingPunctuationChecker();
  const originalScanDelims = StateInline.prototype.scanDelims;

  StateInline.prototype.scanDelims = function (start, canSplitWord) {
    const max = this.posMax;
    const marker = this.src.charCodeAt(start);

    if (!EMPHASIS_MARKERS.has(marker)) {
      return originalScanDelims.call(this, start, canSplitWord);
    }

    const lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;

    let pos = start;
    while (pos < max && this.src.charCodeAt(pos) === marker) pos++;

    const count = pos - start;
    const nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;

    const isLastWhiteSpace = utils.isWhiteSpace(lastChar);
    const isNextWhiteSpace = utils.isWhiteSpace(nextChar);

    let isLastPunctChar =
      utils.isMdAsciiPunct(lastChar) || utils.isPunctChar(String.fromCharCode(lastChar));
    let isNextPunctChar =
      utils.isMdAsciiPunct(nextChar) || utils.isPunctChar(String.fromCharCode(nextChar));

    if (isNextPunctChar && allowLeadingPunctuation(nextChar, marker)) {
      isNextPunctChar = false;
    }

    if (marker === 0x5F /* _ */) {
      if (!isLastWhiteSpace && !isLastPunctChar && isCjkLetter(lastChar)) isLastPunctChar = true;
      if (!isNextWhiteSpace && !isNextPunctChar && isCjkLetter(nextChar)) isNextPunctChar = true;
    }

    const left_flanking = !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
    const right_flanking = !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);

    const can_open = left_flanking && (canSplitWord || !right_flanking || isLastPunctChar);
    const can_close = right_flanking && (canSplitWord || !left_flanking || isNextPunctChar);

    return { can_open, can_close, length: count };
  };
}

/**
 * 创建并配置 markdown-it 实例
 * 包含代码高亮和 CJK 补丁
 * @returns {Object} 配置好的 markdown-it 实例
 */
export function createMarkdownEngine() {
  const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: false,
    highlight: function (str, lang) {
      const dots = '<div class="md-code-block-header" style="display: flex; align-items: center; gap: 6px; padding: 10px 12px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></span><span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></span><span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></span></div>';

      let codeContent = '';
      if (lang && typeof window.hljs !== 'undefined') {
        try {
          codeContent = window.hljs.getLanguage(lang)
            ? window.hljs.highlight(str, { language: lang }).value
            : md.utils.escapeHtml(str);
        } catch (__e) {
          codeContent = md.utils.escapeHtml(str);
        }
      } else {
        codeContent = md.utils.escapeHtml(str);
      }

      return `<div class="md-code-block" data-code-block="true" style="margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">${dots}<div class="md-code-block-body" style="padding: 16px; overflow-x: auto;"><code class="md-code-block-code" style="display: block; font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace; font-size: 14px; line-height: 1.6; white-space: pre;">${codeContent}</code></div></div>`;
    }
  });

  // 必须在实例创建后立即应用 CJK 补丁
  patchMarkdownScanner(md);

  return md;
}

/**
 * 预处理 Markdown 文本（列表格式规范化等）
 * @param {string} content - 原始 Markdown 文本
 * @returns {string} 处理后的文本
 */
export function preprocessMarkdown(content) {
  content = content.replace(/^(\s*(?:\d+\.|-|\*)\s+[^:\n]+)\n\s*:\s*(.+?)$/gm, '$1: $2');
  content = content.replace(/^(\s*(?:\d+\.|-|\*)\s+.+?:)\s*\n\s+(.+?)$/gm, '$1 $2');
  content = content.replace(/^(\s*(?:\d+\.|-|\*)\s+[^:\n]+)\n:\s*(.+?)$/gm, '$1: $2');
  content = content.replace(/^(\s*(?:\d+\.|-|\*)\s+.+?)\n\n\s+(.+?)$/gm, '$1 $2');
  return content;
}
