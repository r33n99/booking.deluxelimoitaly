<template>
  <div class="rides_filter flex flex-col gap-y-4">
    <div class="my-6 flex flex-row gap-x-[6px] lg:hidden">
      <div
        @click="handleOpenSelect('all')"
        class="relative flex w-[14%] cursor-pointer items-center justify-center rounded-[30px] bg-[#FFFFFF] py-5 dark:bg-[#272729]"
      >
        <filter-view-icon class="fill-main" />
      </div>
      <div
        ref="mobileSelectComponent"
        class="relative flex w-full flex-row divide-x-[1px] rounded-[30px] bg-[#FFFFFF] px-4 py-2 dark:divide-[#3D4043] dark:bg-[#272729]"
      >
        <div
          @click="handleOpenSelect('selectSortPrice')"
          class="relative flex w-full cursor-pointer items-center"
        >
          <component
            :is="
              defaultNames.selectSortPrice.icon === 'FilterArrowDownIcon'
                ? FilterArrowDownIcon
                : FilterArrowUpIcon
            "
            class="fill-main stroke-main max-sm:h-5"
          />
          <p :class="{ 'ml-4': !verySmallScreen }" class="select-none lg:mx-4 lg:whitespace-nowrap">
            {{ defaultNames.selectSortPrice.name }}
          </p>
          <template v-if="selectSortPrice">
            <div
              @click.stop
              class="absolute left-1 top-[56px] !z-[999] flex flex-col overflow-hidden rounded-[30px] bg-[#FFFFFF] dark:bg-[#373739]"
            >
              <div
                v-for="(i, index) in ridesPriceSortOptions"
                :key="i.value"
                @click.stop="handleSelectSortPrice(index)"
                :class="{ 'w-full bg-[#FFFFFF20]': i.value === filterObj.sort }"
                class="flex items-center px-6 py-[14px]"
              >
                <component
                  :is="i.icon === 'FilterArrowDownIcon' ? FilterArrowDownIcon : FilterArrowUpIcon"
                  class="fill-main stroke-main"
                />
                <span class="ml-4 whitespace-nowrap">{{ i.name }}</span>
              </div>
            </div>
          </template>
        </div>
        <div
          @click="handleOpenSelect('selectSortDate')"
          class="relative flex w-full cursor-pointer items-center pl-2"
        >
          <component
            :is="
              defaultNames.selectSortDate.icon === 'FilterArrowDownIcon'
                ? FilterArrowDownIcon
                : FilterArrowUpIcon
            "
            class="fill-main stroke-main max-sm:h-5"
          />
          <p :class="{ 'ml-4': !verySmallScreen }" class="select-none lg:mx-4 lg:whitespace-nowrap">
            {{ defaultNames.selectSortDate.name }}
          </p>
          <arrow-down-narrow-icon class="hidden fill-black dark:fill-white sm:ml-1 sm:block" />
          <template v-if="selectSortDate">
            <div
              @click.stop
              class="absolute right-1 top-[56px] !z-[999] flex flex-col overflow-hidden rounded-[30px] bg-[#FFFFFF] dark:bg-[#373739]"
            >
              <div
                v-for="(i, index) in ridesDateSortOptions"
                :key="i.value"
                @click.stop="handleSelectSortDate(index)"
                :class="{ 'w-full bg-[#FFFFFF20]': i.value === filterObj.sort }"
                class="flex items-center px-6 py-[14px]"
              >
                <component
                  :is="i.icon === 'FilterArrowDownIcon' ? FilterArrowDownIcon : FilterArrowUpIcon"
                  class="fill-main stroke-main"
                />
                <span class="ml-4 whitespace-nowrap">{{ i.name }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div
      ref="selectComponent"
      class="relative hidden w-full flex-col rounded-[30px] bg-[#FFFFFF] px-6 py-3 dark:bg-[#272729] lg:flex"
    >
      <div class="filter_panel flex w-full justify-center px-4 lg:px-0">
        <div class="flex w-full flex-row divide-x-[1px] dark:divide-[#3D4043]">
          <div
            @click="handleOpenSelect('selectSortPrice')"
            class="relative flex w-full cursor-pointer items-center pr-6"
          >
            <component
              :is="
                defaultNames.selectSortPrice.icon === 'FilterArrowDownIcon'
                  ? FilterArrowDownIcon
                  : FilterArrowUpIcon
              "
              class="fill-main stroke-main max-sm:h-5"
            />
            <p
              :class="{ 'ml-4': !verySmallScreen }"
              class="select-none lg:mx-4 lg:whitespace-nowrap"
            >
              <template v-if="!smallScreen">
                {{ defaultNames.selectSortPrice.name }}
              </template>
              <template v-else> Price</template>
            </p>
            <arrow-down-narrow-icon class="hidden fill-black dark:fill-white sm:ml-1 sm:block" />

            <template v-if="selectSortPrice && !isMobile">
              <div
                @click.stop
                class="absolute left-0 top-[56px] !z-[999] flex flex-col overflow-hidden rounded-[30px] bg-[#FFFFFF] dark:bg-[#373739]"
              >
                <div
                  v-for="(i, index) in ridesPriceSortOptions"
                  :key="i.value"
                  @click.stop="handleSelectSortPrice(index)"
                  :class="{ 'w-full bg-[#FFFFFF20]': i.value === filterObj.sort }"
                  class="flex items-center px-6 py-[14px]"
                >
                  <component
                    :is="i.icon === 'FilterArrowDownIcon' ? FilterArrowDownIcon : FilterArrowUpIcon"
                    class="fill-main stroke-main"
                  />
                  <span class="ml-4 whitespace-nowrap">{{ i.name }}</span>
                </div>
              </div>
            </template>
          </div>
          <div
            @click="handleOpenSelect('selectSortDate')"
            class="relative flex w-full cursor-pointer items-center px-2 lg:px-6"
          >
            <component
              :is="
                defaultNames.selectSortDate.icon === 'FilterArrowDownIcon'
                  ? FilterArrowDownIcon
                  : FilterArrowUpIcon
              "
              class="fill-main stroke-main max-sm:h-5"
            />
            <p
              :class="{ 'ml-4': !verySmallScreen }"
              class="select-none lg:mx-4 lg:whitespace-nowrap"
            >
              <template v-if="!smallScreen">
                {{ defaultNames.selectSortDate.name }}
              </template>
              <template v-else> Date</template>
            </p>
            <arrow-down-narrow-icon class="hidden fill-black dark:fill-white sm:ml-1 sm:block" />
            <template v-if="selectSortDate && !isMobile">
              <div
                @click.stop
                class="absolute left-0 top-[56px] !z-[999] flex flex-col overflow-hidden rounded-[30px] bg-[#FFFFFF] dark:bg-[#373739]"
              >
                <div
                  v-for="(i, index) in ridesDateSortOptions"
                  :key="i.value"
                  @click.stop="handleSelectSortDate(index)"
                  :class="{ 'w-full bg-[#FFFFFF20]': i.value === filterObj.sort }"
                  class="flex items-center px-6 py-[14px]"
                >
                  <component
                    :is="i.icon === 'FilterArrowDownIcon' ? FilterArrowDownIcon : FilterArrowUpIcon"
                    class="fill-main stroke-main"
                  />
                  <span class="ml-4 whitespace-nowrap">{{ i.name }}</span>
                </div>
              </div>
            </template>
          </div>
          <div
            @click="handleOpenSelect('selectType')"
            class="relative flex w-full cursor-pointer items-center pl-2 lg:px-6"
          >
            <p class="select-none lg:mr-4">
              {{
                selectedServiceTypes.length > 1
                  ? 'Multiple selections'
                  : selectedServiceTypes.length === 1
                    ? selectedServiceTypes[0].name
                    : 'Service type'
              }}
            </p>
            <arrow-down-narrow-icon class="hidden fill-black dark:fill-white sm:ml-1 sm:block" />

            <template v-if="selectType && !isMobile">
              <div
                @click.stop
                class="absolute left-0 top-[56px] !z-[999] flex flex-col overflow-hidden rounded-[30px] bg-[#FFFFFF] dark:bg-[#373739] lg:w-[200px]"
              >
                <div
                  v-for="(i, index) in types"
                  :key="i.value"
                  :class="{ 'w-full bg-[#FFFFFF20]': i.selected }"
                  class="flex items-center px-6 py-[14px]"
                  @click="handleSetType(index)"
                >
                  <input
                    class="!border-[2px] !border-[#111111] dark:!border-[#FFFFFF]"
                    v-model="i.selected"
                    type="checkbox"
                  />
                  <span class="ml-4">{{ i.name }}</span>
                </div>
              </div>
            </template>
          </div>
          <div
            @click="handleOpenSelect('selectStatus')"
            class="relative flex w-full cursor-pointer items-center pl-2 lg:px-6"
          >
            <p class="select-none lg:mr-4">
              {{
                defaultNames.selectStatus.length > 1
                  ? 'Multiple selections'
                  : defaultNames.selectStatus[0].name
              }}
            </p>
            <arrow-down-narrow-icon class="hidden fill-black dark:fill-white sm:ml-1 sm:block" />
            <template v-if="selectStatus && !isMobile">
              <div
                @click.stop
                class="absolute left-0 top-[56px] !z-[999] flex flex-col overflow-hidden rounded-[30px] bg-[#FFFFFF] dark:bg-[#373739] lg:w-[200px]"
              >
                <div
                  v-for="(i, index) in status"
                  :key="i.value ?? i.name"
                  :class="{ 'w-full dark:bg-[#FFFFFF20]': i.checked }"
                  class="flex items-center px-6 py-[14px]"
                  @click="handleSetStatus(index)"
                >
                  <input
                    class="!border-[2px] !border-[#111111] dark:!border-[#FFFFFF]"
                    v-model="i.checked"
                    type="checkbox"
                  />
                  <span class="ml-4">{{ i.name }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div v-if="isMobile" class="mx-4 border-b-[1px] border-b-[#3D4043]"></div>
    </div>
    <div
      ref="selectDateComponent"
      class="relative hidden w-full flex-col rounded-[30px] bg-[#FFFFFF] px-6 py-3 dark:bg-[#272729] lg:flex 2xl:py-2"
    >
      <div class="filter_panel flex w-full justify-center px-4 lg:px-0">
        <div class="flex w-full flex-row divide-x-[1px] dark:divide-[#3D4043]">
          <div class="relative flex w-full cursor-pointer items-center">
            <VueDatePicker
              class="m-0 text-sm lg:text-lg"
              auto-apply
              partial-flow
              placeholder="Date from / to"
              preview-format="DD/MM/YYYY"
              :clearable="true"
              format="dd/MM/yyyy"
              range
              multi-calendars
              :month-change-on-scroll="false"
              v-model="filterObj.date_range"
              :dark="mode === 'dark'"
              :light="mode === 'light'"
            />
          </div>
          <div class="relative w-full">
            <Field
              type="text"
              name="Pick up"
              placeholder="Pick up"
              class="w-full rounded-[40px] border-0 p-5 py-3 !outline-none placeholder:text-[#2b2d32] focus:!border-0 focus:ring-0 dark:bg-[#272729] dark:placeholder:text-white"
              v-model="filterObj.pick_up"
              autocomplete="off"
            />
            <div
              v-if="pickUpSuggestions.length"
              class="absolute top-full z-10 mt-1 w-[200px] overflow-hidden rounded-[20px] bg-[#d8d8d8] dark:bg-[#373739] dark:text-black"
            >
              <ul>
                <li
                  v-for="city in pickUpSuggestions"
                  :key="city"
                  @click="handleSelectPickUp(city)"
                  class="cursor-pointer p-2 px-4 text-[#2b2d32] hover:bg-white hover:text-black dark:text-white dark:hover:bg-[#FFFFFF20] dark:hover:text-white"
                >
                  {{ city }}
                </li>
              </ul>
            </div>
          </div>
          <div class="relative w-full">
            <Field
              type="text"
              name="Drop off"
              placeholder="Drop off"
              class="w-full rounded-[40px] border-0 p-5 py-3 !outline-none placeholder:text-[#2b2d32] focus:!border-0 focus:ring-0 dark:bg-[#272729] dark:placeholder:text-white"
              v-model="filterObj.drop_off"
              autocomplete="off"
            />
            <div
              v-if="dropOffSuggestions.length"
              class="absolute top-full z-10 mt-1 w-[200px] overflow-hidden rounded-[20px] bg-[#d8d8d8] text-white dark:bg-[#373739] dark:text-black"
            >
              <ul>
                <li
                  v-for="city in dropOffSuggestions"
                  :key="city"
                  @click="handleSelectDropOff(city)"
                  class="cursor-pointer p-2 px-4 text-[#2b2d32] hover:bg-white hover:text-black dark:text-white dark:hover:bg-[#FFFFFF20] dark:hover:text-white"
                >
                  {{ city }}
                </li>
              </ul>
            </div>
          </div>
          <div class="relative w-full">
            <Field
              type="text"
              name="Pax name"
              placeholder="Pax name"
              class="w-full rounded-[40px] border-0 p-5 py-3 !outline-none placeholder:text-[#2b2d32] focus:!border-0 focus:ring-0 dark:bg-[#272729] dark:placeholder:text-white"
              v-model="filterObj.pax_name"
              autocomplete="off"
            />
            <div
              v-if="paxNameSuggestions.length"
              class="absolute top-full z-10 mt-1 w-[200px] overflow-hidden rounded-[20px] bg-[#d8d8d8] dark:bg-[#373739] dark:text-black"
            >
              <ul>
                <li
                  v-for="passenger in paxNameSuggestions"
                  :key="passenger"
                  @click="handleSelectPaxName(passenger)"
                  class="cursor-pointer p-2 px-4 hover:bg-white hover:text-black dark:text-white dark:hover:bg-[#FFFFFF20] dark:hover:text-white"
                >
                  {{ passenger }}
                </li>
              </ul>
            </div>
          </div>
          <div
            @click="handleOpenSelect('vehicle')"
            class="relative flex w-full cursor-pointer items-center px-2"
          >
            <p
              :class="{ 'ml-4': !verySmallScreen }"
              class="select-none lg:mx-4 lg:whitespace-nowrap"
            >
              {{ selectedVehicleNames }}
            </p>
            <arrow-down-narrow-icon class="hidden fill-black dark:fill-white sm:ml-1 sm:block" />
            <template v-if="selectVehicle && !isMobile">
              <div
                @click.stop
                class="absolute left-0 top-[56px] !z-[999] flex flex-col overflow-hidden rounded-[30px] bg-[#FFFFFF] dark:bg-[#373739]"
              >
                <div
                  v-for="i in cars"
                  :key="i.class_id"
                  @click.stop="handleSelectVehicle(i)"
                  :class="{ 'w-full bg-[#FFFFFF20]': i.checked }"
                  class="flex items-center px-6 py-[14px]"
                >
                  <input
                    type="checkbox"
                    v-model="i.checked"
                    class="!border-[2px] !border-[#111111] dark:!border-[#FFFFFF]"
                  />
                  <span class="ml-4 whitespace-nowrap">{{ i.class_name }}</span>
                </div>
              </div>
            </template>
          </div>
          <div class="flex w-full flex-row px-2 lg:pl-6">
            <Field
              type="text"
              name="General"
              placeholder="General"
              class="w-full !border-0 border-none bg-transparent p-0 text-[#2b2d32] shadow-none !outline-none placeholder:text-[#2b2d32] focus:!border-0 focus:ring-0 dark:text-white dark:placeholder:text-white"
              v-model="filterObj.general"
            />
          </div>
        </div>
      </div>
      <div v-if="isMobile" class="mx-4 border-b-[1px] border-b-[#3D4043]"></div>
    </div>
    <div
      class="hidden w-full flex-row lg:flex"
      :class="wasEverFiltered ? 'justify-between' : 'justify-end'"
    >
      <p class="mt-3" v-if="wasEverFiltered">
        Number of rides: <span class="text-main">{{ rides.length }}</span>
      </p>
      <div
        class="ml-full relative flex w-1/3 flex-col rounded-[30px] bg-[#FFFFFF] dark:bg-[#272729] lg:mb-10"
      >
        <div class="flex w-full flex-row sm:justify-center">
          <div class="w-full py-[14px] pl-4 pr-6">
            <div class="flex justify-between">
              <span class="mr-1 text-[#878787]">Show:</span>
              <div
                :class="{ 'text-main underline': showPages === i }"
                v-for="i in pages"
                :key="`page-${i}`"
                @click="handleShowPages(i)"
              >
                <span class="cursor-pointer">
                  {{ i }}
                </span>
              </div>
              <span
                class="cursor-pointer"
                :class="{ 'text-main underline': showPages === 'all' }"
                @click="handleShowPages('all')"
                >all</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Unified Mobile Filters Modal -->
    <div
      v-if="selectAll && isMobile"
      @click.self="handleCloseSelect"
      class="fixed left-0 top-0 !z-[999] h-full w-full bg-[#000000B2]"
    >
      <div
        ref="mobileModalContent"
        class="fixed bottom-0 right-0 flex h-[85%] w-full flex-col rounded-t-[30px] bg-[#FFFFFF] dark:bg-[#1E1E20]"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4">
          <div class="w-3/5 text-end">
            <h3 class="mr-3 text-[18px] font-semibold text-main">Filter</h3>
          </div>
          <button
            @click="handleCloseSelect"
            class="flex h-[24px] w-[24px] flex-row items-center justify-center rounded-full bg-placeholder dark:bg-[#3D4043]"
          >
            <close-icon />
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-grow overflow-y-auto p-4">
          <!-- Sort by Price -->
          <div
            class="mb-2 overflow-hidden rounded-[30px] bg-[#F2F2F2] dark:bg-[#272729]"
            :class="{ 'border border-main': isPriceSortSelected }"
          >
            <div
              @click="mobileFiltersState.sortPrice = !mobileFiltersState.sortPrice"
              class="flex cursor-pointer items-center justify-between px-6 pt-3"
              :class="!mobileFiltersState.sortPrice && 'pb-3'"
            >
              <div class="flex items-center">
                <component
                  v-if="filterObj.sort"
                  :is="
                    ridesPriceSortOptions.find((o) => o.value === filterObj.sort)?.icon ===
                    'FilterArrowDownIcon'
                      ? FilterArrowDownIcon
                      : FilterArrowUpIcon
                  "
                  class="mr-2 fill-main stroke-main"
                />
                <p class="text-[14px]">{{ defaultNames.selectSortPrice.name }}</p>
              </div>
              <arrow-down-narrow-icon
                class="transform fill-black transition-transform dark:fill-white"
                :class="{ 'rotate-180': mobileFiltersState.sortPrice }"
              />
            </div>
            <div
              v-if="mobileFiltersState.sortPrice"
              class="mt-2 overflow-hidden rounded-t-[20px] bg-[#d8d8d8] dark:bg-[#373739]"
            >
              <div
                v-for="(i, index) in ridesPriceSortOptions"
                :key="i.value"
                @click="handleSelectSortPrice(index)"
                :class="{
                  'bg-[#F2F2F2] !text-black dark:bg-[#FFFFFF20] dark:!text-white':
                    i.value === filterObj.sort
                }"
                class="flex cursor-pointer items-center p-3 px-6 transition-colors hover:bg-gray-100 hover:text-black dark:hover:bg-[#FFFFFF05] dark:hover:text-white"
              >
                <component
                  :is="i.icon === 'FilterArrowDownIcon' ? FilterArrowDownIcon : FilterArrowUpIcon"
                  class="fill-main stroke-main"
                />
                <span class="ml-4 text-[14px]">{{ i.name }}</span>
              </div>
            </div>
          </div>

          <!-- Sort by Date -->
          <div
            class="mb-2 overflow-hidden rounded-[30px] bg-[#F2F2F2] dark:bg-[#272729]"
            :class="{ 'border border-main': isDateSortSelected }"
          >
            <div
              @click="mobileFiltersState.sortDate = !mobileFiltersState.sortDate"
              class="flex cursor-pointer items-center justify-between px-6 pt-3"
              :class="!mobileFiltersState.sortDate && 'pb-3'"
            >
              <div class="flex items-center">
                <component
                  v-if="filterObj.sort"
                  :is="
                    ridesDateSortOptions.find((o) => o.value === filterObj.sort)?.icon ===
                    'FilterArrowDownIcon'
                      ? FilterArrowDownIcon
                      : FilterArrowUpIcon
                  "
                  class="mr-2 fill-main stroke-main"
                />
                <p class="text-[14px]">{{ defaultNames.selectSortDate.name }}</p>
              </div>
              <arrow-down-narrow-icon
                class="transform fill-black transition-transform dark:fill-white"
                :class="{ 'rotate-180': mobileFiltersState.sortDate }"
              />
            </div>
            <div
              v-if="mobileFiltersState.sortDate"
              class="mt-2 overflow-hidden rounded-t-[20px] bg-[#d8d8d8] dark:bg-[#373739]"
            >
              <div
                v-for="(i, index) in ridesDateSortOptions"
                :key="i.value"
                @click="handleSelectSortDate(index)"
                :class="{
                  'bg-[#F2F2F2] !text-black dark:bg-[#FFFFFF20] dark:!text-white':
                    i.value === filterObj.sort
                }"
                class="flex cursor-pointer items-center p-3 transition-colors hover:bg-gray-100 hover:text-black dark:hover:bg-[#FFFFFF05] dark:hover:text-white"
              >
                <component
                  :is="i.icon === 'FilterArrowDownIcon' ? FilterArrowDownIcon : FilterArrowUpIcon"
                  class="fill-main stroke-main"
                />
                <span class="ml-4 text-[14px]">{{ i.name }}</span>
              </div>
            </div>
          </div>

          <!-- Service Type -->
          <div
            class="mb-2 overflow-hidden rounded-[30px] bg-[#F2F2F2] dark:bg-[#272729]"
            :class="{ 'border border-main': isServiceTypeSelected }"
          >
            <div
              @click="mobileFiltersState.serviceType = !mobileFiltersState.serviceType"
              class="flex cursor-pointer items-center justify-between px-6 pt-3"
              :class="!mobileFiltersState.serviceType && 'pb-3'"
            >
              <p class="text-[14px]">Service Type</p>
              <arrow-down-narrow-icon
                class="transform fill-black transition-transform dark:fill-white"
                :class="{ 'rotate-180': mobileFiltersState.serviceType }"
              />
            </div>
            <div
              v-if="mobileFiltersState.serviceType"
              class="mt-2 overflow-hidden rounded-t-[20px] bg-[#d8d8d8] dark:bg-[#373739]"
            >
              <div
                v-for="(i, index) in types"
                :key="`type-${i.value}`"
                @click="handleSetType(index)"
                class="flex cursor-pointer items-center p-3 transition-colors hover:bg-gray-100 hover:text-black dark:!text-white dark:hover:bg-[#FFFFFF05]"
              >
                <input
                  class="!border-[2px] !border-[#111111] dark:!border-[#FFFFFF]"
                  v-model="i.selected"
                  type="checkbox"
                />
                <span class="ml-4 text-[14px]">{{ i.name }}</span>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div
            class="mb-2 overflow-hidden rounded-[30px] bg-[#F2F2F2] dark:bg-[#272729]"
            :class="{ 'border border-main': isStatusSelected }"
          >
            <div
              @click="mobileFiltersState.status = !mobileFiltersState.status"
              class="flex cursor-pointer items-center justify-between px-6 pt-3"
              :class="!mobileFiltersState.status && 'pb-3'"
            >
              <p class="text-[14px]">Status</p>
              <arrow-down-narrow-icon
                class="transform fill-black transition-transform dark:fill-white"
                :class="{ 'rotate-180': mobileFiltersState.status }"
              />
            </div>
            <div
              v-if="mobileFiltersState.status"
              class="mt-2 overflow-hidden rounded-t-[20px] bg-[#d8d8d8] dark:bg-[#373739]"
            >
              <div
                v-for="(i, index) in status"
                :key="`status-${i.value ?? i.name}`"
                @click="handleSetStatus(index)"
                class="flex cursor-pointer items-center p-3 transition-colors hover:bg-gray-100 hover:text-black dark:!text-white dark:hover:bg-[#FFFFFF05]"
              >
                <input
                  class="!border-[2px] !border-[#111111] dark:!border-[#FFFFFF]"
                  v-model="i.checked"
                  type="checkbox"
                />
                <span class="ml-4 text-[14px]">{{ i.name }}</span>
              </div>
            </div>
          </div>

          <!-- Date Range -->
          <div
            class="mb-2 flex flex-row items-center justify-between rounded-[40px] bg-[#F2F2F2] p-5 py-2 dark:bg-[#272729]"
            :class="{ 'border border-main': isDateRangeSelected }"
          >
            <VueDatePicker
              class="m-0 w-full text-sm lg:text-lg"
              auto-apply
              partial-flow
              placeholder="Date from / to"
              preview-format="DD/MM/YYYY"
              :clearable="true"
              format="dd/mm/yyyy"
              :month-change-on-scroll="false"
              range
              v-model="filterObj.date_range"
              :dark="mode === 'dark'"
              :light="mode === 'light'"
            />
          </div>
          <!-- Text Inputs -->
          <div class="mb-2 flex flex-col gap-y-2">
            <div class="relative">
              <Field
                type="text"
                name="Pick up"
                placeholder="Pick up"
                class="w-full rounded-[40px] border-0 bg-[#F2F2F2] p-5 py-3 !outline-none placeholder:text-[#2b2d32] focus:!border-0 focus:ring-0 dark:bg-[#272729] dark:placeholder:text-white"
                v-model="filterObj.pick_up"
                autocomplete="off"
                :class="{ '!border-1 !border border-main': isPickUpSelected }"
              />
              <div
                v-if="pickUpSuggestions.length"
                class="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-[20px] bg-[#d8d8d8] text-white dark:bg-[#373739] dark:text-black"
              >
                <ul>
                  <li
                    v-for="city in pickUpSuggestions"
                    :key="city"
                    @click="handleSelectPickUp(city)"
                    class="cursor-pointer p-2 px-4 text-[#2b2d32] hover:bg-white hover:text-black dark:text-white dark:hover:bg-[#FFFFFF20] dark:hover:text-white"
                  >
                    {{ city }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="relative">
              <Field
                type="text"
                name="Drop off"
                placeholder="Drop off"
                class="w-full rounded-[40px] border-0 bg-[#F2F2F2] p-5 py-3 !outline-none placeholder:text-[#2b2d32] focus:!border-0 focus:ring-0 dark:bg-[#272729] dark:placeholder:text-white"
                v-model="filterObj.drop_off"
                autocomplete="off"
                :class="{ '!border-1 !border border-main': isDropOffSelected }"
              />
              <div
                v-if="dropOffSuggestions.length"
                class="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-[20px] bg-[#d8d8d8] text-white dark:bg-[#373739] dark:text-black"
              >
                <ul>
                  <li
                    v-for="city in dropOffSuggestions"
                    :key="city"
                    @click="handleSelectDropOff(city)"
                    class="cursor-pointer p-2 px-4 text-[#2b2d32] hover:bg-white hover:text-black dark:text-white dark:hover:bg-[#FFFFFF20] dark:hover:text-white"
                  >
                    {{ city }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="relative w-full">
              <Field
                type="text"
                name="Pax name"
                placeholder="Pax name"
                class="w-full rounded-[40px] border-0 bg-[#F2F2F2] p-5 py-3 !outline-none placeholder:text-[#2b2d32] focus:!border-0 focus:ring-0 dark:bg-[#272729] dark:placeholder:text-white"
                v-model="filterObj.pax_name"
                :class="{ '!border-1 !border border-main': isPaxNameSelected }"
              />
              <div
                v-if="paxNameSuggestions.length"
                class="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-[20px] bg-[#d8d8d8] text-white dark:bg-[#373739] dark:text-black"
              >
                <ul>
                  <li
                    v-for="passenger in paxNameSuggestions"
                    :key="passenger"
                    @click="handleSelectPaxName(passenger)"
                    class="cursor-pointer p-2 px-4 text-[#2b2d32] hover:bg-white hover:text-black dark:text-white dark:hover:bg-[#FFFFFF20] dark:hover:text-white"
                  >
                    {{ passenger }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Vehicle -->
          <div
            class="mb-2 overflow-hidden rounded-[30px] bg-[#F2F2F2] dark:bg-[#272729]"
            :class="{ 'border border-main': isVehicleSelected }"
          >
            <div
              @click="mobileFiltersState.vehicle = !mobileFiltersState.vehicle"
              class="flex cursor-pointer items-center justify-between px-6 pt-3"
              :class="!mobileFiltersState.vehicle && 'pb-3'"
            >
              <p class="text-[14px]">{{ selectedVehicleNames }}</p>
              <arrow-down-narrow-icon
                class="transform fill-black transition-transform dark:fill-white"
                :class="{ 'rotate-180': mobileFiltersState.vehicle }"
              />
            </div>
            <div
              v-if="mobileFiltersState.vehicle"
              class="mt-2 overflow-hidden rounded-t-[20px] bg-[#d8d8d8] dark:bg-[#373739]"
            >
              <div
                v-for="i in cars"
                :key="`car-${i.class_id ?? i.class_name}`"
                @click="handleSelectVehicle(i)"
                :class="{
                  'bg-gray-200 dark:bg-[#FFFFFF20]':
                    i.class_id !== undefined && filterObj.vehicle.includes(i.class_id)
                }"
                class="flex cursor-pointer items-center p-3 transition-colors hover:bg-gray-100 hover:text-black dark:hover:bg-[#FFFFFF05] dark:hover:text-white"
              >
                <input
                  type="checkbox"
                  v-model="i.checked"
                  class="!border-[2px] !border-[#111111] dark:!border-[#FFFFFF]"
                />
                <span class="ml-4">{{ i.class_name }}</span>
              </div>
            </div>
          </div>
          <Field
            type="text"
            name="General"
            placeholder="General"
            class="mb-2 w-full rounded-[40px] border-0 bg-[#F2F2F2] p-5 py-3 text-[#2b2d32] !outline-none placeholder:text-[#2b2d32] focus:!border-0 focus:ring-0 dark:bg-[#272729] dark:text-white dark:placeholder:text-white"
            v-model="filterObj.general"
            :class="{ '!border-1 !border border-main': isGeneralSelected }"
          />
          <div class="rounded-[40px] bg-[#F2F2F2] p-5 py-0 dark:bg-[#272729]">
            <div class="flex w-full flex-row sm:justify-center">
              <div class="w-full py-[14px] pl-4 pr-6">
                <div class="flex justify-between">
                  <span class="mr-1 text-[#878787]">Show:</span>
                  <div
                    :class="{ 'text-main underline': showPages === i }"
                    v-for="i in pages"
                    :key="`page-${i}`"
                    @click="handleShowPages(i)"
                  >
                    <span class="cursor-pointer">
                      {{ i }}
                    </span>
                  </div>
                  <span
                    class="cursor-pointer"
                    :class="{ 'text-main underline': showPages === 'all' }"
                    @click="handleShowPages('all')"
                    >all</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with Apply button -->
        <div class="p-4">
          <button
            @click="applyMobileFilters"
            class="w-full rounded-full bg-main py-3 text-[16px] font-semibold text-white dark:text-black"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
  computed,
  onBeforeMount,
  watch,
  reactive,
  type Ref
} from 'vue'
import type { AxiosInstance } from 'axios'
import { useMobile } from '@/compose/ismobile'
import FilterArrowDownIcon from '@/components/ui/icons/FilterArrowDownIcon.vue'
import FilterArrowUpIcon from '@/components/ui/icons/FilterArrowUpIcon.vue'
import ArrowDownNarrowIcon from '@/components/ui/icons/ArrowDownNarrowIcon.vue'
import { storeToRefs } from 'pinia'
import { useCarsStore } from '@/stores/ride/cars'
import { useRidesHistoryStore } from '@/stores/ride/history'
import { useUserStore } from '@/stores/user/profile'
import { useMainStore } from '@/stores/ui/main'
import VueDatePicker from '@vuepic/vue-datepicker'
import { Field } from 'vee-validate'
import { useFetcher } from '@/compose/axios'
import FilterViewIcon from '@/components/ui/icons/FilterViewIcon.vue'
import CloseIcon from '@/components/ui/icons/CloseIcon.vue'
import type { CarSummary } from '@/types/stores/ride/cars'
import type { RideHistoryItem, RidesFilter } from '@/types/stores/ride/history'

type FilterKey =
  | 'selectType'
  | 'selectStatus'
  | 'selectRidesFilter'
  | 'selectSortDate'
  | 'selectSortPrice'
  | 'pickUp'
  | 'dropOff'
  | 'vehicle'
  | 'all'

type VehicleClassId = string | number

type SortIcon = 'FilterArrowUpIcon' | 'FilterArrowDownIcon'

interface StatusOption {
  name: string
  checked: boolean
  value?: number
}

interface SortOption {
  name: string
  selected: boolean
  icon: SortIcon
  value: string
}

interface ServiceTypeOption {
  name: string
  selected: boolean
  value: string
}

type DateRangeValue = null | [Date, Date]

interface FilterState {
  status: string
  sort: string
  service_type: string
  count: number | 'all'
  pick_up: string
  drop_off: string
  pax_name: string
  date_range: DateRangeValue
  general: string
  vehicle: VehicleClassId[]
}

interface DefaultNamesState {
  selectType: string
  selectStatus: StatusOption[]
  selectRidesFilter: SortOption
  selectSortDate: SortOption
  selectSortPrice: SortOption
}

interface MobileFiltersState {
  sortPrice: boolean
  sortDate: boolean
  serviceType: boolean
  status: boolean
  vehicle: boolean
}

type CarOption = CarSummary & {
  class_id?: VehicleClassId
  class_name?: string
  checked?: boolean
}

interface CarsResponse {
  data?: Array<(CarSummary & { class_id?: VehicleClassId; class_name?: string }) | null> | null
}

interface FiltersResponse {
  filters?: {
    pickup?: Array<string | null>
    dropoff?: Array<string | null>
    main_passenger?: Array<string | null>
  }
}

const mainStore = useMainStore()
const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL }) as {
  axiosInstance: AxiosInstance
}
const carsStore = useCarsStore()

