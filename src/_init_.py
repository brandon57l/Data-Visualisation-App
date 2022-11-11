#! /usr/bin/python
# -*- coding: utf-8 -*-

import os,time
from xml.dom import HierarchyRequestErr
from flask import Flask, render_template,jsonify,request
from reverse_proxy import ReverseProxied
import json
import requests

# Fonction récursive pour structurer les donnée sous forme de "FlatTree"

def MakeNode(dataNode):
    cl = [("ClassNode" + dataNode["libNiveau"]).replace(" ","")]

    data = {
            "id": "N"  + dataNode["ntiers"] + "|" + str(dataNode["niveau"]),
            "Niveau":dataNode["niveau"],
            "libNiveau": dataNode["libNiveau"],
            "ntiers": dataNode["ntiers"],
            "name": dataNode["nom"],
            "pdep": dataNode["pdep"],
            "rue": dataNode["rue"],
            "ville": dataNode["ville"],
            "cpost": dataNode["cpost"],
            "dep":dataNode["cpost"][0]+dataNode["cpost"][1],
            "annul": dataNode["annul"],
            "niveau": dataNode["niveau"],
            "displayed":False
        }
    node = {
            "group" : "nodes",
            "data"  : data,
            "classes" : cl
    }
    return node 

def MakeEdge(Parent, children):
    cl = ["ClassEdge" + Parent["libNiveau"]]
    if (Parent["ntiers"] == children["ntiers"]): 
        cl.append("Dashed")

    data = {
            "id": "E"  + Parent["ntiers"] + "|" + str(Parent["niveau"]) + "-" + children["ntiers"] + "|" + str(children["niveau"]),
            "source" : "N" + Parent["ntiers"] + "|" + str(Parent["niveau"]),
            "target" : "N" + children["ntiers"] + "|" + str(children["niveau"]),
        }
    edge = {
            "group" : "edges",
            "data"  : data,
            "classes" : cl
    }
    return edge 

def MakeFlatTree(data,pays):

    # Faire le noeud : MakeNode
    # Pour chaque children
    #   MakeFlatTree(children)
    #   MakeEdge(noeud - Children)
    tree = []
    # Creation du noeud
    tree.append(MakeNode(data))
    if "children" in data:
        for child in data["children"]:

            if pays:
                print(child["pdep"][0:2])
                if not (data["ntiers"] == child["ntiers"]  and child["niveau"] == 5) and child["pdep"][0:2]==pays: # pour filtrer par pays et ne pas afficher les tiers secondaire
                    tree = tree + MakeFlatTree(child,pays)
                    tree.append(MakeEdge(data,child))
            else:
                if not (data["ntiers"] == child["ntiers"]  and child["niveau"] == 5): # pour ne pas afficher les tiers secondaire
                    tree = tree + MakeFlatTree(child,pays)
                    tree.append(MakeEdge(data,child))
    return tree

# application FLASK
app = Flask(__name__)

# routes pour partage WSGI
app.wsgi_app = ReverseProxied(app.wsgi_app)

# timestamp pour la version des scripts javascript
timestamp = str(int(time.time()))

# Chargement fichier de conf
myhost = os.uname()[1]
if myhost == 'ws-metz-05':
    app.config.from_object('config.ProdConf')
    modeDeveloppement = False
    print('Flask: Config prod')
else:
    app.config.from_object('config.DevConf')
    modeDeveloppement = True
    print('Flask: Config dev')

########################################################################################################################################
# Début jinja

@app.context_processor
def name_app():
    """Retourne les variables globales"""
    return dict(VERSION_FILES=timestamp, DEV=modeDeveloppement)

# Fin jinja
########################################################################################################################################
# Debut Route

@app.route("/")
def hello():
    return "Hello Word !"

@app.route("/app/")
def application3():
    return render_template("index.html")


@app.route("/api/v1.0/<ntiers>/getHierarchieTiers/", methods=['GET'])
def getHierarchieTiers(ntiers):

    pays = request.args.get('pays')

    detailTiers = getDetailTiers(ntiers).get_json()

    data = {
        'title' : 'API getHierarchieTiers',
        'items' : '',
        'status': '',
        'description' : ''
    }

    # Pour gerer les excptions
    try:
        # Pour rester en interne
        proxies = {
            "http": None,
            "https": None
        }

        values = {
            "parametres": {
                "nTiers": detailTiers['items']['numeroGroupe'],
                "niveau": 1,
                "annul": "N"
            }
        }

        url = app.config["API"]["getHierarchieTiers"]

        r = requests.post(url, json=values, verify=False, timeout=600, proxies=proxies)

        if r.status_code == requests.codes.ok:
            app.logger.info('Retour API getHierarchieTiers => %s', r.text)

            data['status'] = 'OK'

            data['items'] = MakeFlatTree(r.json()["getHierarchieTiers"][0],pays)
            data['description'] = 'Requête exécutée avec succès'
            return  jsonify(data)

        else:
            app.logger.error('ERROR')

            data['status'] = 'KO'
            data['description'] = 'Erreur serveur appel API getHierarchieTiers'
            return jsonify(data)
            
    except: 
        app.logger.error('ERROR')
        data['status'] = 'KO'
        data['description'] = "Exception dans l'API getHierarchieTiers"
        return jsonify(data)

@app.route("/api/v1.0/<ntiers>/getDetailTiers/", methods=['GET'])
def getDetailTiers(ntiers):

    data = {
        'title' : 'API getDetailTiers',
        'items' : '',
        'status': '',
        'description' : ''
    }

    proxies = {
        "http": None,
        "https": None
    }

    url = app.config["API"]["getDetailTiers"]+"?ntiers="+ntiers+"&nagence=8000K4"

    r = requests.get(url,  verify=False, timeout=600, proxies=proxies)

    if r.status_code == requests.codes.ok:
        app.logger.info('Retour API getDetailTiers => %s', r.text)
        data['items'] =  r.json()
        data['status'] = 'OK'
        data['description'] = "Requête exécutée avec succès"
        return  jsonify(data)
    else:
        app.logger.error('ERROR')

        data['status'] = 'KO'
        data['description'] = "Erreur serveur appel API getHierarchieTiers"
        return jsonify(data)

if __name__ == '__main__':
    app.run(port=int("5000"),debug='true',host='0.0.0.0', threaded=True)
