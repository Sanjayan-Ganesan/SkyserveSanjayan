const router = require('express').Router();
const ensureAuthenticated = require('../Middlewares/Auth')

router.get('/', ensureAuthenticated ,(req,res)=>{
    
    console.log('----Logged in user details ----',req.user)
    
    res.status(200).json({
        message: "Entered to the Product",
        success: true
    })
})



module.exports = router