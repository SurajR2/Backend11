const check = require('express-validator');

exports.signupValidation =[
    check('Name').not().isEmpty().withMessage('Name must be valid '),
    check('Email').not().isEmpty().isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    check('Password').not().isEmpty().isLength({min: 5}).withMessage('password must be at lest 5 character '),
]
exports.loginValidation = [

    check('Email').not().isEmpty().isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),

    check('Password').not().isEmpty().isLength({min: 5}).withMessage('password must be at lest 5 character '),
]
module.exports=validator;