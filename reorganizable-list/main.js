function main(root) {

  var data = [
    {
      image:'https://i.redd.it/gk5qucswjoiz.jpg',
      name:'Creek',
      description:'A creek in Colorado'
    },
    {
      image:'https://i.redd.it/dbras2txxesz.jpg',
      name:'Fall lake',
      description:'Heart Lake in Ontario'
    },
    {
      image:'https://i.imgur.com/7PlPaTg.jpg',
      name:'Lakeview',
      description:'A lake in Germany'
    },
    {
      image:'https://i.redd.it/a3ye33532fez.jpg',
      name:'Rock formation',
      description:'An exotic rock formation in China'
    },
    {
      image:'https://i.imgur.com/tavZpiF.jpg',
      name:'Ranier',
      description:'The milkyway at twilight over Mount Rainier'
    }];

  var itemMiniSize = 50;
  var itemFullSize = 160;
  var itemSpace = 15;

  function makeExpanded(item) {

    var expanded = document.createElement('div');

    expanded.className = 'expanded-content';

    var background = document.createElement('div');

    background.className = 'background';

    background.style.backgroundImage = 'url(' + item.image + ')';

    expanded.appendChild(background);

    var title = document.createElement('div');

    title.className = 'title';

    title.appendChild(document.createTextNode(item.name));


    var desc = document.createElement('div');

    desc.className = 'description';

    desc.appendChild(document.createTextNode(item.description));

    expanded.appendChild(title);
    expanded.appendChild(desc);

    return expanded
  }

  function makeMini(item) {

    var mini = document.createElement('div');

    var title = document.createElement('div');

    title.className = 'title';

    title.appendChild(document.createTextNode(item.name));

    mini.appendChild(title);

    return mini
  }

  reorganizableList({
      root:root // parent widget
    , data:data // [Item] where Item is whatever you want
    , itemMiniSize:itemMiniSize // collapsed widget size
    , itemFullSize:itemFullSize // expanded widget size
    , itemSpace:itemSpace // amount of spacing between and around items
    , makeExpanded:makeExpanded // Item -> Node, shown in expanded state
    , makeMini:makeMini // Item -> Node, shown in collapsed state
    , callback:function(items) { // called on reorder, yielding the new mapping, items[oldIndex] = newIndex
        console.log(items);
      }
  });

}
