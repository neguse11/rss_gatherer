# getuploaderからファイル情報を得て、rssとしてまとめるサーバコード

「カスタムメイド3D したらば談話室」関連のダウンローダーに対して、1時間に1度巡回を行い、以下の URL を更新します

| 配信元                                                          | RSS の URL                                            |
| -------------                                                   | -------------                                         |
|[CM3D 紳士の嫁貼りろーだ（仮）](http://ux.getuploader.com/CM3D/) | https://neguse11.github.io/rss_gatherer/cm3d.rss      |
|[CM3D2 MOD ろだA](http://ux.getuploader.com/cm3d2/)              | https://neguse11.github.io/rss_gatherer/cm3d2.rss     |
|[CM3D2 MOD ろだB](http://ux.getuploader.com/cm3d2_b/)            | https://neguse11.github.io/rss_gatherer/cm3d2_b.rss   |
|[CM3D2 MOD ろだC](http://ux.getuploader.com/cm3d2_c/)            | https://neguse11.github.io/rss_gatherer/cm3d2_c.rss   |

通常の RSS の用途のように、最新の情報を見るためのものではなく、過去の情報一覧を得るためのものです。
主に「[Uploaderまとめ](http://bl.ocks.org/asm256/raw/d66d733bc43d5d5a87a7/)」の補完用と考えています


## 動作の仕組み

 - １時間に１度、Herokuのサーバー上で[スクリプト](server.js)が動作します
 - サーバー上のスクリプトは以下の動作を行います
     - [設定ファイル](sources.json)に書かれたサイトを巡回
     - サイトの内容 (HTML) をもとに RSS フィードを作成
     - RSS フィードを GitHub 上のリポジトリ内の `gh-pages` ブランチへ格納
 - GitHub は `gh-pages` ブランチの内容を https://neguse11.github.io/rss_gatherer/cm3d2.rss 等の URL で公開します
     - この RSS の表示時に元のサーバー (getuploader.com) へのアクセスは行われません


## 前準備

 - GitHub のアカウントを取得
    - GitHub : [OAuth token](https://help.github.com/articles/git-automation-with-oauth-tokens/)を作る
    - GitHub : RSS格納先のリポジトリを作っておく
 - Heroku のアカウントを取得
    - [heroku toolbelt](https://toolbelt.heroku.com/)をインストール
    - [heroku-config](https://github.com/ddollar/heroku-config)をインストール
        - `heroku plugins:install git://github.com/ddollar/heroku-config.git`
 - [node.js](https://nodejs.org/) をローカルにインストール

ここでは

 - GitHub でのユーザー名 : `HOGE`
 - GitHub での OAuth トークン : `0123456789abcdef0123456789abcdef01234567`
 - GitHub でのフィード格納先リポジトリ名 : `FUGA`
 - GitHub でのフィード格納先リポジトリURL : `https://github.com/HOGE/FUGA.git`

とします


## 初期化

リポジトリをクローンして、`.env.txt` を `.env` としてコピーします

```
git clone https://github.com/neguse11/rss_gatherer.git
cd rss_gatherer
copy .env.txt .env
```

適当なエディタ (`notepad .env`など) で `.env` を編集し、ユーザ名、OAuthトークン、フィード格納先のリポジトリURLを入れます

```
GH_USER=HOGE
GH_PASS=0123456789abcdef0123456789abcdef01234567
GH_REPO=https://github.com/HOGE/FUGA.git
```


## ローカル実験

以下のコマンドで初期化を行い、heroku をローカル実行します

```
npm install
heroku local bot
```

実行が完了したら、`https://github.com/HOGE/FUGA/tree/gh-pages` を開き、`gh-pages` ブランチが更新されたことを確認します。
また、`gh-pages` ブランチの別名 URL となる `https://HOGE.github.io/FUGA/cm3d2.rss` 等で RSS を表示できることを確認します


## Heroku 実験

Heroku へログインし、コードと設定を push して、Heroku のサーバー上で実行します

サーバー設定

```
heroku login
heroku create
heroku ps:scale web=0
heroku plugins:install git://github.com/ddollar/heroku-config.git
git config user.email "HOGE"
git config user.name "HOGE"
```

ファイルの更新と実行

```
heroku login
git add .
git commit -m "push to heroku"
git push heroku master
heroku config:push -o && heroku config
heroku run bot
```

ふたたび `https://github.com/HOGE/FUGA/tree/gh-pages` を開き、`gh-pages` ブランチと `https://HOGE.github.io/FUGA/cm3d2.rss` を確認します


## Heroku 運用

以下の設定をして、1時間に1回の頻度で巡回を行うようにします

 - https://elements.heroku.com/addons/scheduler から Heroku Scheduler をインストール
 - https://scheduler.heroku.com/dashboard でスケジューラの画面を出して「Add new job」を押し、以下のように設定
    - 「$」は「node server.js」
    - 「FREQUENCY」は「Hourly」


スケジューラーの実行ログは以下のコマンドで確認できます

```
heroku logs --ps scheduler
```


## 設定

設定は `.env` と `sources.json` で行います

`.env` には基本的な情報を入れます。**このファイルを公開しないように気をつけてください**

| 項目名             | 内容 | 例   |
| ----               | ---- | ---- |
|GH_USER             |GitHub上のユーザー名 | `HOGE` |
|GH_PASS             |GitHubで取得した [OAuth トークン](https://help.github.com/articles/git-automation-with-oauth-tokens/) (40 文字の 16進数) | `0123456789abcdef0123456789abcdef01234567` |
|GH_REPO             |GitHub上のリポジトリ URL | `https://github.com/HOGE/FUGA.git` |
|GH_EMAIL            |GitHub上のリポジトリ内のコミットログに表示するメールアドレス | [`HOGE@users.noreply.github.com`](https://help.github.com/articles/keeping-your-email-address-private/)) |
|GH_NAME             |GitHub上のリポジトリ内のコミットログに表示する名前 | `HOGE` |
|GH_BRANCH           |GitHub上のリポジトリ内のコミット先ブランチ名 | `gh-pages` |

`.env` ではオプション機能として、Mailgun からの送信設定を指定することができます

| 項目名             | 内容 | 例   |
| ----               | ---- | ---- |
|MAILGUN_API_BASEURL |MailgunのAPIのURL | `https://api.mailgun.net/v3/sandboxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org` |
|MAILGUN_API_KEY     |MailgunのAPIキー  | `key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
|MAILGUN_TO          |Mailgunからのレポートの送信先 | `my.mail@example.com` |
|MAILGUN_FROM        |Mailgunへレポートを送信する際の From: 欄の値 | `rss_gathrer@report.example.com` |

`sources.json` は巡回先の URL 等を指定するファイルです `"sources"` 下の項目を増減させることで、巡回先を設定できます

| 項目名    | 内容 |
| ----      | ---- |
|"url"      | 巡回先の getuploader.com 上の URL |
|"type"     | 巡回先のサイトのタイプ |
|"timezone" | 巡回先の日付のタイムゾーン |
|"title"    | 公開するフィードの名前 |
|"filename" | 公開するフィードのファイル名 |


## 開発用のローカル実行

以下のコマンドで heroku 無しでの実行ができます

```
npm run herokish
```


## うまく動かない場合

- [トラブルと解消方法](TROUBLES.md)


## ライセンス

[ライセンス](LICENSE)は、[WTFPL Version 2](http://www.wtfpl.net/about/)です
