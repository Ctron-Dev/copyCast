<script setup lang="ts">
const route = useRoute()
import logo from '~/assets/images/logo.png'

const items = computed(() => [{
  label: 'Docs',
  to: '/docs',
  active: route.path.startsWith('/docs')
}, {
  label: 'Pricing',
  to: '/pricing'
}, {
  label: 'Blog',
  to: '/blog'
}, {
  label: 'Changelog',
  to: '/changelog',
  badge: {
    label: 'New',
    color: 'primary' as const
  }
}])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="flex items-center space-x-3">
        <LogoPro :src="logo" class="h-10 w-auto" />
        <span class="text-2xl font-bold tracking-tight">Copy Cast</span>
        
         <!-- add functionality here to check the sesh if there are devices connected or not -->
        <UBadge icon="i-lucide-monitor" size="md" color="warning" variant="solid">No Devices</UBadge>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />

      <UButton
        icon="i-lucide-log-in"
        color="neutral"
        variant="ghost"
        to="/login"
        class="lg:hidden"
      />

      <UButton
        label="Sign in"
        color="neutral"
        variant="outline"
        to="/login"
        class="hidden lg:inline-flex"
      />

      <UButton
        label="Sign up"
        color="neutral"
        trailing-icon="i-lucide-arrow-right"
        class="hidden lg:inline-flex"
        to="/signup"
      />
    </template>

    <template #body>
      
      
      <USeparator class="my-6" />
      <UBadge icon="i-lucide-rocket"
       size="md" 
       color="primary" 
       variant="solid">Badge</UBadge>

      <UButton
        label="Sign in"
        color="neutral"
        variant="subtle"
        to="/login"
        block
        class="mb-3"
      />
      <UButton
        label="Sign up"
        color="neutral"
        to="/signup"
        block
      />
    </template>
  </UHeader>
</template>
