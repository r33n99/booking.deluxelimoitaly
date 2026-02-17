<template>
  <Form
    @submit="onFormSubmit"
    class="form"
    :validation-schema="contactDataSchema"
    v-slot="{ errors, isSubmitting }"
  >
    <span v-if="isSubmitting">
      {{ errorFill(errors) }}
    </span>
    <div
      v-if="!utils.isEmpty(errorOnForm) && isShowModal"
      @click="closeModal"
      class="defaultModal fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4"
    >
      <div @click.stop class="wrapper h-max w-full max-w-2xl rounded-lg">
        <div class="flex justify-end p-4">
          <button
            @click="closeModal"
            aria-label="close"
            class="closeButton inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400"
            type="button"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                fill-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div class="p-6 pt-0">
          <p v-for="error in errors" :key="error">{{ error }}</p>
        </div>
        <div class="border-t border-gray-600 p-6">
          <button
            @click="closeModal"
            type="button"
            class="rounded-[37px] bg-main px-5 py-2.5 text-center text-background"
          >
            Ok
          </button>
        </div>
      </div>
    </div>

    <div
      class="font-['Basier Circle'] relative w-full flex-col items-start justify-start gap-10 pt-10 font-normal text-white md:inline-flex"
    >
      <div class="flex w-full items-center justify-between">
        <div
          class="data_header mb-3 text-[40px] font-bold leading-none text-background dark:text-white md:text-[80px]"
        >
          {{
            needInvoice === 'Company or Fiscal Entity that requires and invoice'
              ? 'Account Data'
              : 'Contact Data Required'
          }}
        </div>
        <p class="shrink-0 text-black dark:text-white">
          Step
          <span class="text-main">4</span>
          of 5
        </p>
      </div>
      <div class="data_description">
        <!-- "Dear {{ orderData.first_name }} {{ orderData.last_name }}, thank you very much, we have
        received your payment of Euro {{ orderData.amount ?? orderData.total }}. Please complete the required fields ()
        below. Sharing additional details helps us personalize your experience and offer relevant
        support in the future" -->
        "Complete the required fields (*) below. Sharing additional details helps us personalize
        your experience and offer relevant support in the future"
      </div>
      <div class="mb-6 inline-flex w-full items-center justify-between gap-x-3">
        <div class="relative h-2 w-full">
          <div
            class="absolute left-0 top-0 h-2 w-full rounded-[99px] bg-dark_main/20 dark:bg-[#3D4043]"
          ></div>
          <div
            class="dgt-theme rlt-theme absolute left-0 top-0 h-2 w-3/5 rounded-[99px] bg-main"
          ></div>
        </div>
        <div
          class="dgt-theme-progress rlt-theme-progress shrink-0 text-center font-bold leading-snug text-main md:text-xl"
        >
          60 %
        </div>
      </div>
      <div
        class="flex flex-col items-start justify-start gap-4 self-stretch rounded-[40px] bg-white px-4 pb-3 pt-6 dark:bg-[#333639] sm:p-8"
      >
        <div class="text-base leading-relaxed text-background dark:text-white md:text-2xl">
          Account data
        </div>
        <div class="flex w-full flex-col gap-4 md:flex-row">
          <div class="w-full md:max-w-44">
            <Field name="title" v-model="profile.title">
              <div class="relative">
                <div
                  @click="toggleDropdown"
                  class="flex w-full cursor-pointer items-center justify-between rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                >
                  <p v-if="!profile.title" class="text-[#878787]">
                    Select <span class="text-[#E30000]">*</span>
                  </p>
                  <p v-else>{{ profile.title }}</p>
                  <img class="dark:invert" src="@/assets/dli/images/select_arrow.png" alt="" />
                </div>
                <div
                  v-if="isOpen"
                  class="absolute z-10 mt-2 h-max w-full space-y-1 rounded-[20px] border border-[#878787] bg-[#F4F6F3] px-3 py-5 text-sm text-[#878787] dark:border-[#3D4043] dark:bg-background"
                >
                  <div
                    v-for="option in options"
                    :key="option"
                    @click="selectOption(option)"
                    class="cursor-pointer rounded-full p-3 hover:bg-[#CCF2C8] hover:text-background dark:hover:bg-[#CCF2C8]/5 dark:hover:text-white"
                    :class="{
                      'pointer-events-none !cursor-default bg-[#CCF2C8] text-background dark:bg-[#CCF2C8]/5 dark:text-white':
                        profile.title === option
                    }"
                  >
                    {{ option }}
                  </div>
                </div>
              </div>
            </Field>
          </div>
          <Field name="first_name" v-model="profile.first_name">
            <input
              v-model="profile.first_name"
              placeholder="First name*"
              class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
            />
          </Field>
          <Field name="last_name" v-model="profile.last_name">
            <input
              v-model="profile.last_name"
              placeholder="Last name*"
              class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
            />
          </Field>
        </div>
        <div class="w-full">
          <div class="mb-4 flex flex-col gap-4 lg:flex-row">
            <Field name="mailing_country" v-model="selectedCountry">
              <select
                v-model="selectedCountry"
                @change="changeCountry"
                class="max-h-[60px] w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg lg:w-1/4"
              >
                <option v-for="(val, index) of countries" :key="index">{{ val }}</option>
              </select>
            </Field>
            <input
              v-model="profile.mailing_city"
              @blur="cityChanged"
              type="text"
              placeholder="City"
              class="max-h-[60px] w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg lg:w-1/4"
            />
            <div class="ym-record-keys max-h-[60px] w-full rounded-[53px] lg:w-2/3" maxlength="230">
              <vue-tel-input
                ref="mainTelInputRef"
                v-model="profile.phone"
                @country-changed="(country: CountryOption) => safeCountryChanged(country, 'main')"
                @onInput="
                  (formatted: string, object: VueTelInputEvent) =>
                    safePhoneChange(formatted, object, 'main')
                "
                @focus="safeToggleVisibilityOfDialCode('focus', mainTelInputRef)"
                @blur="safeToggleVisibilityOfDialCode('blur', mainTelInputRef)"
                v-on:beforeinput="validPhone($event, country_prefix)"
                class="vue-tel-input pl-25 border !border-[#878787] !bg-[#E8EDE8]/50 text-sm text-background placeholder:text-[#878787] dark:!border-[#3D4043] dark:!bg-background dark:!text-white md:text-lg"
                placeholder="Enter a phone number"
                v-bind="bindProps"
              ></vue-tel-input>
            </div>
            <div class="w-full lg:w-2/3">
              <span class="data_text">Indicate if Chats Services are used on this number</span>
              <div class="mt-3 flex flex-wrap gap-5" translate="no">
                <label class="inline-flex cursor-pointer items-center">
                  <input
                    v-model="profile.isWhatsApp"
                    @change="checkTurnMessengers"
                    type="checkbox"
                    value=""
                    class="peer sr-only"
                  />
                  <input type="checkbox" value="" class="peer sr-only" />
                  <div
                    class="peer relative h-6 w-11 rounded-full bg-[#F4F6F3] outline outline-2 outline-[#898989] after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-[#878787] after:bg-[#878787] after:transition-all after:content-[''] peer-checked:bg-main/45 peer-checked:outline-main peer-checked:after:translate-x-full peer-checked:after:border-main peer-checked:after:bg-main dark:bg-background dark:after:border-[#E5E5EA] dark:after:bg-[#E5E5EA] rtl:peer-checked:after:-translate-x-full"
                  ></div>
                  <span class="data_invoice-span">WhatsApp</span>
                </label>
                <label class="inline-flex cursor-pointer items-center">
                  <input
                    v-model="profile.isTelegram"
                    @change="checkTurnMessengers"
                    type="checkbox"
                    value=""
                    class="peer sr-only"
                  />
                  <div
                    class="peer relative h-6 w-11 rounded-full bg-[#F4F6F3] outline outline-2 outline-[#898989] after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-[#878787] after:bg-[#878787] after:transition-all after:content-[''] peer-checked:bg-main/45 peer-checked:outline-main peer-checked:after:translate-x-full peer-checked:after:border-main peer-checked:after:bg-main dark:bg-background dark:after:border-[#E5E5EA] dark:after:bg-[#E5E5EA] rtl:peer-checked:after:-translate-x-full"
                  ></div>
                  <span class="data_invoice-span">Telegram</span>
                </label>
                <div class="flex cursor-pointer items-center">
                  <input
                    id="default-radio-2"
                    type="radio"
                    v-model="noField"
                    v-bind:checked="noField"
                    @change="(e: Event) => checkTurnMessengers(e, true)"
                    value=""
                    name="default-radio"
                    class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-[#898989] bg-transparent text-main"
                  />
                  <label for="default-radio-2" class="data_invoice-span cursor-pointer">No</label>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full md:flex md:gap-4">
            <div class="ym-record-keys mb-4 w-full rounded-[53px] lg:w-1/3" maxlength="230">
              <vue-tel-input
                ref="otherTelInputRef"
                v-model="profile.other_phone"
                @country-changed="(country: CountryOption) => safeCountryChanged(country, 'other')"
                @onInput="
                  (formatted: string, object: VueTelInputEvent) =>
                    safePhoneChange(formatted, object, 'other')
                "
                @focus="safeToggleVisibilityOfDialCode('focus', otherTelInputRef)"
                @blur="safeToggleVisibilityOfDialCode('blur', otherTelInputRef)"
                v-on:beforeinput="validPhone($event, country_prefix_other)"
                class="vue-tel-input pl-25 border !border-[#878787] !bg-[#E8EDE8]/50 text-sm text-background placeholder:text-[#878787] dark:!border-[#3D4043] dark:!bg-background dark:text-white md:text-lg"
                v-bind="bindPropsOther"
              ></vue-tel-input>
            </div>
            <div class="ym-record-keys mb-4 w-full rounded-[53px] lg:w-1/3" maxlength="230">
              <vue-tel-input
                ref="homeTelInputRef"
                v-model="profile.home_phone"
                @country-changed="(country: CountryOption) => safeCountryChanged(country, 'home')"
                @onInput="
                  (formatted: string, object: VueTelInputEvent) =>
                    safePhoneChange(formatted, object, 'home')
                "
                @focus="safeToggleVisibilityOfDialCode('focus', homeTelInputRef)"
                @blur="safeToggleVisibilityOfDialCode('blur', homeTelInputRef)"
                v-on:beforeinput="validPhone($event, country_prefix_home)"
                class="vue-tel-input pl-25 border !border-[#878787] !bg-[#E8EDE8]/50 text-sm text-background placeholder:text-[#878787] dark:!border-[#3D4043] dark:!bg-background dark:text-white md:text-lg"
                v-bind="bindPropsHome"
              ></vue-tel-input>
            </div>
            <div class="ym-record-keys mb-4 w-full rounded-[53px] lg:w-1/3" maxlength="230">
              <vue-tel-input
                ref="officeTelInputRef"
                v-model="profile.office_phone"
                @country-changed="(country: CountryOption) => safeCountryChanged(country, 'office')"
                @onInput="
                  (formatted: string, object: VueTelInputEvent) =>
                    safePhoneChange(formatted, object, 'office')
                "
                @focus="safeToggleVisibilityOfDialCode('focus', officeTelInputRef)"
                @blur="safeToggleVisibilityOfDialCode('blur', officeTelInputRef)"
                v-on:beforeinput="validPhone($event, country_prefix_office)"
                class="vue-tel-input pl-25 border !border-[#878787] !bg-[#E8EDE8]/50 text-sm text-background placeholder:text-[#878787] dark:!border-[#3D4043] dark:!bg-background dark:text-white md:text-lg"
                v-bind="bindPropsOffice"
              ></vue-tel-input>
            </div>
          </div>
          <span class="data_text">
            We will try to avoid calling and disturbing you while you travel with us, but if really
            necessary, please tell us what you consider need and wanted in regards to receiving
            phone calls from us.
          </span>
          <input
            v-model="profile.more_information"
            type="text"
            placeholder="More information"
            class="my-2 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
          />
          <Field name="website" v-slot="{ field }">
            <input
              v-model="profile.website"
              v-bind="field"
              type="text"
              placeholder="Client web site here, please enter the completeURL such as mysite.com or the like"
              class="mb-2 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
            />
          </Field>
          <span class="data_text">
            If you wish, please indicate the web site or sites which you feel it would be
            appropriate that we consult to better understand who you are
          </span>
        </div>
        <form action="" class="w-full">
          <div class="my-2 flex flex-col gap-6 md:my-4 md:content-center">
            <span class="data_invoice-header">What fiscal documents should we issue?</span>
            <div class="flex flex-col gap-4 lg:flex-row">
              <div class="flex cursor-pointer items-center gap-3">
                <input
                  id="simple-receipt-to-private-person"
                  type="radio"
                  value="Simple receipt to Private Person"
                  name="invoice-radio"
                  class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-[#898989] bg-transparent text-main"
                  @change="onInvoiceTypeChange"
                  v-model="needInvoice"
                />
                <label
                  for="simple-receipt-to-private-person"
                  class="cursor-pointer text-sm text-background dark:text-white"
                  >Simple receipt to Private Person</label
                >
              </div>
              <div class="flex cursor-pointer items-center gap-3">
                <input
                  id="company-or-fiscal-entity"
                  type="radio"
                  value="Company or Fiscal Entity that requires and invoice"
                  name="invoice-radio"
                  class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-[#898989] bg-transparent text-main"
                  v-model="needInvoice"
                />
                <label
                  for="company-or-fiscal-entity"
                  class="cursor-pointer text-sm text-background dark:text-white"
                  >Company or Fiscal Entity that requires and invoice</label
                >
              </div>
              <div class="flex cursor-pointer items-center gap-3">
                <input
                  id="no-invoice"
                  type="radio"
                  value=""
                  name="invoice-radio"
                  class="radio-dgt radio-rlt h-6 w-6 cursor-pointer border border-[#898989] bg-transparent text-main"
                  v-model="needInvoice"
                />
                <label
                  for="no-invoice"
                  class="cursor-pointer text-sm text-background dark:text-white"
                  >No</label
                >
              </div>
            </div>
          </div>
          <div v-if="needInvoice === 'Simple receipt to Private Person'" class="mt-8 md:mt-11">
            <span class="text-background dark:text-white">Personal Address</span>
            <div class="mt-6">
              <span class="data_text">
                Adress is optional, we may use it in case we run campains on your areas or to send
                you goodwill promotional items
              </span>
              <div class="mt-4 w-full md:flex md:gap-4 md:text-lg">
                <input
                  v-model="profile.mailing_street"
                  type="text"
                  placeholder="Mailing Address"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg lg:w-2/3"
                />
                <input
                  v-model="profile.mailing_city"
                  @blur="cityChanged"
                  type="text"
                  placeholder="City"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg lg:w-1/3"
                />
                <input
                  v-model="profile.mailing_zip"
                  type="text"
                  placeholder="Postal / Zip Code"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg lg:w-1/3"
                />
              </div>
              <div class="md:flex md:gap-4">
                <input
                  v-model="profile.mailing_state"
                  type="text"
                  placeholder="State/Region/Province"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg"
                />
                <input
                  v-model="profile.mailing_country"
                  type="text"
                  placeholder="Country"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg"
                />
                <input
                  v-model="profile.address_notes"
                  type="text"
                  placeholder="Notes on this Address"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg"
                />
              </div>
              <div class="md:flex md:gap-4"></div>
            </div>
          </div>
          <div
            v-if="needInvoice === 'Company or Fiscal Entity that requires and invoice'"
            class="mt-8 md:mt-11"
          >
            <span class="data_invoice-header">Commercial data</span>
            <div class="mt-4">
              <div class="w-full md:flex md:gap-4">
                <input
                  v-model="profile.company_name"
                  type="text"
                  placeholder="Company Name*"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg lg:w-2/5"
                />
                <input
                  v-model="profile.invoice_address"
                  type="text"
                  placeholder="Street Address*"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg lg:w-2/5"
                />
                <input
                  v-model="profile.invoice_zip"
                  type="text"
                  placeholder="Postal / Zip Code*"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg lg:w-1/5"
                />
              </div>
              <div class="md:flex md:gap-4">
                <input
                  v-model="profile.invoice_city"
                  type="text"
                  placeholder="City (Legal Address)*"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg"
                />
                <input
                  v-model="profile.invoice_state"
                  type="text"
                  placeholder="State/Region/Province*"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg"
                />
                <input
                  v-model="profile.invoice_country"
                  type="text"
                  placeholder="Country of Establishment*"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg"
                />
              </div>
              <div class="md:flex md:gap-4">
                <input
                  v-model="profile.invoice_code"
                  type="text"
                  placeholder="Fiscal code"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg"
                />
                <input
                  v-model="profile.invoice_vat"
                  type="text"
                  placeholder="VAT"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg"
                />
                <input
                  v-model="profile.address_notes"
                  type="text"
                  placeholder="Notes on this Address"
                  class="mb-4 w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:grow md:text-lg"
                />
              </div>
            </div>
          </div>
        </form>
        <button
          class="button dgt-theme-btn rlt-theme-btn inline-flex h-16 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[37px] bg-main px-4 py-3"
          type="submit"
        >
          <div
            data-testid="contactDataPage-button"
            class="text-base font-semibold leading-tight text-background md:text-lg"
          >
            Go to next step
          </div>
        </button>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  inject,
  watch,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  computed,
  isRef,
  nextTick,
  type Ref
} from 'vue'
import * as yup from 'yup'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useContactsStore, useProfileCompletionStore, useUserStore } from '@/stores/user'
import type { Contact } from '@/types/stores/user/contacts'
import type { CountryCode } from 'libphonenumber-js'

// Cache for AsYouType - dynamically loaded
let AsYouTypeClass: typeof import('libphonenumber-js').AsYouType | null = null
import { Field, Form, type SubmissionHandler } from 'vee-validate'
import { validPhone } from '@/plugins/validPhone'
import { useOrderStore } from '@/stores/ride/order'
import { trackGtmEvent } from '@/utils/gtm'
import { countries } from '@/constants'

import type {
  ContactProfile,
  ContactDataFormValues,
  UtilsInjected,
  InvoiceType,
  MessengerType,
  VueTelInputEvent,
  VueTelInputRef,
  CountryOption
} from '@/types/pages/account/ContactData'

const utils = inject<UtilsInjected>('utils')
if (!utils) {
  throw new Error('Utils plugin is not provided')
}

const needInvoice = ref<InvoiceType | ''>('')
const profileCompletionStore = useProfileCompletionStore()
const orderStore = useOrderStore()
const contactStore = useContactsStore()
const userStore = useUserStore()
const router = useRouter()
const { selectedContact } = storeToRefs(contactStore)

const { orderData } = storeToRefs(orderStore)
const { profile: profileRef } = storeToRefs(profileCompletionStore)
const { isLoggedIn } = storeToRefs(userStore)
const { contactsData } = storeToRefs(contactStore)

const profile = profileRef as Ref<ContactProfile>
const contactsList = contactsData as Ref<ContactProfile[]>

const selectedCountry = ref<string>('')
const mainTelInputRef = ref<VueTelInputRef | null>(null)
const otherTelInputRef = ref<VueTelInputRef | null>(null)
const homeTelInputRef = ref<VueTelInputRef | null>(null)
const officeTelInputRef = ref<VueTelInputRef | null>(null)

const code = ref<string | null>(null)
const noField = ref<boolean>(true)
const country_prefix = ref<string | null>(null)
const country_prefix_home = ref<string | null>(null)
const country_prefix_office = ref<string | null>(null)
const country_prefix_other = ref<string | null>(null)
const isShowModal = ref<boolean>(true)
const errorOnForm = ref<Partial<Record<string, string | undefined>> | null>(null)
const isMounted = ref<boolean>(false)
const isUnmounting = ref<boolean>(false)

const errorFill = (errorBag: Partial<Record<string, string | undefined>> | null): void => {
  errorOnForm.value = errorBag
}

watch(errorOnForm, (newVal) => {
  if (newVal && !utils.isEmpty(newVal)) {
    isShowModal.value = true
  } else {
    isShowModal.value = false
  }
})

const options: string[] = ['Mr.', 'Ms.', 'Mrs.', 'Miss', 'Mx.', 'Dr.', 'Prof.']
const isOpen = ref<boolean>(false)

const country = ref<string>('')

const contact = computed<Partial<ContactProfile> | undefined>(
  () => contactsList.value?.[contactsList.value.length - 1]
)

const stopContactWatcher = watch(
  contact,
  (newContact) => {
    // Don't update if component is unmounting
    if (isUnmounting.value) {
      return
    }

    if (newContact) {
      // Update first_name and last_name if available
      if (newContact.first_name) {
        profile.value.first_name = newContact.first_name
      }
      if (newContact.last_name) {
        profile.value.last_name = newContact.last_name
      }
      if (newContact.code) {
        profile.value.code = newContact.code
      }

      // Handle phone: ensure it's always a string
      if (newContact.phone !== null && newContact.phone !== undefined) {
        profile.value.phone =
          typeof newContact.phone === 'string' ? newContact.phone : String(newContact.phone)
      } else if (profile.value.phone === null || profile.value.phone === undefined) {
        // Only set to empty string if current value is also null/undefined
        profile.value.phone = ''
      }
    }
  },
  { deep: true, immediate: true }
)

onMounted(async () => {
  isMounted.value = true

  // Preload libphonenumber-js for phone formatting
  if (!AsYouTypeClass) {
    const module = await import('libphonenumber-js')
    AsYouTypeClass = module.AsYouType
  }

  const storedCountry = localStorage.getItem('selectedCountry')
  const savedCountry = storedCountry ?? country.value

  if (savedCountry) {
    selectedCountry.value = savedCountry
    profile.value.mailing_country = savedCountry
  }

  // Wait for next tick to allow contact watcher to populate data first
  await nextTick()

  // Only set to empty string if still null/undefined after watcher runs
  if (profile.value) {
    if (profile.value.phone === null || profile.value.phone === undefined) {
      profile.value.phone = ''
    }
    if (profile.value.other_phone === null || profile.value.other_phone === undefined) {
      profile.value.other_phone = ''
    }
    if (profile.value.home_phone === null || profile.value.home_phone === undefined) {
      profile.value.home_phone = ''
    }
    if (profile.value.office_phone === null || profile.value.office_phone === undefined) {
      profile.value.office_phone = ''
    }
  }
})

const changeCountry = (): void => {
  profile.value.mailing_country = selectedCountry.value
}

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: string): void => {
  profile.value.title = option
  isOpen.value = false
}

