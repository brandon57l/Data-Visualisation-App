#! /usr/bin/python
# -*- coding: utf-8 -*-


# En production avec WSGI le mode DEBUG n'est pas pris en compte
class Config(object):
   
    API = {
        'getHierarchieTiers'    : 'https://clients.stef.com/ords/pcws/pc/getHierarchieTiers/',
        'getDetailTiers' : 'https://onlinews.stef.com/TIERSWS/services/tiers/detailTiersJson'
    }


class DevConf(Config):
    DEBUG = True

class ProdConf(Config):
    DEBUG = True


