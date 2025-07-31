const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  adress: String
});

module.exports = mongoose.model("Client", ClientSchema);
