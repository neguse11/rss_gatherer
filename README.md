# getuploaderからファイル情報を得て、rssとしてまとめるサーバコード

「カスタムメイド3D したらば談話室」関連のダウンローダーに対して、1時間に1度巡回を行い、以下の URL を更新します

| 配信元                                                          | RSS の URL                                            |
| -------------                                                   | -------------                                         |
|[CM3D 紳士の嫁貼りろーだ（仮）](http://ux.getuploader.com/CM3D/) | https://neguse11.github.io/rss_gatherer/cm3d.rss      |
|[CM3D2 MOD ろだA](http://ux.getuploader.com/cm3d2/)              | https://neguse11.github.io/rss_gatherer/cm3d2.rss     |
|[CM3D2 MOD ろだB](http://ux.getuploader.com/cm3d2_b/)            | https://neguse11.github.io/rss_gatherer/cm3d2_b.rss   |
|[CM3D2 MOD ろだC](http://ux.getuploader.com/cm3d2_c/)            | https://neguse11.github.io/rss_gatherer/cm3d2_c.rss   |

通常の RSS の用途のように、最新の情報を見るためのものではなく、過去の情報一覧を得るためのものです


## 前準備

 - GitHub : [OAuth token](https://help.github.com/articles/git-automation-with-oauth-tokens/)を作る
 - GitHub : 格納先のリポジトリを作っておく
 - [node.js](https://nodejs.org/) をインストール
 - [heroku toolbelt](https://toolbelt.heroku.com/)をインストール
 - [heroku-config](https://github.com/ddollar/heroku-config)をインストール
     - `heroku plugins:install git://github.com/ddollar/heroku-config.git`

ここでは

 - GitHub でのユーザー名 : `hoge`
 - GitHub での OAuth トークン : `0123456789abcdef0123456789abcdef01234567`
 - GitHub での格納先リポジトリ名 : `fuga`
 - GitHub での格納先リポジトリURL : `https://github.com/hoge/fuga.git`

とします


## 初期化

リポジトリをクローン

```
git clone https://github.com/neguse11/rss_gatherer.git
cd rss_gatherer
copy .env.txt .env
```

適当なエディタ (`notepad .env`) で `.env` ファイルを編集

```
GH_USER=hoge
GH_PASS=0123456789abcdef0123456789abcdef01234567
GH_REPO=https://github.com/hoge/fuga.git
```


## ローカル実験

node.js の初期化を行い、heroku をローカル実行

```
npm install
heroku local bot
```

`https://github.com/hoge/fuga/tree/gh-pages` を開き、`gh-pages` ブランチが更新されたことを確認


## Heroku 実験

Heroku へログインし、コードと設定を push して、Heroku 上で実行

```
heroku login
heroku create
git config user.email "hoge"
git config user.name "hoge"
git add .
git commit -m "Test"
git push heroku master
heroku config:push
heroku config
heroku run bot
```

ふたたび `https://github.com/hoge/fuga/tree/gh-pages` を開き、`gh-pages` ブランチが更新されたことを確認


## Heroku 運用

以下の設定をして、1時間に1回巡回を行うようにする

 - https://elements.heroku.com/addons/scheduler から Heroku Scheduler をインストール
 - https://scheduler.heroku.com/dashboard でスケジューラの画面を出して「Add new job」を押し、以下のように設定
    - 「$」は「node server.js」
    - 「FREQUENCY」は「Hourly」
