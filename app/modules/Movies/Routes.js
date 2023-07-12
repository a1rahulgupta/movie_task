module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const MovieController = require('./Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/addUpdateMovie', Globals.isUserAuthorised(), Validators.moviesValidator(), Validators.validate, (req, res, next) => {
        const noteObj = (new MovieController()).boot(req, res, next);
        return noteObj.addUpdateMovie();
    });

    router.get('/getmovieDetail/:noteId', Globals.isUserAuthorised(), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        const noteObj = (new MovieController()).boot(req, res, next);
        return noteObj.movieDetail();
    });

    router.post('/deleteMovie', Globals.isUserAuthorised(), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        const noteObj = (new MovieController()).boot(req, res, next);
        return noteObj.deleteMovie();
    });

    router.post('/movieList', Globals.isUserAuthorised(), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        const noteObj = (new MovieController()).boot(req, res, next);
        return noteObj.movieList();
    });

    app.use(config.baseApiUrl, router);
}