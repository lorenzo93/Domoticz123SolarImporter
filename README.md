# Domoticz123SolarImporter

API Interface app between 123solar from Jean-Marc Louviaux and Domoticz.

Written starting from Roland Breedveld's [bash script](http://www.domoticz.com/forum/viewtopic.php?t=12016)

## Install guide
Download the .zip and unzip it in a clean folder one of your linux devices (it works both from 123Solar server and Domoticz Server)
From the shell go into the folder and type
```
npm install
```
After the process finishes change settings, according to yours, in "config.js" file
Then, inside the shell, write
```
sudo npm install forever -g
```
to install forever, a software that keeps the script running and restart it if there are some problems.
Once installed just type (to run it from root, otherwise just change the username)
```
sudo crontab -u root -e
```
and add at the end of the file
```
@reboot /usr/local/bin/forever start /your/path/to/your/app.js
```
and save the file.
At next reboot the software will be online and running!