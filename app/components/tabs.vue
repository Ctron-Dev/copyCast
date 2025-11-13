<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const { data: page } = await useAsyncData('pricing', () => queryCollection('pricing').first())

const textContent = ref('')

// Socket.io integration
const { socket, isConnected, connect, disconnect, emit, on, off } = useSocket()

// Connect to socket when component mounts
onMounted(() => {
  connect()
})

// Listen for text updates from other devices
onMounted(() => {
  on('text-update', (data: { text: string, castId: string }) => {
    textContent.value = data.text
  })
})

// Emit text changes to other connected devices
watch(textContent, (newText) => {
  if (isConnected.value) {
    emit('text-change', { text: newText, castId: 'jh2jlorc0o' })
  }
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
            <!-- QR Code Placeholder -->
            <div class="flex justify-center">
              <div class="w-48 h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg flex items-center justify-center border-2 border-dashed border-primary-300 dark:border-primary-700">
                <div class="text-center">
                  <UIcon name="i-lucide-qr-code" class="w-12 h-12 text-primary mx-auto mb-2" />
                  <p class="text-sm text-muted">QR Code will appear here</p>
                </div>
              </div>
            </div>

            <p class="text-sm text-muted">Scan to join cast</p>
            
            <!-- Session URL -->
            <div class="text-xs break-all p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <p class="text-primary font-mono">https://preview-text-copy-across-devices-kzmqjoj43mcyooxalgav.vusercontent.net/session/jh2jlorc0o</p>
            </div>

            <!-- Cast ID and Connected Devices -->
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">Cast ID:</span>
                <UBadge variant="subtle" size="sm" class="font-mono">jh2jlorc0o</UBadge>
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
                <span class="font-mono text-highlighted">jh2jlorc0o</span>
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

