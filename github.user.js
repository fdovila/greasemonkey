  // version 1.0
  // 2010-11-07
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

  var get_data = function () {
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
  var update = function () {
    var messages = dom('#commit .message a'),
      messages = messages.length > 0 ? messages : dom('#commit .message pre')
      data = get_data(),
      key = '\\d{8}',
      pattern = new RegExp(data.prefix + key + data.suffix, 'ig');
      
    for (var i = messages.length-1; i >= 0; i--) {
      var elem = messages[i],
        basecamp_url = 'https://' + data.account +'.basecamphq.com/todo_items/',
        parent = !!elem.parentNode && elem.parentNode, 
        txt = '';
        
      if (parent) {
        if (parent.getAttribute('data-origin') == null) {
          parent.setAttribute('data-origin', parent.innerHTML);
        } else {
          parent.innerHTML = parent.getAttribute('data-origin');
        }
        txt = parent.firstChild.innerHTML;
      }
     
      if (txt.match(pattern)) {
        var id = txt.match(pattern)[0],
        raw_id = id.match(/\d{8}/)[0],
        raw_message = txt.replace(pattern, ''),
        tooltip = '';
        
        if (data.key != '') {
          tooltip = '<span class="task">' +
            '<span></span>' +
            '<strong class="userbox" id="gm_task_' + raw_id + '">&nbsp;</strong>' +
          '</span>';
          task_description_request(raw_id);
        }
        
        parent.innerHTML = (elem.href ? '' : '<pre>') + 
          '<a target="_blank" style="color:#4183C4;" href="' + basecamp_url + raw_id + '/comments">' + id + tooltip + '</a>' +
          (elem.href ? '<a href="' + elem.href + '">' + raw_message + '</a>' : raw_message + '</pre>');
      }
    }
    
  };

var task_description_request = function (id) {
  var data = get_data(),
    basecamp_url = 'https://' + data.account +'.basecamphq.com/todo_items/' + id;
    
  GM_xmlhttpRequest({
    method: "GET",
    url: basecamp_url,
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
      var task_message = response.responseXML.getElementsByTagName('content')[0].firstChild.nodeValue
      document.getElementById('gm_task_' + id).innerHTML = task_message;
    }
    
  });
};

var timeout_id = 0;

var show_complete_label = function () {
  var style = dom('#gm_basecamp .form-actions .success')[0].style;
  style.visibility = 'visible';
  clearTimeout(timeout_id);
  timeout_id = setTimeout(function () {
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
    '<div class="add-pill-form">' +
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
    '<div class="form-actions">' +
      '<span class="success">✓ saved</span>' +
      '<a href="#submit" class="submit button classy"><span>Save</span></a>' +
    '</div>' +
  '</div>' + 
  '<a href="#" class="toggle userbox">Settings ' +
    '<span class="open">open</span>' +
    '<span class="close">close</span>' +
  '</a>';
document.body.appendChild(form);

var styles = "#gm_basecamp {position:absolute;right:1em;top:0;z-index:3}";
styles += "#gm_basecamp .add-pill-form{width:330px}";
styles += "#gm_basecamp small{color:#777}";
styles += "#gm_basecamp .add-pill-form:first-child{width:70px;margin-right:5px}";
styles += "#gm_basecamp .add-pill-form input[type=text]{width: 100%}";
styles += "#gm_basecamp .add-pill-form dl{padding-right:12px}";
styles += "#gm_basecamp .content {float:none;padding:0 10px 10px;-moz-border-radius-bottomright:0;-webkit-border-radius-bottom-right:0}";
styles += "#gm_basecamp .content > div{display:inline-block}";
styles += "#gm_basecamp .content .form-actions{display:block}";
styles += "#gm_basecamp .content .form-actions a{height:24px}";
styles += "#gm_basecamp .content .form-actions a span{height:24px;line-height:26px}";
styles += "#gm_basecamp .content .form-actions .success{line-height:26px;visibility:hidden}";
styles += "#gm_basecamp h3{margin:0 0 .2em}";
styles += "#gm_basecamp .toggle {background: #ECECEC; margin-top:-1px; padding:5px 8px 0}";
styles += "#gm_basecamp.collapsed .content{display:none}";
styles += "#gm_basecamp.collapsed .open{display:inline}";
styles += "#gm_basecamp.collapsed .close{display:none}";
styles += "#gm_basecamp .open{display:none}";
styles += "#gm_basecamp .close{display:inline}";
styles += ".commit .message pre{position:relative}";
styles += ".commit .message .task {display:none;position:absolute;top:15px;left:0; color:#777}";
styles += ".commit .message .task span{border:10px solid transparent;height:0;line-height:0;width: 0;border-bottom-color:#FCFCFC;margin-top:-10px;margin-left:25px;display:block}";
styles += ".commit .message .userbox {-moz-border-radius:5px;-webkit-border-radius:5px;font-weight:normal}";
styles += ".commit .message a:hover .task{display:block}";
GM_addStyle(styles);
//
// ================================ events ===================================
//
dom('#gm_basecamp .toggle')[0].addEventListener('click', function (event) {
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

dom('#gm_basecamp .submit')[0].addEventListener('click', function (event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopped = true;
  show_complete_label();

  var inputs = dom('#gm_basecamp input[type=text]');
  for (var i = inputs.length-1; i >= 0; i--) {
    localStorage.setItem(inputs[i].id, inputs[i].value);
  }
  update();
}, false);
update();

// initial
if (localStorage.getItem('panel') == 'collapsed') {
  form.setAttribute('class', 'collapsed');
}