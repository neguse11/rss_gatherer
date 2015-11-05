var request  = require('request')
  , fs       = require('fs')
  , cheerio  = require('cheerio')
  , async    = require('async')
  , RSS      = require('rss')
  , rmdir    = require('rimraf')
  , mkdirp   = require('mkdirp')
  , moment   = require('moment')
  ;

process.stdout.write = (function() {
    var fn = function(string, encoding, fd) {
        if(fn.enabled) {
            fn.logs.push(string);
        }
        if(fn.oldStdoutWrite) {
            fn.oldStdoutWrite.apply(this, arguments);
        }
    };

    fn.logs = [];
    fn.enabled = true;
    fn.oldStdoutWrite = process.stdout.write;

    fn.clear = function() {
        fn.logs = [];
    };

    fn.enable = function(enabled) {
        fn.enabled = enabled;
    };

    fn.unhook = function() {
        if(fn.oldStdoutWrite) {
            process.stdout.write = fn.oldStdoutWrite;
            fn.oldStdoutWrite = null;
        }
    };
    return fn;
})();

// Auto load .env file
if(process.argv.indexOf("--load-dot-env") > -1) {
    require('dotenv').load();
}

var gitProfile = {
      email        : process.env.GH_EMAIL  || "nobody@example.com"
    , name         : process.env.GH_NAME   || "nobody"
    , githubUser   : process.env.GH_USER   || null      // github user name
    , githubPass   : process.env.GH_PASS   || null      // github OAuth token
    , githubRepo   : process.env.GH_REPO   || null      // github repository URL (https://github.com/USER/REPO.git)
    , githubBranch : process.env.GH_BRANCH || "gh-pages"
};

var scrapers = {
      "ux.getuploader.com"      : getuploaderScraper
}

var sourcesJsonFilename = process.env.SOURCES || "sources.json";
var sourcesObj = JSON.parse(fs.readFileSync(sourcesJsonFilename, "utf8"));
var sources = sourcesObj[0].sources;
var now = new Date();
var outputDir = process.env.OUTPUT || "output";

(function() {
    var profileError = false;

    if(! process.env.GH_DONT_PUSH) {
        if(!gitProfile.githubUser) { profileError = true; console.log("ERROR : Environment variable GH_USER is not specified"); }
        if(!gitProfile.githubPass) { profileError = true; console.log("ERROR : Environment variable GH_PASS is not specified"); }
        if(!gitProfile.githubRepo) { profileError = true; console.log("ERROR : Environment variable GH_REPO is not specified"); }
        (function() {
            var ss = gitProfile.githubRepo.split("//");
            var remoteUrl = ss[0] + "//" + gitProfile.githubUser + ":" + gitProfile.githubPass + "@" + ss[1];
            gitProfile.githubRemoteUrl = remoteUrl;
        })();
    }

    var sourcesError = false;
    if(!sourcesObj || !sources) { sourcesError = true; console.log("ERROR : sources.json is invalid"); }

    if(profileError || sourcesError) {
        process.exit(1);
    }
})();

var mailgun = function(text, cb) {
    var base = process.env.MAILGUN_API_BASEURL;
    var key  = process.env.MAILGUN_API_KEY;
    var from = process.env.MAILGUN_FROM || "mailgun@example.com";
    var to   = process.env.MAILGUN_TO;
    var subject = process.env.MAILGUN_SUBJECT || "mailgun @ ";
    if(base && key && from && to && subject && text) {
        var mailgunOpts = {
            url: base + "/messages"
            , headers: {
                Authorization: "Basic " + new Buffer("api:" + key).toString("base64")
            }
            , form: {
                  from    : from
                , to      : to
                , subject : subject + new Date()
                , text    : text
            }
        }
        request.post(mailgunOpts, function(err, response, body) {
            if(cb) {
                cb(err, body);
            } else {
                console.log("mailgun: " + JSON.stringify(err || body, null, 2));
            }
        });
    } else {
        var msg = "the following environment variables are not set properly: ";
        if(!base) {
            msg += " MAILGUN_API_BASEURL";
        }
        if(!key) {
            msg += " MAILGUN_API_KEY";
        }
        if(!to) {
            msg += " MAILGUN_TO";
        }
        cb(null, { message: msg });
    }
};

