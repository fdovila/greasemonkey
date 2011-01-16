// 2011-01-16
// Copyright (c) 2010, Christian Angermann
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name           Github - live markdown view
// @namespace      http://github.github.com
// @description    Make a horizontal view of text input and the result area
// @include        http://github.github.com/github-flavored-markdown/preview.html
// ==/UserScript==

// helper/utilities
var s =  function (selector) {
  return document.querySelectorAll(selector);
};

function init () {
  var container = s('.wikistyle')[0],
    childs = container.children,
    user_input = s('#user_input')[0],
    html_result = s('#result')[0];
      
  var e = document.createElement('div');
    container.appendChild(e);
    e.setAttribute('id', 'gm-editor');
    e.appendChild(childs[1]);
    e.appendChild(childs[2]);
    
  var l = document.createElement('div');
    l.setAttribute('id', 'gm-live');
    l.setAttribute('class', 'lU');
    l.appendChild(childs[2]);
    l.appendChild(childs[2]);
    container.appendChild(l);  
    
  var h = document.createElement('div');
    h.setAttribute('id', 'gm-html');
    h.appendChild(childs[2]);
    h.appendChild(childs[2]);
    container.appendChild(h);

  // added customized class  
  container.setAttribute('class', container.getAttribute('class') + ' line');
  
  var styles = '#main #content { width: auto }';
  styles += '#gm-editor { width: 46%; margin-right: 4%; float:left }';
  styles += '#user_input, #result { width: 100%; min-width: 580px }';
  styles += '#result { width: 96% }';
  styles += '#gm-html h3 { text-align: left; border-top: 4px solid #E0E0E0 !important; margin-top: 1.5em !important; padding-top: 0.5em !important }';
  styles += '#gm-html { width: 100% }';
  // oocss grid solution for clearfix 
  // @link https://github.com/stubbornella/oocss
  styles += '.line:after,.lU:after{clear:both;display:block;visibility:hidden;overflow:hidden;height:0 !important;line-height:0;font-size:xx-large;content:" x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x " }';
  styles += '.lU{display:table-cell;float:none;width:auto;*display:block;*zoom:1;_position:relative;_left:-3px;_margin-right:-3px }';
  GM_addStyle(styles);
  
  // events
  function dual_resize () {
    user_input.style.height = html_result.scrollHeight + 'px';
  }
  
  user_input.addEventListener('keyup', function(){
    dual_resize();
  }, false);
  
  dual_resize();
}

init();
