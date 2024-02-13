export default defineNuxtConfig({
  ssr: true,
  modules: [
      "@pinia/nuxt",
  ],
  build: {
    target: 'esnext',
  },
})
    
    