const { isMobile } = useMobile()
const getWindowWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 0)
const smallScreen = ref<boolean>(getWindowWidth() <= 410)
const verySmallScreen = ref<boolean>(getWindowWidth() <= 340)
const { mode } = storeToRefs(mainStore)
const { cars: carsRef } = storeToRefs(carsStore)
const cars = computed<CarOption[]>(() => (carsRef.value ?? []) as CarOption[])

const pages = ref<number[]>([5, 10, 20, 50, 100])
const showPages = ref<number | 'all'>(5)
const selectComponent = ref<HTMLElement | null>(null)
const mobileSelectComponent = ref<HTMLElement | null>(null)
const selectDateComponent = ref<HTMLElement | null>(null)
const mobileModalContent = ref<HTMLElement | null>(null)

const filterObj = ref<FilterState>({
  status: '',
  sort: 'date_desc',
  service_type: '',
  count: 5,
  pick_up: '',
  drop_off: '',
  pax_name: '',
  date_range: null,
  general: '',
  vehicle: []
})

const pickUpSuggestions = computed<string[]>(() => {
  const query = filterObj.value.pick_up
  if (!query) return []

  if (ridesPickUpSortOptions.value.some((option) => option === query)) {
    return []
  }

  return ridesPickUpSortOptions.value.filter((option): option is string => {
    if (option === null) return false
    return option.toLowerCase().includes(query.toLowerCase())
  })
})

