# �g���u���Ɖ������@

## heroku login �ŃG���[���o��ꍇ

�ȉ��̂悤�ȃG���[���o��ꍇ

```
> git push heroku master

remote: !       No such app as mighty-plains-XXXX.
fatal: repository 'https://git.heroku.com/mighty-plains-XXXX.git/' not found
```

�܂��A`git remote -v` �Ō��݂̃����[�g���|�W�g���̐ݒ��\�����܂�

```
> git remote -v

heroku  https://git.heroku.com/mighty-plains-XXXX.git (fetch)
heroku  https://git.heroku.com/mighty-plains-XXXX.git (push)
```

���ꂪ heroku �̃_�b�V���{�[�h��ɕ\������� app ���ƈႤ�ꍇ�A�C�����s���Ă���A������x git push ���܂�

```
> git remote rm heroku
> git remote add heroku git@heroku.com:�{���̂`�o�o��.git
> git push heroku master
```


## git push heroku master �ŃG���[���o��ꍇ

�ȉ��̂悤�ȃG���[���o��ꍇ

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

heroku��npm�̃l�b�g���[�N�̕s���ŏo��ꍇ������̂ŁA[npm�̃X�e�[�^�X](http://status.npmjs.org/)������Ȃǂ��āA�����҂��Ă���ēx�����R�}���h�������Ă݂Ă��������B
