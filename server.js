require('dotenv').config()

const express = require("express")
const multer = require("multer")
const fs = require('fs')
const path = require("path")

const database = require('./database')

const app = express()
const upload = multer({ dest: 'images/'})

app.use(express.static(path.join(__dirname, "build")))

app.get("/", (req, res) => {
    res.send("Hello!")
})

app.get('/images/:imageName', (req, res) => {
    // do a bunch of if statements to make sure the user is 
    // authorized to view this image, then
  
    const imageName = req.params.imageName
    const readStream = fs.createReadStream(`images/${imageName}`)
    readStream.pipe(res)
  })

app.get('/api/images', async (req, res) => {
    const images = await database.getImages()

    res.send({images})
})

app.post("/api/images", upload.single('image'), async (req, res) => {
    const imagePath = req.file.path
    const description = req.body.description

    const image = await database.addImage(imagePath, description)

    // console.log(description, imagePath, req.file)
    // res.send({description, imagePath})
    res.send({image})
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`listening on port ${port}`))