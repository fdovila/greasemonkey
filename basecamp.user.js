// version 0.6 BETA!
// 2011-02-06
// Copyright (c) 2010, Christian Angermann
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name        Basecamp++
// @namespace   http://basecamphd.com
// @description Gives basecamp more functionality
// @include     http://*.basecamphq.com/projects/*
// @include     https://*.basecamphq.com/projects/*
// @include     https://*.basecamphq.com/projects/*/todo_lists/*
// @include     http://*.basecamphq.com/projects/*/todo_lists/*
// ==/UserScript==

// helper/utilities
var dom = function (selector) {
  return document.querySelectorAll(selector);
};

var get_data = function () {
  return {
    key: localStorage.getItem('gm_key') || ''
  };
};

var AUTH_KEY = '';

var Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(c){var a="";var k,h,f,j,g,e,d;var b=0;c=Base64._utf8_encode(c);while(b<c.length){k=c.charCodeAt(b++);h=c.charCodeAt(b++);f=c.charCodeAt(b++);j=k>>2;g=((k&3)<<4)|(h>>4);e=((h&15)<<2)|(f>>6);d=f&63;if(isNaN(h)){e=d=64}else{if(isNaN(f)){d=64}}a=a+this._keyStr.charAt(j)+this._keyStr.charAt(g)+this._keyStr.charAt(e)+this._keyStr.charAt(d)}return a},decode:function(c){var a="";var k,h,f;var j,g,e,d;var b=0;c=c.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(b<c.length){j=this._keyStr.indexOf(c.charAt(b++));g=this._keyStr.indexOf(c.charAt(b++));e=this._keyStr.indexOf(c.charAt(b++));d=this._keyStr.indexOf(c.charAt(b++));k=(j<<2)|(g>>4);h=((g&15)<<4)|(e>>2);f=((e&3)<<6)|d;a=a+String.fromCharCode(k);if(e!=64){a=a+String.fromCharCode(h)}if(d!=64){a=a+String.fromCharCode(f)}}a=Base64._utf8_decode(a);return a},_utf8_encode:function(b){b=b.replace(/\r\n/g,"\n");var a="";for(var e=0;e<b.length;e++){var d=b.charCodeAt(e);if(d<128){a+=String.fromCharCode(d)}else{if((d>127)&&(d<2048)){a+=String.fromCharCode((d>>6)|192);a+=String.fromCharCode((d&63)|128)}else{a+=String.fromCharCode((d>>12)|224);a+=String.fromCharCode(((d>>6)&63)|128);a+=String.fromCharCode((d&63)|128)}}}return a},_utf8_decode:function(a){var b="";var d=0;var e=c1=c2=0;while(d<a.length){e=a.charCodeAt(d);if(e<128){b+=String.fromCharCode(e);d++}else{if((e>191)&&(e<224)){c2=a.charCodeAt(d+1);b+=String.fromCharCode(((e&31)<<6)|(c2&63));d+=2}else{c2=a.charCodeAt(d+1);c3=a.charCodeAt(d+2);b+=String.fromCharCode(((e&15)<<12)|((c2&63)<<6)|(c3&63));d+=3}}}return b}};

var elems = dom('.items_wrapper > div > div[id^=item_]');

function show_points_count_per_list() {
  var lists = dom('.list');
  
  for (var d = lists.length-1; d >= 0; d--) {
    var list = lists[d],
      container = document.createElement('span');
      container.setAttribute('class', 'gm_count');
      var total_match = list.innerHTML.match(/★/g),
        done_match = list.querySelector('.completed_items_todo_list'), 
        total = total_match && total_match.length || 0, 
        done = done_match.length > 0 && done_match.innerHTML.match(/★/g).length || 0;

      container.innerHTML = 'Points <span class="total">Total: ' + (total-done) + '</span> / <span class="done"> Done: ' + done + '</span>';
      list.querySelector('h2').appendChild(container);      

    // styles
    var style = '';
    style += 'h2 .gm_count { font-size: 12px; background-color:#efefef; float:right; font-size:12px; font-weight:normal; padding: 2px 6px; }';
    style += 'h2 .gm_count .total   { font-weight:bold; }';
    style += 'h2 .gm_count .done { font-weight:bold; color:#1F9E1F; }';
    GM_addStyle(style);
  }    
}

