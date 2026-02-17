<template>
  <h1 v-if="isLoggedIn" class="title mr-[15px] mt-8 pb-6 md:mt-[45px] md:pb-[64px]">
    Terms of Service
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
      <router-link
        v-if="isAgency"
        to="/account/agencyinformation"
        class="account__button text-nowrap"
        >Agency information <span class="account__button__disc"></span
      ></router-link>
      <router-link to="/account/ridehistory" class="account__button text-nowrap"
        >Ride History <span class="account__button__disc"></span
      ></router-link>
      <router-link to="/account/documentsreceipts" class="account__button text-nowrap"
        >Documents/Receipts<span class="account__button__disc"></span
      ></router-link>
      <button type="button" class="account__button active text-nowrap">
        Terms of Service <span class="account__button__disc"></span>
      </button>
      <button v-if="!isMobile" @click="logOut" type="button" class="account__button text-[#878787]">
        Log Out
      </button>
    </div>
    <div v-if="isMobile" class="mt-[6px]">
      <button @click="logOut" type="button" class="account__button text-[#878787]">Log Out</button>
    </div>
    <div class="mb-6 text-[18px] md:text-[18px]">
      <span class="text-[18px] font-semibold text-main">1.&nbsp;Introduction.</span><br />
      Deluxe Limo Italy is a trademark developed for an exclusive use by Driving Guide Tours snc, a
      limousine company registered at Chamber of Commerce of Florence, Italy with the number 511113
      and VAT number IT05022040488. As an exclusive holder of the Deluxe Limo Italy trademark
      Driving Guide Tours snc (“Service Provider”) provides chauffeur or guide-driven vehicles and
      walking tours across Italy and Europe. We endeavor to delight all clients through our
      commitment to total customer satisfaction. Below are our specified terms and conditions, which
      you are required to read and accept before booking a transportation or touring service with
      Deluxe Limo Italy.<br /><br />
      <span class="text-[18px] font-semibold text-main">2.&nbsp;Applicability.</span><br />
      (a) These terms and conditions for services (these “Terms”) are the only terms that govern the
      provision of services by Deluxe Limo Italy exclusive holder Driving Guide Tours snc to you,
      our customer.<br />
      (b) The accompanying email order confirmation (the “Booking Confirmation”) and these Terms
      (collectively, this “Agreement”) comprise the entire agreement between the parties, and
      supersede all prior or contemporaneous understandings, agreements, negotiations,
      representations and warranties, and communications, both written and oral. In the event of any
      conflict between these Terms and the Booking Confirmation, the Terms shall govern, unless the
      Booking Confirmation expressly states that these Terms shall not control.<br />
      (c) These Terms prevail over any of customer’s general terms and conditions regardless of when
      customer has submitted their request for proposal, order, or such terms. Provision of services
      to customer does not constitute acceptance of any of customer’s terms and conditions and does
      not serve to modify or amend these Terms.<br />
      (d) These Terms, as may be amended from time to time, apply to all services provided by
      Service Provider and their affiliates and to all transactions between Service Provider and
      their customers conducted online, through any mobile device, by email or by telephone.<br />
      (e) By accessing and using Service Provider’s website and/or by completing a reservation form,
      you, the customer, acknowledge and agree to have read, understood and agreed to the Terms and
      Conditions set forth herein.<br /><br />
      <span class="text-[18px] font-semibold text-main">3.&nbsp;Services.</span><br />
      (a) Service Provider themselves or through an independent service supplier (“Supplier”) shall
      provide Services Providing to customer as described in the Booking Confirmation, in accordance
      with these Terms.<br />
      (b) Automotive transportation Service.<br />
      i.&nbsp;Vehicle selection. Service Provider shall allow customers to choose from different
      vehicle classes as set forth on the Service Provider’s website. The vehicle images shown on
      the website are only illustrative examples, and customers are not guaranteed any particular
      vehicle model for the booked vehicle category.<br />
      ii.&nbsp;Luggage. The price given in the Booking Confirmation allows for an adequate number of
      pieces of luggage. The maximum number of pieces of luggage specified for a particular vehicle
      may vary based on the size and weight of passengers and luggage. It is further within the
      discretion of the Service Provider or their Supplier to determine if the volume or weight of
      the luggage is excessive. Excess luggage, bulky luggage, or the transportation of animals not
      requested at the time of booking of services may result in additional charges and or the
      refusal of Service Provider or their Supplier to transport all or part of the luggage or
      animals. All transported property and luggage remains at all times the responsibility of the
      customer. Service Provider or their Supplier accept no responsibility or liability for any
      loss or damage, no matter how caused, to customer property or luggage or for any loss or
      damage to the property of any other passengers.<br />
      iii.&nbsp;Passengers. The maximum number of passengers specified by Service Provider for a
      particular vehicle may vary based on the size and weight of passengers and their luggage, and
      is therefore, not binding on Service Provider or their Supplier(s). Service Provider or their
      Supplier(s) can refuse the transportation of passengers or luggage if it is believed such
      transportation will compromise the space and safety conditions.<br />
      iv.&nbsp;Transportation of children. Service Provider agrees to furnish car/booster seats for
      children, provided that the customer requests this service as an additional comment by
      specifying the age and weight of each baby or child to be transported. Service Provider or
      their Supplier reserve the right to refuse carriage if the request for a car/booster seat was
      not communicated by the customer as an additional comment at the time of booking. In such
      case, the customer shall still be liable for the full cost of the transportation arranged by
      Service Provider.<br />
      v.&nbsp;Transportation generally. The Service Provider’s or their Suppliers’ chauffeurs will
      use their own judgement to drive at reasonable speeds in relation to the law, prevailing road
      type and conditions and should not be asked to exceed the speed limit under any circumstances.
      Unless Service Provider has agreed in writing that Service Provider or their Supplier shall
      use a particular route, Service Provider or their Supplier have full discretion to select the
      most appropriate route regardless of whether it is the shortest or fastest route.<br /><br />
      <span class="text-[18px] font-semibold text-main"
        >4.&nbsp;Terms of payment and transaction fees.</span
      ><br />
      (a) Unless there exists a written agreement between customer and Service Provider providing
      otherwise, the customer must pay in advance for all services by credit, debit card, bank-wire
      transfer or money order, in accordance with the booking confirmation.<br />
      (b) Charges for Service Provider’s Service Providing will appear on the customer credit or
      debit card statement under the name “Driving Guide Tours.”<br />
      (c) In the event Service Provider bills a customer for past or future Service Providing by
      sending the customer an invoice, the customer shall pay the amount specified on the invoice by
      the date provided on the invoice. Service Provider reserves the right to charge the customer
      interest accruing at a rate of 10% on a yearly basis for late payments. The customer may not
      deduct any sums owed to him from the amount specified on the invoice or otherwise owing to
      Service Provider unless authorized in writing by Service Provider.<br /><br />
      <span class="text-[18px] font-semibold text-main">5.&nbsp;Customer’s obligations.</span><br />
      (a)&nbsp;The customer shall:<br />
      (i) cooperate with Service Provider in all matters relating to the Service Providing;<br />
      (ii) respond promptly to any Service Provider request to provide direction, information,
      approvals, authorizations or decisions that are reasonably necessary for Service Provider to
      perform Service Providing in accordance with the requirements of this Agreement;<br />
      (iii) provide such customer materials or information as Service Provider may request and
      Customer considers reasonably necessary to carry out the Service Providing in a timely manner
      and ensure that such customer materials or information are complete and accurate in all
      material respects; and<br />
      (iv) comply with all applicable laws in relation to the Service Providing before the date on
      which the Service Providing are to start.<br />
      (b)&nbsp;Customer behavior in a Service Provider’s or their Supplier’s vehicle. The customer
      is held expressly responsible for the customer’s behavior and for the behavior of all
      passengers who accompany the customer in the Service Provider’s or their Supplier’s vehicle,
      and the customer is responsible to inform such passengers of the provisions of these Terms. If
      it appears to Service Provider or their Supplier that any passenger is engaged in unacceptable
      (for example, rowdy, raucous, drunken or lewd) behavior, then Service Provider, their Supplier
      or the Chauffeur may refuse entry to the vehicle for that passenger, terminate the agreement
      for that booking and or cease the transportation and require that passenger to leave the
      vehicle. In such circumstances, the customer will still be liable to Service Provider for the
      full price of the booking, and neither Service Provider nor their Supplier will be responsible
      or liable for any losses or costs to the customer or any passenger as a result of incomplete
      performance of the transportation. Customer accepts responsibility and will indemnify Service
      Provider or their Supplier for any internal or external damage to or loss of the vehicle or
      any Service Provider or their Supplier property caused or incited to be caused by the customer
      or another passenger. The customer will be liable for cleaning and valet costs for the Service
      Provider or their Supplier vehicle if any passenger causes any spillage or suffers from
      illness or in any other way causes the cleanliness of the vehicle to be of a lower standard
      than it was prior to the customer entry into the vehicle. The standard “Soiling Fee” is 100
      euro; however, Service Provider and their Supplier reserve the right to charge additional
      amounts for any downtime caused by vehicle(s) being taken off the fleet for cleaning. Smoking
      is prohibited in the vehicle. If a customer or another passenger violates the no-smoking
      policy, they will be liable to pay not only the cost for the cleaning of the vehicle but also
      for the loss of any business that results from the related downtime of the vehicle. During the
      entirety of the transportation, all passengers must follow all applicable road and traffic
      regulations, including seat belt rules or regulations. Any instructions given by Service
      Provider or their Supplier must be followed. It is prohibited for passengers to open vehicle
      doors while the vehicle is in motion, to throw any objects from the vehicle, and to stick body
      parts out of or shout from the vehicle. If the customer wishes to use any of the devices or
      facilities in the vehicle, the customer shall request instruction from the Service Provider or
      their Supplier.<br /><br />
      <span class="text-[18px] font-semibold text-main">6.&nbsp;Customer’s acts or omissions.</span
      ><br />
      If Service Provider’s performance of their obligations under this Agreement is prevented or
      delayed by any act or omission of customer or their agents, subcontractors, consultants or
      employees, Service Provider shall not be deemed in breach of their obligations under this
      Agreement or otherwise liable for any costs, charges or losses sustained or incurred by
      customer, in each case, to the extent arising directly or indirectly from such prevention or
      delay.<br /><br />
      <span class="text-[18px] font-semibold text-main">7.&nbsp;Taxes.</span><br />
      Customer shall be responsible for all sales, use and excise taxes, and any other similar
      taxes, duties and charges of any kind imposed by any federal, state or local governmental
      entity on any amounts payable by customer hereunder.<br /><br />
      <span class="text-[18px] font-semibold text-main"
        >8.&nbsp;Cancellations, changes to bookings, and no-shows.</span
      ><br />
      (a)&nbsp;Cancellations. The customer may cancel a booking at any time, but unless otherwise
      specified in writing, the following cancellation penalties will apply:<br />
      Bookings cancelled at least 2 weeks before the pick-up time will bear a 30% penalty.<br />
      Bookings cancelled from 2 weeks to at least 48 hours before the pick-up time will bear a 50%
      penalty.<br />
      Bookings cancelled from 48 hours to at least 24 hours before the pick-up time will bear a 80%
      penalty.<br />
      Bookings cancelled from 24 hours before the pick-up time or no shows will bear a 100%
      penalty.<br />
      The penalty amount will be equal to the corresponding percentage of the price for the Booking.
      In cases where the customer has prepaid for some or all of the Service Providing, Service
      Provider will retain the penalty amount, or 50 euro, whichever is greater, and reimburse the
      rest to customer.<br />
      (b)&nbsp;Changes to bookings. Any requests for changes to existing bookings will be treated as
      cancellations of the existing booking, and subject to availability, a new booking will be
      made. The cancellation penalties set forth in paragraph 8(a) shall apply.<br />
      (c)&nbsp;Changes to vehicle transportation after commencement of transportation. Subject to
      the agreement and consent of Service Provider, the customer and his/her passenger(s) may
      request changes to the travel arrangements after transportation has already commenced. In such
      cases, the price of the transportation services may be subject to additional increases.<br />
      (d)&nbsp;No-shows. When a client fails to arrive at an agreed time or place or on an agreed
      flight, ship, train or other mode of scheduled or chartered transportation, as agreed upon
      with Service Provider, the customer will have to pay the full price of the journey or tour
      booked in addition to the value of any time or parking or other fees incurred as a result of
      the Service Provider’s chauffeurs or tour guides attempts to wait for and or locate the absent
      customer.<br /><br />
      <span class="text-[18px] font-semibold text-main">9.&nbsp;Confidential information.</span
      ><br />
      (a) All non-public, confidential or proprietary information of Service Provider, including,
      but not limited to, trade secrets, technology, information pertaining to business operations
      and strategies, and information pertaining to customers, pricing, and marketing (collectively,
      “Confidential Information”), disclosed by Service Provider to customer, whether disclosed
      orally or disclosed or accessed in written, electronic or other form or media, and whether or
      not marked, designated or otherwise identified as “confidential,” in connection with the
      provision of the Service Providing and this Agreement is confidential, and shall not be
      disclosed or copied by customer without the prior written consent of Service Provider.
      Confidential Information does not include information that is:<br />
      (i) in the public domain;<br />
      (ii) known to customer at the time of disclosure; or<br />
      (iii) rightfully obtained by customer on a non-confidential basis from a third party.<br />
      (b) Customer agrees to use the Confidential Information only to make use of the Service
      Providing.<br />
      (c) Service Provider shall be entitled to injunctive relief for any violation of this
      Section.<br /><br />
      <span class="text-[18px] font-semibold text-main">10.&nbsp;Representation and warranty.</span
      ><br />
      (a) Service Provider represents and warrants to Customer that it shall perform the Service
      Providing using personnel of required skill, experience and qualifications and in a
      professional and workmanlike manner in accordance with generally recognized industry standards
      for similar services and shall devote adequate resources to meet their obligations under this
      Agreement.<br />
      (b) Service Provider shall not be liable for a breach of the warranty set forth in Section
      10(a) unless customer gives written notice of the defective Service Providing, reasonably
      described, to Service Provider within fifteen (15) days from the conclusion of the Service
      Providing.<br />
      (c) Subject to Section 10(b), Service Provider shall, in their sole discretion, either:<br />
      (i) repair or re-perform such Service Providing (or the defective part); or<br />
      (ii) credit or refund the price of such Service Providing at the pro rata contract rate.<br />
      (d) THE REMEDIES SET FORTH IN SECTION 10(c) SHALL BE THE CUSTOMER’S SOLE AND EXCLUSIVE REMEDY
      AND SERVICE PROVIDER’S ENTIRE LIABILITY FOR ANY BREACH OF THE LIMITED WARRANTY SET FORTH IN
      SECTION 10(a).<br /><br />
      <span class="text-[18px] font-semibold text-main">11.&nbsp;Disclaimer of Warranties.</span
      ><br />
      EXCEPT FOR THE WARRANTY SET FORTH IN SECTION 10(a) ABOVE, SERVICE PROVIDER MAKES NO WARRANTY
      WHATSOEVER WITH RESPECT TO THE SERVICES, INCLUDING ANY (A) WARRANTY OF MERCHANTABILITY; OR (B)
      WARRANTY OF FITNESS FOR A PARTICULAR PURPOSE; OR (C) WARRANTY OF TITLE; OR (D) WARRANTY
      AGAINST INFRINGEMENT OF INTELLECTUAL PROPERTY RIGHTS OF A THIRD PARTY; WHETHER EXPRESS OR
      IMPLIED BY LAW, COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE OF TRADE OR OTHERWISE.<br /><br />
      <span class="text-[18px] font-semibold text-main">12.&nbsp;Limitation of Liability.</span
      ><br />
      (a) In no event shall Service Provider or their Supplier(s) be liable to a customer or to any
      third party for any loss of use, revenue or profit [or loss of data or diminution in value],
      or for any consequential, incidental, indirect, exemplary, special or punitive damages whether
      arising out of breach of contract, tort (including negligence) or otherwise, regardless of
      whether such damages were foreseeable and whether or not Service Provider or their Supplier(s)
      have been advised of the possibility of such damages, and notwithstanding the failure of any
      agreed or other remedy of its essential purpose.<br />
      (b) Service Provider and their Supplier(s) accept no liability for any loss, damage or theft
      of any luggage or personal belonging of the customer and/or passengers as a result of the
      transportation or tour service.<br />
      (c) Service Provider and their Supplier(s) accept no liability for death, illness or injury of
      any kind as a result of the transportation service. Any claim for injury or death resulting
      from acts of Service Provider or their Supplier(s) in this case should be pursued as a claim
      under an insurance policy owned by Service Provider or their Supplier(s).<br />
      (d) Service Provider and their Supplier(s) accept no liability for death, illness or injury of
      any kind as a result of any walking tour service. Any claim for injury, illness or death
      resulting from acts of Service Provider or their Supplier(s) in this case should be pursued as
      a claim under an insurance policy owned by the customer.<br />
      (e) Service Provider is not liable for the intentional or negligent acts of their Suppliers or
      any other third party.<br /><br />
      <span class="text-[18px] font-semibold text-main">13.&nbsp;Waiver.</span><br />
      No waiver by Service Provider of any of the provisions of this Agreement is effective unless
      explicitly set forth in writing and signed by Service Provider. No failure to exercise, or
      delay in exercising, any rights, remedy, power or privilege arising from this Agreement
      operates or may be construed as a waiver thereof. No single or partial exercise of any right,
      remedy, power or privilege hereunder precludes any other or further exercise thereof or the
      exercise of any other right, remedy, power or privilege.<br /><br />
      <span class="text-[18px] font-semibold text-main">14.&nbsp;Force Majeure.</span><br />
      Service Provider shall not be liable or responsible to customer, nor be deemed to have
      defaulted or breached this Agreement, for any failure or delay in fulfilling or performing any
      term of this Agreement when and to the extent such failure or delay is caused by or results
      from active or imminent acts or circumstances beyond the reasonable control of Service
      Provider including, without limitation, acts of God, flood, fire, earthquake, explosion,
      governmental actions, war, invasion or hostilities (whether war is declared or not), terrorist
      threats or acts, riot, or other civil unrest, national emergency, revolution, insurrection,
      epidemic, lock-outs, strikes or other labor disputes (whether or not relating to either
      party’s workforce), or restraints or delays affecting carriers or inability or delay in
      obtaining supplies of adequate or suitable materials, materials or telecommunication breakdown
      or power outage.<br /><br />
      <span class="text-[18px] font-semibold text-main">15.&nbsp;Assignment.</span><br />
      Customer shall not assign any of their rights or delegate any of obligations under this
      Agreement without the prior written consent of Service Provider. Any purported assignment or
      delegation in violation of this Section is null and void. No assignment or delegation relieves
      customer of any of their obligations under this Agreement.<br /><br />
      <span class="text-[18px] font-semibold text-main">16.&nbsp;No Third-Party Beneficiaries.</span
      ><br />
      This Agreement is for the sole benefit of the parties hereto and their respective successors
      and permitted assigns and nothing herein, express or implied, is intended to or shall confer
      upon any other person or entity any legal or equitable right, benefit or remedy of any nature
      whatsoever under or by reason of these Terms.<br /><br />
      <span class="text-[18px] font-semibold text-main">17.&nbsp;Governing Law.</span><br />
      All matters arising out of or relating to this Agreement are governed by and construed in
      accordance with the internal laws of Italy without giving effect to any choice or conflict of
      law provision or rule that would cause the application of the laws of any jurisdiction other
      than those of Italy.<br /><br />
      <span class="text-[18px] font-semibold text-main">18.&nbsp;Submission to Jurisdiction.</span
      ><br />
      Any legal suit, action or proceeding arising out of or relating to this Agreement shall be
      instituted in Italy in the court of Florence, and each party irrevocably submits to the
      exclusive jurisdiction of such court in any such suit, action or proceeding.<br /><br />
      <span class="text-[18px] font-semibold text-main">19.&nbsp;Notices.</span><br />
      All notices, requests, consents, claims, demands, waivers and other communications hereunder
      (each, a “Notice”) shall be in writing and addressed to the parties at the addresses set forth
      in the Booking Confirmation or to such other address that may be designated by the receiving
      party in writing. All Notices shall be delivered by personal delivery, nationally recognized
      overnight courier (with all fees pre-paid), facsimile (with confirmation of transmission) or
      certified or registered mail (in each case, return receipt requested, postage prepaid). Except
      as otherwise provided in this Agreement, a Notice is effective only (a) upon receipt of the
      receiving party, and (b) if the party giving the Notice has complied with the requirements of
      this Section.<br /><br />
      <span class="text-[18px] font-semibold text-main">20.&nbsp;Severability.</span><br />
      If any term or provision of this Agreement is invalid, illegal or unenforceable in any
      jurisdiction, such invalidity, illegality or unenforceability shall not affect any other term
      or provision of this Agreement or invalidate or render unenforceable such term or provision in
      any other jurisdiction.<br /><br />
      <span class="text-[18px] font-semibold text-main">21.&nbsp;Amendment and Modification.</span
      ><br />
      These Terms may be amended or modified. Notification of changes to these Terms will be made as
      a unilateral declaration by publishing the new Terms on the website of Service Provider.
    </div>
  </div>
  <h1 v-if="!isLoggedIn" class="title mr-[15px] mt-[5rem]">
    Please login to view account information
  </h1>
  <router-link v-if="!isLoggedIn" to="/account/signin" class="button mt-[15px] w-fit"
    >Sign in</router-link
  >
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
import { computed, ref } from 'vue'
import swipeModal from '@takuma-ru/vue-swipe-modal'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMobile } from '@/compose/ismobile'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import CarPopupContent from '@/components/features/car/CarPopupContent.vue'
import { useOrderStore } from '@/stores/ride/order'
import { useRidesHistoryStore } from '@/stores/ride/history'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import { useFetcher } from '@/compose/axios'

const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })
const trustyStore = useTrustyStore()
const router = useRouter()
const ridesStore = useRidesHistoryStore()
const userStore = useUserStore()
const orderStore = useOrderStore()
const { isLoggedIn, user } = storeToRefs(userStore)
const isModal = ref(false)

const { isMobile } = useMobile()

const isAgency = computed(() => {
  return user.value?.type === 'agency' || user.value?.type === 'request for Agency'
})

const newRide = () => {
  userStore.clearAgencyData()
  trustyStore.clearInput('pickup')
  trustyStore.clearInput('dropoff')
  orderStore.$reset()
  orderStore.changeTypeOrder('NEW')
  router.push({ name: 'home' })
}

const logOut = () => {
  ridesStore.$reset()
  userStore.preventLogout()
  axiosInstance.get(`/spy/logout`)
  setTimeout(() => router.push('/account/signin'), 100)
}

onMounted(() => {})
</script>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  scrollbar-width: none;
}
</style>
