<template>
  <h1 v-if="isLoggedIn" class="title mr-[15px] mt-8 pb-6 md:mt-[45px] md:pb-[64px]">
    Agency information
  </h1>
  <div v-if="isLoggedIn" class="flex flex-col max-lg:justify-between md:flex-row">
    <div
      class="left_side-wrapper scrollbar-hidden flex-nowrap overflow-x-scroll md:mr-[19.18%] md:overflow-x-visible"
    >
      <button
        @click="newRide"
        type="button"
        class="summary_edit_button m-0 text-nowrap px-[22px] py-[8px] font-bold md:px-[22px] md:py-[8px]"
      >
        Book a New Ride <span class="account__button__disc"></span>
      </button>
      <router-link to="/account/accountinformation" class="account__button text-nowrap"
        >Account Information <span class="account__button__disc"></span
      ></router-link>
      <button type="button" class="account__button active text-nowrap">
        Agency information <span class="account__button__disc"></span>
      </button>
      <router-link to="/account/ridehistory" class="account__button text-nowrap"
        >Ride History <span class="account__button__disc"></span
      ></router-link>
      <router-link to="/account/documentsreceipts" class="account__button text-nowrap"
        >Documents/Receipts<span class="account__button__disc"></span
      ></router-link>
      <router-link to="/account/termsofservice" class="account__button text-nowrap"
        >Terms of Service<span class="account__button__disc"></span
      ></router-link>
      <button v-if="!isMobile" @click="logOut" type="button" class="account__button text-[#878787]">
        Log Out
      </button>
    </div>
    <div v-if="isMobile" class="mt-[6px]">
      <button @click="logOut" type="button" class="account__button text-[#878787]">Log Out</button>
    </div>

    <div class="mt-5 rounded-[40px] bg-[#333639] text-[20px] md:mt-0 md:text-[40px]">
      <Form
        @submit="onFormSubmit"
        class="form"
        :validation-schema="agencySchema"
        v-slot="{ errors, isSubmitting }"
      >
        <span v-if="isSubmitting">
          {{ errorFill(errors) }}
        </span>
        <div
          class="flex w-full flex-col items-start justify-start gap-4 self-stretch rounded-[40px] bg-white px-4 pb-3 pt-6 dark:bg-[#333639] sm:px-8 sm:pb-8 sm:pt-[30px]"
        >
          <p class="mb-2 ml-5 hidden text-[18px] text-[#878787] lg:block">Contact Person</p>
          <div class="flex w-full flex-col gap-4 lg:flex-row">
            <div class="relative flex w-full flex-col lg:max-w-44">
              <span class="mb-2 text-[14px] text-[#878787]"> Salutation </span>
              <div
                @click="isEditable && toggleDropdown()"
                :class="[!isEditable ? '!cursor-not-allowed !text-[#6c6d6f]' : '']"
                class="flex w-full cursor-pointer items-center justify-between rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              >
                <p v-if="!agency.title" class="text-[#878787]">
                  Select <span class="text-[#E30000]">*</span>
                </p>
                <p v-else>{{ agency.title }}</p>
                <img class="dark:invert" src="@/assets/dli/images/select_arrow.png" alt="" />
              </div>
              <div
                v-if="isOpen"
                class="absolute z-10 mt-12 h-max w-full space-y-1 rounded-[20px] border border-[#878787] bg-[#F4F6F3] px-3 py-5 text-sm text-[#878787] dark:border-[#3D4043] dark:bg-background"
              >
                <div
                  v-for="option in options"
                  :key="option"
                  @click="selectOption(option)"
                  class="cursor-pointer rounded-full p-3 hover:bg-[#CCF2C8] hover:text-background dark:hover:bg-[#CCF2C8]/5 dark:hover:text-white"
                  :class="{
                    'pointer-events-none !cursor-default bg-[#CCF2C8] text-background dark:bg-[#CCF2C8]/5 dark:text-white':
                      agency.title === option
                  }"
                >
                  {{ option }}
                </div>
              </div>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Name </span>
              <input
                disabled
                v-model="first_name"
                placeholder="First name"
                class="w-full cursor-not-allowed rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] !text-[#878787] outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              />
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Last name </span>
              <input
                disabled
                v-model="last_name"
                placeholder="Last name"
                class="w-full cursor-not-allowed rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] !text-[#878787] outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              />
            </div>
          </div>
          <p class="mb-2 ml-5 hidden text-[18px] text-[#878787] lg:block">Company data</p>
          <div class="flex w-full flex-col gap-4 lg:flex-row lg:items-end">
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]">
                Company name<span class="text-[#E30000]">*</span>
              </span>
              <Field name="company_name">
                <input
                  :class="[
                    errors.company_name ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.company_name"
                  placeholder="Company name"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
            <div class="relative flex w-full flex-col">
              <input
                v-model="email"
                placeholder="Email"
                class="w-full cursor-not-allowed rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] !text-[#878787] outline-none placeholder:text-[#878787] dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              />
            </div>
          </div>
          <div class="flex w-full flex-col gap-4 lg:flex-row">
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> IATA Code </span>
              <Field name="iata_code">
                <input
                  :class="[
                    errors.iata_code ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.iata_code"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Alternative Industry Code </span>
              <Field name="alternative_industry_code">
                <input
                  :class="[
                    errors.alternative_industry_code ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.alternative_industry_code"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
          </div>
          <div class="flex w-full flex-col gap-4 lg:flex-row">
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]">
                VAT number<span class="text-[#E30000]">*</span>
              </span>
              <Field name="vat">
                <input
                  :class="[
                    errors.vat ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.vat"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Fiscal Code </span>
              <Field name="fiscal_code">
                <input
                  :class="[
                    errors.fiscal_code ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.fiscal_code"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Tax ID code </span>
              <Field name="tax_id_code">
                <input
                  :class="[
                    errors.tax_id_code ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.tax_id_code"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> SDI Code </span>
              <Field name="sdi_code">
                <input
                  :class="[
                    errors.sdi_code ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.sdi_code"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
          </div>
          <div class="flex w-full flex-col gap-4 lg:flex-row">
            <div class="flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]">
                Country<span class="text-[#E30000]">*</span>
              </span>
              <Field name="country">
                <select
                  :class="[
                    errors.country ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.country"
                  class="max-h-[60px] w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                >
                  <option v-for="(val, index) of countries" :key="index">{{ val }}</option>
                </select>
              </Field>
            </div>
            <div class="flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]">
                Region/State/Province<span class="text-[#E30000]">*</span>
              </span>
              <Field name="region">
                <input
                  :class="[
                    errors.region ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.region"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
            <div class="flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]">
                City<span class="text-[#E30000]">*</span>
              </span>
              <Field name="city">
                <input
                  :class="[
                    errors.city ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.city"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
          </div>
          <div class="flex w-full flex-col gap-4 lg:flex-row">
            <div class="relative flex w-full flex-col lg:w-5/12">
              <span class="mb-2 text-[14px] text-[#878787]">
                CAP/ZIP<span class="text-[#E30000]">*</span>
              </span>
              <Field name="cap_zip">
                <input
                  :class="[
                    errors.cap_zip ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.cap_zip"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]">
                Address<span class="text-[#E30000]">*</span>
              </span>
              <Field name="address">
                <input
                  :class="[
                    errors.address ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.address"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
            <div class="relative flex w-full flex-col lg:w-5/12">
              <span class="mb-2 text-[14px] text-[#878787]"> Internal number </span>
              <Field name="internal_number">
                <input
                  :class="[
                    errors.internal_number ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.internal_number"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
          </div>
          <div class="flex w-full flex-col gap-4 lg:flex-row">
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]">
                Company Main Phone<span class="text-[#E30000]">*</span>
              </span>
              <div class="ym-record-keys max-h-[60px] w-full rounded-[53px]" maxlength="230">
                <vue-tel-input
                  :key="country_prefix"
                  v-model="agency.company_main_phone"
                  @country-changed="(country: VueTelCountry) => countryChanged(country, 'main')"
                  v-on:beforeinput="validPhone($event, country_prefix)"
                  class="vue-tel-input pl-25 border !border-[#878787] !bg-[#E8EDE8]/50 text-sm text-background placeholder:text-[#878787] dark:!border-[#3D4043] dark:!bg-background dark:!text-white md:text-lg"
                  placeholder="Enter a phone number"
                  :disabled="!isEditable"
                  :class="[!isEditable ? 'tel-text-color' : '']"
                  v-bind="bindProps"
                  :autoDefaultCountry="!agency.company_main_phone"
                  :defaultCountry="country_prefix"
                ></vue-tel-input>
              </div>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]">
                Company Main email<span class="text-[#E30000]">*</span>
              </span>
              <Field name="company_main_email">
                <input
                  :class="[
                    errors.company_main_email ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.company_main_email"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
          </div>
          <div class="flex w-full flex-col gap-4 lg:flex-row">
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Operations Phone </span>
              <div class="ym-record-keys max-h-[60px] w-full rounded-[53px]" maxlength="230">
                <vue-tel-input
                  :key="country_prefix_operations"
                  v-model="agency.operations_phone"
                  @country-changed="
                    (country: VueTelCountry) => countryChanged(country, 'operations')
                  "
                  v-on:beforeinput="validPhone($event, country_prefix_operations)"
                  class="vue-tel-input pl-25 border !border-[#878787] !bg-[#E8EDE8]/50 text-sm text-background placeholder:text-[#878787] dark:!border-[#3D4043] dark:!bg-background dark:!text-white md:text-lg"
                  placeholder="Enter a phone number"
                  v-bind="bindProps"
                  :disabled="!isEditable"
                  :class="[!isEditable ? 'tel-text-color' : '']"
                  :autoDefaultCountry="!agency.operations_phone"
                  :defaultCountry="country_prefix_operations"
                ></vue-tel-input>
              </div>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Operations email </span>
              <Field name="operations_email">
                <input
                  :class="[
                    errors.operations_email ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.operations_email"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
          </div>
          <div class="flex w-full flex-col gap-4 lg:flex-row">
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Booking Phone </span>
              <div class="ym-record-keys max-h-[60px] w-full rounded-[53px]" maxlength="230">
                <vue-tel-input
                  :key="country_prefix_booking"
                  v-model="agency.booking_phone"
                  @country-changed="(country: VueTelCountry) => countryChanged(country, 'booking')"
                  v-on:beforeinput="validPhone($event, country_prefix_booking)"
                  class="vue-tel-input pl-25 border !border-[#878787] !bg-[#E8EDE8]/50 text-sm text-background placeholder:text-[#878787] dark:!border-[#3D4043] dark:!bg-background dark:!text-white md:text-lg"
                  placeholder="Enter a phone number"
                  v-bind="bindProps"
                  :disabled="!isEditable"
                  :class="[!isEditable ? 'tel-text-color' : '']"
                  :autoDefaultCountry="!agency.booking_phone"
                  :defaultCountry="country_prefix_booking"
                ></vue-tel-input>
              </div>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Booking email </span>
              <Field name="booking_email">
                <input
                  :class="[
                    errors.booking_email ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.booking_email"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
          </div>
          <div class="flex w-full flex-col gap-4 lg:flex-row">
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Administration Phone </span>
              <div class="ym-record-keys max-h-[60px] w-full rounded-[53px]" maxlength="230">
                <vue-tel-input
                  :key="country_prefix_administration"
                  v-model="agency.administration_phone"
                  @country-changed="
                    (country: VueTelCountry) => countryChanged(country, 'administration')
                  "
                  v-on:beforeinput="validPhone($event, country_prefix_administration)"
                  class="vue-tel-input pl-25 border !border-[#878787] !bg-[#E8EDE8]/50 text-sm text-background placeholder:text-[#878787] dark:!border-[#3D4043] dark:!bg-background dark:!text-white md:text-lg"
                  placeholder="Enter a phone number"
                  v-bind="bindProps"
                  :disabled="!isEditable"
                  :class="[!isEditable ? 'tel-text-color' : '']"
                  :autoDefaultCountry="!agency.administration_phone"
                  :defaultCountry="country_prefix_administration"
                ></vue-tel-input>
              </div>
            </div>
            <div class="relative flex w-full flex-col">
              <span class="mb-2 text-[14px] text-[#878787]"> Administration email </span>
              <Field name="administration_email">
                <input
                  :class="[
                    errors.administration_email ? '!border-red-500' : '',
                    !isEditable ? '!text-[#6c6d6f]' : ''
                  ]"
                  :disabled="!isEditable"
                  v-model="agency.administration_email"
                  class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
                />
              </Field>
            </div>
          </div>
          <div class="relative flex w-full flex-col">
            <span class="mb-2 text-[14px] text-[#878787]">
              ERP Enterprise resource planning used
            </span>
            <Field name="erp_enterprise">
              <input
                :class="[
                  errors.erp_enterprise ? '!border-red-500' : '',
                  !isEditable ? '!text-[#6c6d6f]' : ''
                ]"
                :disabled="!isEditable"
                v-model="agency.erp_enterprise"
                class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              />
            </Field>
          </div>
          <div class="relative mb-6 flex w-full flex-col">
            <span class="mb-2 text-[14px] text-[#878787]"> Additional notes </span>
            <Field name="additional_notes">
              <input
                :class="[
                  errors.additional_notes ? '!border-red-500' : '',
                  !isEditable ? '!text-[#6c6d6f]' : ''
                ]"
                :disabled="!isEditable"
                v-model="agency.additional_notes"
                class="w-full rounded-[53px] border border-[#878787] bg-[#E8EDE8]/50 px-[22px] py-4 text-sm tracking-[-0.28px] text-background outline-none placeholder:text-[#878787] disabled:cursor-not-allowed dark:border-[#3D4043] dark:bg-background dark:text-white md:text-lg"
              />
            </Field>
          </div>
          <button
            type="button"
            v-if="!isEditable"
            class="summary_edit_button w-full border-dark_main px-4 py-[18px] text-base/[17.6px] text-dark_main dark:border-main dark:text-main dark:hover:text-background md:py-5 md:text-[18px]/[23.8px]"
            @click="openEdit()"
          >
            Edit
          </button>
          <button
            :disabled="loading"
            type="submit"
            v-if="isEditable"
            class="summary_edit_button save w-full px-4 py-[18px] text-base/[17.6px] md:py-5 md:text-[18px]/[23.8px]"
          >
            <LoadingSpinner
              v-if="loading"
              class="size-[18px] animate-spin stroke-[#2B2D32] md:size-6"
            />
            <span v-else>Save</span>
          </button>
        </div>
      </Form>
    </div>
  </div>
  <h1 v-if="!isLoggedIn" class="title mr-[15px] mt-[5rem]">
    Please login to view account information
  </h1>
  <router-link v-if="!isLoggedIn" to="/account/signin" class="button mt-[15px] w-fit"
    >Sign in
  </router-link>
  <swipe-modal
    v-model="isModal"
    v-if="isMobile"
    contents-height="60vh"
    border-top-radius="16px"
    background-color="ffffff"
    tip-color="#CDCFD0"
  >
    <car-popup-content />
  </swipe-modal>
