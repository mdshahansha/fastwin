import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const gameSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    periodNumber: String,
    userGuess: String,
    money: Number,//point
    result: String,
    message: String,
    updatedMoney: Number,//Amount
    delivery:Number,//if they win
    gameType: String,
    message:{type:String,enum:['win','lost']},
    gameTiming:{type:Number,default:15},//in second
    createdAt: { type: Date, default: Date.now }

    //usedwallet:Number// exact amount with tax deduction
});

const Game = mongoose.model('Game', gameSchema);
export default Game;
