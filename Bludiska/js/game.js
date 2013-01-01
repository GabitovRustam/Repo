
var TILE_SIZE = 32; //32 пикселя размер тайла
var MAX_FPS = 10;   //60 кадров в секунду
var WIDTH = 800; //или 32*25
var HEIGHT = 640; //или 32*20
var GAME_NAME = "labyrinth"
var RESOURCE = {
    'background': 'tiles/empty.jpg', //обязательный ресурс background
    'logo' : 'logo/logo.png',
    'tak'  : 'logo/prostotak.gif',
    'wall' : 'tiles/wall.png',
    'hren' : 'tiles/mario.png'
};

window.onload = init;


function init() {
    Engine.init_resource(RESOURCE);
    Engine.init({
        width : WIDTH,
        height : HEIGHT,
        game_name : GAME_NAME,
        size : TILE_SIZE,
        fps : MAX_FPS
    });

    //Карта 0 - свободно, 1 - стена
    var map = new Array(
        new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1),
        new Array(1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1)
    );


    //Загрузка элементов
    Scene.init(map);
    for(var y = 0; y < Scene.height; y++){
        for(var x = 0; x < Scene.width; x++){
            //Определяем тайлы на карте
            var elem = 'empty';
            switch(map[y][x]){
            case 1: elem = 'wall'; break;
            case 2: elem = 'tak'; break;
            }
            tile = new Tile(elem);
            Scene.set_tile(tile, new Pos(x, y));
        }
    }
    //Загрузим игрока
    var player = new PlayerObject(new Pos(5, 5));
    Scene.add_object('player',player);
    Scene.add_event(KEYCODE.aup,'player.eventKeyUp()');
    Scene.add_event(KEYCODE.adown,'player.eventKeyDown()');
    Scene.add_event(KEYCODE.aleft,'player.eventKeyLeft()');
    Scene.add_event(KEYCODE.aright,'player.eventKeyRight()');

    Engine.play();
}

//Формируем игровой объект
// pass - возможность пройти через тайл
// interact - возможность взаимодействия с тайлом
//
function Tile(elem)
{
    var pass = true,
        interact = false;
    switch(elem){
    case 'wall':
        pass = false;
        break;
    case 'tak':
        interact = true;
        break;
    }
    this.type = elem;
    this.interact = interact;
    this.pass = pass;
}
