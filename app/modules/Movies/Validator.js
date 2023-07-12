
const _ = require("lodash");
const i18n = require("i18n");
const { validationResult } = require('express-validator');
const { body, check, query, header, param } = require('express-validator');

class Validators {
    static moviesValidator() {
        try {
            return [
                check('title').exists().withMessage(i18n.__("%s REQUIRED", 'Title')),
                check('description').exists().withMessage(i18n.__("%s REQUIRED", 'Description'))
            ];
        } catch (error) {
            return error;
        }
    }

    static listingValidator() {
        try {
            return [
                check('page').isNumeric().withMessage(i18n.__("%s REQUIRED", 'Page')),
                check('pagesize').isNumeric().withMessage(i18n.__("%s REQUIRED", 'Pagesize'))
            ];
        } catch (error) {
            return error;
        }
    }


    static detailValidator() {
        try {
            return [
                param('noteId').exists().withMessage(i18n.__("%s REQUIRED", 'Notes Id')),
                param('noteId').not().equals('undefined').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'Notes Id')),
                param('noteId').not().equals('null').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'Notes Id')),
                param('noteId').isAlphanumeric().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'Notes Id')),
                param('noteId').not().isEmpty().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'Notes Id'))
            ];
        } catch (error) {
            return error;
        }
    }
  
    static deleteValidator() {
        try {
            return [
                check('ids').isArray().withMessage(i18n.__("%s ARRAY", 'Notes ids')),
                check('ids').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'Notes ids'))
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