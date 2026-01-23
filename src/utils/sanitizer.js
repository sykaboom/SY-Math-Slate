/**
 * Sanitizes raw HTML string to prevent XSS.
 *
 * Rules:
 * 1. Allow strictly listed tags only.
 * 2. Strip <script>, <iframe>, <object>, <embed>, <form> tags entirely.
 * 3. Remove 'javascript:' URIs in href/src.
 * 4. Remove all 'on*' event attributes.
 * 5. Encode entities as needed while preserving safe HTML structure.
 *
 * @param {string} rawHtml - The potentially malicious HTML string.
 * @returns {string} - The sanitized, safe HTML string.
 */
export function sanitizeHTML(rawHtml) {
  if (typeof rawHtml !== 'string') return '';

  const len = rawHtml.length;
  let i = 0;
  let output = '';
  const blockedStack = [];

  while (i < len) {
    const lt = rawHtml.indexOf('<', i);
    if (lt === -1) {
      if (blockedStack.length === 0) {
        output += escapeText(rawHtml.slice(i));
      }
      break;
    }

    if (blockedStack.length === 0 && lt > i) {
      output += escapeText(rawHtml.slice(i, lt));
    }
    i = lt;

    if (rawHtml.startsWith('<!--', i)) {
      const end = rawHtml.indexOf('-->', i + 4);
      if (end === -1) break;
      i = end + 3;
      continue;
    }

    if (rawHtml.startsWith('<!', i) && !rawHtml.startsWith('<!--', i)) {
      const end = rawHtml.indexOf('>', i + 2);
      if (end === -1) break;
      i = end + 1;
      continue;
    }

    if (rawHtml.startsWith('<?', i)) {
      const end = rawHtml.indexOf('>', i + 2);
      if (end === -1) break;
      i = end + 1;
      continue;
    }

    const parsed = parseTag(rawHtml, i);
    if (!parsed) {
      if (blockedStack.length === 0) output += '&lt;';
      i += 1;
      continue;
    }

    i = parsed.endIndex;
    const tagName = parsed.tagName.toLowerCase();

    if (BLOCKED_TAGS.has(tagName)) {
      if (parsed.isClosing) {
        popBlocked(blockedStack, tagName);
      } else if (!parsed.isSelfClosing) {
        blockedStack.push(tagName);
      }
      continue;
    }

    if (blockedStack.length > 0) {
      continue;
    }

    if (!ALLOWED_TAGS.has(tagName)) {
      continue;
    }

    if (parsed.isClosing) {
      if (!VOID_TAGS.has(tagName)) {
        output += `</${tagName}>`;
      }
      continue;
    }

    const attrString = buildAttributeString(tagName, parsed.attributes);
    if (VOID_TAGS.has(tagName) || parsed.isSelfClosing) {
      output += `<${tagName}${attrString}>`;
    } else {
      output += `<${tagName}${attrString}>`;
    }
  }

  return output;
}

const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'br',
  'div',
  'em',
  'i',
  'img',
  'li',
  'math',
  'mjx-container',
  'mfrac',
  'mi',
  'mn',
  'mo',
  'mrow',
  'msqrt',
  'msub',
  'msup',
  'ol',
  'p',
  'semantics',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]);

const VOID_TAGS = new Set(['br', 'img']);

const BLOCKED_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'form']);

const GLOBAL_ATTRS = new Set(['class', 'id', 'style', 'title', 'aria-label', 'aria-hidden', 'role']);

const TAG_ATTRS = {
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading']),
};

const ALLOWED_ATTRS_BY_TAG = buildAllowedAttrsByTag();

const ESCAPE_TEXT_RE = /[&<>]/g;
const ESCAPE_ATTR_RE = /[&<>"']/g;

function escapeText(text) {
  return text.replace(ESCAPE_TEXT_RE, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      default:
        return ch;
    }
  });
}

function escapeAttribute(value) {
  return value.replace(ESCAPE_ATTR_RE, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return ch;
    }
  });
}

