'use strict';

//var serviceAccount = require("../auth/serviceAccountKey.json");

var config = {
    projectId: 'dexign-7dea4',
    credentials: require('../key/serviceAccountKey.json')
};
var storage = require('@google-cloud/storage')(config);
var bucket = storage.bucket('dexign-7dea4.appspot.com');

// Returns the public, anonymously accessable URL to a given Cloud Storage
// object.
// The object's ACL has to be set to public read.
// [START public_url]
function getPublicUrl (filename) {
    return `https://storage.googleapis.com/dexign-7dea4.appspot.com/${filename}`;
}
// [END public_url]

// Express middleware that will automatically pass uploads to Cloud Storage.
// req.file is processed and will have two new properties:
// * ``cloudStorageObject`` the object name in cloud storage.
// * ``cloudStoragePublicUrl`` the public url to the object.
// [START process]
function sendUploadToGCS (req, res, next) {
    if (!req.file && !req.params.filetype) {
        return next();
    }

    const filetype = req.params.filetype;
    const filename = req.file.originalname;
    const filePath = filetype+'/'+filename;
    const file = bucket.file(filePath);

    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    });
    stream.on('error', (err) => {
        req.file.cloudStorageError = err;
        console.log(err);
        next(err);
    });

    stream.on('finish', () => {
        req.file.cloudStorageObject = filename;
        req.file.cloudStoragePublicUrl = getPublicUrl(filePath);
        next();
    });

    stream.end(req.file.buffer);
}
// [END process]

// Multer handles parsing multipart/form-data requests.
// This instance is configured to store images in memory.
// This makes it straightforward to upload to Cloud Storage.
// [START multer]
const Multer = require('multer');
const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 100 * 1024 * 1024 // no larger than 5mb
    }
});
// [END multer]

module.exports = {
    getPublicUrl,
    sendUploadToGCS,
    multer
};