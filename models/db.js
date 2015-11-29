var mongoose = require('mongoose'),
  settings = require("../settings");

var db = mongoose.connect("mongodb://localhost/" + settings[settings.activeProfile].db);

var Schema = mongoose.Schema;

var appSchema = new Schema({
  logo: String,
  name: String,
  desc: String,
  packageName: String,
  download: Number,
  tags: String
});

exports.App = db.model("apps", appSchema);