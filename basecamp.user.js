// version 0.3 ALPHA!
// 2010-10-20
// Copyright (c) 2010, Christian Angermann
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// ==UserScript==
// @name           Todo in progress highlighter
// @namespace      http://basecamphd.com
// @description    Highlighted todos are in progress and added todo id before description
// @include        https://*.basecamphq.com/projects/*/todo_lists/*
// @include        http://*.basecamphq.com/projects/*/todo_lists/*
// ==/UserScript==



//Element.prototype.setStyle = function (properties) {
var setStyle = function (properties, elem) {
  // if (typeof elem != 'undefined')
  //   return false;
    
  for (var prop in properties) {
    elem.style[prop] = properties[prop];
  }
};

function mouseOverClosure (elem, item) {
  function handler (el) {
    el.addEventListener('mouseover', function () {
      setStyle({display: 'block'}, item);
      setStyle({zIndex: '1'}, (this === el ? elem : el).parentNode);
    }, false);
  }
  handler(elem, item);
  handler(item, item);
}
function mouseOutClosure (elem, item) {
  function handler (el) {
    el.addEventListener('mouseout', function () {
      setStyle({display: 'none'}, item);
      setStyle({zIndex: '0'}, (this === el ? elem : el).parentNode);
    }, false);
  }
  handler(elem);
  handler(item);
}

var elems = document.querySelectorAll('.items_wrapper .item span[id^=item_wrap]');

for (var i = elems.length-1; i >= 0; i--) {
  var elem = elems[i],
    string = elem.innerHTML,
    container = document.createElement('div'),
    link = document.createElement('a'),
    id = elem.id,
    parent = elem.parentNode;

  parent.appendChild(container);
  setStyle({
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
      setStyle({
        backgroundColor: '#A8CFA8',
        color: '#333'
      }, elem);
    } else {
      setStyle({backgroundColor: '#D2E9D2'}, elem);
    }
    setStyle({
      MozBorderRadius: '1em',
      WebkitBorderRadius: '1em',
      padding: '0 .5em 1px .5em'
    }, elem);

    setStyle({
      position:'relative'
    }, parent);
  }
  mouseOverClosure(elem, container);
  mouseOutClosure(elem, container);
}