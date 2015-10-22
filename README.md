# getuploaderからファイル情報を得て、rssとしてまとめるサーバコード


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

```
git clone ...
cd ...
copy .env.txt .env
```

`notepad .env`

```
GH_USER=hoge
GH_PASS=0123456789abcdef0123456789abcdef01234567
GH_REPO=https://github.com/hoge/fuga.git
```


## ローカル実験

```
npm install
heroku local bot
```

`https://github.com/hoge/fuga/tree/gh-pages` を開き、`gh-pages` ブランチが更新されたことを確認


## Heroku 実験

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
