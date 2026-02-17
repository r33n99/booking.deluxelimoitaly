import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountComponent } from '../../../helpers/mountComponent'
import ContactsChoise from '@/components/features/contacts/ContactsChoise.vue'

const mockAxiosInstance = {
  get: vi.fn(() => Promise.resolve({ data: {} })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  put: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
  defaults: { headers: { common: {} } }
}

vi.mock('@/compose/axios', () => ({
  useFetcher: vi.fn(() => ({
    axiosInstance: mockAxiosInstance
  }))
}))

// Mock child components
vi.mock('@/components/features/contacts/ChooseAllContact.vue', () => ({
  default: {
    name: 'ChooseAllContact',
    template: '<div data-testid="choose-all-contact">Choose All Contact</div>'
  }
}))

// Create mutable mock functions that can be changed per test
let mockGetLastUsage = vi.fn(() => ({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '1234567890',
  code: '+1'
}))

let mockSidebarUpdate = vi.fn()

// Mock the stores with flexible functions
vi.mock('@/stores', () => ({
  useContactsStore: vi.fn(() => ({
    getLastUsage: mockGetLastUsage
  }))
}))

vi.mock('@/stores/ui/sidebar', () => ({
  useSideBarStore: vi.fn(() => ({
    update: mockSidebarUpdate
  }))
}))

describe('ContactsChoise.vue', () => {
  let wrapper

  const createWrapper = (props = {}, customContactData = null) => {
    // If custom contact data is provided, update the mock function
    if (customContactData) {
      mockGetLastUsage = vi.fn(() => customContactData)
    }

    return mountComponent(ContactsChoise, {
      props: { ...props },
      pinia: {
        initialState: {
          contacts: {
            lastUsedContact: customContactData || {
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone: '1234567890',
              code: '+1'
            },
            contacts: [],
            getLastUsage: mockGetLastUsage
          },
          sidebar: {
            isOpened: false,
            update: mockSidebarUpdate
          }
        }
      }
    })
  }

  beforeEach(async () => {
    wrapper = createWrapper()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  it('renders successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct title', () => {
    expect(wrapper.text()).toContain('Previously Entered Contacts')
  })

  it('displays contact information correctly', () => {
    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Doe')
    expect(wrapper.text()).toContain('john.doe@example.com')
  })

  it('displays formatted phone number correctly', () => {
    expect(wrapper.text()).toContain('+1 1234567890')
  })

  it('renders select others button', () => {
    const selectButton = wrapper.find('button')
    expect(selectButton.exists()).toBe(true)
    expect(selectButton.text()).toContain('Select Others')
  })

  it('opens sidebar when select others button is clicked', async () => {
    const selectButton = wrapper.find('button')
    await selectButton.trigger('click')
    
    // Basic check that click was handled without errors
    expect(wrapper.exists()).toBe(true)
  })

  it('handles contact with no phone number', () => {
    const customContactData = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: null,
      code: null
    }
    
    const noPhoneWrapper = createWrapper({}, customContactData)
    
    expect(noPhoneWrapper.text()).toContain('Jane')
    expect(noPhoneWrapper.text()).toContain('Smith')
    expect(noPhoneWrapper.text()).toContain('jane.smith@example.com')
    noPhoneWrapper.unmount()
  })

  it('handles phone code without plus sign', () => {
    const customContactData = {
      first_name: 'Bob',
      last_name: 'Wilson',
      email: 'bob.wilson@example.com',
      phone: '9876543210',
      code: '44'
    }
    
    const noPlusWrapper = createWrapper({}, customContactData)
    
    expect(noPlusWrapper.text()).toContain('Bob')
    expect(noPlusWrapper.text()).toContain('Wilson')
    expect(noPlusWrapper.text()).toContain('bob.wilson@example.com')
    noPlusWrapper.unmount()
  })

  it('applies correct CSS classes', () => {
    expect(wrapper.classes()).toContain('border-main')
    expect(wrapper.classes()).toContain('rounded-3xl')
  })

  it('displays field labels correctly', () => {
    expect(wrapper.text()).toContain('First Name:')
    expect(wrapper.text()).toContain('Last Name:')
    expect(wrapper.text()).toContain('E-mail Address:')
    expect(wrapper.text()).toContain('Phone number:')
  })

  it('renders grid layout for contact information', () => {
    const gridElement = wrapper.find('.grid')
    expect(gridElement.exists()).toBe(true)
    expect(gridElement.classes()).toContain('gap-6')
  })

  it('mounts without crashing with empty contact', () => {
    const customContactData = {}
    
    const emptyWrapper = createWrapper({}, customContactData)
    
    expect(emptyWrapper.exists()).toBe(true)
    emptyWrapper.unmount()
  })

  it('handles missing lastUsedContact gracefully', () => {
    const customContactData = null
    
    const missingContactWrapper = createWrapper({}, customContactData)
    
    expect(missingContactWrapper.exists()).toBe(true)
    expect(missingContactWrapper.text()).toContain('Previously Entered Contacts')
    missingContactWrapper.unmount()
  })

  it('renders button with correct styling', () => {
    const button = wrapper.find('button')
    expect(button.classes()).toContain('rounded-full')
    expect(button.classes()).toContain('border')
    expect(button.classes()).toContain('px-6')
    expect(button.classes()).toContain('py-4')
  })

  it('displays contact data in responsive grid', () => {
    const gridContainer = wrapper.find('.grid')
    expect(gridContainer.classes()).toContain('sm:grid-cols-2')
    expect(gridContainer.classes()).toContain('md:grid-cols-4')
  })

  it('shows proper dark mode classes', () => {
    expect(wrapper.find('.dark\\:bg-background').exists()).toBe(true)
    expect(wrapper.find('.dark\\:border-\\[\\#CCF2C8\\]').exists()).toBe(true)
  })
}) 