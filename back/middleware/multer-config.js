const multer = require('multer')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}
// constante storage contient la logique nécessaire pour indiquer a multer ou enregistrer les images // 
const storage = multer.diskStorage({
    destination: (req, file, callback) => { // Destination indique à multer d'enregistrer les fichiers dans le dossier images
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_') // Ici on remplace les espaces par des underscore pour éviter les problèmes sur le serveur
        const extension = MIME_TYPES[file.mimetype] // On indique l'exentension du fichier grace au dictionnaire MIME_TYPES plus haut
        callback(null, name + Date.now() + '.' + extension) // On donne le nom + la date + un point + le nom de l'extension comme nom de fichier unique
    }
})

module.exports = multer({ storage }).single('image') // On exporte ensuite le module en lui indiquant que c'est un module unique 'image'