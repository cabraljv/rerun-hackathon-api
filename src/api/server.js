const App = require('./app')

App.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
