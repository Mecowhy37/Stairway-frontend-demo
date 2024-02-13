export default defineNuxtConfig({
  ssr: true,
  modules: [
      "@pinia/nuxt",
  ],
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
})
    
    
