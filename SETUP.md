## �O����

 - GitHub �̃A�J�E���g���擾
    - GitHub : [OAuth token](https://help.github.com/articles/git-automation-with-oauth-tokens/)�����
    - GitHub : RSS�i�[��̃��|�W�g��������Ă���
 - Heroku �̃A�J�E���g���擾
    - [heroku toolbelt](https://toolbelt.heroku.com/)���C���X�g�[��
    - [heroku-config](https://github.com/ddollar/heroku-config)���C���X�g�[��
        - `heroku plugins:install git://github.com/ddollar/heroku-config.git`
 - �I�v�V�����F[Mailgun](https://www.mailgun.com/) �̃A�J�E���g���擾
    - [Mailgun��"Domains"�^�u](https://mailgun.com/app/domains)�ŁA�uAdd New Domain�v�������A�h���C����ǉ�
    - �ǉ������h���C���́uDomain Name�v�������āA�uAPI Base URL�v�ƁuAPI Key�v����������
 - [node.js](https://nodejs.org/) �����[�J���ɃC���X�g�[��

�����ł�

 - GitHub �ł̃��[�U�[�� : `HOGE`
 - GitHub �ł� OAuth �g�[�N�� : `0123456789abcdef0123456789abcdef01234567`
 - GitHub �ł̃t�B�[�h�i�[�惊�|�W�g���� : `FUGA`
 - GitHub �ł̃t�B�[�h�i�[�惊�|�W�g��URL : `https://github.com/HOGE/FUGA.git`

�Ƃ��܂�


## ������

���|�W�g�����N���[�����āA`.env.txt` �� `.env` �Ƃ��ăR�s�[���܂�

```
git clone https://github.com/neguse11/rss_gatherer.git
cd rss_gatherer
copy .env.txt .env
```

�K���ȃG�f�B�^ (`notepad .env`�Ȃ�) �� `.env` ��ҏW���A���[�U���AOAuth�g�[�N���A�t�B�[�h�i�[��̃��|�W�g��URL�����܂�

```
GH_USER=HOGE
GH_PASS=0123456789abcdef0123456789abcdef01234567
GH_REPO=https://github.com/HOGE/FUGA.git
```


## ���[�J������

�ȉ��̃R�}���h�ŏ��������s���Aheroku �����[�J�����s���܂�

```
npm install
heroku local bot
```

���s������������A`https://github.com/HOGE/FUGA/tree/gh-pages` ���J���A`gh-pages` �u�����`���X�V���ꂽ���Ƃ��m�F���܂��B
�܂��A`gh-pages` �u�����`�̕ʖ� URL �ƂȂ� `https://HOGE.github.io/FUGA/cm3d2.rss` ���� RSS ��\���ł��邱�Ƃ��m�F���܂�


## Heroku ����

Heroku �փ��O�C�����A�R�[�h�Ɛݒ�� push ���āAHeroku �̃T�[�o�[��Ŏ��s���܂�

�T�[�o�[�ݒ�

```
heroku login
heroku create
heroku ps:scale web=0
heroku plugins:install git://github.com/ddollar/heroku-config.git
git config user.email "HOGE"
git config user.name "HOGE"
```

�t�@�C���̍X�V�Ǝ��s

```
heroku login
git add .
git commit -m "push to heroku"
git push heroku master
heroku config:push -o && heroku config
heroku run bot
```

�ӂ����� `https://github.com/HOGE/FUGA/tree/gh-pages` ���J���A`gh-pages` �u�����`�� `https://HOGE.github.io/FUGA/cm3d2.rss` ���m�F���܂�


## Heroku �^�p

�ȉ��̐ݒ�����āA1���Ԃ�1��̕p�x�ŏ�����s���悤�ɂ��܂�

 - https://elements.heroku.com/addons/scheduler ���� Heroku Scheduler ���C���X�g�[��
 - https://scheduler.heroku.com/dashboard �ŃX�P�W���[���̉�ʂ��o���āuAdd new job�v�������A�ȉ��̂悤�ɐݒ�
    - �u$�v�́unode server.js�v
    - �uFREQUENCY�v�́uHourly�v


�X�P�W���[���[�̎��s���O�͈ȉ��̃R�}���h�Ŋm�F�ł��܂�

```
heroku logs --ps scheduler
```


## �ݒ�

�ݒ�� `.env` �� `sources.json` �ōs���܂�

`.env` �ɂ͊�{�I�ȏ������܂��B**���̃t�@�C�������J���Ȃ��悤�ɋC�����Ă�������**

| ���ږ�             | ���e | ��   |
| ----               | ---- | ---- |
|GH_USER             |GitHub��̃��[�U�[�� | `HOGE` |
|GH_PASS             |GitHub�Ŏ擾���� [OAuth �g�[�N��](https://help.github.com/articles/git-automation-with-oauth-tokens/) (40 ������ 16�i��) | `0123456789abcdef0123456789abcdef01234567` |
|GH_REPO             |GitHub��̃��|�W�g�� URL | `https://github.com/HOGE/FUGA.git` |
|GH_EMAIL            |GitHub��̃��|�W�g�����̃R�~�b�g���O�ɕ\�����郁�[���A�h���X | [`HOGE@users.noreply.github.com`](https://help.github.com/articles/keeping-your-email-address-private/)) |
|GH_NAME             |GitHub��̃��|�W�g�����̃R�~�b�g���O�ɕ\�����閼�O | `HOGE` |
|GH_BRANCH           |GitHub��̃��|�W�g�����̃R�~�b�g��u�����`�� | `gh-pages` |

`.env` �ł̓I�v�V�����@�\�Ƃ��āAMailgun ���g�p�������[���ɂ�郌�|�[�g���M�ݒ���w�肷�邱�Ƃ��ł��܂�

| ���ږ�             | ���e | ��   |
| ----               | ---- | ---- |
|MAILGUN_API_BASEURL |Mailgun��API Base URL | `https://api.mailgun.net/v3/sandboxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org` |
|MAILGUN_API_KEY     |Mailgun��API Key  | `key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
|MAILGUN_TO          |���|�[�g���M�� | `my.mail@example.com` |
|MAILGUN_FROM        |���|�[�g���M���� From: ���̒l | `rss_gathrer@report.example.com` |

`sources.json` �͏����� URL �����w�肷��t�@�C���ł� `"sources"` ���̍��ڂ𑝌������邱�ƂŁA������ݒ�ł��܂�

| ���ږ�    | ���e |
| ----      | ---- |
|"url"      | ������ getuploader.com ��� URL |
|"type"     | �����̃T�C�g�̃^�C�v |
|"timezone" | �����̓��t�̃^�C���]�[�� |
|"title"    | ���J����t�B�[�h�̖��O |
|"filename" | ���J����t�B�[�h�̃t�@�C���� |


## �J���p�̃��[�J�����s

�ȉ��̃R�}���h�� heroku �����ł̎��s���ł��܂�

```
npm run herokish
```