function closeModal(): void {
  isShowModal.value = false
}

const contactDataSchema = yup.object({
  title: yup.string().required('Select an appeal option').max(230),
  first_name: yup.string().required('First Name is a required field').max(230),
  last_name: yup.string().required('Last Name is a required field').max(230),
  mailing_country: yup.string().required('Country of Residence is a required field').max(230),
  website: yup.string().test('url', 'Please enter the correct website url', (value) => {
    if (!value) return true
    return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]+)/gm.test(value)
  })
})

const phoneNationalNumber = ref<string>('')

const phoneChange = async (
  formattedNumber: string,
  { number, country, nationalNumber }: VueTelInputEvent,
  type: MessengerType
): Promise<void> => {
  // Prevent operations during unmount
  if (isUnmounting.value || !country) {
    return
  }

  // Safety check: ensure formattedNumber is a string
  if (typeof formattedNumber !== 'string') {
    return
  }

  if (type === 'main') {
    const defaultCountry = country.iso2 ? (country.iso2.toUpperCase() as CountryCode) : undefined
    // Dynamic import of AsYouType
    if (!AsYouTypeClass) {
      const module = await import('libphonenumber-js')
      AsYouTypeClass = module.AsYouType
    }
    const formatter = new AsYouTypeClass(defaultCountry)
    profile.value.phone = formatter.input(formattedNumber)
    phoneNationalNumber.value = nationalNumber ?? ''
    profile.value.phone_send = number ?? ''
    profile.value.code = country.dialCode ?? ''
    profile.value.country_prefix = country.iso2 ?? null
    orderData.value.code = country.dialCode ?? ''
  }

  if (type === 'home') {
    profile.value.home_phone_send = number ?? ''
    const defaultCountry = country.iso2 ? (country.iso2.toUpperCase() as CountryCode) : undefined
    // Dynamic import of AsYouType
    if (!AsYouTypeClass) {
      const module = await import('libphonenumber-js')
      AsYouTypeClass = module.AsYouType
    }
    profile.value.home_phone = new AsYouTypeClass(defaultCountry).input(formattedNumber)
    country_prefix_home.value = country.iso2 ?? null
  }

  if (type === 'office') {
    profile.value.office_phone_send = number ?? ''
    const defaultCountry = country.iso2 ? (country.iso2.toUpperCase() as CountryCode) : undefined
    // Dynamic import of AsYouType
    if (!AsYouTypeClass) {
      const module = await import('libphonenumber-js')
      AsYouTypeClass = module.AsYouType
    }
    profile.value.office_phone = new AsYouTypeClass(defaultCountry).input(formattedNumber)
    country_prefix_office.value = country.iso2 ?? null
  }

  if (type === 'other') {
    profile.value.other_phone_send = number ?? ''
    const defaultCountry = country.iso2 ? (country.iso2.toUpperCase() as CountryCode) : undefined
    // Dynamic import of AsYouType
    if (!AsYouTypeClass) {
      const module = await import('libphonenumber-js')
      AsYouTypeClass = module.AsYouType
    }
    profile.value.other_phone = new AsYouTypeClass(defaultCountry).input(formattedNumber)
    country_prefix_other.value = country.iso2 ?? null
  }
}

