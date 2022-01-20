require('dotenv').config()

const express = require("express")
const multer = require("multer")
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const path = require("path")

const database = require('./database')

const app = express()
const upload = multer({ dest: 'images/'})
const s3 = require('./s3')

app.use(express.static(path.join(__dirname, "build")))

// app.get("/", (req, res) => {
//     res.send("Hello!")
// })

app.get('/images/:imageName', (req, res) => {
    // do a bunch of if statements to make sure the user is 
    // authorized to view this image, then
  
    const imageName = req.params.imageName
    const readStream = s3.getFileStream(imageName)
    readStream.pipe(res)

    // const readStream = fs.createReadStream(`images/${imageName}`)

  })

app.get('/api/images', async (req, res) => {
    const images = await database.getImages()

    res.send({images})
})

app.post("/api/images", upload.single('image'), async (req, res) => {
    const imagePath = req.file.path
    const description = req.body.description
    const filename = req.file.filename

    await s3.uploadFile(imagePath, filename)
    await unlinkFile(imagePath)

    const image = await database.addImage(imagePath, description)
    res.send({image})
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`listening on port ${port}`))