const dropOffSuggestions = computed<string[]>(() => {
  const query = filterObj.value.drop_off
  if (!query) return []

  if (ridesDropOffSortOptions.value.some((option) => option === query)) {
    return []
  }

  return ridesDropOffSortOptions.value.filter((option): option is string => {
    if (option === null) return false
    return option.toLowerCase().includes(query.toLowerCase())
  })
})

const paxNameSuggestions = computed<string[]>(() => {
  const query = filterObj.value.pax_name
  if (!query) return []

  if (mainPassengers.value.some((option) => option === query)) {
    return []
  }

  return mainPassengers.value.filter((option): option is string => {
    if (option === null) return false
    return option.toLowerCase().includes(query.toLowerCase())
  })
})

const ridesDateSortOptions = ref<SortOption[]>([
  {
    name: 'Date ascending',
    selected: false,
    icon: 'FilterArrowUpIcon',
    value: 'date_asc'
  },
  {
    name: 'Date descending',
    selected: true,
    icon: 'FilterArrowDownIcon',
    value: 'date_desc'
  }
])

const ridesPriceSortOptions = ref<SortOption[]>([
  {
    name: 'Price ascending',
    selected: false,
    icon: 'FilterArrowUpIcon',
    value: 'price_asc'
  },
  {
    name: 'Price descending',
    selected: true,
    icon: 'FilterArrowDownIcon',
    value: 'price_desc'
  }
])

