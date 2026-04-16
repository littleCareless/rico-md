/**
 * 渲染管线 - 编排 Markdown → HTML → 处理图片 → 应用样式 → 分组图片
 * @module render-pipeline
 */

/**
 * 完整渲染管线
 * @param {Object} params
 * @param {string} params.markdown - Markdown 文本
 * @param {Object} params.md - markdown-it 实例
 * @param {import('./image-store.js').ImageStore} params.imageStore - 图片存储实例
 * @param {Object} params.styleConfig - 当前主题样式配置 { styles: {...} }
 * @param {Object|null} params.codeTheme - 代码主题配置（可选）
 * @returns {Promise<string>} 渲染后的 HTML
 */
export async function renderPipeline({ markdown, md, imageStore, styleConfig, codeTheme }) {
  if (!markdown.trim()) return '';

  // 1. 预处理 Markdown 文本
  const { preprocessMarkdown } = await import('./markdown-engine.js');
  const processedContent = preprocessMarkdown(markdown);

  // 2. Markdown → HTML
  let html = md.render(processedContent);

  // 3. 处理 img:// 协议（从 IndexedDB 加载图片）
  if (imageStore) {
    html = await processImageProtocol(html, imageStore);
  }

  // 4. 应用内联样式 + 图片网格分组
  html = applyInlineStyles(html, styleConfig, codeTheme);

  return html;
}

/**
 * 处理 img:// 协议，从 IndexedDB 加载图片并替换为 Object URL
 * @param {string} html
 * @param {import('./image-store.js').ImageStore} imageStore
 * @returns {Promise<string>}
 */
async function processImageProtocol(html, imageStore) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images = doc.querySelectorAll('img');

  for (const img of images) {
    const src = img.getAttribute('src');

    if (src && src.startsWith('img://')) {
      const imageId = src.replace('img://', '');

      try {
        const objectURL = await imageStore.getImage(imageId);

        if (objectURL) {
          img.setAttribute('src', objectURL);
          img.setAttribute('data-image-id', imageId);
        } else {
          // 图片不存在，显示占位符
          img.setAttribute('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片丢失%3C/text%3E%3C/svg%3E');
        }
      } catch (_e) {
        img.setAttribute('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23fee" width="200" height="200"/%3E%3Ctext fill="%23c00" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E加载失败%3C/text%3E%3C/svg%3E');
      }
    }
  }

  return doc.body.innerHTML;
}

/**
 * 应用内联样式到 HTML 元素
 * @param {string} html
 * @param {Object} styleConfig - 主题样式配置 { styles: {...} }
 * @param {Object|null} codeTheme - 代码主题（可选）
 * @returns {string}
 */
function applyInlineStyles(html, styleConfig, codeTheme) {
  const style = styleConfig.styles;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 先处理图片网格布局
  groupConsecutiveImages(doc);

  // 应用各元素样式
  Object.keys(style).forEach(selector => {
    // 代码块样式由 codeTheme 控制
    if (selector === 'pre' || selector === 'code' || selector === 'pre code') return;

    const elements = doc.querySelectorAll(selector);
    elements.forEach(el => {
      // 网格容器内的图片跳过
      if (el.tagName === 'IMG' && el.closest('.image-grid')) return;

      const currentStyle = el.getAttribute('style') || '';
      el.setAttribute('style', currentStyle + '; ' + style[selector]);
    });
  });

  // 包裹容器
  applyCodeThemeStyles(doc, codeTheme);

  const container = doc.createElement('div');
  container.setAttribute('style', style.container);
  container.innerHTML = doc.body.innerHTML;

  return container.outerHTML;
}

function applyCodeThemeStyles(doc, codeTheme) {
  if (!codeTheme) return;

  const blocks = doc.querySelectorAll('[data-code-block="true"]');

  blocks.forEach((block) => {
    const header = block.querySelector('.md-code-block-header');
    const body = block.querySelector('.md-code-block-body');
    const code = block.querySelector('.md-code-block-code');

    block.setAttribute(
      'style',
      `margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.15); background: ${codeTheme.bg}; border: 1px solid ${codeTheme.borderColor};`
    );

    if (header) {
      header.setAttribute(
        'style',
        `display: flex; align-items: center; gap: 6px; padding: 10px 12px; background: ${codeTheme.headerBg}; border-bottom: 1px solid ${codeTheme.borderColor};`
      );
    }

    if (body) {
      body.setAttribute(
        'style',
        `padding: 16px; overflow-x: auto; background: ${codeTheme.bg};`
      );
    }

    if (code) {
      code.setAttribute(
        'style',
        `display: block; color: ${codeTheme.textColor}; font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace; font-size: 14px; line-height: 1.6; white-space: pre;`
      );
    }
  });
}

/**
 * 分组连续图片为网格布局
 * @param {Document} doc
 */
function groupConsecutiveImages(doc) {
  const body = doc.body;
  const children = Array.from(body.children);
  let imagesToProcess = [];

  children.forEach((child, index) => {
    if (child.tagName === 'P') {
      const images = child.querySelectorAll('img');
      if (images.length > 0) {
        if (images.length > 1) {
          const group = Array.from(images).map(img => ({
            element: child, img, index, inSameParagraph: true
          }));
          imagesToProcess.push(...group);
        } else {
          imagesToProcess.push({ element: child, img: images[0], index, inSameParagraph: false });
        }
      }
    } else if (child.tagName === 'IMG') {
      imagesToProcess.push({ element: child, img: child, index, inSameParagraph: false });
    }
  });

  // 分组
  let groups = [];
  let currentGroup = [];

  imagesToProcess.forEach((item, i) => {
    if (i === 0) {
      currentGroup.push(item);
    } else {
      const prevItem = imagesToProcess[i - 1];
      const isContinuous = (item.index === prevItem.index) || (item.index - prevItem.index === 1);

      if (isContinuous) {
        currentGroup.push(item);
      } else {
        if (currentGroup.length > 0) groups.push([...currentGroup]);
        currentGroup = [item];
      }
    }
  });
  if (currentGroup.length > 0) groups.push(currentGroup);

  // 处理每组
  groups.forEach(group => {
    if (group.length < 2) return;

    const imageCount = group.length;
    const firstElement = group[0].element;
    const gridContainer = doc.createElement('div');
    gridContainer.setAttribute('class', 'image-grid');
    gridContainer.setAttribute('data-image-count', String(imageCount));

    let columns;
    let gridStyle;

    if (imageCount === 2) {
      columns = 2;
      gridStyle = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 20px auto; max-width: 100%; align-items: start;';
    } else if (imageCount === 3) {
      columns = 3;
      gridStyle = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 20px auto; max-width: 100%; align-items: start;';
    } else if (imageCount === 4) {
      columns = 2;
      gridStyle = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 20px auto; max-width: 100%; align-items: start;';
    } else {
      columns = 3;
      gridStyle = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 20px auto; max-width: 100%; align-items: start;';
    }

    gridContainer.setAttribute('style', gridStyle);
    gridContainer.setAttribute('data-columns', String(columns));

    group.forEach((item) => {
      const imgWrapper = doc.createElement('div');
      imgWrapper.setAttribute('style', 'width: 100%; height: auto; overflow: hidden;');

      const img = item.img.cloneNode(true);
      img.setAttribute('style', 'width: 100%; height: auto; display: block; border-radius: 8px;');

      imgWrapper.appendChild(img);
      gridContainer.appendChild(imgWrapper);
    });

    firstElement.parentNode.insertBefore(gridContainer, firstElement);

    const elementsToRemove = new Set(group.map(item => item.element));
    elementsToRemove.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  });
}