</template>

<script setup lang="ts">
import swipeModal from '@takuma-ru/vue-swipe-modal'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMobile } from '@/compose/ismobile'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { validPhone } from '@/plugins/validPhone'
import { Field, Form } from 'vee-validate'
import { ref, reactive, inject, watch, onBeforeMount } from 'vue'
import * as yup from 'yup'
import { useFetcher } from '@/compose/axios'
import CarPopupContent from '@/components/features/car/CarPopupContent.vue'
import { useOrderStore } from '@/stores/ride/order'
import { useRidesHistoryStore } from '@/stores/ride/history'
import LoadingSpinner from '@/components/ui/icons/LoadingSpinner.vue'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import { countries } from '@/constants'
import { User } from '@/types/stores/user/profile'
import {
  AgencyForm,
  AgencyFormData,
  AgencyPhoneType,
  ErrorBag,
  DefaultSettingsProps,
  CountryCodeItem,
  VueTelCountry,
  AgencyComponentState,
  AgencyComponentMethods,
  AgencyComponentComputed
} from '@/types/pages/account/AgencyInformation'

const trustyStore = useTrustyStore()
const ridesStore = useRidesHistoryStore()
const isModal = ref<boolean>(false)

const { isMobile } = useMobile()

const utils = inject('utils') as any
const orderStore = useOrderStore()
const userStore = useUserStore()
const router = useRouter()
const isAgencyHasData = ref<boolean>(false)

