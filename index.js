var express = require('express');
var swig = require('swig');
var superagent = require('superagent');
var cheerio = require('cheerio');
var utils = require("./utils")

var db = require('./models/db');

swig.setDefaults({ varControls: ['<%=', '%>'] });

var app = express();

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static('public'));

app.get('/getApps', function(req, res) {
  db.App.find(function(err, apps) {
    if(err) {
      res.json(utils.buildResp(false, err));
    } else {
      res.json(utils.buildResp(true, null, [{"data": apps}]))
    }
  });
});

app.get("/", function(req, res) {
  res.render("index");
});

app.post("/crawler", function(req, res) {
  superagent
    .get("http://www.wandoujia.com/top/app")
    .end(function(err, resp) {
      if(err) {
        return res.json(utils.buildResp(false, err));
      }
      var $ = cheerio.load(resp.text, {decodeEntities: false});
      var $liList = $("#j-top-list li");

      $liList.each(function(idx, li) {
        var $li = $(li);
        var imgEle = $li.find(".icon-wrap a img");
        var imgUrl = null;
        if(imgEle.attr("data-original")) {
          imgUrl = imgEle.attr("data-original")
        } else {
          imgUrl = imgEle.attr("src");
        }
        var pkgName = $li.attr("data-pn");

        db.App.findOne({packageName: pkgName}, function(err, app) {
          var appDescEle = $li.find(".app-desc");
          var appName = appDescEle.find(".name").html();
          var appDesc = appDescEle.find(".comment").html();
          if(app) {
            app.name = appName;
            app.logo = imgUrl;
            app.desc = appDesc;
          } else {
            app = new db.App({
              name: appName,
              logo: imgUrl,
              desc: appDesc,
              packageName: pkgName
            });
          }
          app.save(function(err, savedApp) {
            if(err) {
              return res.json({success: 0, message: err});
            }
          });
        });


      });

      return res.json(utils.buildResp(true, null));
    });
});

app.listen(3000, function(req, res) {
  console.log("app is listening in 3000 port");
});
