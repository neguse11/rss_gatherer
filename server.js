var request = require('request')
  , fs      = require('fs')
  , cheerio = require('cheerio')
  , async   = require('async')
  , RSS     = require('rss')
  , rmdir   = require('rimraf')
  ;

var gitProfile = {
      email        : process.env.GH_EMAIL  || "nobody@example.com"
    , name         : process.env.GH_NAME   || "nobody"
    , githubUser   : process.env.GH_USER   || null      // github user name
    , githubPass   : process.env.GH_PASS   || null      // github password
    , githubRepo   : process.env.GH_REPO   || null      // github repository URL (https://github.com/USER/REPO.git)
    , githubBranch : process.env.GH_BRANCH || "gh-pages"
};

var sourcesJsonFilename = process.env.SOURCES || "sources.json";
var sourcesObj = JSON.parse(fs.readFileSync(sourcesJsonFilename, "utf8"));
var sources = sourcesObj[0].sources;
var now = new Date();
var outputDir = "output";

(function() {
    var profileError = false;

    if(!gitProfile.githubUser) { profileError = true; console.log("ERROR : Environment variable GH_USER is not specified"); }
    if(!gitProfile.githubPass) { profileError = true; console.log("ERROR : Environment variable GH_PASS is not specified"); }
    if(!gitProfile.githubRepo) { profileError = true; console.log("ERROR : Environment variable GH_REPO is not specified"); }
    (function() {
        var ss = gitProfile.githubRepo.split("//");
        var remoteUrl = ss[0] + "//" + gitProfile.githubUser + ":" + gitProfile.githubPass + "@" + ss[1];
        gitProfile.githubRemoteUrl = remoteUrl;
    })();

    var sourcesError = false;
    if(!sourcesObj || !sources) { sourcesError = true; console.log("ERROR : sources.json is invalid"); }

    if(profileError || sourcesError) {
        process.exit(1);
    }
})();

function getuploaderHtmlToEntries(url, html) {
    var nextPage = null;
    var entries = [];
    var $ = cheerio.load(html);
    var dateTimeConverter = function(str) {
        var ds = str.split(/\s|\:|\//);
        return new Date(parseInt(ds[0])+2000, ds[1]-1, ds[2], ds[3], ds[4]);
    };

    // トップページは div.table-wrapper tbody
    // ２ページ目以降は div.table-responsive tbody
    $("div.table-wrapper tbody, div.table-responsive tbody").filter(function() {
        $(this).find("tr").each(function(trIndex) {
            var entry = {
                  filename : ""
                , comment  : ""
                , original : ""
                , filesize : ""
                , date     : new Date()
                , url      : ""
            };
            $(this).find("td").each(function(tdIndex) {
                switch(tdIndex) {
                default: break;
                case 0: entry.filename = $(this).text(); entry.url = $(this).find("a").attr("href"); break;
                case 1: entry.comment  = $(this).text(); break;
                case 2: entry.original = $(this).text(); break;
                case 3: entry.filesize = $(this).text(); break;
                case 4: entry.date     = dateTimeConverter($(this).text()); break;
                }
            });
            entries.push(entry);
        });
    });

    // 次のページを得る
    $("li.next a").filter(function() {
        nextPage = $(this).attr("href");

        // なぜか最後のページは「次へ」が同じURLを指す
        if(nextPage == url) {
            nextPage = null;
        }
    });

    return {
          entries  : entries
        , nextPage : nextPage
    };
}

function getuploaderScraper(result, url) {
    request(url, function(error, response, html) {
        var r = getuploaderHtmlToEntries(url, html);
        result.entries = result.entries.concat(r.entries);
        if(r.nextPage == null) {
            result.callback(result);
            return;
        }
        getuploaderScraper(result, r.nextPage);
    });
}

function getuploaderMakeFeed(result, cb) {
    var feed = new RSS(result.feedOptions);
    for(var i = 0; i < result.entries.length; i++) {
        var e = result.entries[i];
        feed.item({
              title         : e.filename + "(" + e.original + ")"
            , description   : e.comment + "(" + e.filesize + ")"
            , url           : e.url
            , date          : e.date
        });
    }
    var xml = feed.xml();
    fs.writeFile(
          result.output_feedname
        , xml
        , function(err) {
            if(err) { return console.log(err); }
            console.log("Feed " + result.output_feedname + " successfuly written");
            cb();
        }
    );
}

// http://stackoverflow.com/a/21196961/2132223
function mkdir(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err && err.code != 'EEXIST') {
            cb(err);
        } else {
            cb(null);
        }
    });
}

function mkEmptyDir(path, mask, cb) {
    rmdir(path, function(err) {
        if(err) { return console.log(err); }
        mkdir(path, mask, cb);
    });
}

function main() {
    mkEmptyDir(outputDir, function(err) {
        if(err) { return console.log(err); }
        async.forEachOf(
            sources

            // sources の各要素に対して実行される関数
            , function(source, key, asyncCallback) {
                try {
                    var feedOptions = {};
                    feedOptions.title    = source.title;
                    feedOptions.site_url = source.url;
                    feedOptions.pubDate  = new Date();
                    var result = {
                          url             : source.url
                        , output_feedname : outputDir + "/" + source.filename
                        , feedOptions     : feedOptions
                        , entries         : []
                        , callback        : function(that) {
                            getuploaderMakeFeed(that, function() {
                                asyncCallback();
                            });
                        }
                    };
                    getuploaderScraper(result, result.url);
                } catch(e) {
                    return asyncCallback(e);
                }
            }

            // 全要素の実行が終了したあとに呼ばれる関数
            , function(err) {
                if(err) { return console.log(err); }
                console.log("All tasks are successfully completed");
                require('simple-git')(outputDir)
                    .init()
                    .addRemote("github", gitProfile.githubRemoteUrl)
                    ._run(['checkout', '--orphan', gitProfile.githubBranch], function(err) {
                        if(err) { return console.log(err); }
                    })
                    ._run(['config', 'user.email', gitProfile.email], function(err) {
                        if(err) { return console.log(err); }
                    })
                    ._run(['config', 'user.name', gitProfile.name], function(err) {
                        if(err) { return console.log(err); }
                    })
                    .add("./*")
                    .commit("Update @ " + now.toUTCString())
                    ._run(['push', '--force', "github", gitProfile.githubBranch], function(err) {
                        if(err) { return console.log(err); }
                        console.log("git push completed");
                    })
                    ;
            }
        );
    })
}

main();