function create_base() {
  for (var d = elems.length-1; d >= 0; d--) {
    var elem = elems[d],
      string = elem.innerHTML,
      box = document.createElement('div'),
      id = elem.getAttribute('record'),
      parent = elem.parentNode,
      desc_elem = dom('#item_' + id + ' [id^=item_wrap_]')[0],
      content_elem = dom('#item_' + id + ' .content')[0],
      has_comments = dom('#item_' + id+ ' .comments .empty').length == 0;
      
    var old_box = elem.querySelector('.gm_box');
    
    if (old_box) {
      elem.removeChild(old_box);
    }
    
    box.setAttribute('class', 'gm_box');
    desc_elem.parentNode.parentNode.parentNode.parentNode.appendChild(box);
    
    // show todo id
    box.innerHTML = '<div class="gm_task">ID #' + id + '</div>';
      
  
    (function (id) {
      print_todo_with_comments(id);
      show_comments_by_task(id);
    })(id);

    
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

function http_request(url, callback) {
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

var styles = '';
styles += 'body.todos div.item_wrapper, .left .Left .col { background-color:#fafafa; }';
styles += '.gm_hidden { display:none; }';

styles += '.gm_box{position:absolute; top:-27px; left:0; display:none;background-color: #FFF;color: #aaa; border:1px solid #ccc; border-bottom-color: #fff; font-size: 10px; padding: 5px 5px 5px 106px;}';
styles += '.gm_box *{ display:inline-block; margin-right: 5px; left:0; }';

styles += '.item_wrapper{z-index:0; border-bottom:1px solid #fcfcfc; border-top:1px solid #ccc; margin-top:-4px; padding-top: 3px; }';
styles += '.item_wrapper>div>.content{ padding:4px 0; }';
styles += '.item_wrapper>div>.content>span{z-index:0}';
styles += '.item_wrapper .drag_button { left:6px; position: absolute; top: 36px }';
styles += '.item_wrapper .controls { left:54px!important; top:-24px; z-index:11; display:none; }';
styles += '.item_wrapper .content { margin-left:0!important; }';

styles += '.item_wrapper .nubbin { left:24px; top:-24px; z-index: 11; }';
styles += '.item_wrapper .nubbin div { background-image:none!important; }';
styles += '.item_wrapper:hover { z-index:1; background-color:#fff!important; border-color: #ccc; }';
styles += '.item_wrapper:hover .controls, .item_wrapper:hover .nubbin { display:block; }';

styles += '[id^=item_]:hover .gm_box{display:block;}';
styles += 'body.todos div.list a.pill_todo_item,body.todos div.list a.pill_todo_item span.content{background-image:none;}';
styles += 'table.layout td.left{width:85%}';
styles += '.gm_print{cursor:pointer;text-decoration: underline;}';
styles += '.gm_print:hover{text-decoration: none;}';

GM_addStyle(styles);

var PROTOCOL = window.location.protocol;

function show_comments_by_task(id) {
  var url = PROTOCOL + '/todo_items/' + id + '/comments.xml',
    has_comments = !document.querySelector('#item_' + id + ' .comments .empty'),
    content_elem = document.querySelector('#item_' + id + ' .content');
  
  if (has_comments) {
    var comments_container, comment_html = '';
    http_request(url, function (xhr) {
      var comments = xhr.responseXML.getElementsByTagName('comment');
      comments_container = document.createElement('div');
      comments_container.setAttribute('class', 'gm_comments');
      content_elem.appendChild(comments_container);
      
      for (var i = 0, len = comments.length; i < len; i++) {
        comment_html += '<li>' + 
          '<h5>' + comments[i].getElementsByTagName('author-name')[0].firstChild.nodeValue + '</h5>' + 
          '<p>' + comments[i].getElementsByTagName('body')[0].firstChild.nodeValue + '</p>' + 
        '</li>';
      }
      comments_container.innerHTML = '<h3>Comments</h3><ul>' + comment_html + '</ul>';
      // styles
      var style = '';
      style += '.item_wrapper .gm_comments { display:none; font-size:11px; color:#666; }';
      style += '.item_wrapper .gm_comments li:nth-child(odd) { background-color:#eee; }';
      style += '.item_wrapper .gm_comments li { padding: 2px 4px; }';
      style += '.item_wrapper .gm_comments ul { margin: 8px 0; }';
      style += '.item_wrapper:hover .gm_comments { display:block; }';
      GM_addStyle(style);
    });
  }
}

function print_todo_with_comments(id) {
  var style = '',
    button = document.createElement('div'),
    url = PROTOCOL + '/todo_items/' + id + '/comments.xml';
    
  button.setAttribute('class', 'gm_print');
  button.innerHTML = 'Print';
  document.querySelector('#item_' + id + ' .gm_box').appendChild(button);
  
  if (button) {
    button.addEventListener('click', function () { 
      var text = document.querySelector('#item_wrap_' + id).innerHTML, 
      comment_html = '';
      
      http_request(url, function (xhr) {
        var comments = xhr.responseXML.getElementsByTagName('body');

        for (var i = 0, len = comments.length; i < len; i++) {
          comment_html += comments[i].firstChild.nodeValue;
          if (i == len - 1) {
            var container = document.createElement('div'),
            body = document.querySelector('body');
                      
            container.setAttribute('id', 'gm_print_container_' + id);
            container.style.display = 'block';
            container.innerHTML = '<div class="story">' + text + '</div><div class="list">' + comment_html + '</div></div>';
            body.appendChild(container);
            body.setAttribute('class', body.getAttribute('class') + ' gm_print_process');
            window.print();
            body.removeChild(container)
            body.setAttribute('class', body.getAttribute('class').replace('gm_print', ''));
          }
        }
      });
    }, false);
  }
  // styles
  style += 'body.gm_print_process > * { display:none; }';
  style += '[id^=gm_print_container] { max-width:21cm; max-height:29.7cm; background-color:#FFF; padding:2.5cm 3cm; text-align:left; }';
  style += '[id^=gm_print_container] .story { font-size:18px; }';
  style += '[id^=gm_print_container] .list { font-size:14px; padding:5mm 1cm; }';
  style += '[id^=gm_print_container] .list > div { display:list-item; font-size:14px; }';
  GM_addStyle(style);
}

function settings_panel() {
  var panel = document.createElement('li');
  
  panel.setAttribute('id', 'gm_settings');
  panel.innerHTML = '' +
  '<a href="#gm_settings">Basecamp++</a>' + 
  '<div class="gm_hidden">' + 
    '<h2>Settings</h2>' + 
    '<div class="inputs">' + 
      '<div>' + 
        '<label for="gm_key">API token</label>' +
        '<input id="gm_key" value="" />' +
        '<p>Is necessary to interact with the project data.</p>' + 
      '</div>' + 
    '</div>' +
    '<div class="buttons">' + 
      '<button type="submit">submit</button>' +
    '</div>' +
  '</div>';
  
  document.querySelector('#MainTabs').insertBefore(panel, document.querySelector('#MainTabs li:first-child'));
  
  var key_elem = document.querySelector('#gm_key'),
    is_visible = false
    panel = dom('#gm_settings > div')[0];
  if (localStorage.getItem(key_elem.id)) {
    key_elem.value = localStorage.getItem(key_elem.id);
  }
  
  dom('#gm_settings button')[0].addEventListener('click', function () {
    localStorage.setItem(key_elem.id, key_elem.value);
    window.location = window.location.href;
  }, false);
  
  dom('#gm_settings > a')[0].addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopped = true;
    
    if (is_visible) {
      panel.setAttribute('class', 'gm_hidden');
    } else {
      panel.removeAttribute('class', 'gm_hidden');
    }
    is_visible = !is_visible;
  }, false);
  
  // styles
  var style = '';
  style += '#gm_settings { float:right; }';
  style += '#gm_settings > div { background-color:#FFF; border:1px solid #CCC; border-top:none; color: #666; font-size: 10px; padding: 3px 1em; position: absolute; right:57px; text-align:left; top: 92px; z-index: 1; -moz-box-shadow:3px 3px 4px #BBB; -webkit-box-shadow:3px 3px 4px #BBB; }';
  style += '#gm_settings label { display:inline-block; padding-right:10px; }';
  style += '#gm_settings input { padding:0 }';
  style += '#gm_settings h2 { margin-top: 0; }';
  style += '#gm_settings > div div{margin-bottom:3px}';
  style += '#gm_settings p { font-size:10px; }';
  style += '#gm_settings .action{padding:0;border:none;margin-left:1em;float: right;}';
  GM_addStyle(style);
}
settings_panel();



// wrapped link elements for links in time entry comments 
function link_wrapper () {
  if (/time_entries/.test(window.location.pathname)) {
    for (var elems = document.querySelectorAll('.TimeTrack .entry .desc'), d = elems.length - 1; d >= 0; d--) {
      var elem = elems[d];
      elem.innerHTML = elem.innerHTML.replace(/(https:\/\/[\d\S-_.\/]+)/i, '<a class="external" href="$1">$1</a>');
    }
  }
}

function init() {
  create_base();
  show_points_count_per_list();
  link_wrapper();
}

init();
