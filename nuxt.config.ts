// https://v3.nuxtjs.org/api/confsiguration/nuxt.config
export default defineNuxtConfig({
  target : 'static',
  router: {
    base: '/app/'
  },
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
    
    
