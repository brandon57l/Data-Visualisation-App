#!/bin/bash

## Recuperation du type d'appli à la fin du nom du script courant (ex:  API ou WEB)
TYPEAPP="$(basename \"$0\" | cut -f2 -d '-' | cut -f1 -d '.')"
if [ "$TYPEAPP" == "$(basename $0 .${0##*.})" ]
then
    TYPEAPP="WEB"
fi
if [ "$TYPEAPP" != "WEB" ] && [ "$TYPEAPP" != "API" ]
then
    echo "ERREUR : mauvais type d'application, WEB ou API attendu."
    exit 1
fi

## Variable a modifier ##
SERVER="10.253.255.9"
FOLDERSERVICE="/etc/init/"
FOLDERDEST="/data/Flask${TYPEAPP}-project/"
FOLDERNGINX="/etc/nginx/Flask${TYPEAPP}Config/"
FOLDERSCRIPT="Scripts"
WEBUSER="www-data"

## Fonction ##
function pause(){
   read -p "$*"
}

replace() {
    local search=$1
    local replace=$2
    local file=$3
    sed -i "s/${search}/${replace}/g" $file
}

## Variable Script ##
DIR="$(dirname $(readlink -f $0))"
SITE="$(basename $DIR)"

# Positionnement dans le dossier
cd $DIR

echo "##############################################"
echo "# Installation du site $TYPEAPP : $SITE"
echo "##############################################"

pause "> Appuyer sur [Enter] pour continuer..."
echo
echo "> Copie du dossier src/ vers root@$SERVER:$FOLDERDEST$SITE/src/"
echo "> Copie du dossier logs/ vers root@$SERVER:$FOLDERDEST$SITE/logs/"
echo "> Copie du dossier conf/ vers root@$SERVER:$FOLDERDEST$SITE/conf/"
rsync  -azv --chown=$WEBUSER:$WEBUSER --exclude="venv" --exclude="Queue/Archive/*" --exclude="Queue/In/*" --exclude="Queue/tmp/*" --exclude="flask_session/*" --exclude="static/cache/**" --exclude="**/*.log" ./src ./logs ./conf root@$SERVER:$FOLDERDEST$SITE/
echo
echo "> Copie du service vers root@$SERVER:$FOLDERSERVICE$SITE-$TYPEAPP.conf"
TFILE="/tmp/service.conf.$$.tmp"
cp ./CONF_INIT/service.conf $TFILE
replace "\[SITEWEB\]" "$SITE" "$TFILE"
replace "\[TYPEAPP\]" "$TYPEAPP" "$TFILE"
rsync "$TFILE" "root@$SERVER:$FOLDERSERVICE$SITE-$TYPEAPP.conf"
rm "$TFILE"
echo
echo "> Copie de la conf NGINX vers root@$SERVER:$FOLDERNGINX$SITE.conf"
TFILE="/tmp/nginx.conf.$$.tmp"
cp ./CONF_NGINX/nginx.conf $TFILE
replace "\[SITEWEB\]" "$SITE" "$TFILE"
replace "\[TYPEAPP\]" "$TYPEAPP" "$TFILE"
rsync "$TFILE" "root@$SERVER:$FOLDERNGINX$SITE.conf"
rm "$TFILE"
echo
echo "#################################################################################"
echo "# Finaliser l'installation sur le serveur WEB : $SERVER"
echo "#  > cd $FOLDERDEST$SITE"
echo "#  > virtualenv -p python3 venv"
echo "#  > source venv/bin/activate"
echo "#  > pip install --proxy=http://10.253.255.100:3128 -r ./src/requirements.txt"
echo "#  > deactivate"
echo "#  > "
echo "#"
echo "# Demarrer le service Gunicorn    : service $SITE-$TYPEAPP start"
echo "# Redemarrer le service nginx     : service nginx restart"
echo "#################################################################################"
echo ">Fin"
