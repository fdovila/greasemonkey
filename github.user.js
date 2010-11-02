// version 0.1 BETA!
// 2010-11-02
// Copyright (c) 2010, Christian Angermann
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name           Github - Create dependence form commit to Basecamp todo 
// @namespace      http://*.github.com
// @description    Adds when task number is available, a link to the task in http://basecamphd.com Todo list added to commit message.
// @include        https://*.github.com/*/*/commits/*
// @include        https://*.github.com/*/*/commit/*
// @include        https://*.github.com/*
// @include        http://*.github.com/*
// ==/UserScript==

var commits = document.getElementById('commit');
var $s = document.querySelectorAll;

var css = function (properties, elem) {
   if (arguments.length > 2)
    return;
    
  for (var prop in properties) {
    elem.style[prop] = properties[prop];
  }
};

var messages = $s('#commit .message a'),
  prefix = 'qc-',
  key = '\\d{8}',
  suffix = '',
  pattern = new RegExp(prefix + key + suffix, 'ig');

for (var i = messages.length-1; i >= 0; i--) {
  var elem = messages[i],
    txt = elem.innerHTML,
    basecampUrl = 'https://ubilabs.basecamphq.com/todo_items/';

  if (txt.match(pattern)) {

    var id = txt.match(pattern)[0];

    elem.parentNode.innerHTML = '<a target="_blank" style="color:#4183C4;" href="' + (basecampUrl + id.match(/\d{8}/)[0]) + '">' + id + '</a>' +
      '<a href="' + elem.href + '">' + txt.replace(pattern, '') + '</a>';
  }
}
var form = document.createElement('div');
form.id = 'basecamp';
form.innerHTML = '<div class="content">' +
    '<div class="gm-basecamp">' +
      '<h3>Basecamp todos</h3>' +
      '<div>'+
        '<label for="gm-prefix">Suffix</label>' + 
        '<input id="gm-prefix" value="" />' + 
      '</div>'+
      '<div>'+
        '<label for="gm-suffix">Prefix</label>' + 
        '<input id="gm-suffix" value="" />' + 
      '</div>'+
    '</div>' + 
    '<div class="gm-github">' +
      '<h3>github</h3>' +
      '<div>'+
        '<label for="gm-account">Account</label>' + 
        '<input id="gm-account" value="" />' +
      '</div>'+
      '<div>'+
        '<label for="gm-repo">Repository</label>' + 
        '<input id="gm-repo" value="" />' +
      '</div>'+
    '</div>' +
    '<button type="sumit">Save</button>'+
  '</div>' + 
  '<div class="toggle">Settings '+
    '<span class="open">open</span>'+
    '<span class="close" style="display:none;">close</span>'+
  '</div>';
document.body.appendChild(form);

var content = $s('#basecamp .content')[0];
var inactive = '-112px';
css({
  position: 'absolute',
  right: '1em',
  top: 0
}, form);

css({
  backgroundColor: '#eee',
  border: '1px solid #CCCCCC',
  marginLeft: '-120px',
  padding: '10px 10px',
  width: '240px',
  MozBorderRadius: '0 0 0px 10px'
}, content);


var toggle = $s('#basecamp .toggle')[0];
css({
  backgroundColor: '#EEE',
  border: '1px solid #CCC',
  borderTop: 'medium none',
  marginTop: '-1px',
  padding: '1px 8px',
  MozBorderRadius: '0 0 5px 5px'
}, toggle);

var labels = $s('#basecamp label');

for (var i = labels.length-1; i >= 0; i--) {
  css({display:'inline-block', width:'70px'},labels[i]);
}



// toggle.addEventListener('click', function(){
//   console.log('arguments %o',arguments)
// }, false);
// 

