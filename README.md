# getuploader����t�@�C�����𓾂āArss�Ƃ��Ă܂Ƃ߂�T�[�o�R�[�h


## �O����

 - GitHub : [OAuth token](https://help.github.com/articles/git-automation-with-oauth-tokens/)�����
 - GitHub : �i�[��̃��|�W�g��������Ă���
 - [node.js](https://nodejs.org/) ���C���X�g�[��
 - [heroku toolbelt](https://toolbelt.heroku.com/)���C���X�g�[��
 - [heroku-config](https://github.com/ddollar/heroku-config)���C���X�g�[��
     - `heroku plugins:install git://github.com/ddollar/heroku-config.git`

�����ł�

 - GitHub �ł̃��[�U�[�� : `hoge`
 - GitHub �ł� OAuth �g�[�N�� : `0123456789abcdef0123456789abcdef01234567`
 - GitHub �ł̊i�[�惊�|�W�g���� : `fuga`
 - GitHub �ł̊i�[�惊�|�W�g��URL : `https://github.com/hoge/fuga.git`

�Ƃ��܂�


## ������

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


## ���[�J������

```
npm install
heroku local bot
```

`https://github.com/hoge/fuga/tree/gh-pages` ���J���A`gh-pages` �u�����`���X�V���ꂽ���Ƃ��m�F


## Heroku ����

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

�ӂ����� `https://github.com/hoge/fuga/tree/gh-pages` ���J���A`gh-pages` �u�����`���X�V���ꂽ���Ƃ��m�F
