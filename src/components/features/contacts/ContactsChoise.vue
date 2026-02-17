<template>
  <div
    class="mb-6 rounded-3xl border border-main bg-[#E8EDE8]/50 px-5 py-8 text-white dark:border-[#CCF2C8] dark:bg-background"
  >
    <h1 class="mb-5 text-black dark:text-white lg:text-2xl lg:font-semibold">
      Previously Entered Contacts
    </h1>
    <div class="flex justify-between gap-6 max-lg:flex-col lg:items-center">
      <div>
        <template v-if="lastUsedContact">
          <div class="grid gap-6 *:space-y-1.5 sm:grid-cols-2 md:grid-cols-4 lg:gap-12 xl:text-lg">
            <div>
              <p class="text-[#878787] dark:text-[#C8C8C8]">First Name:</p>
              <p class="break-words text-background dark:text-white">
                {{ lastUsedContact.first_name }}
              </p>
            </div>
            <div>
              <p class="text-[#878787] dark:text-[#C8C8C8]">Last Name:</p>
              <p class="break-words text-background dark:text-white">
                {{ lastUsedContact.last_name }}
              </p>
            </div>
            <div>
              <p class="text-[#878787] dark:text-[#C8C8C8]">E-mail Address:</p>
              <p class="break-words text-background dark:text-white">
                {{ lastUsedContact.email ?? 'No contact available' }}
              </p>
            </div>
            <div>
              <p class="text-[#878787] dark:text-[#C8C8C8]">Phone number:</p>
              <p class="flex break-words text-background dark:text-white">
                {{
                  lastUsedContact.code && lastUsedContact.phone
                    ? lastUsedContact.code.startsWith('+')
                      ? `${lastUsedContact.code} ${lastUsedContact.phone}`
                      : `+${lastUsedContact.code} ${lastUsedContact.phone}`
                    : 'No contact available'
                }}
              </p>
            </div>
          </div>
        </template>
        <p v-else class="text-[#878787] dark:text-[#C8C8C8]">No previously used contact found.</p>
      </div>
      <div class="flex space-x-4">
        <button
          @click="sideBarStore.update(true)"
          class="w-full rounded-full border border-[#878787] px-6 py-4 font-semibold text-background transition-all duration-[0.3s] ease-in hover:bg-[#D3D3D3] dark:border-[#C8C8C8] dark:text-white dark:hover:bg-[#636363] lg:w-max lg:py-5 lg:text-lg"
        >
          Select Others
        </button>
      </div>
      <teleport to="body">
        <ChooseAllContact @selectContact="selectContact($event)" />
      </teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, isRef } from 'vue'
import ChooseAllContact from './ChooseAllContact.vue'
import { useSideBarStore } from '@/stores/ui/sidebar'
import { useContactsStore } from '@/stores/user/contacts'
import type { Contact } from '@/types/stores/user/contacts'

const sideBarStore = useSideBarStore()
const contactsStore = useContactsStore()

interface ContactsStoreLike {
  contactsData?: unknown
  selectedContact?: unknown
  lastUsedContact?: unknown
  $state?: {
    contactsData?: unknown
    selectedContact?: unknown
    lastUsedContact?: unknown
  }
}

const emit = defineEmits<{
  (e: 'getContact', contact: Contact | null): void
}>()

const lastUsedContact = ref<Contact | null>(null)

const extractContactArray = (source: unknown): Contact[] => {
  if (!source) {
    return []
  }

  if (isRef(source)) {
    return Array.isArray(source.value) ? source.value : []
  }

  return Array.isArray(source) ? source : []
}

const extractContact = (source: unknown): Contact | null => {
  if (!source) {
    return null
  }

  if (isRef(source)) {
    return (source.value as Contact | null) ?? null
  }

  return (source as Contact) ?? null
}

const resolveInitialContact = (): Contact | null => {
  const recent =
    typeof contactsStore.getLastUsage === 'function' ? contactsStore.getLastUsage() : null
  if (recent) {
    return recent
  }

  const storeSnapshot = contactsStore as unknown as ContactsStoreLike

  const selected = extractContact(storeSnapshot.selectedContact)
  if (selected) {
    return selected
  }

  const contacts = extractContactArray(storeSnapshot.contactsData)
  if (contacts.length) {
    return contacts[0]
  }

  const fallbackFromState = extractContact(storeSnapshot.lastUsedContact)
  if (fallbackFromState) {
    return fallbackFromState
  }

  const stateSnapshot = storeSnapshot.$state

  if (stateSnapshot) {
    const stateSelected = extractContact(stateSnapshot.selectedContact)
    if (stateSelected) {
      return stateSelected
    }

    const stateContacts = extractContactArray(stateSnapshot.contactsData)
    if (stateContacts.length) {
      return stateContacts[0]
    }

    const stateLastUsed = extractContact(stateSnapshot.lastUsedContact)
    if (stateLastUsed) {
      return stateLastUsed
    }
  }

  return contacts.length ? contacts[0] : null
}

onBeforeMount(() => {
  const fallbackContact = resolveInitialContact()

  if (fallbackContact) {
    lastUsedContact.value = fallbackContact
    emit('getContact', fallbackContact)
  }
})

const selectContact = (contact: Contact | null): void => {
  if (contact) {
    lastUsedContact.value = contact
    emit('getContact', contact)
  } else {
    lastUsedContact.value = null
    emit('getContact', null)
  }
}
</script>
