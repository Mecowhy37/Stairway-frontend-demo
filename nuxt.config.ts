// https://v3.nuxtjs.org/api/confsiguration/nuxt.config
export default defineNuxtConfig({
  // ssr: false,
  nitro: {
    prerender: {
      crawlLinks: true
    }
  },
  modules: [
      "@pinia/nuxt",
      "@nuxt/devtools"
  ],
  build: {
    // standalone: true,
  },
})
    
    
