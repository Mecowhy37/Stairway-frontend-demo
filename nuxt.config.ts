// https://v3.nuxtjs.org/api/confsiguration/nuxt.config
export default defineNuxtConfig({
  ssr: true,
  modules: [
      "@pinia/nuxt",
  ],
  typescript: {
    tsConfig: {
      target: "es2020",
      compilerOptions: {
        target: "es2020"
    }
    }
  }
})
    
    
