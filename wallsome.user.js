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

var items = document.querySelectorAll('.responsible_for_item');
for (var i = items.length-1; i >= 0; i--)
  items[i].style.backgroundColor = '#A6FF44';
