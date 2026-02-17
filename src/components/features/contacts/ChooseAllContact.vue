<template>
  <div
    :class="{ 'invisible opacity-0': !isSideBarOpen }"
    @click="sideBarStore.update(false)"
    class="fixed inset-0 left-0 top-0 z-50 flex w-screen items-end justify-end bg-black/55 bg-opacity-50 duration-300"
  >
    <div
      :class="{ 'max-lg:translate-y-full lg:translate-x-full': !isSideBarOpen }"
      @click.stop
      class="h-3/4 w-full rounded-2xl bg-[#E8EDE8] px-8 py-12 text-white duration-500 dark:bg-[#2B2D32] lg:h-full lg:w-5/12 lg:bg-white"
    >
      <div class="relative mb-11 flex items-center justify-between">
        <h2 class="text-[32px]/none font-bold text-black dark:text-white">Choose contact</h2>
        <button
          @click="sideBarStore.update(false)"
          class="absolute -right-1.5 -top-4 size-12 rounded-full border border-[#C8C8C8] bg-[#E8EDE8] text-xl text-[#5FD052] transition-all duration-[0.3s] ease-in dark:border-[#3D4043] dark:bg-background lg:-right-0.5 lg:bg-white"
        >
          ✕
        </button>
      </div>
      <div class="h-full space-y-8 overflow-y-auto pb-[50px] pr-5 text-lg">
        <div
          v-for="(contact, index) in contactsData"
          :key="index"
          class="grid gap-4 border-t-2 border-[#DDE5DC] pt-8 *:space-y-1.5 first:border-transparent first:pt-0 sm:grid-cols-2"
        >
          <div>
            <p class="text-[#878787] dark:text-[#C8C8C8]">First Name:</p>
            <p class="text-background dark:text-white">{{ contact.first_name }}</p>
          </div>
          <div>
            <p class="text-[#878787] dark:text-[#C8C8C8]">E-mail Address:</p>
            <p class="text-background dark:text-white">{{ contact.email }}</p>
          </div>
          <div>
            <p class="text-[#878787] dark:text-[#C8C8C8]">Last Name:</p>
            <p class="text-background dark:text-white">{{ contact.last_name }}</p>
          </div>
          <div>
            <p class="text-[#878787] dark:text-[#C8C8C8]">Phone number:</p>
            <p class="text-background dark:text-white">+{{ contact.code }} {{ contact.phone }}</p>
          </div>
          <!-- <button @click="contactsStore.select(contact)" :class="buttonClass(contact)" class="w-full py-2 mt-2 text-center rounded-lg text-black">Select Contact</button> -->
          <button
            @click="updateActiveContact(contact)"
            class="col-span-full mt-4 rounded-full border border-[#5FD052] p-2 text-lg font-semibold text-[#5FD052] transition-all duration-[0.3s] ease-in hover:bg-main hover:text-[#2B2D38]"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useContactsStore } from '@/stores/user/contacts'
import { useSideBarStore } from '@/stores/ui/sidebar'
import type { Contact } from '@/types/stores/user/contacts'

const contactsStore = useContactsStore()
const { contactsData, selectedContact } = storeToRefs(contactsStore)

const sideBarStore = useSideBarStore()
const { isSideBarOpen } = storeToRefs(sideBarStore)

const activeContact = ref<Contact | null>(null)

const emit = defineEmits<{
  (e: 'selectContact', contact: Contact | null): void
}>()

const updateActiveContact = (contact: Contact | null): void => {
  activeContact.value = contact
  emit('selectContact', contact)
  sideBarStore.update(false)
}

watch(selectedContact, (newSelectedContact) => {
  if (newSelectedContact) {
    updateActiveContact(newSelectedContact)
  }
})
</script>
