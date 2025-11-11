const mongoose = require("mongoose");

const conncectdb = async () => {
  await mongoose.connect("mongodb+srv://siddeshsk:Sidduyadav@backend.d5v7s5h.mongodb.net/DevTinder");
};

module.exports = { conncectdb };
