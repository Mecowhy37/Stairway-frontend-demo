// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  target: 'static',
  modules: [
      "@pinia/nuxt",
  ],
  build: {
    standalone: true,
    transpile: ['mdi-vue'],
  },
  // vite: {
  //   vue: {
  //     script: {
  //        propsDestructure: true
  //     }
  //   }
  // }
})
    
    
