
module.exports = (app, express) => {

    const router = express.Router();
    const UsersController = require('../User/Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/users/register', Validators.userSignupValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.register();
    });

    router.post('/users/login', Validators.loginValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.login();
    });

    app.use(config.baseApiUrl, router);
}