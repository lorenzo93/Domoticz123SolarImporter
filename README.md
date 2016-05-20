# Domoticz123SolarImporter

This app is still in BETA!

API Interface app between 123solar from Jean-Marc Louviaux and Domoticz.

Written starting from Roland Breedveld's [bash script](http://www.domoticz.com/forum/viewtopic.php?t=12016)

## Install guide
Download the .zip and unzip it in a clean folder one of your linux devices (it works both from 123Solar server and Domoticz Server)
From the shell go into the folder and type
```
npm install
```
After the process finishes change settings, according to yours in "config.js" file
Then, inside the shell, write
```
crontab -e
```

and add this line at the end
```
*/5 * * * * /usr/local/bin/node /your/path/to/the/script/app.js
```