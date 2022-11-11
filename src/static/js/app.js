/* namespace */
var appWEB = appWEB || {};


filterSearch = (function () {
    var self = {}
    var pays
    var pdepFilter = []
    var labelFilter = ""

    self.getPdepFilter = function (){
        return pdepFilter
    }
    self.getLabelFilter = function (){
        return labelFilter
    }

    self.init = function (){

        $('#dropdownPays')
        .dropdown({
            values: [
                {
                    name : "France",
                    value : "FR",
                    type     : 'item'
                },
                {
                    name : "Espagne",
                    value : "ES",
                    type     : 'item'
                },
                {
                    name : "Belgique",
                    value : "BE",
                    type     : 'item'
                },
                {
                    name : "Italie",
                    value : "IT",
                    type     : 'item'
                },
                {
                    name : "Pays-Bas",
                    value : "PA",
                    type     : 'item'
                },
                {
                    name : "Portugal",
                    value : "PO",
                    type     : 'item'
                },
                {
                    name : "Suisse",
                    value : "SU",
                    type     : 'item'
                },
            ],
            onChange: function(value) {
                // cyt.addFilter(value.split(','),'PDEP')
                $("#inputPays").attr("placeholder", "")
                pays = value
                console.log(pays)
            }
        })

        $("#search").api({
            action: 'getHierarchieTiers',            
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            beforeSend : function(settings) {
                settings.urlData = {
                    ntiers: $('#txtNtier').val(),
                    pays: pays
                }
                return settings
            },
            onSuccess: function(response) {
                $('.input').removeClass("disabled");
                
                appWEB.setAncienNiveau(0) // Met à jour le filtre par niveau 
                $(".legendeitem").css('background-color','white')

                cyt.setData(response.items)
                cyt.display($('#txtNtier').val())
                self.dropdownSetDep()
                self.dropdownSetTiers()
                return 
            },
        })

        // Evenement declenché avec la touche "enter" 
        $("#btnNtiers").keypress(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13'){
                $("#search").click()
            }
        })



        $("#txtSearchLabel").keypress(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13'){
                $("#btnLabelValider").click()
            }
        })

        $('#txtSearchLabel').bind('input', function(){
            console.log(this.value)

            if(this.value.length>3 ){
                labelFilter = this.value
                cyt.getCy().elements().removeClass('lowOpacity')
                cyt.getCy().edges().addClass('lowOpacity')

                cyt.getCy().nodes(function(node){

                    if(appWEB.getNiveauFilter()!=0)
                        return !(node.style('label').indexOf($('#txtSearchLabel').val().toUpperCase())+1) || node.data('niveau')!=appWEB.getNiveauFilter()
                    else
                        return !(node.style('label').indexOf($('#txtSearchLabel').val().toUpperCase())+1)

                }).addClass('lowOpacity')

            }else{
                if(appWEB.getNiveauFilter()==0)
                    cyt.getCy().elements().removeClass('lowOpacity')
                else    
                    cyt.getCy().filter(`node[niveau=${appWEB.getNiveauFilter()}]`).removeClass('lowOpacity')
            }
        });

        $("#btnLabelValider").click(function(){
            // $('#txtSearchLabel').addClass('loading')
            labelFilter = $('#txtSearchLabel').val()

            if($('#txtSearchLabel').val()){

                cyt.getCy().elements().removeClass('lowOpacity')
                cyt.getCy().edges().addClass('lowOpacity')

                cyt.getCy().nodes(function(node){

                    if(appWEB.getNiveauFilter()!=0)
                        return !(node.style('label').indexOf($('#txtSearchLabel').val().toUpperCase())+1) || node.data('niveau')!=appWEB.getNiveauFilter()
                    else
                        return !(node.style('label').indexOf($('#txtSearchLabel').val().toUpperCase())+1)

                }).addClass('lowOpacity')
            }
        })

        $("#btnLabelAnnuler").click(function(){
            labelFilter = ""
            $('#txtSearchLabel').val('')
            if(appWEB.getNiveauFilter())
                cyt.getCy().elements(function(ele){return ele.data('niveau')==appWEB.getNiveauFilter()}).removeClass('lowOpacity')
            else
                cyt.getCy().elements().removeClass('lowOpacity')
        })

        // $('#dropdownMenu').on('click','.item',function(e){

        //     console.log($(this).data('value'))

        //     var nodeFilter = cyt.getCy().filter(`node[dep != "${$(this).data('value')}"]`)

        //     nodeFilter.style({'display':'none'})
        // })
    }

    self.dropdownSetTiers = function (){
        // Suprimme tous les elements du tableau
        var listNtiers = []
        $('#dropdownTiers').removeClass("disabled");
        $('#dropdownMenuTiers').empty()

        // Trie les éléments cy
        var elements = cyt.getCy().nodes().sort(function( a, b ){
            if(a.data('ntiers') > b.data('ntiers')) {
                return 1;
            }
            else {
                return -1;
            }
        })

        // Creer la liste de code tiers (nTiers) pour le dropdown
        elements.nodes().forEach(node => {

                listNtiers.push({
                        name : node.data('ntiers'),
                        // name : (`${node.data('ntiers')} ${node.data('libNiveau').slice(0,4)}...`),
                        value : node.data('ntiers'),
                        type     : 'item'
                })
        })
        console.log(listNtiers)

        $('#dropdownTiers')
        .dropdown({
            values: listNtiers,
            onChange: function(value) {
                console.log("hello")

                cyt.addFilter(value.split(','),'NTIERS')
            }
        })
    }

    self.dropdownSetDep = function (){
        // Suprimme tous les elements du tableau
        pdepFilter = []

        var listPdep = []
        var val = []
        $('#dropdownPdep').removeClass("disabled");
        $('#dropdownMenuPdep').empty()

        // Trie les éléments cy
        var elements = cyt.getCy().nodes().sort(function( a, b ){
            if(a.data('pdep') > b.data('pdep')) {
                return 1;
            }
            else {
                return -1;
            }
        })

        // Creer la liste de département (pdep) pour le dropdown
        elements.nodes().forEach(node => {
            if (!listPdep.includes(node.data().pdep)){
                listPdep.push(node.data().pdep)

                val.push({
                        name : node.data().pdep,
                        value : node.data().pdep,
                        type     : 'item'
                })
            }
        })

        $('#dropdownPdep')
        .dropdown({
            values: val,
            onChange: function(value) {
                pdepFilter = value.split(',')
                cyt.addFilter(value.split(','),'PDEP')
            }
        })
        
    }
    
    return self
})()