const defaultNames = ref<DefaultNamesState>({
  selectType: 'Service type',
  selectStatus: [
    {
      name: 'Status',
      checked: true
    }
  ],
  selectRidesFilter: {
    name: 'Date descending',
    selected: true,
    icon: 'FilterArrowDownIcon',
    value: 'date_desc'
  },
  selectSortDate: ridesDateSortOptions.value[1],
  selectSortPrice: ridesPriceSortOptions.value[1]
})

const selectStatus = ref<boolean>(false)
const selectType = ref<boolean>(false)
const selectRidesFilter = ref<boolean>(false)
const selectSortDate = ref<boolean>(false)
const selectSortPrice = ref<boolean>(false)
const selectPickUp = ref<boolean>(false)
const selectDropOff = ref<boolean>(false)
const selectVehicle = ref<boolean>(false)
const selectAll = ref<boolean>(false)

const ridesHistoryStore = useRidesHistoryStore()
const userStore = useUserStore()
const { isRequestMessage, rides } = storeToRefs(ridesHistoryStore) as {
  isRequestMessage: Ref<boolean>
  rides: Ref<RideHistoryItem[]>
}

const wasEverFiltered = ref(false)
let firstRidesValue: RideHistoryItem[] | undefined

watch(rides, (newVal) => {
  if (firstRidesValue === undefined) {
    firstRidesValue = Array.isArray(newVal) ? [...newVal] : newVal
    return
  }

  if (newVal !== firstRidesValue) {
    wasEverFiltered.value = true
  }
})

