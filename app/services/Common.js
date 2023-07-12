
const _ = require("lodash");
const bcrypt = require('bcrypt');
const i18n = require("i18n");
const Config = require('../../configs/configs');




class Common {

    ecryptPassword(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data && data.password) {
                    let password = bcrypt.hashSync(data.password, 10);
                    return resolve(password);
                }
                return resolve();
            } catch (error) {
                reject(error);
            }
        });
    }


  
    validatePassword(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data && data.password) {
                    if (data.userObj && _.isEqual(data.password, data.userObj.firstname)) {
                        return resolve({ status: 0, message: i18n.__("PASSWORD_NOT_SAME_FIRSTNAME") });
                    }
                    // Check new password is already used or not
                    if (Config.dontAllowPreviouslyUsedPassword && Config.dontAllowPreviouslyUsedPassword == 'true' && data.userObj && data.userObj.previouslyUsedPasswords && Array.isArray(data.userObj.previouslyUsedPasswords) && data.userObj.previouslyUsedPasswords.length) {
                        let isPreviouslyUsed = _.filter(data.userObj.previouslyUsedPasswords, (previouslyUsedPassword) => {
                            let base64data = Buffer.from(previouslyUsedPassword, 'binary').toString();
                            return bcrypt.compareSync(data.password, base64data)
                        });
                        if (isPreviouslyUsed && Array.isArray(isPreviouslyUsed) && isPreviouslyUsed.length) {
                            return resolve({ status: 0, message: i18n.__("ALREADY_USED_PASSWORD") });
                        }
                    }
                    return resolve({ status: 1, message: "Valid password." });
                } else {
                    return resolve({ status: 0, message: "Password required." });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

  
    listing(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let bodyData = data.bodyData;
                let model = data.bodyData.model;
                let searchText = data.searchText ? data.searchText : '';
                if (bodyData.page && bodyData.pagesize) {
                    let skip = (bodyData.page - 1) * (bodyData.pagesize);
                    let sort = bodyData.sort ? bodyData.sort : { createdAt: -1 };
                    let search = (searchText != '') ? await this.searchData({ searchText, fieldsArray }) : {};
                    let listing; let finalQuery;
                    finalQuery = {...search, isDeleted:false };
                    listing =  await model.find(finalQuery).sort(sort).skip(skip).limit(bodyData.pagesize)
                    const total = await model.find(finalQuery).countDocuments()
                        return resolve({ status: 1, data: { listing }, page: parseInt(bodyData.page), perPage: parseInt(bodyData.pagesize), total: total });
                    
                } else {
                    return resolve({ status: 0, message: "Page and pagesize required." })
                }
            } catch (error) {
                return reject(error)
            }
        });
    }


    searchData(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let searchText = data.searchText;
                let fieldsArray = data.fieldsArray;
                let orArray = [];
                await fieldsArray.map(data => {
                    orArray.push({ [data]: { $regex: '.*' + searchText + '.*', $options: 'i' } });
                })
                return resolve({ $and: [{ $or: orArray }] })
            } catch (error) {
                return reject(error);
            }
        })
    }

    verifyPassword(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let isVerified = false;
                if (data && data.password && data.savedPassword) {
                    let base64data = Buffer.from(data.savedPassword, 'binary').toString();
                    isVerified = await bcrypt.compareSync(data.password, base64data)
                }
                return resolve(isVerified);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = Common;