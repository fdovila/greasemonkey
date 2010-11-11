// version 0.4 BETA!
// 2010-11-09
// Copyright (c) 2010, Christian Angermann
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name           Basecamp - Highlight todo in progress
// @namespace      http://basecamphd.com
// @description    Highlighted todos are in progress and added todo id before description
// @include        https://*.basecamphq.com/projects/*/todo_lists/*
// @include        http://*.basecamphq.com/projects/*/todo_lists/*
// ==/UserScript==

// helper/utilities
var dom =  function (selector) {
  return document.querySelectorAll(selector);
};

var elems = dom('.items_wrapper .item span[id^=item_wrap]');

for (var i = elems.length-1; i >= 0; i--) {
  var elem = elems[i],
    string = elem.innerHTML,
    box = document.createElement('div'),
    link = document.createElement('a'),
    id = elem.id,
    parent = elem.parentNode;

  box.setAttribute('class', 'gm_box');
  parent.appendChild(box);

  // show todo id
  box.innerHTML = '<span class="gm_task"><strong>Task #</strong>' + id.substr(id.search(/[0-9]/), id.length) + '</span>' + 
    '<span class="gm_progress"><span></span></span>';

  // highlighting
  if (/in progress/.test(string)) {
    if (/204/.test(elem.style.backgroundColor)) {
      elem.setAttribute('data-gm-owner', 'true');
    } else {
      elem.setAttribute('data-gm-owner', 'false');
    }
  }
}

var styles = '.gm_box{position:absolute;display:none;background-color:rgba(255,255,255,.9);border:1px solid #AAA;left:-3px;top:-3px;padding:18px 0 0;width:100%;z-zndex:-1;-moz-border-radius:3px;-webkit-border-radius:3px;-moz-box-shadow:0 2px 5px rgba(0,0,0,.5);-webkit-box-shadow:0 2px 5px rgba(0,0,0,.5);z-index:-1;}';
styles += '[data-gm-owner]{position:relative;z-index:0;padding:0 .5em;background-image:-moz-linear-gradient(left,#d3e9d2 90%,#eee);}';
styles += '.gm_box .gm_task{font-size:10px;color:#666;marginLeft:5px;padding:2px 4px 1px;}';
styles += '[data-gm-owner=true]{background-color:#A8CFA8!important;color:#333;background-image:-moz-linear-gradient(left,#A8CFA8 90%,#eee)!important;}';
styles += '[data-gm-owner=false]{background-color:#D2E9D2;background-image:-moz-linear-gradient(left,#FFF 90%,#eee)!important;}';
styles += '.item_wrapper{z-index:0;}';
styles += '.item_wrapper>div>.content{border-bottom: solid 1px #eee; padding:4px 0}';
styles += '.item_wrapper>div>.content>span{z-index:0}';
styles += '.gm_progress{border: medium none #EEE;display: inline-block;height: 2px;line-height: 0;overflow: hidden;}';
styles += '.gm_progress span{border-left:30px solid #090; border-right: 70px solid #fc0}';
styles += '.item_wrapper:hover{z-index:1;}';
styles += '[id^=item_]:hover .gm_box{display:block;}';
styles += 'table.layout td.left{width:85%}';
styles += 'body.todos div.list a.pill_todo_item span.content{background-image:none;}';

GM_addStyle(styles);
// "hello {a:3.5, s:3} diu".replace(/(\{.*\})/, '$1')