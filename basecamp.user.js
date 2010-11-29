// version 0.5 BETA!
// 2010-11-09
// Copyright (c) 2010, Christian Angermann
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name        Basecamp - Highlight todo in progress
// @namespace   http://basecamphd.com
// @description Highlighted todos are in progress and added todo id before description
// @include     https://*.basecamphq.com/projects/*/todo_lists/*
// @include     http://*.basecamphq.com/projects/*/todo_lists/*
// ==/UserScript==

// helper/utilities
var dom =  function (selector) {
  return document.querySelectorAll(selector);
};

var get_data = function () {
  return {
    key: localStorage.getItem('gm_key') || ''
  };
};

var AUTH_KEY = '';

var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(c){var a="";var k,h,f,j,g,e,d;var b=0;c=Base64._utf8_encode(c);while(b<c.length){k=c.charCodeAt(b++);h=c.charCodeAt(b++);f=c.charCodeAt(b++);j=k>>2;g=((k&3)<<4)|(h>>4);e=((h&15)<<2)|(f>>6);d=f&63;if(isNaN(h)){e=d=64}else{if(isNaN(f)){d=64}}a=a+this._keyStr.charAt(j)+this._keyStr.charAt(g)+this._keyStr.charAt(e)+this._keyStr.charAt(d)}return a},decode:function(c){var a="";var k,h,f;var j,g,e,d;var b=0;c=c.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(b<c.length){j=this._keyStr.indexOf(c.charAt(b++));g=this._keyStr.indexOf(c.charAt(b++));e=this._keyStr.indexOf(c.charAt(b++));d=this._keyStr.indexOf(c.charAt(b++));k=(j<<2)|(g>>4);h=((g&15)<<4)|(e>>2);f=((e&3)<<6)|d;a=a+String.fromCharCode(k);if(e!=64){a=a+String.fromCharCode(h)}if(d!=64){a=a+String.fromCharCode(f)}}a=Base64._utf8_decode(a);return a},_utf8_encode:function(b){b=b.replace(/\r\n/g,"\n");var a="";for(var e=0;e<b.length;e++){var d=b.charCodeAt(e);if(d<128){a+=String.fromCharCode(d)}else{if((d>127)&&(d<2048)){a+=String.fromCharCode((d>>6)|192);a+=String.fromCharCode((d&63)|128)}else{a+=String.fromCharCode((d>>12)|224);a+=String.fromCharCode(((d>>6)&63)|128);a+=String.fromCharCode((d&63)|128)}}}return a},_utf8_decode:function(a){var b="";var d=0;var e=c1=c2=0;while(d<a.length){e=a.charCodeAt(d);if(e<128){b+=String.fromCharCode(e);d++}else{if((e>191)&&(e<224)){c2=a.charCodeAt(d+1);b+=String.fromCharCode(((e&31)<<6)|(c2&63));d+=2}else{c2=a.charCodeAt(d+1);c3=a.charCodeAt(d+2);b+=String.fromCharCode(((e&15)<<12)|((c2&63)<<6)|(c3&63));d+=3}}}return b}};

var elems = dom('.items_wrapper > div > div[id^=item_]');

var init = function () {
  for (var i = elems.length-1; i >= 0; i--) {
    var elem = elems[i],
      string = elem.innerHTML,
      box = document.createElement('div'),
      id = elem.getAttribute('record'),
      parent = elem.parentNode,
      desc_elem = dom('#item_' + id + ' [id^=item_wrap_]')[0];
      
    var old_box = elem.querySelector('.gm_box');
    if (old_box) {
      elem.removeChild(old_box);
    }
    
    box.setAttribute('class', 'gm_box');
    desc_elem.parentNode.parentNode.parentNode.appendChild(box);

    // show todo id
    box.innerHTML = '<span class="gm_task"><strong>Task #</strong>' + id + '</span><span class="gm_progress"><span></span><strong>Spent:/Estimated:</strong></span>';
    
    (function (elem, item) {
      var id = elem.getAttribute('record'),
      estimate_time = item.innerHTML.split(/.*\(([\.:\d].*)h\).*/g)[1];
      if (estimate_time) {
        var loc = window.location;
        elem.addEventListener('mouseover', function () { 
          var url = loc.protocol + '/todo_items/' + id + '/time_entries.xml';  
         
          // if (localStorage.getItem('spent_time_' + id) == null) {
            http_request(url, function (xhr) {
              var hours = xhr.responseXML.getElementsByTagName('hours'),
                spent_time = 0;
              
              for (var i = hours.length - 1; i >= 0; i--) {
                var hour = hours[i];
                spent_time += parseFloat(hour.firstChild.nodeValue, 10);
              }
              localStorage.setItem('spent_time_' + id, spent_time);
              localStorage.setItem('estimate_time_' + id, parseFloat(estimate_time, 10));
              update_progress_bar(id);
            });
          // } else {
          //   update_progress_bar(id);
          // }
        }, false);   
      }
    })(elem, desc_elem);

    
    // highlighting
    var description = desc_elem.innerHTML;
    
    if (/story/i.test(description)) {
      elem.setAttribute('class', elem.getAttribute('class') + ' gm_user_story');
    }
    
    if (/in progress/.test(description)) {
      if (/204/.test(desc_elem.style.backgroundColor)) {
        desc_elem.setAttribute('data-gm-owner', 'true');
      } else {
        desc_elem.setAttribute('data-gm-owner', 'false');
      }
    }
      

  }
};

var roundNumber =  function (num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
};

