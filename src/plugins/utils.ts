import dayjs from 'dayjs'

export default {
  isEmpty: (v: any, zeroIsEmpty = false) => {
    /**
     * typeof null === object - first step
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#typeof_null
     */
    if (v === null) {
      return true
    }

    if (v === true) {
      return false
    }

    if (typeof v === 'object') {
      return !Object.keys(v).length
    }

    if (!isNaN(parseFloat(v)) && isFinite(v)) {
      return zeroIsEmpty ? parseFloat(v) === 0 : false
    }

    return !v || !v.length || v.length < 1
  },
  dateFormat: (date: string) => {
    return dayjs(date).format('DD/MM/YYYY H:mm')
  },
  isLetter: (e: any) => {
    if (!/^[0-9]+$/.test(e.data)) return true
    else e.preventDefault()
  },

  isNumber: (e: any) => {
    if (/^[+0-9]+$/.test(e.data) || e.data === null || /^[+0-9]+$/.test(e.key) || e.key === null)
      return true
    else e.preventDefault()
  }
}