const status = ref<StatusOption[]>([
  {
    name: 'Model Selection Pending',
    checked: false,
    value: 1
  },
  {
    name: 'Payment Pending',
    checked: false,
    value: 2
  },
  {
    name: 'Waiting convert tours',
    checked: false,
    value: 3
  },
  {
    name: 'Booked',
    checked: false,
    value: 4
  }
])

if (userStore.user?.type === 'agency') {
  status.value.push({
    name: 'Credit',
    checked: false,
    value: 5
  })
}

const types = ref<ServiceTypeOption[]>([
  {
    name: 'One Way',
    selected: false,
    value: 'oneWayTransfer'
  },
  {
    name: 'Hourly',
    selected: false,
    value: 'hourlyAsDirected'
  },
  {
    name: 'Tours/Roadshows',
    selected: false,
    value: 'toursRoadshows'
  }
])

const selectedServiceTypes = computed<ServiceTypeOption[]>(() =>
  types.value.filter((t) => t.selected)
)
const selectedVehicleNames = computed<string>(() => {
  const selected = cars.value.filter((car) => Boolean(car.checked))
  if (selected.length === 0) return 'Vehicle'
  if (selected.length === 1) return selected[0].class_name ?? 'Vehicle'
  return 'Multiple selections'
})

let debounceTimer: number | undefined
const debounce = (callback: () => void, time: number) => {
  if (debounceTimer !== undefined) {
    window.clearTimeout(debounceTimer)
  }
  debounceTimer = window.setTimeout(() => {
    callback()
    debounceTimer = undefined
  }, time)
}

