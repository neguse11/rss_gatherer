# getuploaderからファイル情報を得て、rssとしてまとめる

「カスタムメイド3D したらば談話室」関連のダウンローダーに対して、1時間に1度巡回を行い、以下の URL を更新します

| 配信元                                                          | RSS の URL                                            |
| -------------                                                   | -------------                                         |
|[CM3D 紳士の嫁貼りろーだ（仮）](http://ux.getuploader.com/CM3D/) | https://neguse11.github.io/rss_gatherer/cm3d.rss      |
|[CM3D2 MOD ろだA](http://ux.getuploader.com/cm3d2/)              | https://neguse11.github.io/rss_gatherer/cm3d2.rss     |
|[CM3D2 MOD ろだB](http://ux.getuploader.com/cm3d2_b/)            | https://neguse11.github.io/rss_gatherer/cm3d2_b.rss   |
|[CM3D2 MOD ろだC](http://ux.getuploader.com/cm3d2_c/)            | https://neguse11.github.io/rss_gatherer/cm3d2_c.rss   |
|[CM3D2 MOD ろだD](http://ux.getuploader.com/cm3d2_d/)            | https://neguse11.github.io/rss_gatherer/cm3d2_d.rss   |
|[CM3D2 MOD ろだE](http://ux.getuploader.com/cm3d2_e/)            | https://neguse11.github.io/rss_gatherer/cm3d2_e.rss   |

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


## セットアップの方法

- githubとherokuの無料アカウントを使って、自分で[フィードを設定する方法](SETUP.md)
- うまく動かない場合は[トラブルと解消方法](TROUBLES.md)を参照してください


## ライセンス

[ライセンス](LICENSE)は、[WTFPL Version 2](http://www.wtfpl.net/about/)です
