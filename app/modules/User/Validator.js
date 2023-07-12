
const _ = require("lodash");
const i18n = require("i18n");
const { validationResult } = require('express-validator');
const { check} = require('express-validator');

let commonlyUsedPasswords = require('../../../configs/commonlyUsedPassword').passwords;

class Validators {


    static loginValidator() {
        try {
            return [
                ...this.emailValidator(),
                ...this.passwordValidator({ key: 'password' })
            ];
        } catch (error) {
            throw new Error(error);
        }
    }

    static userSignupValidator() {
        try {
            return [
                ...this.emailValidator(),
                ...this.basicInfoValidator(),
                ...this.passwordValidator({ key: 'password' })
            ];
        } catch (error) {
            return error;
        }
    }


    static passwordValidator(keyObj = { key: 'password' }) {
        try {
            return [
                check(keyObj.key)
                    .not().isIn(commonlyUsedPasswords).withMessage(i18n.__("COMMONLY_USED_PASSWORD"))
                    .isLength({ min: 8 }).withMessage(i18n.__("PASSWORD_VALIDATION_LENGTH"))
                    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].*/).withMessage(i18n.__("PASSWORD_VALIDATION"))
            ];
        } catch (error) {
            return error;
        }
    }

    static emailValidator() {
        try {
            return [check('emailId').isEmail().withMessage(i18n.__("VALID_EMAIL"))];
        } catch (error) {
            return error;
        }
    }
 

    static basicInfoValidator() {
        try {
            return [
                check('firstName').exists().withMessage(i18n.__("%s REQUIRED", 'firstName')),
                check('lastName').exists().withMessage(i18n.__("%s REQUIRED", 'Lastname')),
            ];
        } catch (error) {
            return error;
        }
    }

    static validate(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ status: 0, message: errors.array() });
            }
            next();
        } catch (error) {
            return res.send({ status: 0, message: error });
        }
    }
}

module.exports = Validators;