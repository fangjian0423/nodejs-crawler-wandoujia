var express = require('express');
var swig = require('swig');
var superagent = require('superagent');
var cheerio = require('cheerio');
var utils = require("./utils");


var EventProxy = require('eventproxy');


var settings = require('./settings');


var db = require('./models/db');

swig.setDefaults({ varControls: ['<%=', '%>'] });

var app = express();

var activeProfile = settings.activeProfile;

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + settings[activeProfile]["htmlDir"]);

app.use("/bower_components", express.static(__dirname + '/bower_components'));
app.use("/dist", express.static(__dirname + settings[activeProfile]["staticDir"]));

app.get('/getApps', function(req, res) {
  db.App.find(function(err, apps) {
    if(err) {
      res.json(utils.buildErrResp(err));
    } else {
      res.json(utils.buildResp(true, null, [{"data": apps}]))
    }
  });
});

app.get("/", function(req, res) {
  res.render("index");
});

app.post("/crawler", function(req, res) {

  var ep = new EventProxy();

  var detailPages = [];

  superagent
    .get("http://www.wandoujia.com/top/app")
    .end(function(err, resp) {
      if(err) {
        return res.json(utils.buildErrResp(err));
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
          if(err) {
            return res.json(utils.buildErrResp(err));
          }
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
              return res.json(utils.buildErrResp(err));
            }
          });
        });

        detailPages.push("http://www.wandoujia.com/apps/" + pkgName);

      });

      ep.after("detailPage", detailPages.length, function(detailPages) {

        detailPages.forEach(function(detailPagePair) {
          var url = detailPagePair[0];
          var $detail = cheerio.load(detailPagePair[1]);

          var pkgName = url.substring(url.lastIndexOf("/") + 1);

          var downloadCount = $detail(".num-list i[itemprop=interactionCount]").attr("content").split(":")[1];

          var tags = "";

          $detail(".infos-list .tag-box a").each(function(idx, ele) {
            tags += "," + $(ele).text();
          });

          tags = tags.substring(1);

          db.App.findOne({packageName: pkgName}, function(err, app) {

            if(!err && app) {
              app.download = downloadCount;
              app.tags = tags;
              app.save(function(err, savedApp) {

              });
            }

          });

        });

        return res.json(utils.buildResp(true, null));

      });


      detailPages.forEach(function(detailPageUrl) {
        superagent.get(detailPageUrl).end(function(detailErr, detailResp) {
          ep.emit("detailPage", [detailPageUrl, detailResp.text]);
        });
      });

    });

});

app.listen(3000, function(req, res) {
  console.log("app is listening in 3000 port");
});