const sendRequest = () => {
  const params = new URLSearchParams()
  if (filterObj.value.status) params.append('status', filterObj.value.status)
  if (filterObj.value.sort) params.append('sort', filterObj.value.sort)
  if (filterObj.value.service_type) params.append('service_type', filterObj.value.service_type)
  if (filterObj.value.count !== undefined && filterObj.value.count !== null) {
    params.append('count', String(filterObj.value.count))
  }
  if (filterObj.value.pick_up) params.append('pick_up', filterObj.value.pick_up)
  if (filterObj.value.drop_off) params.append('drop_off', filterObj.value.drop_off)
  if (filterObj.value.pax_name) params.append('pax_name', filterObj.value.pax_name)
  if (filterObj.value.general) params.append('general', filterObj.value.general)
  if (filterObj.value.vehicle.length > 0) {
    filterObj.value.vehicle.forEach((vehicle) => params.append('vehicle[]', String(vehicle)))
  }

  const dateRange = filterObj.value.date_range
  if (Array.isArray(dateRange)) {
    const [startDate, endDate] = dateRange
    let range = startDate?.toISOString() ?? ''
    if (endDate) {
      range += `,${endDate.toISOString()}`
    }
    if (range) {
      params.append('date_range', range)
    }
  }

  if (Array.from(params.keys()).length > 0) {
    isRequestMessage.value = true
    ridesHistoryStore.loadRides(params as unknown as RidesFilter)
  }
}