const toggleVisibilityOfDialCode = (
  eventType: 'focus' | 'blur',
  currentInputRef: VueTelInputRef | Ref<VueTelInputRef | null> | null
): void => {
  // Prevent operations during unmount
  if (isUnmounting.value) {
    return
  }

  const inputInstance = isRef(currentInputRef) ? currentInputRef.value : currentInputRef
  if (!inputInstance) {
    return
  }

  // Safety check: ensure $refs exists and is not null
  if (!inputInstance.$refs || !inputInstance.$refs.input) {
    return
  }

  const inputEl = inputInstance.$refs.input
  const dialCode = inputInstance.phoneObject?.country?.dialCode

  if (!dialCode || !inputEl) {
    return
  }

  // Safety check: ensure inputEl.value exists
  if (typeof inputEl.value !== 'string') {
    return
  }

  if (eventType === 'focus' && !inputEl.value.split(`+${dialCode}`)[1]) {
    inputEl.value = `+${dialCode}`
  }

  if (eventType === 'blur' && inputEl.value.slice(1) === dialCode) {
    inputEl.value = ''
  }
}

const countryChanged = (country: CountryOption, type: MessengerType): void => {
  // Prevent operations during unmount
  if (isUnmounting.value || !country) {
    return
  }

  if (type === 'main') {
    const countryName = country.name.split(' (')[0]
    const countryIndex = countries.indexOf(countryName)

    if (countryIndex !== -1) {
      localStorage.setItem('selectedCountry', countryName)
      selectedCountry.value = countries[countryIndex]
      country.name = countries[countryIndex]
    }

    code.value = country.dialCode
    country_prefix.value = country.iso2 ?? ''
  }
}

