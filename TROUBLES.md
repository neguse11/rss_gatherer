# トラブルと解消方法

## heroku login でエラーが出る場合

以下のようなエラーが出る場合

```
> git push heroku master

remote: !       No such app as mighty-plains-XXXX.
fatal: repository 'https://git.heroku.com/mighty-plains-XXXX.git/' not found
```

まず、`git remote -v` で現在のリモートリポジトリの設定を表示します

```
> git remote -v

heroku  https://git.heroku.com/mighty-plains-XXXX.git (fetch)
heroku  https://git.heroku.com/mighty-plains-XXXX.git (push)
```

これが heroku のダッシュボード上に表示される app 名と違う場合、修正を行ってから、もう一度 git push します

```
> git remote rm heroku
> git remote add heroku git@heroku.com:本来のＡＰＰ名.git
> git push heroku master
```


## git push heroku master でエラーが出る場合

以下のようなエラーが出る場合

```
> git push heroku master

Counting objects: 15, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (10/10), done.
Writing objects: 100% (10/10), 5.93 KiB | 0 bytes/s, done.
Total 10 (delta 3), reused 0 (delta 0)
remote: Compressing source files... done.
remote: Building source:

...

remote:        npm ERR! node v5.0.0
remote:        npm ERR! npm  v3.3.6
remote:        npm ERR! code ECONNRESET
remote:        npm ERR! errno ECONNRESET
remote:        npm ERR! syscall read
```

herokuやnpmのネットワークの不調で出る場合があるので、[npmのステータス](http://status.npmjs.org/)を見るなどして、少し待ってから再度同じコマンドを試してみてください。