semanticToast = (function () {
    var self = {}

    self.init = function (){
    }

    // Récupère le detail des infos d'un tier
    self.createToast = function (data) {
        $.api({
            action: 'getDetailTiers',    
            urlData: {
                ntiers: data.ntiers
            },
            on: 'now',
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            onSuccess: function(response) {
                console.log(response)
                self.displayToast(response.items)
                return;
            },
        })
    }

    // Affiche le detail des infos d'un tier
    self.displayToast = function (data) {

        var $toastItem = $('body')

        .toast({
            message:(`<h2>${data.nom}</h2>
                    <div>
                        <div class="ui top attached tabular menu">
                          <div class="item active" data-tab="one">One</div>
                          <div class="center item" data-tab="two">Two</div>
                          <div class="item" data-tab="three">Three</div>
                       </div>
                       <div class="ui bottom attached tab segment active" data-tab="one">
                           <p><strong>Identifiant CEE :</strong> ${data.identifiantCEE}</p>
                           <p><strong>Matricule Demandeur Ouverture :</strong> ${data.matriculeDemandeurOuverture}</p>
                           <p><strong>Matricule Maj :</strong> ${data.matriculeMaj}</p>
                           <p><strong>Nom Abrege :</strong> ${data.nomAbrege}</p>
                           <p><strong>Numero Agence E plan :</strong> ${data.numeroAgenceEplan}</p>
                           <p><strong>Numero Etablissement :</strong> ${data.numeroEtablissement}</p>
                           <p><strong>Numero Groupe :</strong> ${data.numeroGroupe}</p>
                       </div>
                       <div class="ui bottom attached tab segment" data-tab="two">
                            <p><strong>Ville :</strong> ${data.ville}</p>
                            <p><strong>Pays département :</strong> ${data.paysPdep}</p>
                            <p><strong>Code postal :</strong> ${data.codePostal}</p>
                       </div>
                       <div class="ui bottom attached tab segment" data-tab="three">
                           <p></p>
                           <p></p>
                       </div>
                    </div>`),
            displayTime: 0,
            closeIcon: true,
            position:'left bottom'
        })

        // Interaction avec les tableaux dans les toasts
        $toastItem.find('.menu .item').tab({
            context: 'parent'
        })
    }

    self.loadingToast = function (num) {
        $('body')
        .toast({
            class: 'info',
            preserveHTML:true,
            message: ` 
            <div>.</div>
            <div class="ui active inverted dimmer">
            <div class="ui tiny text loader">Chargement de ${num} elements</div>
            </div>
                        `,
            
            displayTime: 1000,
        })        
    }
    
    return self
})()

