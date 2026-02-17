import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AsYouType } from 'libphonenumber-js'
import type { Contact } from '@/types/stores/user/contacts'

const STORE_NAME = 'contacts'
const LOCALSTORAGE_KEY = 'contacts'

export const useContactsStore = defineStore(STORE_NAME, () => {
  const defaultData: Contact[] = []

  const cleanupOldData = (): Contact[] => {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored) as Contact[]
        if (Array.isArray(data) && data.length > 0) {
          const hasExtraFields = data.some(
            (contact: Contact) =>
              contact.type_of_service || contact.pickup || contact.dropoff || contact.hours
          )
          if (hasExtraFields) {
            console.log('Cleaning up old contact data with extra fields')
            localStorage.removeItem(LOCALSTORAGE_KEY)
            return []
          }
        }
        return data
      } catch (e: any) {
        localStorage.removeItem(LOCALSTORAGE_KEY)
        console.error(e)
        return []
      }
    }
    return []
  }

  const contactsData = ref<Contact[]>(cleanupOldData())
  const selectedContact = ref<Contact | null>(null)

  const saveToStorage = (): void => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(contactsData.value))
  }

  const select = (data: Contact | null): void => {
    selectedContact.value = data
  }

  const fill = (data: Contact[]): void => {
    contactsData.value = data
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data))
  }

  const format_phone = (phone: string, code?: string): string => {
    if (!phone) return ''
    let clearedPhone = phone.replace(/[^0-9]/g, '')
    if (code) {
      const codeDigits = code.replace(/[^0-9]/g, '')
      if (clearedPhone.startsWith(codeDigits)) {
        clearedPhone = clearedPhone.substring(codeDigits.length)
      }
    }
    return clearedPhone
  }

  const findContact = (order: Partial<Contact>): Contact | undefined => {
    const searchOrder = { ...order }
    const normalizedPhone =
      typeof searchOrder.phone === 'string'
        ? format_phone(searchOrder.phone, searchOrder.code)
        : undefined

    return contactsData.value.find(
      (contact) =>
        contact.first_name === searchOrder.first_name &&
        contact.last_name === searchOrder.last_name &&
        contact.email === searchOrder.email &&
        format_phone(contact.phone, contact.code) === normalizedPhone
    )
  }

  const removeDuplicates = (): void => {
    const uniqueContacts: Contact[] = []
    const contactSet = new Set<string>()

    contactsData.value.forEach((contact) => {
      const uniqueKey = `${contact.first_name}_${contact.last_name}_${contact.email}_${contact.phone || ''}`
      if (!contactSet.has(uniqueKey)) {
        contactSet.add(uniqueKey)
        uniqueContacts.push(contact)
      }
    })

    contactsData.value = uniqueContacts
    localStorage.setItem('contacts', JSON.stringify(uniqueContacts))
  }

  const findContactByFirstName = (firstName: string): boolean => {
    return !!contactsData.value.find((contact) => contact.first_name === firstName)
  }

  const updateContact = (
    contactData: Partial<Contact> & { id?: string | number; temp_id?: string }
  ): boolean => {
    if (!contactData.id && !contactData.temp_id) {
      return false
    }

    const contactIndex = contactsData.value.findIndex(
      (contact) =>
        (contactData.id && contact.id === contactData.id) ||
        (contactData.temp_id && contact.temp_id === contactData.temp_id)
    )

    if (contactIndex === -1) {
      return false
    }

    const formatter = new AsYouType()
    const phoneValue = contactData.phone ?? ''
    formatter.input(typeof phoneValue === 'string' ? phoneValue : String(phoneValue))

    const updatedContact: Contact = {
      ...contactsData.value[contactIndex],
      ...contactData,
      phone: formatter.getNumber()?.number || contactData.phone || '',
      code: contactData.code?.replace?.('+', ''),
      last_usage: new Date().toISOString()
    }

    contactsData.value[contactIndex] = updatedContact
    saveToStorage()
    return true
  }

  const add = (contact: Omit<Contact, 'id' | 'temp_id' | 'last_usage'>): void => {
    if (!contact.first_name || !contact.last_name) {
      return
    }

    const existingContactIndex = contactsData.value.findIndex(
      (existing) =>
        existing.first_name === contact.first_name &&
        existing.last_name === contact.last_name &&
        existing.email === contact.email &&
        format_phone(existing.phone, existing.code) === format_phone(contact.phone, contact.code)
    )

    if (existingContactIndex !== -1) {
      contactsData.value[existingContactIndex].last_usage = new Date().toISOString()
    } else {
      // Если контакт не найден, добавляем новый
      let formattedPhone = ''
      let cleanedCode = ''

      if (contact.phone) {
        const formatter = new AsYouType()
        const phoneValue = contact.phone ?? ''
        formatter.input(typeof phoneValue === 'string' ? phoneValue : String(phoneValue))
        formattedPhone = formatter.getNumber()?.number || contact.phone
        cleanedCode = contact.code?.replace?.('+', '') || ''
      }

      const newContact: Contact = {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: formattedPhone,
        code: cleanedCode,
        country_prefix: contact.country_prefix,
        temp_id: Date.now(),
        last_usage: new Date().toISOString()
      }
      contactsData.value.push(newContact)
    }

    saveToStorage()
  }

  const getLastUsage = (): Contact | false => {
    if (contactsData.value.length === 0) {
      return false
    }

    return contactsData.value.reduce((a, b) => {
      const aUsage = a.last_usage || ''
      const bUsage = b.last_usage || ''
      return aUsage > bUsage ? a : b
    })
  }

  const remove = (contactName: string): void => {
    contactsData.value = contactsData.value.filter((contact) => contact.first_name !== contactName)
    saveToStorage()
  }

  const $reset = (): void => {
    localStorage.removeItem(LOCALSTORAGE_KEY)
  }

  const removeNullPhone = (): void => {
    if (contactsData.value.length) {
      contactsData.value.forEach((contact, index) => {
        if (contact.phone === null) {
          contactsData.value[index] = { ...contact, phone: '' }
        }
      })
      fill(contactsData.value)
    }
  }

  const loadDefaultValue = (): void => {
    const localStorageData = localStorage.getItem(LOCALSTORAGE_KEY)

    if (localStorageData) {
      try {
        fill(JSON.parse(localStorageData) as Contact[])
      } catch (e: any) {
        fill(defaultData)
        console.error(e.message)
      }
    } else {
      fill(defaultData)
    }
  }

  loadDefaultValue()
  removeDuplicates()

  return {
    contactsData,
    selectedContact,
    updateContact,
    removeNullPhone,
    format_phone,
    add,
    remove,
    fill,
    getLastUsage,
    select,
    findContact,
    removeDuplicates,
    $reset,
    findContactByFirstName
  }
})
