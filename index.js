var express = require('express');
var swig = require('swig');
var superagent = require('superagent');
var cheerio = require('cheerio');

swig.setDefaults({ varControls: ['<%=', '%>'] });

var app = express();

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static('public'));

app.get("/", function(req, res) {
  res.render("index", {
    test: "gogogo"
  })
});

app.post("/crawler", function(req, res) {
  superagent
    .get("http://www.wandoujia.com/top/app")
    .end(function(err, resp) {
      if(err) {
        return res.json({success: 0, message: err});
      }
      var $ = cheerio.load(resp.text, {decodeEntities: false});
      var $liList = $("#j-top-list li");

      var appList = [];

      $liList.each(function(idx, li) {
        var $li = $(li);
        var imgUrl = $li.find(".icon-wrap a img").attr("src");
        var appDescEle = $li.find(".app-desc");
        var appName = appDescEle.find(".name").html();
        var appDesc = appDescEle.find(".comment").html();
        appList.push({
          imgUrl: imgUrl,
          appName: appName,
          appDesc: appDesc,
          detailUrl: $li.find(".icon-wrap a").attr("href"),
          packageName: $li.attr("data-pn")
        });
      });

      return res.json({
        success: 1,
        data: appList
      });
    });
});

app.listen(3000, function(req, res) {
  console.log("app is listening in 3000 port");
});
