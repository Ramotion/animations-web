"use strict";

/* State machine model

  Expanded --* mousedown on hamburger *-->
    Mini
      --* mouseup *--> Expanded
      --* mousemove *--> reorder Mini

*/

function reorganizableList(params) {

  var root = params.root;
  var data = params.data;
  var itemMiniSize = params.itemMiniSize;
  var itemFullSize = params.itemFullSize;
  var itemSpace = params.itemSpace;
  var makeExpanded = params.makeExpanded;
  var makeMini = params.makeMini;
  var callback = params.callback;

  var contentState;

  function makeItemNode (expandedContent,miniContent) {

    var n = document.createElement('div');

    n.className = 'item-node-container';
    n.style.height = itemFullSize + 'px';
    n.style.left = itemSpace + 'px';
    n.style.width = 'calc(100% - ' + (itemSpace * 2) + 'px)';

    // refresh document flow via a relative node

    var stabalizer = document.createElement('div');

    stabalizer.className = 'stabalizer';

    n.appendChild(stabalizer);

    // expanded state

    var expanded = document.createElement('div');

    expanded.className = 'item-state expanded';

    expanded.appendChild(expandedContent);

    stabalizer.appendChild(expanded);

    // mini state

    var mini = document.createElement('div');

    mini.className = 'item-state mini disabled';

    mini.appendChild(miniContent);

    stabalizer.appendChild(mini);

    // drag button

    var dragBtn = document.createElement('div');

    dragBtn.className = 'drag-btn';

    stabalizer.appendChild(dragBtn);

    return [n,expanded,mini,dragBtn,stabalizer];
  }

  function itemCoordinates(index, size, offset) {
    return (index * (size + offset)) + offset;
  }

  function itemExpandedCoordinates(index) {
    return itemCoordinates(index,itemFullSize,itemSpace);
  }

  function itemMiniCoordinates(index) {
    return itemCoordinates(index,itemMiniSize,itemSpace);
  }

  // set appropriate root dimensions
  root.style.height = itemExpandedCoordinates(data.length) + 'px';

  var uiItems = data.map(function(d,i){

    // expanded content

    var expanded = makeExpanded(d);

    // mini content

    var mini = makeMini(d);

    // create an item

    var item = makeItemNode(expanded,mini);

    item[0].style.top = itemExpandedCoordinates(i) + 'px';

    return {
      base:item[0],
      expanded:item[1],
      mini:item[2],
      drag:item[3],
      stabalizer:item[4],
      id:i,
      index:i
    };

  });

  // state machine

  var transitionDuration = 0.3;

  var stateMachineState = {current:'expanded'};

  contentState = JSON.stringify(uiItems.map($0=>$0.index));

  function setStateMini(selected) {

    uiItems.forEach(function(item){

      // base size and position

      TweenLite.to(item.base, transitionDuration, {
        top:itemMiniCoordinates(item.index) + 'px'
      , height:itemMiniSize + 'px'
      });

      // expanded state visibility

      TweenLite.to(item.expanded, transitionDuration, {
        opacity:0.0
      });

      // mini state visibility

      TweenLite.to(item.mini, transitionDuration, {
        opacity:1.0
      });

      item.mini.classList.remove('disabled');

    });

    stateMachineState.current = 'mini';

  }

  function setStateExpanded() {

    uiItems.forEach(function(item){

      // base size and position

      TweenLite.to(item.base, transitionDuration, {
        top:itemExpandedCoordinates(item.index) + 'px'
      , height:itemFullSize + 'px'
      });

      // expanded state visibility

      TweenLite.to(item.expanded, transitionDuration, {
        opacity:1.0
      });

      // mini state visibility

      TweenLite.to(item.mini, transitionDuration, {
        opacity:0.0
      });

      item.mini.classList.add('disabled');

    });

    stateMachineState.current = 'expanded';

  }

  function reorderState(id,i) {

    var a = new Array();

    uiItems.forEach(function(item){
      a[item.index] = item.id;
    });

    var oldIndex = a.findIndex($0=>$0 === id);

    a = a.filter($0=>$0 !== id);
    var b = new Array();

    if(a.length === i) {
      b[i] = id;
    }

    for(var j=0;j<a.length;j++) {
      if(j < i) {
        b[j] = a[j];
      }else if(j === i) {
        b[j] = id;
        b[j + 1] = a[j];
      }else {
        b[j + 1] = a[j];
      }
    }

    uiItems.forEach(function(item){
      item.index = b.findIndex($0=>$0 === item.id);
    });

    if(stateMachineState.current === 'mini') {
      setStateMini();
    }else{
      setStateExpanded();
    }

  }

  // execution

  uiItems.forEach(function(i){

    root.appendChild(i.base);

    // drag

    i.drag.onmousedown = function(base) {

      base.preventDefault();

      i.base.style.zIndex = '1';
      i.drag.style.cursor = 'grabbing';
      i.stabalizer.style.boxShadow = '0px 0px 10px black';

      setStateMini();

      function getOffset(el) {

        el = el.getBoundingClientRect();

        return {
          left: el.left + window.scrollX,
          top: el.top + window.scrollY,
          height:el.height
        }
      }

      var or = getOffset(i.base);

      var pos = {x:base.pageX, y:base.pageY, continue:true};

      function update(){

        if(pos.continue){
          window.requestAnimationFrame(update);
        }else{
          return
        }

        var o = getOffset(i.base);
        var x = (pos.x - o.left) - (base.pageX - or.left);
        var y = (pos.y - o.top) - (base.pageY - or.top) + (or.height - o.height) / 2;

        i.stabalizer.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px)';
      }

      update();

      document.onmousemove = function (e) {
        
        pos.x = e.pageX;
        pos.y = e.pageY;

        // check if we need to reorder

        var s = {overIndex:null};

        var base = getOffset(root).top + itemSpace;
        var size = getOffset(uiItems[0].base).height + itemSpace;

        if(pos.y < base + size) {
          s.overIndex = 0;
        }else if((base + size * uiItems.length) < pos.y) {
          s.overIndex = uiItems.length - 1;
        }else {
          for(var j=0;j<uiItems.length;j++) {
            if(base < pos.y && pos.y < base + size) {
              s.overIndex = j;
            }
            base += size;
          }
        }

        if(s.overIndex !== i.index && s.overIndex !== null) {
          reorderState(i.id,s.overIndex);
        }

      };

      document.onmouseup = function() {

        pos.continue = false;

        document.onmousemove = null;

        setStateExpanded();

        TweenLite.to(i.stabalizer,0.3,{
            x:'0px',
            y:'0px',
            parseTransform:true,
            onComplete:function(){
              i.drag.style.cursor = 'pointer';
              i.base.style.zIndex = 'auto';
              i.stabalizer.style.boxShadow = 'none';
            }
          });

        document.onmouseup = null;

        // notify if we have a callback and a new ordering

        var newStateData = uiItems.map($0=>$0.index);
        var newState = JSON.stringify(newStateData);

        if(contentState !== newState) {
          contentState = newState;
          callback(newStateData);
        }

      };

    };

  });

}
