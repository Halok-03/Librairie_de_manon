const UserModel = require('../models/userModels') // Import du models users //
const bcrypt = require('bcrypt') // Import du module bcrypt pour crypter le mot de passe //
const jwt = require('jsonwebtoken')
// import environement variables
require('dotenv').config();

// Controllers pour enregistré un user
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // On hash le password transmis dans la requete // 
    .then(hash => {
        const user = new UserModel({ // On créer un nouvel utilisateur grace au model crée (et on passe en password hash) //
            email: req.body.email,
            password: hash
        });
        user.save() // On sauvegarde dans la db le nouvel utilisateur // 
        .then(() => res.status(201).json({ message: 'Utilisateur crée !' }))
        .catch((error) => { res.status(400).json({ error: error })})
    })
    .catch((error) => { res.status(500).json({ error: error })})
}

// Controllers pour vérifier le login d'un utilisateur // 
exports.login = (req, res, next) => {
    UserModel.findOne({ 
        email: req.body.email,  // On recherche l'utilisateur demandé via le mail dans la db // 
    })
    .then(user => {
        if (user === null) {
            res.status(401).json({message: 'Identifiant/mot de passe incorrect'}) // Si l'adresse mail n'est pas dans la db nous mettons 'Identifiant/mot de passe incorrect' pour ne pas faire fuir de donnée de la db // 
        } else {
            bcrypt.compare(req.body.password, user.password) // On utilise la méthode compare de bcrypt pour comparé le mdp rentré par l'utilisateur et le mdp hashé présent dans la db //
            .then(valid => {
                if (!valid) {
                    res.status(401).json({message: 'Identifiant/mot de passe incorrect'}) // si le mdp n'est pas valide on renvoit 'Identifiant/mot de passe incorrect' pour la même raison que le mail // 
                } else {
                    res.status(200).json({ // Si le mail et le mdp sont correcte alors on renvoi une réponse qui contient l'id de l'utilisateur créer par mongoDB et le token d'authentification //
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.privateKey,
                            { expiresIn: '24h' }
                        )
                    })
                }
            })
            .catch((error) => { res.status(500).json({ error: error })})
        }
    })
    .catch((error) => { res.status(500).json({ error: error })})
}