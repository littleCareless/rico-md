/**
 * Code syntax highlighting helpers for preview and clipboard export.
 * @module code-highlight
 */

import { getCodeHighlightTheme } from '../ui/code-themes.js';

const TOKEN_RULES = [
  { classes: ['hljs-comment'], token: 'comment', fontStyle: 'italic' },
  { classes: ['hljs-quote'], token: 'comment', fontStyle: 'italic' },
  { classes: ['hljs-keyword'], token: 'keyword', fontWeight: '600' },
  { classes: ['hljs-selector-tag'], token: 'keyword', fontWeight: '600' },
  { classes: ['hljs-name'], token: 'keyword', fontWeight: '600' },
  { classes: ['hljs-title', 'function_'], token: 'function', fontWeight: '600' },
  { classes: ['hljs-title', 'class_'], token: 'class', fontWeight: '600' },
  { classes: ['hljs-title'], token: 'title', fontWeight: '600' },
  { classes: ['hljs-string'], token: 'string' },
  { classes: ['hljs-regexp'], token: 'regexp' },
  { classes: ['hljs-number'], token: 'number' },
  { classes: ['hljs-literal'], token: 'literal' },
  { classes: ['hljs-type'], token: 'type' },
  { classes: ['hljs-built_in'], token: 'builtIn' },
  { classes: ['hljs-meta'], token: 'meta', fontWeight: '600' },
  { classes: ['hljs-attr'], token: 'attr' },
  { classes: ['hljs-attribute'], token: 'attribute' },
  { classes: ['hljs-property'], token: 'property' },
  { classes: ['hljs-variable'], token: 'variable' },
  { classes: ['hljs-params'], token: 'params' },
  { classes: ['hljs-symbol'], token: 'literal' },
  { classes: ['hljs-operator'], token: 'operator' },
  { classes: ['hljs-punctuation'], token: 'punctuation' },
  { classes: ['hljs-subst'], token: 'subst' }
];

export function applyCodeHighlighting(root, { codeTheme, styleConfig } = {}) {
  if (!root?.querySelectorAll) return null;

  const highlightTheme = getCodeHighlightTheme(codeTheme, styleConfig);
  root.querySelectorAll('.md-code-block-code').forEach((codeElement) => {
    applyHighlightThemeToCode(codeElement, highlightTheme);
  });

  return highlightTheme;
}

export function applyHighlightThemeToCode(codeElement, highlightTheme) {
  if (!codeElement || !highlightTheme) return;

  appendStyleText(codeElement, `color: ${highlightTheme.textColor};`);

  codeElement.querySelectorAll('span[class]').forEach((span) => {
    const tokenStyle = resolveTokenStyle(span.classList, highlightTheme);
    if (tokenStyle) {
      appendStyleText(span, tokenStyle);
    }
  });
}

export function serializeHighlightedCodeHtml(codeElement) {
  if (!codeElement) return '&nbsp;';

  const html = Array.from(codeElement.childNodes)
    .map((node) => serializeNode(node))
    .join('');

  return html || '&nbsp;';
}

function resolveTokenStyle(classList, highlightTheme) {
  const classes = new Set(Array.from(classList || []));

  for (const rule of TOKEN_RULES) {
    if (!rule.classes.every((className) => classes.has(className))) continue;

    const color = highlightTheme.tokens?.[rule.token] || highlightTheme.textColor;
    let style = `color: ${color};`;

    if (rule.fontWeight) {
      style += ` font-weight: ${rule.fontWeight};`;
    }

    if (rule.fontStyle) {
      style += ` font-style: ${rule.fontStyle};`;
    }

    return style;
  }

  return '';
}

function serializeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return formatTextForHtml(node.nodeValue || '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.tagName.toLowerCase();
  const style = node.getAttribute('style');
  const children = Array.from(node.childNodes)
    .map((child) => serializeNode(child))
    .join('');

  return `<${tag}${style ? ` style="${escapeAttribute(style)}"` : ''}>${children}</${tag}>`;
}

function formatTextForHtml(value) {
  return escapeHtml(
    String(value || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, '  ')
  )
    .replace(/ /g, '&nbsp;')
    .replace(/\n/g, '<br>');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function appendStyleText(element, styleText) {
  if (!styleText) return;
  const currentStyle = element.getAttribute('style') || '';
  element.setAttribute('style', currentStyle ? `${currentStyle}; ${styleText}` : styleText);
}
