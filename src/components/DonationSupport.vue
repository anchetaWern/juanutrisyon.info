<template>
  <section class="donation-support" aria-labelledby="donation-support-title">
    <div class="donation-support__inner">
      <p id="donation-support-title">
        Juan Nutrisyon is an independent project built to make nutrition information more
        accessible to Filipinos.
      </p>
      <p>
        Built by
        <a href="https://wernancheta.com" target="_blank" rel="noopener">Wern Ancheta</a>.
      </p>
      <p>
        <RouterLink to="/about">Learn more about the project</RouterLink>.
      </p>
      <p>
        If you find the project useful or believe in what we're building, you can help support
        its continued development by clicking on the button below.
      </p>
      <button class="donation-support__button" type="button" @click="openDonationModal">
        Support Juan Nutrisyon
      </button>
    </div>
  </section>

  <Teleport to="body">
    <div
      v-if="activeModal"
      class="donation-modal-backdrop"
      role="presentation"
      @click.self="closeModals"
    >
      <section
        v-if="activeModal === 'donate'"
        ref="donateModalRef"
        class="donation-modal donation-modal--qr"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
        tabindex="-1"
        @keydown.esc="closeModals"
      >
        <h2 id="donation-modal-title">Support Juan Nutrisyon</h2>
        <p class="donation-modal__intro">
          Thank you so much for your donation. It means so much for an independent project like this.
          Scan the QR below to donate. Any amount is appreciated.
        </p>

        <div class="qr-tabs" role="tablist" aria-label="Donation payment method">
          <button
            v-for="method in paymentMethods"
            :id="`${method.id}-tab`"
            :key="method.id"
            class="qr-tabs__tab"
            :class="{ 'qr-tabs__tab--active': selectedPaymentMethod === method.id }"
            type="button"
            role="tab"
            :aria-selected="selectedPaymentMethod === method.id"
            :aria-controls="`${method.id}-panel`"
            @click="selectedPaymentMethod = method.id"
          >
            {{ method.label }}
          </button>
        </div>

        <div
          :id="`${selectedMethod.id}-panel`"
          class="qr-panel"
          role="tabpanel"
          :aria-labelledby="`${selectedMethod.id}-tab`"
        >
          <img
            class="qr-panel__image"
            :src="selectedMethod.qrSrc"
            :alt="`${selectedMethod.label} donation QR code for Juan Nutrisyon`"
          />
          <a class="qr-panel__download" :href="selectedMethod.qrSrc" :download="selectedMethod.fileName">
            Download {{ selectedMethod.label }} QR Code
          </a>
          <button class="donation-support__button" type="button" @click="openDetailsModal">
            I sent a donation
          </button>
        </div>

        <button class="donation-modal__close" type="button" @click="closeModals">Close</button>
      </section>

      <section
        v-else-if="activeModal === 'details'"
        ref="detailsModalRef"
        class="donation-modal donation-modal--details"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-details-title"
        tabindex="-1"
        @keydown.esc="closeModals"
      >
        <h2 id="donation-details-title">Donation details</h2>

        <form class="donation-form" @submit.prevent="submitDonation">
          <label class="sr-only" for="donor-name">Name or nickname</label>
          <input
            id="donor-name"
            v-model="form.name"
            name="name"
            type="text"
            autocomplete="name"
            placeholder="Name or nickname (optional)"
          />

          <label class="sr-only" for="donation-amount">Amount</label>
          <input
            id="donation-amount"
            v-model="form.amount"
            name="amount"
            type="text"
            inputmode="decimal"
            placeholder="Amount (optional)"
          />

          <fieldset>
            <legend>GCash or Maya</legend>
            <label v-for="method in paymentMethods" :key="method.id" class="radio-option">
              <input v-model="form.payment_method" type="radio" name="payment_method" :value="method.id" />
              <span>{{ method.label }}</span>
            </label>
          </fieldset>

          <fieldset>
            <legend>How should we acknowledge you?</legend>
            <label class="radio-option">
              <input v-model="form.acknowledgement" type="radio" name="acknowledgement" value="none" />
              <span>Please don't acknowledge me publicly</span>
            </label>
            <label class="radio-option">
              <input v-model="form.acknowledgement" type="radio" name="acknowledgement" value="anonymous" />
              <span>Acknowledge me anonymously</span>
            </label>
            <label class="radio-option">
              <input v-model="form.acknowledgement" type="radio" name="acknowledgement" value="name" />
              <span>Use my name or nickname</span>
            </label>
          </fieldset>

          <label class="sr-only" for="donation-message">Message</label>
          <textarea
            id="donation-message"
            v-model="form.message"
            name="message"
            rows="3"
            placeholder="Message (optional)"
          ></textarea>

          <div>
            <label class="sr-only" for="donor-contact">Contact</label>
            <input
              id="donor-contact"
              v-model="form.contact"
              name="contact"
              type="text"
              autocomplete="email"
              placeholder="Contact (optional)"
              aria-describedby="donor-contact-help"
            />
            <p id="donor-contact-help" class="donation-form__help">
              So I can thank you or contact you if needed. This won't be displayed publicly.
            </p>
          </div>

          <p v-if="submitError" class="donation-form__status donation-form__status--error" role="alert">
            {{ submitError }}
          </p>

          <div class="donation-form__actions">
            <button class="donation-form__button donation-form__button--plain" type="button" @click="closeModals">
              Cancel
            </button>
            <button class="donation-form__button donation-form__button--primary" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit' }}
            </button>
          </div>
        </form>
      </section>

      <section
        v-if="activeModal === 'success'"
        ref="successModalRef"
        class="donation-modal donation-modal--success"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-success-title"
        tabindex="-1"
        @keydown.esc="closeModals"
      >
        <h2 id="donation-success-title">Thank you for supporting Juan Nutrisyon</h2>
        <p>
          Your donation details were received. Your support helps keep the project moving.
        </p>
        <button class="donation-support__button" type="button" @click="closeModals">Done</button>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'