// Safe wrapper functions with try-catch
const safePhoneChange = (
  formattedNumber: string,
  object: VueTelInputEvent,
  type: MessengerType
): void => {
  try {
    phoneChange(formattedNumber, object, type)
  } catch (error) {
    console.warn('Error in phoneChange:', error)
  }
}

const safeCountryChanged = (country: CountryOption, type: MessengerType): void => {
  try {
    countryChanged(country, type)
  } catch (error) {
    console.warn('Error in countryChanged:', error)
  }
}

const safeToggleVisibilityOfDialCode = (
  eventType: 'focus' | 'blur',
  currentInputRef: VueTelInputRef | Ref<VueTelInputRef | null> | null
): void => {
  try {
    toggleVisibilityOfDialCode(eventType, currentInputRef)
  } catch (error) {
    console.warn('Error in toggleVisibilityOfDialCode:', error)
  }
}

// Ensure phone values are always strings
watch(
  () => profile.value.phone,
  (newVal) => {
    if (newVal === null || newVal === undefined) {
      profile.value.phone = ''
    } else if (typeof newVal !== 'string') {
      profile.value.phone = String(newVal)
    }
  }
)

watch(
  () => profile.value.other_phone,
  (newVal) => {
    if (newVal === null || newVal === undefined) {
      profile.value.other_phone = ''
    } else if (typeof newVal !== 'string') {
      profile.value.other_phone = String(newVal)
    }
  }
)

