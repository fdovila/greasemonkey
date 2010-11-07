// version 0.5 BETA!
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
var dom = function (selector) {
  return document.querySelectorAll(selector);
};

var get_data = function() {
  return {
    prefix: localStorage.getItem('gm_prefix') || '',
    suffix: localStorage.getItem('gm_suffix') || '',
    key: localStorage.getItem('gm_key') || '',
    account: localStorage.getItem('gm_account') || ''
  };
};

//
// ======================= update commit message =============================
//
var update = function() {
  var messages = dom('#commit .message a'),
    data = get_data(),
    key = '\\d{8}',
    pattern = new RegExp(data.prefix + key + data.suffix, 'ig');
    
  for (var i = messages.length-1; i >= 0; i--) {
    var elem = messages[i],
      txt = elem.innerHTML,
      basecamp_url = 'https://' + data.account +'.basecamphq.com/todo_items/';
    if (txt.match(pattern)) {
      var id = txt.match(pattern)[0];

      elem.parentNode.innerHTML = '<a target="_blank" style="color:#4183C4;" href="' + (basecamp_url + id.match(/\d{8}/)[0]) + '/comments">' + id + '</a>' +
        '<a href="' + elem.href + '">' + txt.replace(pattern, '') + '</a>';
    }
  }
};
var timeout_id = 0;
var show_complete_label = function () {
  var style = dom('#gm_basecamp .action > span')[0].style;
  style.visibility = 'visible';
  clearTimeout(timeout_id);
  timeout_id = setTimeout(function(){
    style.visibility = '';
  }, 2000);
};

//
// ============================= data settings ===============================
//
var data = get_data(),
  form = document.createElement('div');

form.id = 'gm_basecamp';
form.innerHTML = '<div class="content userbox">' +
    '<div class="add-pill-form first">' +
      '<h3>github</h3>' +
      '<dl>' +
        '<dt><label for="gm_prefix">Prefix</label></dt>'+
        '<dd>' + 
          '<input id="gm_prefix" class="short" type="text" value="' + data.prefix + '" />' +
          '<small>&nbsp;</small>' +
        '</dd>' +
        '<dt><label for="gm_suffix">Suffix</label></dt>' +
        '<dd><input id="gm_suffix" class="short" type="text" value="' + data.suffix + '" /></dd>' +
      '</dl>' +
    '</div>' +
    '<div class="add-pill-form">' +
      '<h3>basecamp</h3>' +
      '<dl>' +
        '<dt><label for="gm_account">Account</label></dt>' +
        '<dd>' +
          '<input id="gm_account" class="short" type="text" value="' + data.account + '" />' +
          '<small><strong>Example:</strong> https://ACCOUNT.basecamphd.com</small>' +
        '</dd>' +
        '<dt><label for="gm_key">API token</label></dt>' +
        '<dd><input id="gm_key" class="short" type="text" value="' + data.key + '" /></dd>' +
      '</dl>' +
    '</div>' +
    '<div class="action">' +
      '<span>complete</span>' +
      '<a href="#submit" class="submit button classy"><span>Save</span></a>' +
    '</div>' +
  '</div>' + 
  '<a href="#" class="toggle userbox">Settings ' +
    '<span class="open">open</span>' +
    '<span class="close">close</span>' +
  '</a>';
document.body.appendChild(form);

var css_form = "#gm_basecamp {position:absolute;right:1em;top:0;z-index:3}";
css_form += "#gm_basecamp .add-pill-form{width: 250px}";
css_form += "#gm_basecamp small{color: #777}";
css_form += "#gm_basecamp .add-pill-form.first{width: 100px;margin-right:5px;}";
css_form += "#gm_basecamp .add-pill-form input[type=text]{width: 100%;}";
css_form += "#gm_basecamp .add-pill-form dl{padding-right:12px}";
css_form += "#gm_basecamp .content {float:none;padding:0 10px 10px;-moz-border-radius-bottomright:0;-webkit-border-radius-bottom-right:0}";
css_form += "#gm_basecamp .content > div{display:inline-block;}";
css_form += "#gm_basecamp .content .action{display:block;text-align:right;position:relative}";
css_form += "#gm_basecamp .content .action a{height:24px}";
css_form += "#gm_basecamp .content .action a span{height:24px;line-height:26px;}";
css_form += "#gm_basecamp .content .action > span{line-height:26px;position: absolute;right:70px;color:#70C765;visibility:hidden}";
css_form += "#gm_basecamp h3{margin:0 0 .2em}";
css_form += "#gm_basecamp .toggle {background: #ECECEC; margin-top:-1px; padding:5px 8px 0;}";
css_form += "#gm_basecamp.collapsed .content{display:none;}";
css_form += "#gm_basecamp.collapsed .open{display:none;}";
css_form += "#gm_basecamp.collapsed .close{display:inline}";
css_form += "#gm_basecamp .close{display:none}";
GM_addStyle(css_form);

dom('#gm_basecamp .toggle')[0].addEventListener('click', function(event){
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

dom('#gm_basecamp .submit')[0].addEventListener('click', function(event){
  event.preventDefault();
  event.stopPropagation();
  event.stopped = true;
  show_complete_label();
  
  var inputs = dom('#gm_basecamp .form input[type=text]');
  for (var i = inputs.length-1; i >= 0; i--) {
    localStorage.setItem(inputs[i].id, inputs[i].value);
  }
  update();
}, false);
update();