const API_BASE_URI = 'https://api.juanutrisyon.info/api'

const paymentMethods = [
  {
    id: 'gcash',
    label: 'GCash',
    qrSrc: '/donate/gcash-qr.jpeg',
    fileName: 'juan-nutrisyon-gcash-qr.jpeg'
  },
  {
    id: 'maya',
    label: 'Maya',
    qrSrc: '/donate/maya-qr.jpeg',
    fileName: 'juan-nutrisyon-maya-qr.jpeg'
  }
]

const activeModal = ref('')
const selectedPaymentMethod = ref('gcash')
const donateModalRef = ref(null)
const detailsModalRef = ref(null)
const successModalRef = ref(null)
const isSubmitting = ref(false)
const submitError = ref('')

const form = reactive({
  name: '',
  amount: '',
  payment_method: 'gcash',
  acknowledgement: 'none',
  message: '',
  contact: ''
})

const selectedMethod = computed(() => {
  return paymentMethods.find((method) => method.id === selectedPaymentMethod.value) || paymentMethods[0]
})

const nullableString = (value) => {
  const normalized = String(value || '').trim()
  return normalized ? normalized : null
}

const focusActiveModal = async () => {
  await nextTick()

  const modalByName = {
    donate: donateModalRef.value,
    details: detailsModalRef.value,
    success: successModalRef.value
  }

  modalByName[activeModal.value]?.focus()
}

const openDonationModal = () => {
  activeModal.value = 'donate'
  submitError.value = ''
}

const openDetailsModal = () => {
  form.payment_method = selectedPaymentMethod.value
  activeModal.value = 'details'
  submitError.value = ''
}

const closeModals = () => {
  activeModal.value = ''
  submitError.value = ''
}

const resetForm = () => {
  form.name = ''
  form.amount = ''
  form.payment_method = selectedPaymentMethod.value
  form.acknowledgement = 'none'
  form.message = ''
  form.contact = ''
}

