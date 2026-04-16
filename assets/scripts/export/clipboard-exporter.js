/**
 * 剪贴板导出器 - 复制流程 + Grid 转 Table + Base64 转换 + 微信兼容变换
 * @module clipboard-exporter
 */

/**
 * 从样式字符串中提取背景颜色
 * @param {string} styleString
 * @returns {string|null}
 */
function extractBackgroundColor(styleString) {
  if (!styleString) return null;

  const bgColorMatch = styleString.match(/background-color:\s*([^;]+)/);
  if (bgColorMatch) return bgColorMatch[1].trim();

  const bgMatch = styleString.match(/background:\s*([#rgb][^;]+)/);
  if (bgMatch) {
    const bgValue = bgMatch[1].trim();
    if (bgValue.startsWith('#') || bgValue.startsWith('rgb')) return bgValue;
  }

  return null;
}

/**
 * 将图片转为 Base64（优先从 IndexedDB，兜底 fetch）
 * @param {HTMLImageElement} imgElement
 * @param {import('../core/image-store.js').ImageStore} imageStore
 * @returns {Promise<string>} Base64 数据 URL
 */
async function convertImageToBase64(imgElement, imageStore) {
  const src = imgElement.getAttribute('src');

  // 已经是 Base64
  if (src.startsWith('data:')) return src;

  // 优先从 IndexedDB 获取
  const imageId = imgElement.getAttribute('data-image-id');
  if (imageId && imageStore) {
    try {
      const blob = await imageStore.getImageBlob(imageId);
      if (blob) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = (e) => reject(new Error('FileReader failed: ' + e));
          reader.readAsDataURL(blob);
        });
      }
    } catch (_e) {
      // 继续尝试 fetch
    }
  }

  // 后备：通过 URL fetch
  const response = await fetch(src, { mode: 'cors', cache: 'default' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (e) => reject(new Error('FileReader failed: ' + e));
    reader.readAsDataURL(blob);
  });
}

/**
 * 将 Grid 布局转换为 Table 布局（微信兼容）
 * @param {Document} doc
 */
function convertGridToTable(doc) {
  const imageGrids = doc.querySelectorAll('.image-grid');
  imageGrids.forEach(grid => {
    const columns = parseInt(grid.getAttribute('data-columns')) || 2;
    convertToTable(doc, grid, columns);
  });
}

/**
 * 将单个 Grid 容器转换为 Table
 */
function convertToTable(doc, grid, columns) {
  const imgWrappers = Array.from(grid.children);

  const table = doc.createElement('table');
  table.setAttribute('style', 'width: 100% !important; border-collapse: collapse !important; margin: 20px auto !important; table-layout: fixed !important; border: none !important; background: transparent !important;');

  const rows = Math.ceil(imgWrappers.length / columns);

  for (let i = 0; i < rows; i++) {
    const tr = doc.createElement('tr');

    for (let j = 0; j < columns; j++) {
      const index = i * columns + j;
      const td = doc.createElement('td');
      td.setAttribute('style', `padding: 4px !important; vertical-align: top !important; width: ${100 / columns}% !important; border: none !important; background: transparent !important;`);

      if (index < imgWrappers.length) {
        const img = imgWrappers[index].querySelector('img');
        if (img) {
          const wrapper = doc.createElement('div');
          wrapper.setAttribute('style', 'width: 100% !important; height: 360px !important; text-align: center !important; background-color: #f5f5f5 !important; border-radius: 4px !important; padding: 10px !important; box-sizing: border-box !important; overflow: hidden !important; display: table !important;');

          const innerWrapper = doc.createElement('div');
          innerWrapper.setAttribute('style', 'display: table-cell !important; vertical-align: middle !important; text-align: center !important;');

          const newImg = img.cloneNode(true);
          newImg.setAttribute('style', 'max-width: calc(100% - 20px) !important; max-height: 340px !important; width: auto !important; height: auto !important; display: inline-block !important; margin: 0 auto !important; border-radius: 4px !important; object-fit: contain !important;');

          innerWrapper.appendChild(newImg);
          wrapper.appendChild(innerWrapper);
          td.appendChild(wrapper);
        }
      }

      tr.appendChild(td);
    }

    table.appendChild(tr);
  }

  grid.parentNode.replaceChild(table, grid);
}

/**
 * 复制渲染内容到剪贴板（微信兼容格式）
 *
 * 执行流程：
 * 1. Grid → Table 转换
 * 2. 图片 Base64 转换
 * 3. Section 容器包裹（带背景色）
 * 4. 代码块简化（去除 macOS 装饰）
 * 5. 列表项扁平化
 * 6. 引用块深色模式适配
 *
 * @param {Object} params
 * @param {string} params.renderedHTML - 渲染后的 HTML
 * @param {Object} params.styleConfig - 当前主题样式配置
 * @param {import('../core/image-store.js').ImageStore} params.imageStore
 * @param {Function} params.showToast - Toast 提示
 * @returns {Promise<boolean>} 是否成功
 */