watch(
  () => profile.value.home_phone,
  (newVal) => {
    if (newVal === null || newVal === undefined) {
      profile.value.home_phone = ''
    } else if (typeof newVal !== 'string') {
      profile.value.home_phone = String(newVal)
    }
  }
)

watch(
  () => profile.value.office_phone,
  (newVal) => {
    if (newVal === null || newVal === undefined) {
      profile.value.office_phone = ''
    } else if (typeof newVal !== 'string') {
      profile.value.office_phone = String(newVal)
    }
  }
)

const checkTurnMessengers = (event: Event | null = null, isNoField = false): void => {
  if (!isNoField) {
    noField.value = !(profile.value.isTelegram || profile.value.isWhatsApp)
    return
  }

  const target = event?.target as HTMLInputElement | null
  if (target?.checked) {
    profile.value.isTelegram = false
    profile.value.isWhatsApp = false
  }
}

const cityChanged = (): void => {
  if (profile.value.mailing_city) {
    orderStore.update({ mailing_city: profile.value.mailing_city })
  }
}

const onInvoiceTypeChange = (): void => {
  if (needInvoice.value === 'Simple receipt to Private Person') {
    cityChanged()
  }
}

const preferredCountries = ['us', 'it', 'au', 'uk', 'in', 'ca', 'il', 'sg', 'ae'] as const