watch(
  () => [
    filterObj.value.pick_up,
    filterObj.value.drop_off,
    filterObj.value.pax_name,
    filterObj.value.general
  ],
  () => {
    if (isMobile.value && selectAll.value) return
    debounce(sendRequest, 1500)
  }
)

watch(
  [
    () => filterObj.value.status,
    () => filterObj.value.sort,
    () => filterObj.value.service_type,
    () => filterObj.value.count,
    () => filterObj.value.date_range,
    () => filterObj.value.vehicle
  ],
  () => {
    if (isMobile.value && selectAll.value) return
    sendRequest()
  },
  { deep: true }
)

const mobileFiltersState = reactive<MobileFiltersState>({
  sortPrice: false,
  sortDate: false,
  serviceType: false,
  status: false,
  vehicle: false
})

const isPriceSortSelected = computed<boolean>(() => {
  return (
    filterObj.value.sort === ridesPriceSortOptions.value[0].value ||
    filterObj.value.sort === ridesPriceSortOptions.value[1].value
  )
})

const isDateSortSelected = computed<boolean>(() => {
  return (
    filterObj.value.sort === ridesDateSortOptions.value[0].value ||
    filterObj.value.sort === ridesDateSortOptions.value[1].value
  )
})

const isServiceTypeSelected = computed<boolean>(() => selectedServiceTypes.value.length > 0)

const isStatusSelected = computed<boolean>(() => status.value.some((s) => s.checked))

const isDateRangeSelected = computed<boolean>(() => Array.isArray(filterObj.value.date_range))

const isVehicleSelected = computed<boolean>(() => filterObj.value.vehicle.length > 0)

const isPickUpSelected = computed<boolean>(() => filterObj.value.pick_up !== '')

const isDropOffSelected = computed<boolean>(() => filterObj.value.drop_off !== '')

const isPaxNameSelected = computed<boolean>(() => filterObj.value.pax_name !== '')

const isGeneralSelected = computed<boolean>(() => filterObj.value.general !== '')

const handleSetStatus = (index: number) => {
  const item = status.value[index]
  if (!item) return

  item.checked = !item.checked

  const statusValues = filterObj.value.status ? filterObj.value.status.split(',') : []

  if (item.checked && item.value !== undefined) {
    if (!statusValues.includes(String(item.value))) {
      statusValues.push(String(item.value))
    }

    if (!defaultNames.value.selectStatus.some((option) => option.value === item.value)) {
      defaultNames.value.selectStatus.push(item)
    }
  } else if (item.value !== undefined) {
    const filteredValues = statusValues.filter((statusValue) => statusValue !== String(item.value))
    defaultNames.value.selectStatus = defaultNames.value.selectStatus.filter(
      (option) => option.value !== item.value
    )
    statusValues.splice(0, statusValues.length, ...filteredValues)
  }

  defaultNames.value.selectStatus = defaultNames.value.selectStatus.filter(
    (option) => option.name !== 'Status'
  )

  if (defaultNames.value.selectStatus.length === 0) {
    defaultNames.value.selectStatus.push({ name: 'Status', checked: true })
  }

  filterObj.value.status = statusValues.join(',')
}

