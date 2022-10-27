const BookModel  = require('../models/bookModels') // Import du models book //
const fs = require('fs') // Fs (File System) donne accés aux fonctions qui permettent de modifier le système de fichiers y compris aux fonctions qui permettent de les supprimer
const genreBooks = ['Apologue','Autobiographie','Biographie','Chronique','Conte','Journal','Légende','Mythe','Nouvelle','Roman baroque','Petit roman galant et historique','Roman comique et picaresque','Roman épistolaire','Roman libertin','Roman philosophique','Roman romantique','Roman populaire','Roman satirique','Roman psychologique','Roman viennois','Roman existentialiste','Roman lettriste','Roman noir','Roman policier','Roman d’espionnage','Roman courtois','Roman historique','Roman-mémoires','Roman d’amour','Roman industriel','Roman d’aventures','Roman de science-fiction','Chanson','Ballade','Calligramme','Chant Royal','Élégie','Épigramme','Épopée','Fatrasie','Ode','Essai','Fable','Fabliau','Pamphlet','Sermon','Encyclique','Tragédie','Comédie','Farce','Moralité','Drame','Proverbe']

// get all books
exports.getAllBook = (req, res, next) => {
    BookModel.find()
    .then((book) => { res.status(200).json(book)}
    ).catch((error) => { res.status(400).json({ error: error })})
}

// get one book
exports.getOneBook = (req, res, next) => {
    BookModel.findOne({_id: req.params.id})
    .then((book) => {res.status(200).json(book);}
    ).catch((error) => {res.status(404).json({error: error})}
    )
};

/* post book */
  
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book) // On parse la requète puisque l'objet est envoyé en chaine de caractère du à l'image
    delete bookObject._id // On supprime l'id car il va être généré par la DB
    delete bookObject._userId // On supprime l'userId pour ne pas faire confiance au client par mesure de sécurité. On preferera utilisé le token ID car on est sur quil est valide
    BookModel.findOne({name: bookObject.name}, {editor: bookObject.editor})
    .then( (book) => {
        if(!book && !genreBooks.indexOf(book.genre) === -1) {
            const newBook = new BookModel({ // On créer ensuite un nouveau livre 
                ...bookObject,  // On reprend les modifications de l'objet plus haut
                userId: req.auth.userId, // On prend le token ID pour être sur qu'il est valide
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // On créer un url pour l'image avec ce que nous envoie la requete
                lu: 0,
                possedes: 0,
                usersLu: [],
                usersPossedes: [],
            })
            newBook.save()
            res.status(201).json({ message: 'Livre enregistré avec succés!' })
        } else if (book && !genreBooks.indexOf(book.genre) === -1){
            res.status(400).json({ message: 'Livre déjà existant!' })
        } else if (!book && genreBooks.indexOf(book.genre) === -1) {
            res.status(403).json({ message : `Le genre doit être un de ceux-ci: ${genreBooks}` })
        } else {
            res.status(403).json({ message : `Livre déjà existant et le genre doit être un de ceux-ci: ${genreBooks}` })
        }
    })
    .catch((error) => res.status(400).json({ error }));
}

