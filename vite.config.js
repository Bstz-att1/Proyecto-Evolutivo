export default {
  server: {
    proxy: {
      '/todos': 'http://localhost:3000'
    }
  }
}