const { isLoggedIn, user } = storeToRefs(userStore)
const options: string[] = ['Mr.', 'Ms.', 'Mrs.', 'Miss', 'Mx.', 'Dr.', 'Prof.']
const isOpen = ref<boolean>(false)
const loading = ref<boolean>(false)
const first_name = ref<string>(user.value?.first_name || '')
const last_name = ref<string>(user.value?.last_name || '')
const email = ref<string>(user.value?.email || '')
const agency = ref<AgencyForm>({
  title: '',
  company_name: '',
  email: '',
  vat: '',
  fiscal_code: '',
  tax_id_code: '',
  sdi_code: '',
  country: '',
  address: '',
  cap_zip: '',
  region: '',
  city: '',
  iata_code: '',
  internal_number: '',
  alternative_industry_code: '',
  company_main_phone: '',
  company_main_phone_code: '',
  company_main_email: '',
  operations_phone: '',
  operations_phone_code: '',
  operations_email: '',
  booking_email: '',
  booking_phone: '',
  booking_phone_code: '',
  administration_phone: '',
  administration_phone_code: '',
  administration_email: '',
  erp_enterprise: '',
  additional_notes: ''
})

const isEditable = ref<boolean>(false)

const noField = ref<boolean>(true)
const country_prefix = ref<string | null>(null)
const country_prefix_operations = ref<string | null>(null)
const country_prefix_booking = ref<string | null>(null)
const country_prefix_administration = ref<string | null>(null)
const isShowModal = ref<boolean>(true)
const errorOnForm = ref<ErrorBag | null>(null)

