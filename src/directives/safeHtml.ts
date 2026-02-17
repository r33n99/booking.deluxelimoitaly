import type { Directive, DirectiveBinding } from 'vue'
import DOMPurify from 'dompurify'

const sanitizeContent = (value: unknown): string => {
  if (typeof value !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(value)
}

const applySanitizedHtml = (el: HTMLElement, binding: DirectiveBinding<unknown>) => {
  const sanitized = sanitizeContent(binding.value)
  el.innerHTML = sanitized
}

const vSafeHtml: Directive<HTMLElement, unknown> = {
  beforeMount(el, binding) {
    applySanitizedHtml(el, binding)
  },
  updated(el, binding) {
    applySanitizedHtml(el, binding)
  }
}

export default vSafeHtml