cyt = (function () {
    var cy
    var elemTippy

    var self = {}

    self.getCy = function () {
        return cy
    }

    
    self.init = function () {
        
        cy = cytoscape({
            container: $('#cy'),
            
            ready: function(){
                
            },

            elements: [],

            // Feuilles de style
            style: [
                {
                    selector: 'node',
                    css: {
                        "display":"none",
                        "text-wrap": "wrap",
                        "label": node => {return `${node.data("ntiers")} - ${node.data("name")} \n ${node.data("pdep")} ${node.data("ville")}`},
                        'width': 10,
                        'height':10,
                        'font-size':5,
                        'font-family':"Poppins",
                        'font-weight': "normal",
                        "background-color":"white",

                        "border-width":"1px",
                        "border-style":"solid"
                    }
                },
                {
                    selector: 'node:selected',
                    css: {
                        "background-color":"#D9EDFF",
                    }
                },
                {
                    selector: 'edge',
                    style: {
                    'width': 1.5,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'vee',
                    }
                },
                {
                    selector: '.ClassNodeGroupe',
                    style: {
                        'shape'  : 'star',
                        'border-color':'#E85177',
                        'width': '20',
                        'height': '20'
                    }
                },
                {
                    selector: '.ClassNodeDivision',
                    style: {
                        'shape'  : 'hexagon',
                        'border-color':'#ED8058',
                        'width': '17',
                        'height': '17'
                    }
                },
                {
                    selector: '.ClassNodeEntreprise',
                    style: {
                        'shape'  : 'rectangle',
                        'border-color':'#E8D168',
                        'width': '14',
                        'height': '14'
                    }
                },
                {
                    selector: '.ClassNodeEtablissement',
                    style: {
                        'shape'  : 'triangle',
                        'border-color':'#2A9D8F',
                        'width': '12',
                        'height': '12'
                    }
                },
                {
                    selector: '.ClassNodeTierssecondaire',
                    style: {
                        'shape'  : 'ellipse',
                        'border-color':'#264653',
                        'width': '10',
                        'height': '10'
                    }
                },
                {
                    selector: '.ClassEdgeGroupe',
                    style: {
                        'line-color' : '#E85177',
                        'target-arrow-color' :'#E85177'
                    }
                },
                {
                    selector: '.ClassEdgeDivision',
                    style: {
                        'line-color' : '#ED8058',
                        'target-arrow-color' :'#ED8058'
                    }
                },
                {
                    selector: '.ClassEdgeEntreprise',
                    style: {
                        'line-color' : '#E8D168',
                        'target-arrow-color' :'#E8D168'
                    }
                },
                {
                    selector: '.ClassEdgeEtablissement',
                    style: {
                        'line-color' : '#2A9D8F',
                        'target-arrow-color' :'#2A9D8F'
                    }
                },
                {
                    selector: '.Dashed',
                    style: {
                        'line-style': 'dashed'
                    }
                },
                {
                    selector: '.displayElement',
                    style: {
                        'display': 'element',
                        'z-index': 1,
                    }
                },
                {
                    selector: '.alwaysDisplay',
                    style: {
                        'display': 'element',
                        'z-index': 99,
                    }
                },
                {
                    selector: '.root',
                    style: {
                        "background-color":"red",
                    }
                },
                {
                    selector: '.haveHiddenNodes',
                    style: {
                        'font-weight': 'bold'
                    }
                },
                {
                    selector: '.lowOpacity',
                    style: {
                        'opacity':0.20,
                        'content': ''
                    }
                },
                {
                    selector: '.selectedTiers',
                    style: {
                        'background-color':'blue',
                    }
                },
            ],
        })
        
        var makeTippy = function(ele, text){
            var ref = ele.popperRef();
            
            // Since tippy constructor requires DOM element/elements, create a placeholder
            var dummyDomEle = document.createElement('div');

            var tip = tippy( dummyDomEle, {
                getReferenceClientRect: ref.getBoundingClientRect,
                trigger: 'manual', // mandatory
                // dom element inside the tippy:
                content: function(){ // function can be better for performance
                    var div = document.createElement('div');

                    div.innerHTML = text;

                    return div;
                },
                // your own preferences:
                arrow: true,
                placement: 'bottom',
                hideOnClick: false,
                sticky: "reference",

                // if interactive:
                interactive: true,
                appendTo: document.body // or append dummyDomEle to document.body
            } );

            return tip;
        };


        cy.on('mouseover','node', function(evt){
            
            var node = evt.target;

            var data = evt.target.data();
            
            var target =  node.successors();

            if (target) {
                cy.automove({
                     nodesMatching: target,
                     reposition: 'drag',
                     dragWith: node
                });
            }

            elemTippy = makeTippy(node, 
                            `<strong>${data.name}</strong>`
                            +`<p>${data.ntiers + " - " +data.pdep+" - "+data.ville}</p>`
                        );
			elemTippy.show();
        });

        cy.on('mouseout','node', function(evt){
            elemTippy.hide()
            cy.automove('destroy')
        })

        $('#cy').on('mousedown', function(evt) {
            if(elemTippy) elemTippy.hide()
        });


        cy.on('click', 'node', function(evt){
            single_clique = true

            // Attends pour vérifier que l'événement "dbclick" ne sois pas exécutés
            setTimeout(()=>{if(single_clique){

                    
            }}, 250);
        });

        cy.on('dblclick', 'node', function(evt){

            single_clique = false
            // cy.startBatch();

            // Selection les elements cachés
            var hiddenElements = this.outgoers(function(ele){ 
                            return (!ele.hasClass('displayElement'))
                        })
            

            

            if (hiddenElements.length){

            // Si le nombre d'element cacher est elevé j'affiche un message
            if (hiddenElements.length>200)
                semanticToast.loadingToast(hiddenElements.length+1)

                // J'attends que le message s'affiche puis je mets à jour les éléments
                setTimeout(() => {
                    hiddenElements.addClass('displayElement')
                    self.updateDisplay(hiddenElements.union(this))
                }, 10);

            }else{ // Si aucun élément est caché je les cache tous et spécifie que le node sélection a désormais des nodes enfants
                if (this.successors(".displayElement").removeClass('displayElement').length)  this.addClass('haveHiddenNodes')
            }

        })

        cy.cxtmenu({
            selector: 'node',
            
            commands: [
                {
                content: '<i style="font-size:25px" class="eye slash outline icon"></i>',
                    select: function(ele){
                        ele.successors(".displayElement").removeClass('displayElement')
                        ele.removeClass('displayElement')
                    },
                    
                },
                {
                    content: '<span">Select</span>',
                    select: function(ele){

                        ele.successors().forEach(element => {
                            element.json({selected: true})
                        });
                        // ele.json({selected: true})
                        
                    },
                   
                },
                {
                    content: '<i style="font-size:25px" class="file alternate outline icon"></i>',
                    select: function(ele){

                        // appWEB.initYUI(ele.data())
                        // dragWindow.createWindow(ele.data())

                        semanticToast.createToast(ele.data())
                        
                    }
                }
            ]
        });

        $(".iconPosition").click(function(){
            elements = cy.elements(':visible')

            console.log(`Mise a jour position de ${elements.length} elements`)


            // Si le nombre d'element cacher est élevé j'affiche un message
            if (elements.length>200)
                semanticToast.loadingToast(elements.length+1)

            // J'attends que le message s'affiche et je mets à jour les éléments
            setTimeout(() => {
                self.updateDisplay(elements)
            }, 10);
        })

        $(".iconEye").click(function(e){
            elements = cy.elements()
            

            // Si le nombre d'element cacher est elevé j'affiche un message
            if (elements.length>200)
                semanticToast.loadingToast(elements.length+1)

            // J'attends que le message s'affiche et je mets à jour les éléments
            setTimeout(() => {
                elements.addClass('displayElement')
                self.updateDisplay(elements)
            }, 10);
        })
    }

    self.setData = function(data){
        // Supprime les anciens elements avant d'ajouter les nouveaux
        cy.elements().remove()

        cy.add(data)
    }    


    self.updateDisplay = function(elts){
        if (!elts) {
            elts = cy.elements(':visible')
            cy.elements('.displayElement, .alwaysDisplay').layout({name: 'cose-bilkent'}).run()
            
        } else {
                
            console.log(`Chargement de ${elts.length} elements`)

            elts.layout({name: 'cose-bilkent',randomize: false})
            // .on('layoutstart', function() {
            //     console.log("start")
            //     semanticToast.loadingToast(elts.length)
            // }).on('layoutstop', function() {
            //     console.log("stop")
            // })
            .run()

        }
        
        // Pour chacun des éléments, vérifie s'il possède des nodes enfant caché

        setTimeout(() => {
            elts.forEach(function(ele){
                if (ele.outgoers(':hidden').length) 
                    ele.addClass('haveHiddenNodes')
                else
                    ele.removeClass('haveHiddenNodes')  ;
            })
        }, 10);


    }

    self.display = function(root){
        
        //Affiche les Nodes principaux
        rootElement = cy.filter(`node[id = 'N${root}|5'],node[id = 'N${root}|4']`)
        rootElement.addClass('alwaysDisplay root').predecessors().addClass('alwaysDisplay')
        self.updateDisplay()

        // dragging mid drags its neighbourhood with it
		cy.automove({
			nodesMatching: cy.$(':selected').neighbourhood().nodes(),
			reposition: 'drag',
			dragWith: cy.$('.ClassEtablissement')
		});

    }

    self.addFilter = function(list,action){
        

        // Filtre les nodes par PDEP
        if(action=='PDEP'){
            cy.elements().removeClass('displayElement')

            var nodes = cy.nodes(function(node){

                return (list.includes(node.data().pdep))
            })

            nodes.addClass('displayElement')
            nodes.predecessors().addClass('displayElement')

            self.updateDisplay(nodes.predecessors().union(nodes))

        }else if(action=='NTIERS'){
            var majPosition = false
            // cy.nodes('.selectedTiers').predecessors().removeClass('displayElement')
            cy.nodes('.selectedTiers').removeClass('selectedTiers')
                // .removeClass('displayElement')
            

            var nodes = cy.nodes(function(node){
                
                if(list.includes(node.data('ntiers'))){
                    console.log(node.style('display'))
                    if(node.style('display')=='element'){
                        console.log('1')
                        node.addClass('selectedTiers')
                        return false
                    }else{
                        console.log('2')
                        majPosition = true
                        node.addClass('displayElement selectedTiers').predecessors().addClass('displayElement')
                        return true 
                    }
                }
                
            })
            
            if(majPosition){
                self.updateDisplay(nodes.predecessors().union(nodes))
            }
        }

        console.log("In addFilter")
        
    }


    return self
})();