// put one book
exports.modifyBook =  (req, res, next) => {
    const bookObject = req.file ? { // On créer un bookObject qui parse la requete et qui met le lien de la nouvelle image 
        ...JSON.parse(req.body.book), // seulement si la requete contient un fichier . Ensuite nous mettons le reste de la nouvelle requete ...req.body
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : { ...req.body}
    delete bookObject._userId // Nous supprimons le nouvel userId pour ne pas qu'il soit enregistré plusieurs fois
    BookModel.findOne({_id: req.params.id})
    .then((book) => { 
        if (genreBooks.indexOf(book.genre) === -1){
            res.status(403).json({ message : `Le genre doit être un de ceux-ci: ${genreBooks}` })
        } else {
            if (book.userId != req.auth.userId) { // Si l'userId n'est pas celui qui à créer le livre alors nous n'autorisons pas la modification
                res.status(403).json({ message : "unauthorized request" })
            } else {
                if (req.file){
                    const filename = book.imageUrl.split('/images/')[1] // Nous récupérons le liens qui mene au fichier dans le dossier images
                    fs.unlink(`images/${filename}`, () => { // grace a 'fs' que nous avons importé en haut nous utilisons la methode unlink afin de supprimer le fichier image dans le dossier images
                        BookModel.updateOne({ _id: req.params.id}, {...bookObject, _id: req.params.id})
                        .then(res.status(201).json({ message: 'Livre modifiée avec succés!' }))
                        .catch((error) => { res.status(400).json({ error: error })})
                }) 
                } else {
                    BookModel.updateOne({ _id: req.params.id}, {...bookObject, _id: req.params.id})
                        .then(res.status(201).json({ message: 'Livre modifiée avec succés!' }))
                        .catch((error) => { res.status(400).json({ error: error })})
                } 
            }
        }
    })
    .catch((error) => { res.status(500).json({ error: error })})
  }

// Delete one book
exports.deleteOneBook = (req, res, next) => {
    BookModel.findOne({_id: req.params.id}) // On identifie le livre a supprimer grace a l'id params //
    .then((book) => { 
        if (book.userId != req.auth.userId) { // Ensuite on vérifie que le token correspondent a l'id , si ce n'est pas le cas nous n'authorisons pas la requete //
            res.status(403).json({ message : "unauthorized request" })
        }else {
            const filename = book.imageUrl.split('/images/')[1] // Nous récupérons le liens qui mene au fichier dans le dossier images
            fs.unlink(`images/${filename}`, () => { // grace a 'fs' qu enous avons importé en haut nous utilisons la methode unlink afin de supprimer le fichier image dans le dossier images
                BookModel.deleteOne({_id: req.params.id}) // Ensuite nous supprimons dans la DB
                .then(() => { res.status(200).json({ message: 'Deleted!' })}
                ).catch((error) => { res.status(400).json({ error: error })}
                )
            })
        }
    }) 
    .catch((error) => { res.status(500).json({ error: error })})
}

exports.postLu = (req, res, next) => {
    BookModel.findOne({_id: req.params.id})  // On identifie le livre grace a l'id params //
    .then ((book) => {
        if (req.body.lu === 1 && !book.usersLu.includes(req.auth.userId)) { // Si l'utilisateur indique avoir lu mais n'avais pas deja lu auparavant
                BookModel.findByIdAndUpdate(req.params.id, {
                    ...book, // On renvoi le livre en ajoutant 1 lu et l'userID au tableau correspondant
                    lu: book.lu++,
                    usersLu: book.usersLu.push(req.auth.userId),
                  })
                    .then(() => res.status(200).json({ message: 'Livre lu !' }))
                    .catch(error => res.status(401).json({ error }));
        }else if (req.body.lu === 0 && book.usersLu.includes(req.auth.userId)) { // Si l'utilisateur n'a finalement pas lu
                const indexOfUser = book.usersLu.indexOf(req.auth.userId) // On récupère a quel index est l'userId dans le tableau usersLu
                BookModel.findByIdAndUpdate(req.params.id, {
                    ...book,
                    lu: book.lu--,
                    usersLu: book.usersLu.splice(indexOfUser, 1) // On supprime l'userId a lindex defini plus haut
                })
                .then(() => res.status(200).json({ message: 'Livre non-lu' }))
                .catch(error => res.status(401).json({ error })); 
        }else { // Sinon (si le user essaye d'indiquer lu alors qu'il a deja lu)
            return res.status(400).json({ error })
        }
    }).catch((error) => { res.status(500).json({ error: error })})
}

exports.postPossedes = (req, res, next) => {
    BookModel.findOne({_id: req.params.id})  // On identifie le livre grace a l'id params //
    .then ((book) => {
        if (req.body.possedes === 1 && !book.usersPossedes.includes(req.auth.userId)) { // Si l'utilisateur indique possédés le livre mais n'avais pas deja indiqué le possédés auparavant
                BookModel.findByIdAndUpdate(req.params.id, {
                    ...book, // On renvoi le livre en ajoutant 1 possedes et l'userID au tableau correspondant
                    possedes: book.possedes++,
                    usersPossedes: book.usersPossedes.push(req.auth.userId),
                  })
                    .then(() => res.status(200).json({ message: 'Livre possédés !' }))
                    .catch(error => res.status(401).json({ error }));
        }else if (req.body.possedes === 0 && book.usersPossedes.includes(req.auth.userId)) { // Si l'utilisateur ne le possèdes finalement plus
                const indexOfUser = book.usersPossedes.indexOf(req.auth.userId) // On récupère a quel index est l'userId dans le tableau usersPossedes
                BookModel.findByIdAndUpdate(req.params.id, {
                    ...book,
                    possedes: book.possedes--,
                    usersPossedes: book.usersPossedes.splice(indexOfUser, 1) // On supprime l'userId a lindex defini plus haut
                })
                .then(() => res.status(200).json({ message: 'Livre non-possédés' }))
                .catch(error => res.status(401).json({ error })); 
        }else { // Sinon (si le user essaye d'indiquer possedes alors qu'il a deja indiqué possedes)
            return res.status(400).json({ error })
        }
    }).catch((error) => { res.status(500).json({ error: error })})
}


