// https://v3.nuxtjs.org/api/confsiguration/nuxt.config
export default defineNuxtConfig({
  ssr: false,
  // nitro: {
  //   prerender: {
  //     crawlLinks: true
  //   }
  // },
  meta: {
    title: 'Stairway.fi',
  },
  modules: [
      "@pinia/nuxt",
      "@nuxt/devtools"
  ],
  build: {
    standalone: true,
  },
})
    
    