export async function copyToWechat({ renderedHTML, styleConfig, imageStore, showToast }) {
  if (!renderedHTML) {
    showToast('没有内容可复制', 'error');
    return false;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(renderedHTML, 'text/html');

    // 1. Grid → Table
    convertGridToTable(doc);

    // 2. 图片转 Base64
    const images = doc.querySelectorAll('img');
    if (images.length > 0) {
      showToast(`正在处理 ${images.length} 张图片...`, 'success');

      let successCount = 0;
      let failCount = 0;

      await Promise.all(Array.from(images).map(async (img) => {
        try {
          const base64 = await convertImageToBase64(img, imageStore);
          img.setAttribute('src', base64);
          successCount++;
        } catch (_e) {
          failCount++;
        }
      }));

      if (failCount > 0) {
        showToast(`图片处理：${successCount} 成功，${failCount} 失败`, 'error');
      }
    }

    // 3. Section 容器包裹
    const containerBg = extractBackgroundColor(styleConfig.styles.container);
    if (containerBg && containerBg !== '#fff' && containerBg !== '#ffffff') {
      const section = doc.createElement('section');
      const cs = styleConfig.styles.container;
      const paddingMatch = cs.match(/padding:\s*([^;]+)/);
      const maxWidthMatch = cs.match(/max-width:\s*([^;]+)/);

      section.setAttribute('style',
        `background-color: ${containerBg}; ` +
        `padding: ${paddingMatch ? paddingMatch[1].trim() : '40px 20px'}; ` +
        `max-width: ${maxWidthMatch ? maxWidthMatch[1].trim() : '100%'}; ` +
        `margin: 0 auto; box-sizing: border-box; word-wrap: break-word;`
      );

      while (doc.body.firstChild) section.appendChild(doc.body.firstChild);

      // 移除子元素的 max-width / margin / 相同背景色
      section.querySelectorAll('*').forEach(el => {
        let s = el.getAttribute('style') || '';
        s = s.replace(/max-width:\s*[^;]+;?/g, '');
        s = s.replace(/margin:\s*0\s+auto;?/g, '');
        if (s.includes(`background-color: ${containerBg}`)) {
          s = s.replace(new RegExp(`background-color:\\s*${containerBg.replace(/[()]/g, '\\$&')};?`, 'g'), '');
        }
        s = s.replace(/;\s*;/g, ';').replace(/^\s*;\s*|\s*;\s*$/g, '').trim();
        if (s) el.setAttribute('style', s); else el.removeAttribute('style');
      });

      doc.body.appendChild(section);
    }

    // 4. 代码块简化（去除 macOS 窗口装饰）
    doc.querySelectorAll('div[style*="border-radius: 8px"]').forEach(block => {
      const codeElement = block.querySelector('code');
      if (codeElement) {
        const codeText = codeElement.textContent || codeElement.innerText;
        const pre = doc.createElement('pre');
        const code = doc.createElement('code');

        pre.setAttribute('style',
          'background: linear-gradient(to bottom, #2a2c33 0%, #383a42 8px, #383a42 100%);' +
          'padding: 0; border-radius: 6px; overflow: hidden; margin: 24px 0;' +
          'box-shadow: 0 2px 8px rgba(0,0,0,0.15);'
        );

        code.setAttribute('style',
          'color: #abb2bf; font-family: "SF Mono", Consolas, Monaco, "Courier New", monospace;' +
          'font-size: 14px; line-height: 1.7; display: block; white-space: pre;' +
          'padding: 16px 20px; -webkit-font-smoothing: antialiased;'
        );

        code.textContent = codeText;
        pre.appendChild(code);
        block.parentNode.replaceChild(pre, block);
      }
    });

    // 5. 列表项扁平化
    doc.querySelectorAll('li').forEach(li => {
      let text = (li.textContent || li.innerText).replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\s+/g, ' ').trim();
      li.innerHTML = '';
      li.textContent = text;
      const currentStyle = li.getAttribute('style') || '';
      li.setAttribute('style', currentStyle);
    });

    // 6. 引用块深色模式适配（使用 rgba 透明度让微信自动转换）
    doc.querySelectorAll('blockquote').forEach(blockquote => {
      let s = (blockquote.getAttribute('style') || '')
        .replace(/background(?:-color)?:\s*[^;]+;?/gi, '')
        .replace(/color:\s*[^;]+;?/gi, '');

      s += '; background: rgba(0, 0, 0, 0.05) !important';
      s += '; color: rgba(0, 0, 0, 0.8) !important';
      s = s.replace(/;\s*;/g, ';').replace(/^\s*;\s*|\s*;\s*$/g, '').trim();
      blockquote.setAttribute('style', s);
    });

    // 写入剪贴板
    const simplifiedHTML = doc.body.innerHTML;
    const plainText = doc.body.textContent || '';

    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([simplifiedHTML], { type: 'text/html' }),
      'text/plain': new Blob([plainText], { type: 'text/plain' })
    });

    await navigator.clipboard.write([clipboardItem]);
    showToast('复制成功', 'success');
    return true;

  } catch (error) {
    console.error('复制失败:', error);
    showToast('复制失败', 'error');
    return false;
  }
}