const defaultSettingsProps = ref({
  mode: 'auto',
  preferredCountries,
  inputClasses: 'input',
  defaultCountry: orderData.value.country_prefix ? String(orderData.value.country_prefix) : '',
  dropdownOptions: {
    showFlags: true,
    showDialCodeInList: true,
    showDialCodeInSelection: true
  }
})

const createBindProps = (placeholder: string) =>
  reactive({
    inputOptions: {
      placeholder
    },
    ...defaultSettingsProps.value
  })

const bindProps = createBindProps('Mobile Phone Number')
const bindPropsOther = createBindProps('Alternative mobile phone you will use on this trip')
const bindPropsHome = createBindProps('Home Phone')
const bindPropsOffice = createBindProps('Office Phone')

const onFormSubmit: SubmissionHandler = () => {
  const serviceType = orderData.value.type_of_service

  if (serviceType === 'oneWayTransfer' || serviceType === 'hourlyAsDirected') {
    const funnel = serviceType === 'oneWayTransfer' ? 'one_way_transfer' : 'hourly_as_directed'
    trackGtmEvent('booking_next_step', {
      booking_funnel: funnel,
      booking_step_number: 5,
      booking_step_name: 'contact_details'
    })
  }

  profile.value.code = profile.value.phone ? (orderData.value.code as string | null) : null

  const data: Partial<ContactProfile> = {
    first_name: profile.value.first_name,
    last_name: profile.value.last_name,
    code: profile.value.code
  }
  if (profile.value.phone) {
    data.phone = profile.value.phone
    data.code = code.value ?? profile.value.code ?? null
    data.country_prefix = country_prefix.value
    orderStore.changeHasPhoneStatus(!!profile.value.phone)
  }

  orderStore.update({
    first_name: data.first_name ?? null,
    last_name: data.last_name ?? null,
    phone: data.phone ?? null,
    code: data.code ?? null,
    country_prefix: data.country_prefix ?? null
  })

  if (selectedContact.value) {
    const contactUpdatePayload: Partial<Contact> & { id?: string | number; temp_id?: string } = {
      id: selectedContact.value.id,
      temp_id:
        selectedContact.value.temp_id !== undefined && selectedContact.value.temp_id !== null
          ? String(selectedContact.value.temp_id)
          : undefined,
      first_name: data.first_name,
      last_name: data.last_name
    }

    if (typeof data.code === 'string') {
      contactUpdatePayload.code = data.code
    }

    if (typeof data.country_prefix === 'string') {
      contactUpdatePayload.country_prefix = data.country_prefix
    }

    if (data.phone) {
      contactUpdatePayload.phone = data.phone
    }

    if (contactUpdatePayload.id || contactUpdatePayload.temp_id) {
      contactStore.updateContact(contactUpdatePayload)
    }
  }

  const userData: Record<string, string> = {}

  if (data.phone && data.code) {
    userData.phone = data.phone.replaceAll(' ', '').replace(`+${data.code}`, '')
  }
  if (data.country_prefix) {
    userData.country_prefix = data.country_prefix
  }
  if (typeof data.code === 'string') {
    userData.code = data.code
  }

  if (Object.keys(userData).length && isLoggedIn.value) {
    userStore.update(userData)
  }

  const dealId = orderData.value.deal_id
  if (dealId !== null && dealId !== undefined) {
    const dealIdString = String(dealId)
    profileCompletionStore.profileCompletion(dealIdString, orderData.value.email ?? undefined)
  }
  if (orderData.value.allowedPages) {
    orderData.value.allowedPages['serviceData'] = 1
  }
  router.push('/serviceData')
}
onBeforeMount(() => {
  checkTurnMessengers()
  orderStore.update({ paymentSuccess: true })
})

onBeforeUnmount(() => {
  // Set unmounting flag first to prevent watcher updates
  isUnmounting.value = true

  // Set mounted flag to false to prevent any operations
  isMounted.value = false

  // Stop the contact watcher to prevent updates during unmount
  stopContactWatcher()

  // Set all phone fields to empty strings to prevent vue-tel-input errors
  if (profile.value) {
    profile.value.phone = profile.value.phone || ''
    profile.value.other_phone = profile.value.other_phone || ''
    profile.value.home_phone = profile.value.home_phone || ''
    profile.value.office_phone = profile.value.office_phone || ''
  }

  // Clear all tel input refs to prevent errors during unmount
  mainTelInputRef.value = null
  otherTelInputRef.value = null
  homeTelInputRef.value = null
  officeTelInputRef.value = null
})
</script>
<style scoped></style>
