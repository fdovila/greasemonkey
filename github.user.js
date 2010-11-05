// version 0.4 BETA!
// 2010-10-20
// Copyright (c) 2010, Christian Angermann
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name           Github - Show commit dependence to basecamp task
// @namespace      http://*.github.com
// @description    Adds when task number is available, a link to the task in http://basecamphd.com Todo list added to commit message.
// @include        https://*.github.com/*
// @include        http://*.github.com/*
// @exclude        http://*.github.com/*/*/raw/*
// @exclude        https://*.github.com/*/*/raw/*
// ==/UserScript==
// helper/utilities
var _ = {
  $: function (selector) {
    return document.querySelectorAll(selector);
  }  
};
//
// ======================= update commit message =============================
//
var update = function() {
  var messages = _.$('#commit .message a'),
    prefix = localStorage.getItem('gm_prefix'),
    key = '\\d{8}',
    suffix = localStorage.getItem('gm_suffix'),
    account = localStorage.getItem('gm_account'),
    pattern = new RegExp(prefix + key + suffix, 'ig');

  for (var i = messages.length-1; i >= 0; i--) {
    var elem = messages[i],
      txt = elem.innerHTML,
      basecamp_url = 'https://'+account+'.basecamphq.com/todo_items/';
    if (txt.match(pattern)) {
      var id = txt.match(pattern)[0];

      elem.parentNode.innerHTML = '<a target="_blank" style="color:#4183C4;" href="' + (basecamp_url + id.match(/\d{8}/)[0]) + '/comments">' + id + '</a>' +
        '<a href="' + elem.href + '">' + txt.replace(pattern, '') + '</a>';
    }
  }
};
//
// ============================= data settings ===============================
//
var prefix = localStorage.getItem('gm_prefix') || '',
suffix = localStorage.getItem('gm_suffix') || '',
repo = localStorage.getItem('gm_repo') || '',
account = localStorage.getItem('gm_account') || '';

var form = document.createElement('div');
form.id = 'gm_basecamp';
form.innerHTML = '<div class="content userbox">' +
    '<div class="gm_basecamp">' +
      '<h3>Basecamp todos</h3>' +
      '<dl class="form">'+
        '<dt><label for="gm_prefix">Prefix</label></dt>'+
        '<dd><input id="gm_prefix" class="short" type="text" value="'+prefix+'" /></dd>'+
        '<dt><label for="gm_suffix">Suffix</label></dt>'+
        '<dd><input id="gm_suffix" class="short" type="text" value="'+suffix+'" /></dd>'+
      '</dl>'+
    '</div>'+
    '<div class="gm_github">' +
      '<h3>github</h3>' +
      '<dl class="form">'+
        '<dt><label for="gm_account">Account</label></dt>'+
        '<dd><input id="gm_account" class="short" type="text" value="'+repo+'" /></dd>'+
        '<dt><label for="gm_repo">Repository</label></dt>'+
        '<dd><input id="gm_repo" class="short" type="text" value="'+account+'" /></dd>'+
      '</dl>'+
    '</div>' +
    '<a href="#submit" class="submit button classy"><span>Save</span></a>'+
  '</div>' + 
  '<a href="#" class="toggle userbox">Settings '+
    '<span class="open">open</span>'+
    '<span class="close">close</span>'+
  '</a>';
document.body.appendChild(form);

var css_form = "#gm_basecamp {position:absolute;right:1em;top:0}";
css_form += "#gm_basecamp .content {float:none;padding: 10px;-moz-border-radius-bottomright:0}";
css_form += "#gm_basecamp .toggle {background: #ECECEC; margin-top:-1px; padding:5px 8px 0;}";
css_form += "#gm_basecamp.collapsed .content{display:none;}";
css_form += "#gm_basecamp.collapsed .open{display:none;}";
css_form += "#gm_basecamp.collapsed .close{display:inline}";
css_form += "#gm_basecamp .close{display:none}";
GM_addStyle(css_form);


_.$('#gm_basecamp .toggle')[0].addEventListener('click', function(event){
  event.preventDefault();
  event.stopPropagation();
  event.stopped = true;

  var classNames = form.getAttribute('class');
  if (/collapsed/.test(classNames))
    classNames = '';
  else 
    classNames = 'collapsed';
  form.setAttribute('class', classNames);
  localStorage.setItem('panel', classNames);
}, false);

if (localStorage.getItem('panel') == 'collapsed') {
  form.setAttribute('class', 'collapsed');
}

_.$('#gm_basecamp .submit')[0].addEventListener('click', function(event){
  event.preventDefault();
  event.stopPropagation();
  event.stopped = true;
  
  var inputs = _.$('#gm_basecamp .form input[type=text]');
  for (var i = inputs.length-1; i >= 0; i--) {
    localStorage.setItem(inputs[i].id, inputs[i].value);
  }
  update();
}, false);
update();