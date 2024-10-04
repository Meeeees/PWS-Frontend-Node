const fs = require('fs');
const express = require('express');
const ejs = require('ejs');
const FormData = require('form-data');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({
    limit: '50mb'
}))
app.use(cors());


app.post('/upload-image', async (req, res) => {
    const buffer = req.body.imageSrc;
    let newBuffer = await FetchServer(buffer);

    res.json(newBuffer);
});

const FetchServer = async (buffer) => {

    const form = new FormData();

    form.append('file', fs.createReadStream(buffer));
    const newBuffer = buffer.replace("data:image/jpeg;base64,", "");

    fs.createWriteStream("./images/image.png").write(Buffer.from(newBuffer, "base64"));
    let processedBuffer;
    console.log("sending image to server")
    await fetch("http://127.0.0.1:8000/predict/", {
        method: "POST",
        body: JSON.stringify(buffer),
        headers: form.getHeaders(),
    }).then(async res => {
        if (res.ok) {
            return res.json()
        } else {
            throw new Error("Network response was not ok.");
        }
    }).then(data => {

        processedBuffer = data;
    }).catch(err => {
        console.error("Error:", err);
    });
    console.log("received image from server")
    return processedBuffer;
}

const form = new FormData();
form.append('file', fs.createReadStream('./image.png'));

fetch("http://127.0.0.1:8000/upload-image/", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
})
    .then(async res => {
        if (res.ok) {
            return res.arrayBuffer();
        } else {
            throw new Error("Network response was not ok.");
        }
    })
    .then(buffer => {
        try {
            const img = Buffer.from(buffer);

            fs.createWriteStream("./output.png").write(img);
        } catch (error) {
            console.error("Error in blobber:", error);
        }
    })
    .catch(err => {
        console.error("Error:", err);
    });

app.listen(5000, () => console.log('Server started on port 5000'));