function buildAllowedAttrsByTag() {
  const map = {};
  for (const tag of ALLOWED_TAGS) {
    const allowed = new Set(GLOBAL_ATTRS);
    const extra = TAG_ATTRS[tag];
    if (extra) {
      for (const attr of extra) allowed.add(attr);
    }
    map[tag] = allowed;
  }
  return map;
}

function buildAttributeString(tagName, attributes) {
  const allowed = ALLOWED_ATTRS_BY_TAG[tagName];
  if (!allowed || attributes.length === 0) return '';

  const attrMap = new Map();
  const order = [];
  let rawTarget = null;
  let rawRel = null;

  for (const attr of attributes) {
    if (!attr || !attr.name) continue;
    const name = attr.name.toLowerCase();
    if (name.startsWith('on')) continue;
    if (!allowed.has(name)) continue;

    let value = attr.value == null ? '' : String(attr.value);
    value = value.replace(/[\u0000-\u001F\u007F]/g, '');

    if ((name === 'href' || name === 'src') && isUnsafeUrl(value)) {
      continue;
    }

    if (name === 'target') rawTarget = value;
    if (name === 'rel') rawRel = value;

    const safeValue = escapeAttribute(value);
    if (!attrMap.has(name)) order.push(name);
    attrMap.set(name, safeValue);
  }

  if (tagName === 'a' && rawTarget && rawTarget.trim().toLowerCase() === '_blank') {
    const relTokens = new Set(
      (rawRel || '')
        .split(/\s+/)
        .map((t) => t.toLowerCase())
        .filter(Boolean),
    );
    relTokens.add('noopener');
    relTokens.add('noreferrer');
    const relValue = escapeAttribute(Array.from(relTokens).join(' '));
    if (!attrMap.has('rel')) order.push('rel');
    attrMap.set('rel', relValue);
  }

  let out = '';
  for (const name of order) {
    const value = attrMap.get(name);
    out += ` ${name}="${value}"`;
  }
  return out;
}

function isUnsafeUrl(value) {
  const compact = value.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
  return compact.startsWith('javascript:');
}

function parseTag(input, startIndex) {
  const len = input.length;
  let i = startIndex + 1;
  if (i >= len) return null;

  let isClosing = false;
  if (input[i] === '/') {
    isClosing = true;
    i += 1;
  }

  const nameStart = i;
  while (i < len && /[A-Za-z0-9:-]/.test(input[i])) i += 1;
  if (i === nameStart) return null;

  const tagName = input.slice(nameStart, i);
  const attributes = [];
  let isSelfClosing = false;

  while (i < len) {
    while (i < len && /\s/.test(input[i])) i += 1;
    if (i >= len) return null;

    if (input[i] === '>') {
      i += 1;
      break;
    }

    if (input[i] === '/' && input[i + 1] === '>') {
      isSelfClosing = true;
      i += 2;
      break;
    }

    const attrNameStart = i;
    while (i < len && /[^\s=/>]/.test(input[i])) i += 1;
    const attrName = input.slice(attrNameStart, i);
    if (!attrName) {
      i += 1;
      continue;
    }

    while (i < len && /\s/.test(input[i])) i += 1;

    let attrValue = null;
    if (input[i] === '=') {
      i += 1;
      while (i < len && /\s/.test(input[i])) i += 1;
      if (i >= len) {
        attrValue = '';
        break;
      }

      const quote = input[i];
      if (quote === '"' || quote === "'") {
        i += 1;
        const valueStart = i;
        while (i < len && input[i] !== quote) i += 1;
        attrValue = input.slice(valueStart, i);
        if (input[i] === quote) i += 1;
      } else {
        const valueStart = i;
        while (i < len && /[^\s>]/.test(input[i])) i += 1;
        attrValue = input.slice(valueStart, i);
      }
    }

    attributes.push({ name: attrName, value: attrValue });
  }

  return { tagName, isClosing, isSelfClosing, attributes, endIndex: i };
}

function popBlocked(stack, tagName) {
  for (let idx = stack.length - 1; idx >= 0; idx -= 1) {
    if (stack[idx] === tagName) {
      stack.length = idx;
      return;
    }
  }
}