var update_progress_bar = function (id) {
  var spent_time = localStorage.getItem('spent_time_' + id),
    estimate_time = localStorage.getItem('estimate_time_' + id),
    percent = spent_time / estimate_time * 100,
    left = percent,
    right = 100 - percent,
    green = '#99BF85;',
    green_dark = '#317D31;',
    blue = '#8CB2D4;',
    red = '#C83131;',
    orange = '#BF783D;',
    yellow = '#C8C831;',
    left_color = percent < 50 ? green : green_dark,
    right_color = percent < 50 ? blue : orange,
    factor = 2;
    
  
  if (percent > 100) {
    left = 100 / percent * 100;
    right = 100 - left ;
    left_color = yellow;
    right_color = red;
  }
  
  GM_addStyle('#item_' + id + ' .gm_progress span{border-left-width:' + (left*factor) + 'px;border-left-color:' + left_color + 'border-right-width:' + (right*factor) + 'px;border-right-color:' + right_color + '}');
  var time = dom('#item_' + id + ' .gm_progress strong')[0];
  time.innerHTML = 'Spent: ' + roundNumber(spent_time, 2) + 'h / Estimated: ' + roundNumber(estimate_time, 2) + 'h';
};

var http_request = function (url, callback) {
  var data = get_data();

  if(AUTH_KEY == ''){
    AUTH_KEY = Base64.encode(data.key + ":x");
  }
  
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    headers: {
      'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey/0.3',
      'Accept': 'application/atom+xml,application/xml,text/xml',
      "Authorization": "Basic " + AUTH_KEY
    },
    onload: function (response) {
      if (!response.responseXML) {
        response.responseXML = new DOMParser()
          .parseFromString(response.responseText, "text/xml");
      }
      callback.call(this, response);
    }
  });
};


var styles = '.gm_box{position:absolute;display:none;background-color:rgba(255,255,255,.9);border:1px solid #AAA;left:-3px;top:4px;padding:18px 0 0;width:100%;z-zndex:0;-moz-border-radius:3px;-webkit-border-radius:3px;-moz-box-shadow:0 2px 5px rgba(0,0,0,.5);-webkit-box-shadow:0 2px 5px rgba(0,0,0,.5);z-index:-1;}';
styles += '[data-gm-owner]{position:relative;z-index:0;padding:0 3px 1px;background-image:-moz-linear-gradient(left,#d3e9d2 90%,#eee);}';
styles += '.gm_box .gm_task{font-size:10px;color:#666;marginLeft:5px;padding:2px 4px 1px;}';
styles += '[data-gm-owner=true]{background-color:#A8CFA8!important;color:#333;background-image:-moz-linear-gradient(left,#A8CFA8 90%,#eee)!important;}';
styles += '[data-gm-owner=false]{background-color:#D2E9D2;background-image:-moz-linear-gradient(left,#D2E9D2 90%,#eee)!important;}';
styles += '.gm_user_story{background-color: #EDF3FE !important;border-top: 1px solid #CCC;margin-top: -4px;padding-top: 3px;}';
styles += '.item_wrapper{z-index:0;}';
styles += '.item_wrapper>div>.content{border-bottom: solid 1px #eee; padding:4px 0}';
styles += '.item_wrapper>div>.content:hover{border-bottom: solid 1px transparent;}';
styles += '.item_wrapper>div>.content>span{z-index:0}';
styles += '.gm_progress{display: inline-block;height: 13px;overflow: hidden;position:relative;margin-bottom: -2px;}';
styles += '.gm_progress span{border:0 solid transparent;}';
styles += '.gm_progress strong{color: #FFF;display: block;font-size: 9px;font-weight: normal;height: auto;line-height: 100%;position: absolute;text-align: center;width: 200px;top:2px;text-shadow:0 0 1px #000;}';
styles += '.item_wrapper:hover{z-index:1;}';
styles += '[id^=item_]:hover .gm_box{display:block;}';
styles += 'body.todos div.list a.pill_todo_item,body.todos div.list a.pill_todo_item span.content{background-image:none;}';
styles += 'table.layout td.left{width:85%}';
GM_addStyle(styles);

// --------------------------
var panel = document.createElement('div');
panel.id = 'gm_panel';
panel.innerHTML = '' +
  '<div class="form">' + 
    '<h2>greasmonkey helper</h2>' + 
    '<div>' + 
      '<div>' + 
        '<label for="gm_key">API token</label>' +
        '<input id="gm_key" value="" />' +
      '</div>' + 
    '</div>' +   
    '<div class="action">' + 
      '<button type="submit">submit</button>' +
    '</div>'
  '</div>'
;

document.body.appendChild(panel);
var style =  '#gm_panel{-moz-box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2) inset, -1px -1px 0 rgba(200,200,200,.2) inset;-moz-border-radius: 5px;-webkit-border-radius: 5px;border-radius: 5px;color:#fff;background-color: rgba(200, 200, 200, 0.4);font-size: 10px;padding: 3px 1em;position: absolute;right: 20%;text-align: left;top: 4px;}';
style += '#gm_panel label{display: inline-block;padding-right: 10px;}';
style += '#gm_panel input{padding:0}';
style += '#gm_panel button{}';
style += '#gm_panel h2{margin-top: 0;}';
style += '#gm_panel .form div{margin-bottom:3px}';
style += '#gm_panel .form span{color: rgba(255, 255, 255, 0.5);display: block; margin-top:3px}';
style += '#gm_panel .action{padding:0;border:none;margin-left:1em;float: right;}';
GM_addStyle(style);

var key_elem = document.querySelector('#gm_key');
if (localStorage.getItem(key_elem.id)) {
  key_elem.value = localStorage.getItem(key_elem.id);
}

dom('#gm_panel button')[0].addEventListener('click', function(){
  localStorage.setItem(key_elem.id, key_elem.value);
  window.location = window.location.href;
}, false);

init();