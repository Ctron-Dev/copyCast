<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

// Test Supabase integration
const clipboardStore = useClipboardStore()
const testContent = ref('')

// Test Socket.io integration
const socket = useSocket()

// Use the socket's isConnected state directly
const socketStatus = computed(() => socket.isConnected.value ? 'Connected' : 'Disconnected')

// Clipboard sync handler
const handleClipboardSync = (data: any) => {
  console.log('Received clipboard sync:', data)
  // You can update the store here if needed
}

// Connect socket when component mounts
onMounted(() => {
  socket.connect()
  socket.on('clipboard-sync', handleClipboardSync)
})

// Clean up event listeners on unmount
onUnmounted(() => {
  socket.off('clipboard-sync', handleClipboardSync)
})

const testCreateRoom = async () => {
  try {
    await clipboardStore.createRoom('Test Room')
  } catch (error) {
    console.error('Error creating room:', error)
  }
}

const testAddClip = async () => {
  if (!testContent.value.trim()) return
  try {
    await clipboardStore.addClip(testContent.value)
    testContent.value = ''
  } catch (error) {
    console.error('Error adding clip:', error)
  }
}
</script>

<template>
  <div v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.hero.links"
    >
    <!-- orientation="horizontal" -->
      <template #top>
        <div class="absolute rounded-full dark:bg-primary blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-1/2 -translate-y-80" ></div>

        <LazyStarsBg />
        
        <!-- tabs seciont i need to fix the styling and the tabs lol  -->
        <!-- <Tabs /> -->
      </template>
      <Tabs />
      <!-- <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :features="section.features"
      >
      <ImagePlaceholder />
      </UPageSection> -->

      <!-- maybe create a video in the future and smash it here -->
      <!-- <PromotionalVideo /> -->
    </UPageHero>

    <!-- <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :features="section.features"
    >
      <ImagePlaceholder />
    </UPageSection> -->

    <!-- features -->
    <!-- <UPageSection
      :title="page.features.title"
      :description="page.features.description"
    >
      <UPageGrid>
        <UPageCard
          v-for="(item, index) in page.features.items"
          :key="index"
          v-bind="item"
          spotlight
        />
      </UPageGrid>
    </UPageSection> -->

    <!-- testemonials -->
    <!-- <UPageSection
      id="testimonials"
      :headline="page.testimonials.headline"
      :title="page.testimonials.title"
      :description="page.testimonials.description"
    >
      <UPageColumns class="xl:columns-4">
        <UPageCard
          v-for="(testimonial, index) in page.testimonials.items"
          :key="index"
          variant="subtle"
          :description="testimonial.quote"
          :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }"
        >
          <template #footer>
            <UUser
              v-bind="testimonial.user"
              size="lg"
            />
          </template>
        </UPageCard>
      </UPageColumns>
    </UPageSection> -->

    <USeparator />

    <!-- Test Supabase Integration -->
    <UContainer class="py-16">
      <div class="max-w-md mx-auto space-y-6">
        <h3 class="text-2xl font-bold text-center">Test Integration</h3>
        
        <!-- Socket Status -->
        <div class="flex items-center justify-between p-3 border rounded-lg">
          <span class="font-semibold">Socket Status:</span>
          <UBadge 
            :color="socketStatus === 'Connected' ? 'green' : 'red'"
            variant="subtle"
          >
            {{ socketStatus }}
          </UBadge>
        </div>
        
        <!-- Current Room Info -->
        <div v-if="clipboardStore.currentRoom" class="p-4 border rounded-lg">
          <p><strong>Current Room:</strong> {{ clipboardStore.currentRoom.name }}</p>
          <p><strong>Room ID:</strong> {{ clipboardStore.currentRoom.id }}</p>
        </div>

        <!-- Create Room Button -->
        <UButton 
          @click="testCreateRoom" 
          :loading="clipboardStore.loading"
          block
        >
          Create Test Room
        </UButton>

        <!-- Add Clip Form -->
        <div v-if="clipboardStore.currentRoom" class="space-y-3">
          <UInput 
            v-model="testContent"
            placeholder="Enter text to add to clipboard"
          />
          <UButton 
            @click="testAddClip" 
            :loading="clipboardStore.loading"
            :disabled="!testContent.trim()"
            block
          >
            Add Clip
          </UButton>
        </div>

        <!-- Error Display -->
        <UAlert 
          v-if="clipboardStore.error"
          color="red"
          variant="subtle"
          :title="clipboardStore.error"
        />

        <!-- Clips List -->
        <div v-if="clipboardStore.clips.length > 0" class="space-y-2">
          <h4 class="font-semibold">Clipboard History:</h4>
          <div 
            v-for="clip in clipboardStore.clips" 
            :key="clip.id"
            class="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <p class="text-sm">{{ clip.content }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ new Date(clip.created_at).toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- <UPageCTA
      v-bind="page.cta"
      variant="naked"
      class="overflow-hidden"
    >
      <div class="absolute rounded-full dark:bg-primary blur-[250px] size-40 sm:size-50 transform -translate-x-1/2 left-1/2 -translate-y-80" />

      <LazyStarsBg />
    </UPageCTA> -->
  </div>
</template>
