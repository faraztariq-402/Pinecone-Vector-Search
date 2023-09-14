import express from 'express'
let router = express.Router()


router.post('/login', (req, res) => {
    res.send('this is login v1' + new Date())
  })
  router.post('/signup', (req, res) => {
    res.send('this is signup v1' + new Date())
  })

  export default router