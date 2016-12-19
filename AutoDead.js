var AUTODEAD = AUTODEAD || (function() {
        'use strict';
        var version='0.1',
            lastUpdate = 1480353432,
        //Format is "property in config": [type,label,dropdown list (dropdowns only)]
            configMenu = {
                "MarkOnlyNPC": ["toggle","NPCs Only"],
                "AutoKill": ["toggle","Auto Kill"],
                "AutoBloody": ["toggle","Auto Bloody"],
                "AutoDropLoot": ["toggle","Drop Loot"],
                "AutoRemoveLoot": ["toggle","Remove Loot"],
                "AutoXP": ["toggle","EasyExperience"],
                "Layer": ["dropdown","Layer",{
                    "Object":"object",
                    "GM Layer":"gmlayer",
                    "Map":"map"
                }],
                "xpCommand":["text","XP Cmd"],
                "bagImage":["text","Bag Img"],
                "xpAttr":["text","XP Attr"],
                "crAttr":["text","CR Attr"],
                "bar":["dropdown","HP Bar",{
                    "Bar 1":"bar1",
                    "Bar 2":"bar2",
                    "Bar 3":"bar3"
                }],
                "bloodyIcon":["dropdown","Bloody",{
                    "Half Heart":"half-heart",
                    "Pummeled":"pummeled",
                    "Broken Heart":"broken-heart",
                    "Red":"red"
                }],
                "deadIcon":["dropdown","Dead",{
                    "Dead":"dead",
                    "Skull":"skull",
                    "Death Zone":"death-zone",
                    "Arrowed":"arrowed"
                }],
                "deadPlayerIcon":["dropdown","Player Dead",{
                    "Arrowed":"arrowed",
                    "Dead":"dead",
                    "Skull":"skull",
                    "Death Zone":"death-zone"
                }]
            },
            config = {
                MarkOnlyNPC: true,
                AutoKill: true,
                AutoBloody: true,
                Layer: "objects",
                xpCommand: "!xp challenge [xp]",
                bagImage: "https://s3.amazonaws.com/files.d20.io/images/25721939/m50gsYOI-r1DSbRJg-TXcg/thumb.png?1480319035",
                commandName:"ad",
                xpAttr: "xp",
                crAttr: "level",
                bar: "bar3",
                bloodyIcon: "half-heart",
                deadIcon: "dead",
                deadPlayerIcon: "arrowed",
                AutoDropLoot: true,
                AutoRemoveLoot: true,
                AutoXP: true,
            },
            htmlDefaults = {
                menu: {
                    default: {
                        "box-sizing": "content-box",
                        "border": "none",
                        "color": "black",
                        "text-overflow": "ellipsis",
                        "background": "#ffff80",
                        "background-position": "50% 50%",
                        "background-size": "auto auto",
                        "box-shadow": "4px 4px 6px 1px rgba(0,0,0,0.4)"
                    },
                    header: {
                        "text-align":"center",
                        "background-color": "rgba(255, 255, 255, 0.3)",
                        "border-bottom":"2px black solid",
                        "padding": "0px 0px .1em 0px"
                    },
                    line: {
                        "border-bottom":"1px black solid",
                        "padding": ".5em .5em .5em .5em"
                    }
                },
                card: {
                    main: {
                        "background-color":"#fff",
                        "border":"1px solid #000",
                        "margin-left":"-42px",
                        "border-radius":"3px",
                    },
                    header: {
                        "margin-left":"0px",
                        "padding":"3px 3px 5px 3px",
                        "font-size":"24px",
                        "font-weight":"bold"

                    },
                    subheader: {
                        "border-bottom":"1px solid #ccc",
                        "padding":"0px 3px 5px 3px",
                        "font-size":"12px",
                        "font-weight":"bold",
                        "font-style":"italic"
                    },
                    body: {
                        "padding":"0px 3px 5px 3px",
                        "font-size":"12px"
                    }
                },
                button: {
                    default: {
                        'border': '1px solid #ccc',
                        'border-radius': '1em',
                        'background-color': '#fff',
                        'margin': '0 .1em',
                        'font-weight': 'bold',
                        'padding': '.1em 1em',
                        'color': '#333'
                    },
                    primary: {
                        'color': "#fff",
                        'background-color': "#337ab7",
                        'border': "1px solid #2e6da4"
                    },
                    success: {
                        'color':"#fff",
                        'background-color':"#4cae4c",
                        'border': "1px solid #4cae4c"
                    },
                    info: {
                        'color':"#fff",
                        'background-color':"#5bc0de",
                        'border': "1px solid #46b8da"
                    },
                    warning: {
                        'color':"#fff",
                        'background-color':"#f0ad4e",
                        'border': "1px solid #eea236"

                    },
                    danger: {
                        'color':"#fff",
                        'background-color': "#d9534f",
                        'border': "1px solid #d43f3a"
                    }
                }
            },
            templates = {},
            ch = function (c) {
                var entities = {
                    '<' : 'lt',
                    '>' : 'gt',
                    "'" : '#39',
                    '@' : '#64',
                    '{' : '#123',
                    '|' : '#124',
                    '}' : '#125',
                    '[' : '#91',
                    ']' : '#93',
                    '"' : 'quot',
                    '-' : 'mdash',
                    ' ' : 'nbsp'
                };

                if(_.has(entities,c) ){
                    return ('&'+entities[c]+';');
                }
                return '';
            },
            HandleDead = function(obj) {
                var barMax = config.bar+"_max";
                var barValue = config.bar+"_value";
                if(obj.get(barMax) === "") return;

                var hp=obj.get(barValue);
                if (config.AutoBloody) {
                    if(hp <= obj.get(barMax) / 2 && hp>0) {
                        obj.set("status_"+config.bloodyIcon, true);
                    }
                    else{
                        obj.set("status_"+config.bloodyIcon, false);
                    }
                }
                if (config.AutoKill) {
                    var isDead = obj.get("status_"+config.deadIcon);

                    if(hp <= 0 && !isDead) {
                        kill(obj);
                    } else if (isDead && hp>0) {
                        //resurected
                        if (config.AutoBloody)
                            obj.set("status_"+config.deadIcon, false);
                    }
                }

            }, //End HandleDead
            GetIndividualTreasure = function (cr) {
                var roll = _.random(0,100);
                var cp=0,sp=0,ep=0,gp=0,pp=0;
                switch(true) {
                    case (cr<=4):
                        switch(true) {
                            case(roll <=30):
                                cp = _.random(5,30);
                                break;
                            case (roll<=60):
                                sp = _.random(4,24);
                                break;
                            case (roll<=70):
                                ep=_.random(3,18);
                                break;
                            case (roll<=95):
                                gp=_.random(3,18);
                                break;
                            case (roll<=100):
                                pp=_.random(1,6);
                                break;
                        }
                        break;
                    case (cr<=10):
                        break;
                    case (cr<=16):
                        break;
                    default:
                        break;
                }
                return {
                    "cp":cp,
                    "sp":sp,
                    "ep":ep,
                    "gp":gp,
                    "pp":pp
                };
            },//End GetIndividualTreasure
            GetTokenTreasure = function(target) {
                if (typeof(target)==='undefined') {
                    sendError("Error in GetTokenTreasure. No target found.");
                    return null;
                }
                var oCharacter = getObj("character", target.get("represents"));
                var cr = findObjs({_type: "attribute", _characterid: oCharacter.id, name: config.crAttr});
                if (typeof(cr)==='undefined') {
                    sendError("cr not defined for "+target.get("name"));
                    return null;
                }
                cr = cr[0].get("current");
                return GetIndividualTreasure(eval(cr));
            },//End GetTokenTreasure
            DropLootBag = function(target) {
                if (typeof(target)==='undefined') {
                    sendError("Error in DropLootBag. No target found.");
                    return null;
                }

                var gPage_id=target.get("_pageid"),
                    gLeft = target.get("left"),
                    gTop = target.get("top"),
                    width = target.get("width"),
                    height = target.get("height");

                //var treasure = JSON.stringify(GetTokenTreasure(target));
                var oCharacter = getObj("character", target.get("represents"));
                oCharacter.get("gmnotes",function(note){
                    var start=note.indexOf("Loot Start");
                    var end = note.lastIndexOf("Loot End");
                    var treasure="";
                    if (start>=0) { //We have a starting tag
                        if (end>=0) { //We have a end tag
                            treasure=note.substring(start+10,end);
                        } else {
                            sendError("Error in DropLootBag. Missing Loot End tag in GM Notes");
                            return;
                        }
                    } else { //Use fallback
                        treasure = JSON.stringify(GetTokenTreasure(target));
                    }
                    //Trim it down to just { }
                    start=treasure.indexOf("{");
                    treasure = treasure.substr(start);
                    end = treasure.lastIndexOf("}")+1;
                    treasure = treasure.substr(0,end);
                    //Drop our bag
                    var bag = createObj("graphic",{
                        name: "Auto Death loot bag",
                        imgsrc: config.bagImage,
                        gmnotes: treasure,
                        pageid: gPage_id,
                        left: gLeft,
                        top: gTop,
                        rotation: 0,
                        width: width,
                        height: height,
                        layer: config.Layer
                    });
                });



            },//End DropLootBag
            kill = function(target) {
                if (isPlayer(target) && config.MarkOnlyNPC ) {
                    return;
                }
                target.set("status_"+config.bloodyIcon, false);
                if (isPlayer(target)) {
                    target.set("status_"+config.deadPlayerIcon, true);
                    return;
                }
                target.set(config.bar+"_value",0);
                target.set("status_"+config.deadIcon, true);
                if (config.AutoDropLoot)
                    DropLootBag(target);
                if (config.AutoXP) {
                    if (typeof(EASYEXPERIENCE) !== 'undefined') {
                        if (typeof(EASYEXPERIENCE.RecordXP)==='undefined') {
                            senderror("Easy Experience not installed");
                        } else {
                            var xp = GetXP(target);
                            EASYEXPERIENCE.RecordXP(xp);
                        }
                    }
                }
                sendChat("Auto Death","/w gm "+GetKillButtons(target));
            },//End kill
            RemoveToken = function(target) {
                target.remove();
            },//End Remove Token
            GetXP = function(target) {
                var oCharacter = getObj("character", target.get("represents"));
                var xp = findObjs({_type: "attribute", _characterid: oCharacter.id, name: config.xpAttr})[0];
                if ((typeof(xp) != "undefined") && isNPC(oCharacter)) {
                    return parseInt(xp.get("current"));
                } else {
                    return 0;
                }
            },
            GetKillButtons = function(target) {
                var oCharacter = getObj("character", target.get("represents"));
                var xp = findObjs({_type: "attribute", _characterid: oCharacter.id, name: config.xpAttr})[0];

                var buttons = "<br>";
                if ((typeof(xp) != "undefined") && isNPC(oCharacter)) {
                    var cmd = config.xpCommand.replace("[xp]",xp.get("current"));
                    buttons += MakeButton("XP",cmd,htmlDefaults.button.primary);
                }
                buttons += MakeButton("Loot","!"+config.commandName+" treasure "+target.get("_id"),htmlDefaults.button.primary);

                buttons += MakeButton("Remove","!"+config.commandName+
                    " remove "+target.get("_id")+" ?{Are you sure you want to remove "+target.get("name")+" from the map?|yes,1|no,0}"
                    ,htmlDefaults.button.danger);
                return buttons;
            },
            MakeButton = function(txt,cmd,style) {
                var title=txt;
                //Make our button text around 8-10 chars at most)
                txt = TrimString(txt,8,13);
                return templates.button({
                    command: cmd,
                    label: txt,
                    title: title,
                    templates: templates,
                    htmlDefaults: htmlDefaults,
                    css: style
                });
            },
            ShowConfig = function(style) {
                var header="Auto Dead v"+version;
                var body=[];
                //debug(_.defaults(style,htmlDefaults.menu.default));
                style=htmlDefaults.menu.default;
                for (var property in configMenu) {
                    if (!configMenu.hasOwnProperty(property)) {
                        continue;
                    }
                    var type = configMenu[property][0];
                    var label = configMenu[property][1];
                    var value = config[property];
                    var button;
                    if (type==="toggle") {
                        var notvalue = (value==true)?false:true;
                        button = templates.toggle({
                            templates: templates,
                            htmlDefaults: htmlDefaults,
                            on:value,
                            label: label,
                            command: "!"+config.commandName+" configsetbool "+property+" "+notvalue
                        });

                    } else if (type==="text") {
                        var cmd = "!"+config.commandName+" configset "+property+" ";
                        cmd += "?{Choose a new value for "+label+"|"+value+"}";
                        button = MakeButton(value,cmd,htmlDefaults.button.default);

                    } else if (type==="dropdown") {
                        var dropList = configMenu[property][2];
                        var cmd = "!"+config.commandName+" configset "+property+" ";
                        cmd += "?{Choose a new value for "+label;
                        for (var key in dropList) {
                            if (!dropList.hasOwnProperty(key)) {
                                continue;
                            }
                            var dropLabel = key;
                            var dropValue = dropList[key];
                            cmd+="|"+dropLabel+","+dropValue
                        }
                        cmd+="}";
                        button = MakeButton(value,cmd,htmlDefaults.button.default);
                    }
                    body.push(templates.menuline({
                        templates: templates,
                        htmlDefaults: htmlDefaults,
                        label: label,
                        button: button
                    }));
                }

                var html = templates.menu({
                    templates: templates,
                    htmlDefaults: htmlDefaults,
                    css: style,
                    header: header,
                    body: body
                });
                sendmsg(html);
            },//End ShowConfig
            SayLoot = function(player,target) {
                if (target.get("name")!=="Auto Death loot bag") {
                    senderr("Selected token is not a loot bag");
                    return;
                }
                var note = target.get("gmnotes");
                note = note.replace(/\\"/g, '"');
                note = note.replace(/\\"/g, '\'');
                var loot = JSON.parse(note);
                var body="";
                for (var item in loot) {
                    log(item);
                    if (typeof loot[item] === "number") {
                        if (loot[item] > 0)
                            body += item + ": " + loot[item] + "<br>";
                    } else {
                        body += item + ": " + loot[item] + "<br>";
                    }
                }
                body=ParseRolls(body);
                var msg = templates.card({
                    templates: templates,
                    htmlDefaults: htmlDefaults,
                    css: {},
                    header:"Loot",
                    subheader: player.get("name"),
                    body: body
                });
                if (config.AutoRemoveLoot) {
                    target.remove();
                }
                broadcast(msg);
            },
            DoOnSelected = function(selectedList,func) {
                if (typeof(selectedList) === 'undefined') {
                    sendError("No token selected.");
                    return;
                }
                var result={};
                _.each(selectedList,selObj => {
                    var selected = getObj('graphic',selObj._id);
                result[selObj._id] = func(selected);
            });
                return result;
            },//End DoOnSelected
            isNPC = function(oCharacter) {
                //If we are not type character try to get the character.
                if (oCharacter.get("_type")!=="character")
                    oCharacter = getObj("character", oCharacter.get("represents"));
                //Check first for an is_npc attribute
                var targets = findObjs({_type: "attribute", _characterid: oCharacter.id, name: "is_npc"});
                if (typeof(targets) !== 'undefined') {
                    return targets[0].get("current")=="1";
                }
                return oCharacter.get("controlledby").length>0;
            },
            isPlayer = function(oCharacter) {
                return !isNPC(oCharacter);
            },
        //trims to the first word after size is reached
        //if over max size, hard trim.
        //if trimed add ?
            TrimString=function (txt_org,size,max) {
                var txt=txt_org;
                var regex = new RegExp("^(.{"+size+"}[^\\s]*).*");
                txt = txt.replace(regex,"$1");

                if (txt.length>max)
                    txt=txt.substring(0,size);
                if (txt.length<txt_org.length)
                    txt+="?";

                return txt;
            },
            has = function(obj, key) {
                return key.split(".").every(function(x) {
                    if(typeof obj === "undefined" || obj === null || ! x in obj)
                        return false;
                    obj = obj[x];
                    return true;
                });
            },
            handleInput = function(msg_orig) {
                var msg = _.clone(msg_orig),
                    args, who;

                if (msg.type !== "api") {
                    return;
                }
                who=getObj('player',msg.playerid).get('_displayname');
                args = msg.content.split(/\s+/);
                switch(args[0]) {
                    case '!'+config.commandName:
                        switch(args[1]) {
                            case 'test':
                                //var test='{cp:"[[1d6]]",gp:"[[1d6+8]]",item1:"[[3t[test-table]]]"}';
                                sendmsg("---Doing test---");
                                //log(ParseRolls(test));
                                break;
                            case 'kill':
                                DoOnSelected(msg.selected,kill);
                                break;
                            case 'treasure':
                                if (typeof(args[2])==='undefined') {
                                    DoOnSelected(msg.selected,DropLootBag);
                                } else {
                                    var target = getObj('graphic',args[2]);
                                    if (typeof(target)==='undefined') {
                                        sendError("Can not create loot for token. ID "+args[2]+" not found.");
                                        return;
                                    }
                                    sendmsg("Drop loot");
                                    DropLootBag(target);
                                }
                                break;
                            case 'tokenurl':
                                var urls = _.map(msg.selected, selected => {
                                        var token = getObj('graphic', selected._id);
                                return token.get('imgsrc');
                        });
                        debug(urls);
                        break;
                    case 'remove':
                        if(args[3] !== "1") {
                            sendmsg("Remove canceled");
                            return;
                        }
                        if (typeof(args[2])==='undefined') {
                            DoOnSelected(msg.selected,RemoveToken);
                        } else {
                            var target = getObj('graphic',args[2]);
                            if (typeof(target)==='undefined') {
                                sendError("Can not remove token. ID "+args[2]+" not found.");
                                return;
                            }
                            RemoveToken(target);
                        }
                        break;
                    case 'configset':
                        var value=args.slice(3).join(" ");
                        config[args[2]]=value;
                        sendmsg("Set "+args[2]+" to "+value);
                        ShowConfig({});
                        UpdateState();
                        break;
                    case 'configsetbool':
                        var value=(args[3]=="true")?true:false;
                        config[args[2]]=value;
                        sendmsg("Set "+args[2]+" to "+value);
                        ShowConfig({});
                        UpdateState();
                        break;
                    case 'config':
                        ShowConfig({});
                        break;
                    case 'sayloot':
                        if (typeof(args[2])==='undefined' || typeof(args[3])==='undefined') {
                            //Send button to allow targeting
                            sendmsg(MakeButton("Do Loot",
                                "!"+config.commandName+" sayloot "+formatTarget("Player","token_id")+" "+formatTarget("Loot","token_id"),
                                htmlDefaults.button.primary
                            ));
                        } else {
                            var player = getObj('graphic',args[2]);
                            var target = getObj('graphic',args[3]);
                            if (target.get("name")!=="Auto Death loot bag") {
                                //Try swaping them
                                var temp=target;
                                target=player;
                                player=temp;
                                if (target.get("name")!=="Auto Death loot bag") {
                                    senderror("Invalid selections");
                                }
                            }
                            SayLoot(player,target);
                        }
                        break;
                }
                break;
            }
            },//handleInput
            formatTarget=function(prompt,property) {
                return ch('@')+ch('{')+'target|'+prompt+"|"+property+'}';
            },
            sendmsg = function(msg) {
                sendChat("Auto Death","/w gm "+msg);
            },//End sendmsg
            broadcast = function(msg) {
                sendChat("Auto Death",msg);
            },
            debug = function(msg) {
                if (typeof(msg)==='object') {
                    debugObj(msg);
                } else {
                    sendChat("Auto Death Debug","/w gm Debug: "+msg);
                }
            },//End debug
            debugObj = function(obj) {
                debug(JSON.stringify(obj));
            },//end debugObj
            sendError = function(error) {
                sendChat("Auto Death Error","/w gm Error: "+error);
            },//end sendError
            UpdateState = function() {
                state.AutoDead = config;
            },
            ParseRolls=function(str) {
                str=RollDice(str);
                var match=true;
                while(match) {
                    match = /\[\[(\d+)t\[(.*?)\]\]\]/.exec(str);
                    if (match)
                        str = RollTable(str);
                }
                return str;
            },
            RollDice=function(str) {
                var match = /\[\[(\d+)?d(\d+)([+\-\*Xx])?(\d+)?\]\]?/.exec(str);
                if (!match) {
                    //If it is not a dice roll, just return it.
                    return str;
                }
                var howMany = (typeof match[1] == 'undefined') ? 1 : parseInt(match[1]);
                var dieSize = parseInt(match[2]);
                var modifierType = (typeof match[3] == 'undefined') ? 0 : parseInt(match[3]);
                var modifierNumber = (typeof match[4] == 'undefined') ? 0 : parseInt(match[4]);
                var total=0;
                for (var i = 0; i < howMany; i++)
                    total += Math.floor(Math.random() * dieSize) + 1;
                if (modifierType=="-" || modifierType=="+")
                    str=str.replace(match[0],total+modifier);
                else if (modifierType=="*" || modifierType=="X" || modifierType=="x")
                    str=str.replace(match[0],total*modifier);
                return RollDice(str);
            },
            RollTable=function(str) {
                var match = /\[\[(\d+)t\[(.*?)\]\]\]/.exec(str);
                if (!match) {
                    return RollDice(str);
                }
                var howMany = (typeof match[1] == 'undefined') ? 1 : parseInt(match[1]);
                var tableName = match[2];
                var table = findObjs({
                    type:'rollabletable',
                    name: tableName
                })[0];
                var list =[];
                var total=0;
                _.each(findObjs({
                    type:'tableitem',
                    rollabletableid: table.id
                }), function(obj) {
                    var weight=obj.get('weight');
                    list.push({name: obj.get('name'),weight: weight});
                    total+=weight;
                });
                var result="";
                for (var j = 0; j < howMany; j++) {
                    //Select one item at random.
                    var roll = Math.floor(Math.random() * total) + 1;
                    var i = 0;
                    while (roll > 0)
                        roll -= list[i++].weight;
                    i--;
                    result+= list[i].name +" + "
                }
                result=result.substr(0,result.length-3);
                str = str.replace(match[0], result);
                return RollTable(RollDice(str));
            },
            BuildTemplates = function() {
                //Shamefuly ripped from Easy Experience
                templates.cssProperty =_.template(
                    '<%= name %>: <%= value %>;'
                );

                templates.style = _.template(
                    'style="<%= '+
                    '_.map(css,function(v,k) {'+
                    'return templates.cssProperty({'+
                    'htmlDefaults: htmlDefaults,'+
                    'templates: templates,'+
                    'name:k,'+
                    'value:v'+
                    '});'+
                    '}).join("")'+
                    ' %>"'
                );
                templates.button = _.template(
                    '<a <%= templates.style({'+
                    'htmlDefaults: htmlDefaults,'+
                    'templates: templates,'+
                    'css: _.defaults(css,htmlDefaults.button.default)'+
                    '}) %> title="<%=title%>" href="<%= command %>"><%= label||"Button" %></a>'
                );
                //End shameful rip
                templates.menu = _.template(
                    '<div <%= templates.style({'+
                    'htmlDefaults: htmlDefaults,'+
                    'templates: templates,'+
                    'css: _.defaults(css,htmlDefaults.menu.default)'+
                    '}) %>>'+
                    '<div <%= templates.style({'+
                    'htmlDefaults: htmlDefaults,'+
                    'templates: templates,'+
                    'css: htmlDefaults.menu.header'+
                    '}) %>>'+
                    '<%=header%>'+
                    '</div>'+
                    '<% _.each(body,function(line){%>'+
                    '<div <%= templates.style({'+
                    'htmlDefaults: htmlDefaults,'+
                    'templates: templates,'+
                    'css: htmlDefaults.menu.line'+
                    '}) %>><%=line%></div>'+
                    '<%});%>'+
                    '</div>'
                );
                templates.menuline = _.template(
                    '<div style="float:left"><%= label %></div>'+
                    '<div style="float:right">'+
                    '<%=button%>'+
                    '</div><br>'
                );
                templates.toggle = _.template(
                    '<%= templates.button({'+
                    'htmlDefaults:htmlDefaults,'+
                    'templates: templates,'+
                    'css: on == true ? htmlDefaults.button.success : htmlDefaults.button.default,'+
                    'label: on == true ? "On" : "Off",'+
                    'title: "toggle",'+
                    'command: command'+
                    '})%>'
                );
                templates.card = _.template(
                    '<div '+FormatStyle("htmlDefaults.card.main")+'>'+
                    '<div '+FormatStyle("htmlDefaults.card.header")+'>'+
                    '<%=header%>'+
                    '</div>'+
                    '<div '+FormatStyle("htmlDefaults.card.subheader")+'>'+
                    '<%=subheader%>'+
                    '</div>'+
                    '<div '+FormatStyle("htmlDefaults.card.body")+'>'+
                    '<%=body%>'+
                    '</div>'+
                    '</div>'
                );
            },
            FormatStyle=function(style) {
                return '<%= templates.style({'+
                    'htmlDefaults: htmlDefaults,'+
                    'templates: templates,'+
                    'css: '+style+
                    '}) %>';
            },
            CheckInstall = function() {
                log('-=> Auto Dead v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

                if(!state.AutoDead) {
                    state.AutoDead = config;
                } else {
                    config = state.AutoDead;
                }
                BuildTemplates();
            },//End CheckInstall
            RegisterEventHandlers = function() {
                on("change:graphic",HandleDead);
                on('chat:message', handleInput);
            };//End RegisterEventHandlers

        return {
            CheckInstall: CheckInstall,
            RegisterEventHandlers: RegisterEventHandlers
        };
    }());

on("ready",function(){
    'use strict';
    AUTODEAD.CheckInstall();
    AUTODEAD.RegisterEventHandlers();
});