const submitDonation = async () => {
  isSubmitting.value = true
  submitError.value = ''

  try {
    const response = await fetch(`${API_BASE_URI}/donation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        name: nullableString(form.name),
        amount: nullableString(form.amount),
        payment_method: form.payment_method,
        acknowledgement: form.acknowledgement,
        message: nullableString(form.message),
        contact: nullableString(form.contact)
      })
    })

    if (!response.ok) {
      throw new Error('Unable to submit donation details.')
    }

    resetForm()
    activeModal.value = 'success'
  } catch {
    submitError.value = 'Sorry, we could not submit your donation details. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

watch(selectedPaymentMethod, (method) => {
  form.payment_method = method
})

watch(activeModal, (modalName) => {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('donation-modal-is-open', Boolean(modalName))
  }

  if (modalName) {
    focusActiveModal()
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('donation-modal-is-open')
  }
})
</script>

<style scoped>
.donation-support {
  width: min(100% - 40px, 590px);
  margin: var(--space-8) auto 0;
}

.donation-support__inner {
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  text-align: center;
}

.donation-support p {
  max-width: 500px;
  margin: 0 auto var(--space-2);
  color: var(--text-primary);
  font-size: 0.88rem;
  line-height: 1.45;
}

.donation-support a {
  color: var(--brand-700);
  font-weight: 600;
}

.donation-support__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  margin-top: var(--space-3);
  padding: 0.55rem 0.95rem;
  border: 1px solid var(--success);
  border-radius: var(--radius-sm);
  background: #18803a;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  box-shadow: var(--shadow-popover);
}

.donation-support__button:hover {
  background: #146c33;
}

.donation-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-5);
  background: rgba(15, 23, 42, 0.42);
  overflow-y: auto;
}

.donation-modal {
  width: min(100%, 500px);
  max-height: min(92vh, 760px);
  padding: var(--space-5);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text-primary);
  overflow-y: auto;
  box-shadow: var(--shadow-popover);
}

.donation-modal:focus {
  outline: none;
}

.donation-modal h2 {
  margin-bottom: var(--space-3);
  color: #3f4248;
  font-size: clamp(1.35rem, 3vw, 1.7rem);
  line-height: 1.2;
}

.donation-modal__intro {
  margin-bottom: var(--space-5);
  color: #4d4f55;
  font-size: 1rem;
  line-height: 1.45;
}

.qr-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: var(--space-8);
}

.qr-tabs__tab {
  min-height: 42px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #3f4248;
  font-size: 0.98rem;
  cursor: pointer;
}

.qr-tabs__tab--active {
  border-color: #18803a;
  color: #18803a;
}

.qr-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-panel__image {
  width: min(100%, 230px);
  max-height: 300px;
  object-fit: contain;
  margin-bottom: var(--space-4);
}

.qr-panel__download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin-bottom: var(--space-2);
  padding: 0.5rem 0.9rem;
  border: 1px solid #18803a;
  border-radius: var(--radius-sm);
  color: #18803a;
  font-weight: 500;
}

.donation-modal__close {
  display: block;
  margin: var(--space-5) 0 0 auto;
  border: 0;
  background: transparent;
  color: #3f4248;
  font-size: 0.98rem;
  cursor: pointer;
}

.donation-form {
  display: grid;
  gap: var(--space-3);
}

.donation-form input[type='text'],
.donation-form textarea {
  width: 100%;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xs);
  background: #ffffff;
  color: #3f4248;
  font: inherit;
  font-size: 0.98rem;
}

.donation-form input[type='text'] {
  min-height: 44px;
  padding: 0 0.9rem;
}

.donation-form textarea {
  min-height: 76px;
  padding: 0.75rem 0.9rem;
  resize: vertical;
}

.donation-form input::placeholder,
.donation-form textarea::placeholder,
.donation-form legend,
.donation-form__help {
  color: #898d93;
}

.donation-form fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  padding: 0;
  border: 0;
}

.donation-form legend {
  width: 100%;
  margin-bottom: var(--space-1);
  font-size: 0.98rem;
}

.radio-option {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: #3f4248;
  font-size: 0.98rem;
  line-height: 1.35;
}

.radio-option input {
  width: 20px;
  height: 20px;
  margin: 0;
  accent-color: #18803a;
}

.donation-form__help {
  margin-top: var(--space-1);
  padding-left: 0.9rem;
  font-size: 0.82rem;
  line-height: 1.25;
}

.donation-form__status {
  margin: 0;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  font-weight: 700;
}

.donation-form__status--error {
  background: var(--nutrition-limit-bg);
  color: var(--error);
}

.donation-form__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-4);
}

.donation-form__button {
  min-height: 48px;
  padding: 0.6rem 1.1rem;
  border-radius: var(--radius-sm);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.donation-form__button--plain {
  border: 0;
  background: transparent;
  color: #3f4248;
}

.donation-form__button--primary {
  border: 1px solid #18803a;
  background: #18803a;
  color: #ffffff;
  box-shadow: var(--shadow-popover);
}

.donation-form__button--primary:disabled {
  cursor: wait;
  opacity: 0.7;
}

.donation-modal--success {
  text-align: center;
}

.donation-modal--success p {
  margin-bottom: var(--space-3);
  color: #4d4f55;
  font-size: 0.98rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 560px) {
  .donation-support {
    width: min(100% - 28px, 590px);
  }

  .donation-support__inner {
    padding: var(--space-4);
  }

  .donation-modal {
    padding: var(--space-5);
  }

  .donation-modal-backdrop {
    align-items: flex-start;
    padding: var(--space-4);
  }

  .donation-form fieldset {
    flex-direction: column;
  }

  .donation-form__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .donation-form__button {
    width: 100%;
  }
}
</style>
