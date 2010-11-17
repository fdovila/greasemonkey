// 2010-10-20
// Copyright (c) 2010, Christian Angermann
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
// ==UserScript==
// @name           Wallsome - Highlight my own basecamp tasks
// @namespace      http://wallsome.com
// @description    Highlight my own task in board
// @include        http://*.wallsome.com/*/projects/*/milestones/*
// ==/UserScript==

GM_addStyle('.responsible_for_item{background-color: #A6FF44;}');
  
var items = document.querySelectorAll('.todo_item');
for (var i = items.length-1; i >= 0; i--) {
  var item = items[i];
  if (/story/i.test(item.innerHTML))
    item.style.backgroundColor = '#dcdcdc';
}
  
