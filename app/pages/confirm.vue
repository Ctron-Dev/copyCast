<script setup lang="ts">
// This page handles OAuth callback and email confirmation
const router = useRouter()

onMounted(async () => {
  // Wait a moment for auth to process
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Redirect to home after confirmation
  await router.push('/')
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
      <p class="text-lg text-muted">Confirming authentication...</p>
    </div>
  </div>
</template>