function getuploaderHtmlToEntries(url, html, timeZoneOffsetInMilliSeconds) {
    var nextPage = null;
    var entries = [];
    var $ = cheerio.load(html);
    var dateTimeConverter = function(str) {
        var ds = str.split(/\s|\:|\//);
        var d = new Date(Date.UTC(parseInt(ds[0])+2000, ds[1]-1, ds[2], ds[3], ds[4]));
        d.setTime(d.getTime() + timeZoneOffsetInMilliSeconds);
        return d;
    };

    // トップページは div.table-wrapper tbody
    // ２ページ目以降は div.table-responsive tbody
    $("div.table-wrapper tbody, div.table-responsive tbody").filter(function() {
        $(this).find("tr").each(function(trIndex) {
            var entry = {
                  filename      : ""
                , comment       : ""
                , original      : ""
                , filesize      : ""
                , date          : new Date()
                , url           : ""
                , downloadCount : ""
            };
            $(this).find("td").each(function(tdIndex) {
                switch(tdIndex) {
                default: break;
                case 0: entry.filename      = $(this).text(); entry.url = $(this).find("a").attr("href"); break;
                case 1: entry.comment       = $(this).text(); break;
                case 2: entry.original      = $(this).text(); break;
                case 3: entry.filesize      = $(this).text(); break;
                case 4: entry.date          = dateTimeConverter($(this).text()); break;
                case 5: entry.downloadCount = $(this).text(); break;
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

function getuploaderScraper(result, url, cb) {
    if(! result.hasOwnProperty("entries")) {
        result.entries = [];
    }

    request(url, function(error, response, html) {
        var r = getuploaderHtmlToEntries(url, html, result.timeZoneOffsetInMilliSeconds);
        result.entries = result.entries.concat(r.entries);
        if(r.nextPage != null) {
            getuploaderScraper(result, r.nextPage, cb);
            return;
        }
        getuploaderMakeFeed(result, cb);
    });
}

function getuploaderMakeFeed(result, cb) {
    for(var i = 0; i < result.entries.length; i++) {
        var e = result.entries[i];
        result.feed.item({
              title         : e.filename + "(" + e.original + ")"
            , description   : e.comment + "(" + e.filesize + ")"
            , url           : e.url
            , date          : e.date
        });
    }
    cb(result);
}

function mkEmptyDir(path, cb) {
    rmdir(path, function(err) {
        if(err) { return console.log(err); }
        mkdirp(path, cb);
    });
}

function init(path, asyncCallback) {
    console.log("init", path);
    rmdir(path, function(err) {
        if(err) { return console.log(err); }
        mkdirp(path, asyncCallback);
    });
}

function sourceProcessor(source, key, asyncCallback) {
    try {
        var feedOptions = {};
        feedOptions.title    = source.title;
        feedOptions.site_url = source.url;
        feedOptions.pubDate  = new Date();
        var result = {
              url             : source.url
            , outputFileName  : outputDir + "/" + source.filename
            , feed            : new RSS(feedOptions)
            , timeZoneOffsetInMilliSeconds  : moment.duration(0).asMilliseconds()
        };
        if(source.hasOwnProperty("timezone")) {
            result.timeZoneOffsetInMilliSeconds = -moment.duration(source.timezone).asMilliseconds();
        }

        var scraper = undefined;
        if(source.hasOwnProperty("type")) {
            scraper = scrapers[source.type];
        }

        if(! scraper) {
            asyncCallback();
        } else {
            scraper(
                result,
                result.url,
                function(result) {
                    fs.writeFile(
                          result.outputFileName
                        , result.feed.xml()
                        , function(err) {
                            if(err) { return console.log(err); }
                            console.log("Feed " + result.outputFileName + " successfuly written");
                            asyncCallback();
                        }
                    );
                }
            );
        }
    } catch(e) {
        return asyncCallback(e);
    }
}

function gitPush(callback) {
    require('simple-git')(outputDir)
        .init()
        .addRemote("github", gitProfile.githubRemoteUrl)
        ._run(['checkout', '--orphan', gitProfile.githubBranch], function(err) {
			if(err) { console.log(err); callback(err); return; }
        })
        ._run(['config', 'user.email', gitProfile.email], function(err) {
            if(err) { console.log(err); callback(err); return; }
        })
        ._run(['config', 'user.name', gitProfile.name], function(err) {
            if(err) { console.log(err); callback(err); return; }
        })
        .add("./*")
        .commit("Update @ " + now.toUTCString())
        ._run(['push', '--force', "github", gitProfile.githubBranch], function(err) {
            if(err) { console.log(err); callback(err); return; }
	        console.log("git push completed");
			callback(err);
   	 	});
}

function sendMailgun(asyncCallback) {
    var logs = process.stdout.write.logs;
    var log = "";
    logs.forEach(function(line) {
        log += line;
    });
    logs = [];
    console.log("mailgun: sending...");
    mailgun(log, function(err, response) {
        console.log("mailgun: " + JSON.stringify(err || response, null, 4));
        asyncCallback(null);
    });
}

function main() {
    async.series([
          function(asyncCallback) {
            console.log("rss_gathrer : start @ " + new Date().toUTCString());
            init(outputDir, function(err) {
                asyncCallback(null);
            });
        }
        , function(asyncCallback) {
            async.forEachOf(sources, sourceProcessor, asyncCallback)
        }
        , function(asyncCallback) {
            if(process.env.GH_DONT_PUSH) {
                console.log("SKIP : git push");
	            asyncCallback(null);
				return;
            }
			gitPush(function(err) {
				asyncCallback(null);
			});
        }
        , function(asyncCallback) {
            console.log("rss_gathrer : finish @ " + new Date().toUTCString());
            sendMailgun(function(err, response) {
                asyncCallback(null);
            });
        }
    ]);
}

main();
