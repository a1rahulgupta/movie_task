
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const movieSchema = new mongoose.Schema({
    userId: { type: schema.Types.ObjectId, ref: 'Users' },
    movieName: { type: String },
    rating: { type: Number },
    cast: [{ }],
    genre: { type: String },
    releaseDate : { type: Date },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Movies = mongoose.model('movies', movieSchema);
module.exports = {
    Movies
}