const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })

const agencySchema = computed<yup.ObjectSchema<any>>(() =>
  !agency.value || Object.keys(agency.value).length === 0 ? requiredSchema : optionalSchema
)

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: string): void => {
  agency.value.title = option
  isOpen.value = false
}

const newRide = (): void => {
  userStore.clearAgencyData()
  trustyStore.clearInput('pickup')
  trustyStore.clearInput('dropoff')
  orderStore.$reset()
  orderStore.changeTypeOrder('NEW')
  router.push({ name: 'home' })
}

const logOut = (): void => {
  ridesStore.$reset()
  userStore.preventLogout()
  axiosInstance.get(`/spy/logout`)
  setTimeout(() => router.push('/account/signin'), 100)
}

const errorFill = (errorBag: ErrorBag): void => {
  errorOnForm.value = errorBag
}

watch(errorOnForm, (newVal: ErrorBag | null) => {
  if (!utils.isEmpty(newVal)) {
    isShowModal.value = true
  }
})

const openEdit = (): void => {
  isEditable.value = true
}

const requiredSchema = yup.object({
  company_name: yup.string().required('Company name is required'),
  country: yup.string().required('Country is required'),
  region: yup.string().required('Region/State/Province is required'),
  city: yup.string().required('City is required'),
  address: yup.string().required('Address is required'),
  cap_zip: yup.string().required('CAP/ZIP is required'),
  company_main_email: yup.string().email('Invalid email'),
  operations_email: yup.string().email('Invalid email'),
  booking_email: yup.string().email('Invalid email'),
  administration_email: yup.string().email('Invalid email'),
  vat: yup.string().required(),
  fiscal_code: yup.string(),
  tax_id_code: yup.string(),
  sdi_code: yup.string(),
  internal_number: yup.string(),
  iata_code: yup.string(),
  alternative_industry_code: yup.string(),
  company_main_phone: yup.string(),
  operations_phone: yup.string(),
  booking_phone: yup.string(),
  administration_phone: yup.string(),
  erp_enterprise: yup.string(),
  additional_notes: yup.string()
})

