const _ = require('lodash');
const Moment = require('moment');
const i18n = require("i18n");
const jwt = require('jsonwebtoken')

const config = require('./configs');
const Authentication = require('../app/modules/Authentication/Schema').Authtokens;
const Users = require('../app/modules/User/Schema').Users;
const Model = require('../app/modules/Base/Model');

class Globals {

    // Generate Token
    getToken(params) {
        return new Promise(async (resolve, reject) => {
            try {
                // Generate Token
                let token = jwt.sign({
                    id: params.id,
                    algorithm: "HS256",
                    exp: Math.floor(Date.now() / 1000) + parseInt(config.tokenExpiry)
                }, config.securityToken);

                params.token = token;
                params.userId = params.id;
                params.tokenExpiryTime = Moment().add(parseInt(config.tokenExpirationTime), 'minutes');
                delete params.id
                await Authentication.findOneAndUpdate({ userId: params.userId }, params, { upsert: true, new: true });
                return resolve(token);
            } catch (err) {
                console.log("Get token", err);
                return reject({ message: err, status: 0 });
            }
        });
    }



    static isUserAuthorised(resource) {
        return async (req, res, next) => {
            try {
                const token = req.headers.authorization;
                if (!token) return res.status(401).json({ status: 0, message: i18n.__("TOKEN_WITH_API") });

                const authenticate = new Globals();

                const tokenCheck = await authenticate.checkTokenInDB(token);
                if (!tokenCheck) return res.status(401).json({ status: 0, message: i18n.__("INVALID_TOKEN") });

                const tokenExpire = await authenticate.checkExpiration(token);
                if (!tokenExpire) return res.status(401).json({ status: 0, message: i18n.__("TOKEN_EXPIRED") });

                const userExist = await authenticate.checkUserInDB(token);
                if (!userExist) return res.status(401).json({ status: 0, message: i18n.__("USER_NOT_EXIST") });

                if (userExist._id) {
                    req.currentUser = userExist;
                }
                next();
            } catch (err) {
                console.log("Token authentication", err);
                return res.send({ status: 0, message: err });
            }
        }

    }
    // Check User Existence in DB
    checkUserInDB(token) {
        return new Promise(async (resolve, reject) => {
            try {
                // Initialisation of variables
                let decoded = jwt.decode(token);
                if (!decoded) { return resolve(false); }
                let userId = decoded.id

                const user = await Users.findOne({ _id: userId, isDeleted: false });
                if (user) return resolve(user);
                return resolve(false);

            } catch (err) {
                console.log("Check user in db")
                return reject({ message: err, status: 0 });
            }

        })
    }
    // Check token in DB
    checkTokenInDB(token) {
        return new Promise(async (resolve, reject) => {
            try {
                let tokenDetails = Buffer.from(token, 'binary').toString();
                // Initialisation of variables
                let decoded = jwt.verify(tokenDetails, config.securityToken, { ignoreExpiration: true });
                if (!decoded) { return resolve(false); }

                const authenticate = await Authentication.findOne({ token: tokenDetails });
                if (authenticate) return resolve(true);
                return resolve(false);
            } catch (err) {
                console.log("Check token in db", err)
                return resolve({ message: err, status: 0 });
            }
        })
    }
    // Check Token Expiration
    checkExpiration(token) {
        return new Promise(async (resolve, reject) => {
            let tokenDetails = Buffer.from(token, 'binary').toString();
            let status = false;
            const authenticate = await Authentication.findOne({ token: tokenDetails });
            if (authenticate && authenticate.tokenExpiryTime) {
                let expiryDate = Moment(authenticate.tokenExpiryTime, 'YYYY-MM-DD HH:mm:ss')
                let now = Moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
                if (expiryDate > now) { status = true; resolve(status); }
            }
            resolve(status);
        })
    }

}

module.exports = Globals;
