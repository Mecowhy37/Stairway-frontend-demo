// https://v3.nuxtjs.org/api/confsiguration/nuxt.config
export default defineNuxtConfig({
  ssr: true,
  modules: [
      "@pinia/nuxt",
  ],
  build: {
    target: 'esnext',
  },
})
    
    