const optionalSchema = yup.object({
  company_name: yup.string(),
  country: yup.string(),
  region: yup.string(),
  city: yup.string(),
  address: yup.string(),
  cap_zip: yup.string(),
  company_main_email: yup.string().email('Invalid email'),
  operations_email: yup.string().email('Invalid email'),
  booking_email: yup.string().email('Invalid email'),
  administration_email: yup.string().email('Invalid email'),
  vat: yup.string(),
  fiscal_code: yup.string(),
  tax_id_code: yup.string(),
  sdi_code: yup.string(),
  internal_number: yup.string(),
  iata_code: yup.string(),
  alternative_industry_code: yup.string(),
  company_main_phone: yup.string(),
  operations_phone: yup.string(),
  booking_phone: yup.string(),
  administration_phone: yup.string(),
  erp_enterprise: yup.string(),
  additional_notes: yup.string()
})

const countryChanged = (country: VueTelCountry, type: string): void => {
  if (!country) return

  if (type === 'main') {
    agency.value.company_main_phone_code = country.dialCode || ''
    country_prefix.value = country.iso2 || ''
  }
  if (type === 'operations') {
    agency.value.operations_phone_code = country.dialCode || ''
    country_prefix_operations.value = country.iso2 || ''
  }
  if (type === 'booking') {
    agency.value.booking_phone_code = country.dialCode || ''
    country_prefix_booking.value = country.iso2 || ''
  }
  if (type === 'administration') {
    agency.value.administration_phone_code = country.dialCode || ''
    country_prefix_administration.value = country.iso2 || ''
  }
}

