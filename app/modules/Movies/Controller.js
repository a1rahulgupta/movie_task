const i18n = require("i18n");
const _ = require('lodash');
const ObjectId = require('mongodb').ObjectID;
const Controller = require('../Base/Controller');
const Model = require("../Base/Model");
const Movie = require('./Schema').Movie;
const RequestBody = require("../../services/RequestBody");
const CommonService = require("../../services/Common");
const { StatusCodes }  = require('http-status-codes');

class MovieController extends Controller {
    constructor() {
        super();
    }

    /********************************************************
     Purpose: Movie insert and update
     Parameter:
     {
       
        'movieName':"", 
        'rating':"", 
        'cast':"", 
        'genre':"", 
        'releaseDate':""
     }
     Return: JSON String
     ********************************************************/
    async addUpdateMovie() {
        try {
            let fieldsArray = ['movieName', 'rating','cast','genre','releaseDate'];
            this.req.body['userId'] = this.req.currentUser._id;
            console.log(this.req.body)
            let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);

            if (this.req.body.id) {
                const movieData = await movie.findByIdAndUpdate(this.req.body.id, data, { new: true });
                if (_.isEmpty(movieData)) {
                    return this.res.status(StatusCodes.NOT_MODIFIED).send({ status: 0, message: i18n.__('MOVIE__NOT_UPDATED') })
                }
                return this.res.status(StatusCodes.OK).send({ status: 1, message: i18n.__('MOVIE_UPDATED'), movieData })

            } else {
                const movieData = await (new Model(movie)).store(data);
                if (_.isEmpty(movieData)) {
                    return this.res.status(StatusCodes.BAD_REQUEST).send({ status: 0, message:i18n.__('MOVIE_NOT_SAVED.') })
                }
                return this.res.status(StatusCodes.OK).send({ status: 1, message: i18n.__('MOVIE_SAVED'), movieData });
            }

        } catch (error) {
            console.log("error- ", error);
            return this.res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ status: 0, message: error });
        }
    }

     /********************************************************
     Purpose:movie list
     Parameter:
     {
            "page":1,
            "pagesize":10
     }
     Return: JSON String
     ********************************************************/

    async movieList() {
        try {

            this.req.body['model'] = movie;
            this.req.body['userId'] = this.req.currentUser._id;
            let data = { bodyData: this.req.body }
            if (this.req.body.searchText) {
                data.fieldsArray = ['movieName']
                data.searchText = this.req.body.searchText;
            }
            let result = await new CommonService().listing(data);
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            this.res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ status: 0, message: error });
        }
    }


    /********************************************************
     Purpose:Movie description
     Parameter:
     {
           "movieId":"1"
     }
     Return: JSON String
     ********************************************************/
    async movieDetail() {
        try {
            const movieData = await Movie.findOne({ _id: ObjectId(this.req.params.movieId), isDeleted: false }, { __v: 0 });
            return this.res.send(_.isEmpty(movieData) ? { status: 0, message: i18n.__('MOVIE_NOT_FOUND') } : { status: 1, data: movieData });
        } catch (error) {
            console.log("error- ", error);
            this.res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose:movie delete
     Parameter:
     {
          "ids": ["5ffeb773ca25600c8b50e03c"]

     }
     Return: JSON String
     ********************************************************/
    async deleteMovie() {
        try {
            let msg = i18n.__("MOVIE_NOT_DELETED");
            const updatedmovie = await movie.updateMany({ _id: { $in: this.req.body.ids }, isDeleted: false }, { $set: { isDeleted: true } });
            if (updatedmovie) {
                msg = updatedMovie.nModified ? updatedMovie.nModified +  i18n.__("MOVIE_DELETED") : updatedMovie.n == 0 ? i18n.__("MOVIE_NOT_FOUND") : msg;
            }
            return this.res.status(StatusCodes.OK).send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ status: 0, message: error });
        }
    }

   
  

}
module.exports = MovieController;