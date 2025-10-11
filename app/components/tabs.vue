<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import logo from '~/assets/images/logo.png'

const { data: page } = await useAsyncData('pricing', () => queryCollection('pricing').first())

const textContent = ref('')

// Socket.io integration
const { socket, isConnected, connect, disconnect, emit, on, off } = useSocket()

// QR Code integration
const { generateQRCode, downloadQRCode } = useQRCode()
const qrCodeContainer = ref<HTMLDivElement | null>(null)
const sessionId = ref('jh2jlorc0o') // TODO: Generate unique session ID

// Get URL safely for both SSR and client
const requestUrl = useRequestURL()
const sessionUrl = computed(() => `${requestUrl.origin}/session/${sessionId.value}`)

// Get color mode for theme-responsive QR code
const colorMode = useColorMode()

// Text update handler
const handleTextUpdate = (data: { text: string, castId: string }) => {
  textContent.value = data.text
}

// Generate QR Code with theme-responsive colors and logo
const createQRCode = () => {
  if (!qrCodeContainer.value) return

  const isDark = colorMode.value === 'dark'

  const qrCode = generateQRCode({
    data: sessionUrl.value,
    width: 200,
    height: 200,
    image: logo, // CopyCast logo in center
    dotsColor: isDark ? '#60a5fa' : '#3b82f6', // blue-400 in dark, blue-500 in light
    cornersSquareColor: isDark ? '#60a5fa' : '#2563eb', // blue-400 in dark, blue-600 in light
    cornersDotColor: isDark ? '#60a5fa' : '#2563eb', // blue-400 in dark, blue-600 in light
    backgroundColor: isDark ? '#1f2937' : '#ffffff' // Dark gray in dark mode, white in light mode
  })

  // Clear previous QR code
  qrCodeContainer.value.innerHTML = ''

  // Append new QR code
  qrCode.append(qrCodeContainer.value)

  return qrCode
}

// Download QR code handler
const handleDownloadQR = () => {
  const qrCode = createQRCode()
  if (qrCode) {
    downloadQRCode(qrCode, `session-${sessionId.value}`)
  }
}

// Connect to socket and setup listeners when component mounts
onMounted(() => {
  connect()
  on('text-update', handleTextUpdate)

  // Generate QR code when component mounts
  nextTick(() => {
    createQRCode()
  })
})

// Clean up event listeners on unmount
onUnmounted(() => {
  off('text-update', handleTextUpdate)
})

// Emit text changes to other connected devices
watch(textContent, (newText) => {
  if (isConnected.value) {
    emit('text-change', { text: newText, castId: sessionId.value })
  }
})

// Regenerate QR code when theme changes
watch(() => colorMode.value, () => {
  nextTick(() => {
    createQRCode()
  })
})

const items: TabsItem[] = [
  {
    label: 'Share Text',
    slot: 'text' as const
  },
  {
    label: 'History',
    slot: 'history' as const
  },
  {
    label: 'Pricing',
    slot: 'pricing' as const
  }
]
</script>

<template>
  <UTabs :items="items" class="w-full max-w-7xl mx-auto" color="neutral" :ui="{ trigger: 'grow' }">
    <template #text="{ item }">
      <div class="grid md:grid-cols-2 gap-6 mt-8">
        <!-- Left Card - Text to Cast -->
        <UCard class="flex flex-col h-full">
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-type" class="w-5 h-5 text-primary" />
              <div>
                <h3 class="text-lg font-semibold text-highlighted">Text to Cast</h3>
                <p class="text-sm text-muted">Type or paste your text here. It will sync across all connected devices.</p>
              </div>
            </div>
          </template>

          <div class="flex flex-col flex-1 space-y-4">
            <UTextarea
              v-model="textContent"
              placeholder="Enter your text here..."
              resize
              class="flex-1 min-h-0"
              :ui="{ base: 'h-full' }"
            />
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-sm text-muted">{{ textContent.length }} characters</span>
                <div class="flex items-center gap-1.5">
                  <div 
                    class="w-2 h-2 rounded-full transition-colors"
                    :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
                  />
                  <span class="text-xs text-muted">
                    {{ isConnected ? 'Connected' : 'Disconnected' }}
                  </span>
                </div>
              </div>
              <UButton 
                icon="i-lucide-copy" 
                label="Copy" 
                color="primary" 
                size="sm"
              />
            </div>
          </div>
        </UCard>

        <!-- Right Card - Connect Devices -->
        <UCard class="h-fit">
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-qr-code" class="w-5 h-5 text-primary" />
              <div>
                <h3 class="text-lg font-semibold text-highlighted">Connect Devices</h3>
                <p class="text-sm text-muted">Scan this QR code with another device to join the session.</p>
              </div>
            </div>
          </template>

          <div class="space-y-6 text-center">
            <!-- QR Code -->
            <div class="flex justify-center">
              <div
                ref="qrCodeContainer"
                class="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-primary-200 dark:border-primary-700 shadow-sm"
              />
            </div>

            <p class="text-sm text-muted">Scan to join cast</p>

            <!-- Session URL -->
            <div class="text-xs break-all p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <p class="text-primary font-mono">{{ sessionUrl }}</p>
            </div>

            <!-- Cast ID and Connected Devices -->
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">Cast ID:</span>
                <UBadge variant="subtle" size="sm" class="font-mono">{{ sessionId }}</UBadge>
              </div>

              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">Connected devices:</span>
                <span class="text-highlighted">1</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2 justify-center">
              <UButton
                icon="i-lucide-download"
                label="Download"
                variant="outline"
                size="sm"
                @click="handleDownloadQR"
              />
              <UButton
                icon="i-lucide-share"
                label="Share"
                variant="outline"
                size="sm"
              />
            </div>

            <!-- Session Info -->
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Session ID:</span>
                <span class="font-mono text-highlighted">{{ sessionId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Connected devices:</span>
                <span class="text-highlighted">1</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>

    <template #history="{ item }">
      <p>History will have the premium if no auth and no premium</p>
      
    </template>

    <template #pricing="{ item }">
      
      <UPricingPlans scale class="mt-5">
        <UPricingPlan
          v-for="(plan, index) in page.plans"
          :key="index"
          v-bind="plan"
          :price="plan.price.month"
          :billing-cycle="'/month'"
        />
      </UPricingPlans>
   
      
    </template>
  </UTabs>
</template>

