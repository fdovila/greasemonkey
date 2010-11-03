// version 0.3 BETA!
// 2010-10-20
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
var _ = {
  $: function (selector) {
    return document.querySelectorAll(selector);
  },
  
  css: function (properties, elem) {
    if (arguments.length < 2)
      return false;

    for (var prop in properties)
      elem.style[prop] = properties[prop];
  }
  
};




function mouseOverClosure (elem, item) {
  function handler (el) {
    el.addEventListener('mouseover', function () {
      _.css({display: 'block'}, item);
      _.css({zIndex: '1'}, (this === el ? elem : el).parentNode);
    }, false);
  }
  handler(elem, item);
  handler(item, item);
}
function mouseOutClosure (elem, item) {
  function handler (el) {
    el.addEventListener('mouseout', function () {
      _.css({display: 'none'}, item);
      _.css({zIndex: '0'}, (this === el ? elem : el).parentNode);
    }, false);
  }
  handler(elem);
  handler(item);
}

var elems = _.$('.items_wrapper .item span[id^=item_wrap]');

for (var i = elems.length-1; i >= 0; i--) {
  var elem = elems[i],
    string = elem.innerHTML,
    container = document.createElement('div'),
    link = document.createElement('a'),
    id = elem.id,
    parent = elem.parentNode;

  parent.appendChild(container);
  _.css({
    position: 'absolute',
    display: 'none',
    backgroundColor: 'rgba(255,255,255,.9)',
    border: '1px solid #AAA',
    left: '-3px',
    top: '-3px',
    padding: '18px 0 0',
    width: '100%',
    zIndex: '-1',
    MozBorderRadius: '7px 7px 3px 3px',
    WebkitBorderRadius: '7px 7px 3px 3px',
    MozBoxShadow: '0 2px 5px rgba(0,0,0,.5)',
    WebkitBoxShadow: '0 2px 5px rgba(0,0,0,.5)'
  }, container);

  // show todo id
  container.innerHTML = '<span style="font-size:10px;color:#666;marginLeft:5px;padding:2px 4px 1px;"><strong>Task #</strong>' + id.substr(id.search(/[0-9]/), id.length) + '</span>';

  // highlighting
  if (/in progress/.test(string)) {
    if (/204/.test(elem.style.backgroundColor)) {
      _.css({
        backgroundColor: '#A8CFA8',
        color: '#333'
      }, elem);
    } else {
      _.css({backgroundColor: '#D2E9D2'}, elem);
    }
  }
  
  _.css({
    MozBorderRadius: '1em',
    WebkitBorderRadius: '1em',
    padding: '0 .5em 1px .5em'
  }, elem);

  _.css({
    position:'relative'
  }, parent);
  
  mouseOverClosure(elem, container);
  mouseOutClosure(elem, container);
}