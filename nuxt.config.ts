export default defineNuxtConfig({
  ssr: false,
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
    
    