appWEB = (function () {
    var self = {}
    var niveauFilter=0
    var ancienNiveau

    self.getNiveauFilter = function () {
        return niveauFilter
    }
    self.setAncienNiveau = function (val) {
        ancienNiveau =  val
    }

    self.init = function () {

        // ZOOM
        $(".plus").click(function(e){
            let currentSize = cyt.getCy().zoom()
            cyt.getCy().zoom({
                level : currentSize+0.2,
                renderedPosition: { x: window.innerWidth/2, y: window.innerHeight/2 }
            })
        })

        $(".minus").click(function(e){
            let currentSize = cyt.getCy().zoom()
            cyt.getCy().zoom({
                level : currentSize-0.2,
                renderedPosition: { x: window.innerWidth/2, y: window.innerHeight/2 }
            })
        })

        $(".containerLegende").on("click",".legendeitem", function(){

            
            niveauFilter = $(this).data("level")

            cyt.getCy().elements().removeClass('lowOpacity') // Réaffiche tous les elements

            if(ancienNiveau==niveauFilter){// Si le clique est effectuer sur le même niveau que le precedant, je met a jour les backgrounds dans la légende et laisse afficher tous les nodes
                $(".legendeitem").css('background-color','white')

                cyt.getCy().elements(function(ele){
                    console.log('no')
                    return !(ele.style('label').indexOf(filterSearch.getLabelFilter().toUpperCase())+1)
                }).addClass('lowOpacity')

                ancienNiveau = 0
                niveauFilter = 0
            }else{
                
                $(".legendeitem").css('background-color','white')
                $('.legendeitem').each((ele,val) => { 
                    if(val.dataset.level!=niveauFilter) // Grise les niveaux caché dans la légende
                        $(".containerLegende").find(`[data-level='${val.dataset.level}']`).css('background-color','rgb(211, 211, 211)')
                });

                // cyt.getCy().edges().addClass('lowOpacity')
                // cyt.getCy().filter(`node[niveau!=${niveauFilter}]`).addClass('lowOpacity')

                cyt.getCy().elements(function(ele){
                    console.log(ele.data('niveau')!=niveauFilter || !(ele.style('label').indexOf(filterSearch.getLabelFilter().toUpperCase())+1))
                    return ele.data('niveau')!=niveauFilter || !(ele.style('label').indexOf(filterSearch.getLabelFilter().toUpperCase())+1)
                }).addClass('lowOpacity')


                ancienNiveau = $(this).data("level")
            }
            
        })
    };




    return self
})();


// Ready function
$(document).ready(function () {
    appWEB.init();
    cyt.init();
    filterSearch.init();

    // appWEB.initYUI()
})