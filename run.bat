@echo off
for /F "tokens=*" %%A in (.env) do set %%A
node server.js
