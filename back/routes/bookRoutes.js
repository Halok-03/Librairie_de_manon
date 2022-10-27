const express = require ('express') 
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const bookControllers = require('../controllers/bookControllers')

router.get('/', auth, bookControllers.getAllBook) 
router.get('/:id', auth, bookControllers.getOneBook) 
router.post('/', auth, multer, bookControllers.createBook)
router.put('/:id', auth, multer, bookControllers.modifyBook)
router.delete('/:id', auth, bookControllers.deleteOneBook)
router.post('/:id/lu',  auth, bookControllers.postLu)
router.post('/:id/possedes',  auth, bookControllers.postPossedes)

module.exports = router