const checkTurnMessengers = (e: Event | null = null, isNoField: boolean = false): void => {
  if (!isNoField) {
    if (agency.value.isTelegram || agency.value.isWhatsApp) {
      noField.value = false
    } else {
      noField.value = true
    }
  } else {
    if (e && (e.target as HTMLInputElement).checked === true) {
      agency.value.isTelegram = false
      agency.value.isWhatsApp = false
    }
  }
}

const preferredCountries: string[] = ['us', 'it', 'au', 'uk', 'in', 'ca', 'il', 'sg', 'ae']

const defaultSettingsProps = ref<DefaultSettingsProps>({
  mode: 'auto',
  preferredCountries: preferredCountries,
  inputClasses: 'input',
  dropdownOptions: {
    showFlags: true,
    showDialCodeInList: true,
    showDialCodeInSelection: true
  }
})

const bindProps = reactive({
  inputOptions: {
    placeholder: 'Mobile Phone Number'
  },
  ...defaultSettingsProps.value
})

const cleanPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return ''
  }
  const cleanNumber = phoneNumber.replace(/^\+(\d+)\s/, '')
  return cleanNumber.replace(/\D/g, '')
}

const onFormSubmit = async (): Promise<void> => {
  loading.value = true

  const data: AgencyFormData = {
    ...agency.value,
    company_main_phone: cleanPhoneNumber(agency.value.company_main_phone),
    operations_phone: cleanPhoneNumber(agency.value.operations_phone),
    booking_phone: cleanPhoneNumber(agency.value.booking_phone),
    administration_phone: cleanPhoneNumber(agency.value.administration_phone),
    title: agency.value.title ? agency.value.title.replace(/\.$/, '') : '',
    company_main_phone_code: agency.value.company_main_phone
      ? agency.value.company_main_phone_code
      : '',
    operations_phone_code: agency.value.operations_phone ? agency.value.operations_phone_code : '',
    booking_phone_code: agency.value.booking_phone ? agency.value.booking_phone_code : '',
    administration_phone_code: agency.value.administration_phone
      ? agency.value.administration_phone_code
      : ''
  }

  try {
    await axiosInstance.post('/account', data)
    loading.value = false
    isEditable.value = false
    getAccInfo()
  } catch (error) {
    loading.value = false
  }
}

const getCountryPrefixByCode = (countryCode: string): string | null => {
  const country = (window as any).countryCodes?.find(
    (item: CountryCodeItem) => item.code === countryCode
  )
  return country ? country.prefix : null
}

const getAccInfo = async (): Promise<void> => {
  try {
    const res = await axiosInstance.get('/account')

    if (res.data && res.data.data && Object.keys(res.data.data).length > 0) {
      isAgencyHasData.value = true
    } else {
      isAgencyHasData.value = false
    }

    if (res.data.data) {
      let data = res.data.data

      const removeCountryCode = (phone: string | undefined): string => {
        if (!phone || typeof phone !== 'string') return ''
        const digitsOnly = phone.replace(/\D/g, '')
        return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly
      }

      data.company_main_phone = removeCountryCode(data.company_main_phone)
      data.operations_phone = removeCountryCode(data.operations_phone)
      data.booking_phone = removeCountryCode(data.booking_phone)
      data.administration_phone = removeCountryCode(data.administration_phone)

      agency.value = data

      country_prefix.value = getCountryPrefixByCode(data.company_main_phone_code) || null
      country_prefix_operations.value = getCountryPrefixByCode(data.operations_phone_code) || null
      country_prefix_booking.value = getCountryPrefixByCode(data.booking_phone_code) || null
      country_prefix_administration.value =
        getCountryPrefixByCode(data.administration_phone_code) || null
    }
  } catch (error) {
    console.error('Ошибка при получении данных аккаунта:', error)
    isAgencyHasData.value = false
  }
}

onBeforeMount(() => {
  checkTurnMessengers()
  orderStore.update({ paymentSuccess: true })
})
onMounted(() => {
  getAccInfo()
})
</script>

<style>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  scrollbar-width: none;
}

.tel-text-color .vti__dropdown span {
  color: #6c6d6f !important;
}

.tel-text-color input {
  color: #6c6d6f !important;
}
</style>
