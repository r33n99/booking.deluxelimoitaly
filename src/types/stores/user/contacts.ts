export interface Contact {
  id?: string | number
  temp_id?: string | number
  first_name: string
  last_name: string
  email?: string
  phone: string
  code?: string
  country_prefix?: string
  company?: string
  address?: string
  city?: string
  country?: string
  postal_code?: string
  last_usage?: string
  type_of_service?: string
  pickup?: string
  dropoff?: string
  hours?: string
  notes?: string
  [key: string]: any // For any additional properties
}

export interface ContactsStoreState {
  contactsData: Contact[]
  selectedContact: Contact | null
}

export interface ContactsStoreActions {
  select(data: Contact | null): void
  fill(data: Contact[]): void
  format_phone(phone: string, code?: string): string
  findContact(order: Partial<Contact>): Contact | undefined
  removeDuplicates(): void
  findContactByFirstName(firstName: string): boolean
  updateContact(contactData: Partial<Contact> & { id?: string | number; temp_id?: string }): boolean
  add(contact: Omit<Contact, 'id' | 'temp_id' | 'last_usage'>): void
  getLastUsage(): Contact | false
  remove(contactName: string): void
  $reset(): void
  removeNullPhone(): void
}
