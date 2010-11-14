// version 0.5 BETA!
// 2010-11-09
// Copyright (c) 2010, Christian Angermann
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name   Basecamp - Highlight todo in progress
// @namespace  http://basecamphd.com
// @descriptionHighlighted todos are in progress and added todo id before description
// @includehttps://*.basecamphq.com/projects/*/todo_lists/*
// @includehttp://*.basecamphq.com/projects/*/todo_lists/*
// ==/UserScript==

// helper/utilities
var dom =  function (selector) {
  return document.querySelectorAll(selector);
};
var get_data = function () {
  return {
    prefix: localStorage.getItem('gm_indicator') || '',
    key: localStorage.getItem('gm_key') || ''
  };
};


var elems = dom('.items_wrapper > div > div[id^=item_]');
var init = function () {
console.log('init')
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
         
          if (localStorage.getItem('spent_time_' + id) == null) {
            get_request(url, id, function (xhr) {
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
          } else {
            update_progress_bar(id);
          }
        }, false);   
      }
    })(elem, desc_elem);

    
    // highlighting
    var description = desc_elem.innerHTML;
    
    if (/story/i.test(description)) {
      alert(description)
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


var update_progress_bar = function (id) {
  var spent_time = localStorage.getItem('spent_time_' + id),
    estimate_time = localStorage.getItem('estimate_time_' + id),
    percent = spent_time / estimate_time * 100,
    left = percent,
    right = 100 - percent,
    green = '#99BF85;',
    green_dark = '#317D31;'
    blue = '#8CB2D4;',
    red = '#C83131;',
    orange = '#BF783D;',
    yellow = '#C8C831;',
    left_color = percent < 50 ? green : green_dark;
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
  time.innerHTML = 'Spent: ' + spent_time + 'h / Estimated: ' + estimate_time + 'h';
}


var get_request = function (url, id, callback) {
  var data = {} ;
  data.key = '';
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    data: 'username=' + data.key + '&password=x',
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/xml"
    },
    onload: function (response) {
      if (!response.responseXML) {
        response.responseXML = new DOMParser()
          .parseFromString(response.responseText, "text/xml");
      }
/*
      GM_log([
        response.status,
        response.statusText,
        response.readyState,
        response.responseHeaders,
        response.responseText,
        response.finalUrl,
        response.responseXML
      ].join("\n"));
*/

      callback.call(this, response);
    }
  });
};




var styles = '.gm_box{position:absolute;display:none;background-color:rgba(255,255,255,.9);border:1px solid #AAA;left:-3px;top:4px;padding:18px 0 0;width:100%;z-zndex:0;-moz-border-radius:3px;-webkit-border-radius:3px;-moz-box-shadow:0 2px 5px rgba(0,0,0,.5);-webkit-box-shadow:0 2px 5px rgba(0,0,0,.5);z-index:-1;}';
styles += '[data-gm-owner]{position:relative;z-index:0;padding:0 3px 1px;background-image:-moz-linear-gradient(left,#d3e9d2 90%,#eee);}';
styles += '.gm_box .gm_task{font-size:10px;color:#666;marginLeft:5px;padding:2px 4px 1px;}';
styles += '[data-gm-owner=true]{background-color:#A8CFA8!important;color:#333;background-image:-moz-linear-gradient(left,#A8CFA8 90%,#eee)!important;}';
styles += '[data-gm-owner=false]{background-color:#D2E9D2;background-image:-moz-linear-gradient(left,#D2E9D2 90%,#eee)!important;}';
styles += '.gm_user_story{background-color: #F6F6F6 !important;border-top: 1px solid #CCC;margin-top: -4px;padding-top: 3px;}';
styles += '.item_wrapper{z-index:0;}';
styles += '.item_wrapper>div>.content{border-bottom: solid 1px #eee; padding:4px 0}';
styles += '.item_wrapper>div>.content:hover{border-bottom: solid 1px transparent;}';
styles += '.item_wrapper>div>.content>span{z-index:0}';
styles += '.gm_progress{display: inline-block;height: 13px;overflow: hidden;position:relative;margin-bottom: -2px;}';
styles += '.gm_progress span{border:0 solid transparent;}';
styles += '.gm_progress strong{color: #FFF;display: block;font-size: 9px;font-weight: normal;height: auto;line-height: 100%;position: absolute;text-align: center;width: 200px;top:2px;text-shadow:0 0 1px #000;}'
styles += '.item_wrapper:hover{z-index:1;}';
styles += '[id^=item_]:hover .gm_box{display:block;}';
styles += 'body.todos div.list a.pill_todo_item,body.todos div.list a.pill_todo_item span.content{background-image:none;}';
styles += 'table.layout td.left{width:85%}';


GM_addStyle(styles);
// "hello {a:3.5, s:3} diu".replace(/(\{.*\})/, '$1')

// --------------------------
var panel = document.createElement('div');
panel.id = 'gm_panel';
panel.innerHTML = '' +
  '<div class="form">' + 
    '<div>' + 
      '<label for="gm_key">API token</label>' +
      '<input id="gm_key" />' +
    '</div>' + 
    '<div>' + 
      '<label for="gm_story">Story key</label>' +
      '<input id="gm_story" />' +
      '<span>Key string to highlight the list entry</span>' +
    '</div>' +
  '</div>' +   
  '<div class="action">' + 
    '<button type="submit">submit</button>'
  '</div>'
;
//document.body.appendChild(panel);
var style =  '#gm_panel{-moz-box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2) inset, -1px -1px 0 rgba(200,200,200,.2) inset;-moz-border-radius: 5px;-webkit-border-radius: 5px;border-radius: 5px;color:#fff;background-color: rgba(200, 200, 200, 0.4);font-size: 10px;padding: 3px 1em;position: absolute;right: 20%;text-align: left;top: 4px;}';
style += '#gm_panel label{display: inline-block;padding-right: 10px;}';
style += '#gm_panel input{padding:0}';
style += '#gm_panel button{}';
style += '#gm_panel .form{float: left;}';
style += '#gm_panel .form div{margin-bottom:3px}';
style += '#gm_panel .form span{color: rgba(255, 255, 255, 0.5);display: block; margin-top:3px}';
style += '#gm_panel .action{padding:0;border:none;margin-left:1em;float: right;}';
//GM_addStyle(style);

//dom('#gm_panel button')[0].addEventListener('click', function(){
  
//}, false);


init();