const ridesPickUpSortOptions = ref<Array<string | null>>([])
const ridesDropOffSortOptions = ref<Array<string | null>>([])

const mainPassengers = ref<Array<string | null>>([])

const handleSelectSortDate = (index: number) => {
  ridesDateSortOptions.value.forEach((option, optionIndex) => {
    option.selected = optionIndex === index
  })
  const selectedOption = ridesDateSortOptions.value[index]
  if (!selectedOption) return
  defaultNames.value.selectSortDate = selectedOption
  filterObj.value.sort = selectedOption.value
  if (!isMobile.value) {
    selectSortDate.value = false
  }
}

const handleSelectSortPrice = (index: number) => {
  ridesPriceSortOptions.value.forEach((option, optionIndex) => {
    option.selected = optionIndex === index
  })
  const selectedOption = ridesPriceSortOptions.value[index]
  if (!selectedOption) return
  defaultNames.value.selectSortPrice = selectedOption
  filterObj.value.sort = selectedOption.value
  if (!isMobile.value) {
    selectSortPrice.value = false
  }
}

const handleSelectPaxName = (passenger: string) => {
  filterObj.value.pax_name = passenger
}

const handleSelectPickUp = (city: string) => {
  filterObj.value.pick_up = city
}

const handleSelectDropOff = (city: string) => {
  filterObj.value.drop_off = city
}

const handleSetType = (index: number) => {
  const item = types.value[index]
  if (!item) return

  item.selected = !item.selected

  const selected = types.value.filter((type) => type.selected)
  filterObj.value.service_type = selected.map((type) => type.value).join(',')

  if (selected.length === 0) {
    defaultNames.value.selectType = 'Service type'
  } else if (selected.length === 1) {
    defaultNames.value.selectType = selected[0].name
  } else {
    defaultNames.value.selectType = 'Multiple selections'
  }
}

const handleOpenSelect = (value: FilterKey) => {
  // Create a map of all select states with correct keys
  const selectStates = {
    selectType,
    selectStatus,
    selectRidesFilter,
    selectSortDate,
    selectSortPrice,
    pickUp: selectPickUp, // Map 'pickUp' key to selectPickUp ref
    dropOff: selectDropOff, // Map 'dropOff' key to selectDropOff ref
    vehicle: selectVehicle, // Map 'vehicle' key to selectVehicle ref
    all: selectAll // Map 'all' key to selectAll ref
  }

  // Store the current state of the clicked select
  const wasActive = selectStates[value]?.value

  // Reset all states
  Object.values(selectStates).forEach((select) => {
    select.value = false
  })

  // Toggle the clicked select
  if (!wasActive) {
    selectStates[value].value = true
  }
}

const handleCloseSelect = () => {
  selectStatus.value = false
  selectType.value = false
  selectRidesFilter.value = false
  selectSortDate.value = false
  selectSortPrice.value = false
  selectPickUp.value = false
  selectDropOff.value = false
  selectVehicle.value = false
  selectAll.value = false

  for (const key of Object.keys(mobileFiltersState) as Array<keyof MobileFiltersState>) {
    mobileFiltersState[key] = false
  }
}

const handleShowPages = (value: number | 'all') => {
  showPages.value = value
  filterObj.value.count = value
}

const handleSelectVehicle = (vehicle: CarOption) => {
  const car = cars.value.find((item) => item.class_id === vehicle.class_id)
  if (car) {
    car.checked = !car.checked
  }

  filterObj.value.vehicle = cars.value
    .filter((item): item is CarOption & { class_id: VehicleClassId } => {
      return Boolean(item.checked) && item.class_id !== undefined
    })
    .map((item) => item.class_id)
}

const applyMobileFilters = () => {
  sendRequest()
  handleCloseSelect()
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectAll.value && isMobile.value) {
    return
  }

  const target = event.target as Node | null
  if (!target) return

  const isOutsideMobileSelect =
    mobileSelectComponent.value && !mobileSelectComponent.value.contains(target)
  const isOutsideSelect = selectComponent.value && !selectComponent.value.contains(target)
  const isOutsideDate = selectDateComponent.value && !selectDateComponent.value.contains(target)

  if (isOutsideSelect && isOutsideDate && isOutsideMobileSelect) {
    handleCloseSelect()
  }
}

const fetchVehicle = async () => {
  try {
    const response = await axiosInstance.get<CarsResponse>('/cars')
    if (Array.isArray(response.data?.data)) {
      carsStore.update(response.data.data as CarSummary[])
    }
  } catch (error) {
    console.error('Error fetching vehicle:', error)
  }
}

const fetchFilterData = async () => {
  try {
    const response = await axiosInstance.get<FiltersResponse>('/rides/histories/filters')
    const filters = response.data?.filters
    ridesPickUpSortOptions.value = Array.isArray(filters?.pickup) ? filters.pickup : []
    ridesDropOffSortOptions.value = Array.isArray(filters?.dropoff) ? filters.dropoff : []
    mainPassengers.value = Array.isArray(filters?.main_passenger) ? filters.main_passenger : []
  } catch (error) {
    console.error('Error fetching main passengers:', error)
  }
}

onBeforeMount(async () => {
  await fetchVehicle()
  await fetchFilterData()
})

onMounted(async () => {
  await userStore.getUserInfo()
  sendRequest()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss">
.rides_filter {
  .dp__input {
    background-color: transparent !important;
    padding-right: 25px !important;
  }
  .dp__icon {
    width: 25px !important;
    height: 25px !important;
  }

  input[type='checkbox'] {
    width: 15px;
    height: 15px;
    color: #5fd052 !important;
    accent-color: #5fd052 !important;
    background-color: transparent;
    border-radius: 4px;
  }

  input[type='checkbox']:checked {
    background-color: #5fd052 !important;
    border: 2px solid #5fd052 !important;
  }

  @media screen and (max-width: 345px) {
    .filter_panel {
      flex-direction: column !important;
      gap: 20px !important;
    }

    .filter_panel_type {
      border: none !important;
    }
  }
}
</style>
