// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
      '@pinia/nuxt',
    ],
  runtimeConfig: {
    public: {
      devFactoryAddress: "0x8Bdc903568E2696767A1FaA26Ae9a1F242338859",
    }
  }
})
    
    