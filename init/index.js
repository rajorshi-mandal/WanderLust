const mongoose = require("mongoose");
const intiData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main().then(() => {
    console.log("connectd to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    intiData.data = intiData.data.map((ob) => ({
        ...ob, 
        owner: '66d802176adcb974b98d0a30'
    }))
    await Listing.insertMany(intiData.data);
    console.log("data was initiliased");
};

initDB();