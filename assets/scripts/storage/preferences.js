/**
 * User preference persistence.
 * Keeps legacy keys for backward compatibility.
 * @module preferences
 */

const KEY_STYLE = 'currentStyle';
const KEY_CONTENT = 'markdownInput';
const KEY_DOCUMENTS = 'documents';
const KEY_ACTIVE_DOCUMENT_ID = 'activeDocumentId';

let saveTimer = null;

function parseJSON(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function isValidDocument(doc) {
  return !!doc
    && typeof doc.id === 'string'
    && typeof doc.title === 'string'
    && typeof doc.content === 'string'
    && typeof doc.createdAt === 'number'
    && typeof doc.updatedAt === 'number';
}

function normalizeDocuments(documents) {
  if (!Array.isArray(documents)) return [];
  return documents.filter(isValidDocument);
}

export function loadPreferences() {
  try {
    const currentStyle = localStorage.getItem(KEY_STYLE) || 'wechat-default';
    const content = localStorage.getItem(KEY_CONTENT);
    const documents = normalizeDocuments(parseJSON(localStorage.getItem(KEY_DOCUMENTS), []));
    const activeDocumentId = localStorage.getItem(KEY_ACTIVE_DOCUMENT_ID);

    return {
      currentStyle,
      content,
      documents,
      activeDocumentId
    };
  } catch (_error) {
    return {
      currentStyle: 'wechat-default',
      content: null,
      documents: [],
      activeDocumentId: null
    };
  }
}

export function saveDocuments(documents, activeDocumentId) {
  try {
    localStorage.setItem(KEY_DOCUMENTS, JSON.stringify(documents));

    if (activeDocumentId) {
      localStorage.setItem(KEY_ACTIVE_DOCUMENT_ID, activeDocumentId);
    } else {
      localStorage.removeItem(KEY_ACTIVE_DOCUMENT_ID);
    }
  } catch (_error) {
    console.error('保存文档失败');
  }
}

export function savePreferences(currentStyle, content, documents = null, activeDocumentId = null) {
  try {
    localStorage.setItem(KEY_STYLE, currentStyle);
    localStorage.setItem(KEY_CONTENT, content);

    if (Array.isArray(documents)) {
      saveDocuments(documents, activeDocumentId);
    }
  } catch (_error) {
    console.error('保存偏好失败');
  }
}

export function debounceSaveContent(payload, delay = 1000) {
  if (saveTimer) clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    try {
      if (typeof payload === 'string') {
        localStorage.setItem(KEY_CONTENT, payload);
        return;
      }

      const {
        content = '',
        documents = null,
        activeDocumentId = null
      } = payload || {};

      localStorage.setItem(KEY_CONTENT, content);

      if (Array.isArray(documents)) {
        saveDocuments(documents, activeDocumentId);
      }
    } catch (_error) {
      console.error('自动保存失败');
    }
  }, delay);
}
