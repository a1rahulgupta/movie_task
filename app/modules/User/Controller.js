const _ = require("lodash");
const i18n = require("i18n");
const Controller = require("../Base/Controller");
const Users = require('./Schema').Users;
const Model = require("../Base/Model");
const Globals = require("../../../configs/Globals");
const RequestBody = require("../../services/RequestBody");
const CommonService = require("../../services/Common");
const { StatusCodes }  = require('http-status-codes');



class UsersController extends Controller {
    constructor() {
        super();
    }


    /********************************************************
   Purpose: user register
   Parameter:
      {
          "emailId":"john@doe.com",
          "password":"john",
          "firstName":"john",
          "lastName":"deo"
      }
   Return: JSON String
   ********************************************************/
    async register() {
        try {
            
            let filter = { "$or": [{ "emailId": this.req.body.emailId.toLowerCase() }] }
            const user = await Users.findOne(filter);

            if (!_.isEmpty(user) && (user.emailId)) {
                return this.res.status(StatusCodes.CONFLICT).send({ status: 0, message: i18n.__("DUPLICATE_EMAIL") });
            } else {
                let data = this.req.body;
                let isPasswordValid = await (new CommonService()).validatePassword({ password: data['password'] });
                if (isPasswordValid && !isPasswordValid.status) {
                    return this.res.send(isPasswordValid)
                }
                let password = await (new CommonService()).ecryptPassword({ password: data['password'] });

                data = { ...data, password: password};
                data['emailId'] = data['emailId'].toLowerCase();

                const newUserId = await new Model(Users).store(data);

                if (_.isEmpty(newUserId)) {
                    return this.res.status(StatusCodes.BAD_REQUEST).send({ status: 0, message: i18n.__('USER_NOT_SAVED') })
                }
                else {
                    return this.res.status(StatusCodes.CREATED).send({ status: 1, message: i18n.__('REGISTRATION_SCUCCESS') });
                }

            }
        } catch (error) {
            console.log("error = ", error);
            return this.res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ status: 0, message: i18n.__('SERVER_ERROR')  });
        }

    }

 

    /********************************************************
    Purpose: Login
    Parameter:
        {
            "emailId":"john@doe.com"
            "password":"123456",
        }
    Return: JSON String
   ********************************************************/
    async login() {
        console.log(this.req.body);
        try {
            let fieldsArray = ["emailId", "password"];
            let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
            if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
                return this.res.status(StatusCodes.NOT_ACCEPTABLE).send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
            }
            const user = await Users.findOne({ emailId: this.req.body.emailId.toString().toLowerCase(), isDeleted: false });

            if (_.isEmpty(user)) {
                return this.res.status(StatusCodes.NOT_FOUND).send({ status: 0, message: i18n.__("USER_NOT_EXIST_OR_DELETED") });
            } else {
                const status = await (new CommonService()).verifyPassword({ password: this.req.body.password, savedPassword: user.password });
                if (!status) {
                    return this.res.status(StatusCodes.UNAUTHORIZED).send({ status: 0, message: i18n.__("INVALID_PASSWORD") });
                }
            }
                let token = await new Globals().getToken({ id: user._id });
                return this.res.status(StatusCodes.ACCEPTED).send({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token});
            
        } catch (error) {
            console.log(error);
            return this.res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ status: 0, message: i18n.__('SERVER_ERROR')  })
        }
    }

}
module.exports = UsersController;