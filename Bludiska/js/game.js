
var TILE_SIZE = 32; //32 пикселя размер тайла
var MAX_FPS = 10;   //60 кадров в секунду
var WIDTH = 800; //или 32*25
var HEIGHT = 450; //или 32*20
var GAME_NAME = "labyrinth"
var RESOURCE = {
    'background': 'tiles/background.jpg', //обязательный ресурс background
    'empty': 'tiles/empty.jpg', //для пустых клеток
    'logo' : 'logo/logo.png',
    'tak'  : 'logo/prostotak.gif',
    'wall' : 'tiles/wall.png',
    'hren' : 'tiles/mario.png',
    'fog'  : 'tiles/fog.jpg',
    'player_up' : 'tiles/player_up.png',
    'player_down' : 'tiles/player_down.png',
    'player_left' : 'tiles/player_left.png',
    'player_right' : 'tiles/player_right.png'
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
        new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1),
        new Array(1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1),
        new Array(1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1),
        new Array(1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1),
        new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1),
        new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1),
        new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1)
    );
    //Определяет ресур в точке на карте
    function resDef(x,y)
    {
        var elem = 'empty';
        switch(map[y][x]){
        case 1: elem = 'wall'; break;
        case 2: elem = 'tak'; break;
        }
        return elem;
    }

    //Загрузка элементов
    Scene.init(map);
    for(var y = 0; y < Scene.height; y++){
        for(var x = 0; x < Scene.width; x++){
            //Определяем тайлы на карте
            var elem = resDef(x,y);
            tile = new Tile(elem);
            Scene.set_tile(tile, new Pos(x, y));
        }
    }

    //Загрузим игрока
    var player = new PlayerObject(new Pos(1, 1));
    Scene.add_object('player',player);
    Scene.add_event(KEYCODE.aup,'player.eventKeyUp()');
    Scene.add_event(KEYCODE.adown,'player.eventKeyDown()');
    Scene.add_event(KEYCODE.aleft,'player.eventKeyLeft()');
    Scene.add_event(KEYCODE.aright,'player.eventKeyRight()');
    Scene.add_event(KEYCODE.space,'player.eventKeySpace()');
    //Изменение тайлов от позиции pos, на расстояние viewDist, тайл определяет code
    function view(pos,viewDist,state)
    {
        for(y = pos.y-viewDist; y <= pos.y+viewDist; y++){
            for(x = pos.x-viewDist; x <= pos.x+viewDist; x++){
                //Определяем тайлы на карте
                if(x < 0 || y < 0) continue;
                if(x >= Scene.width || y >= Scene.height) continue;
                var dist = Math.sqrt((x-pos.x)*(x-pos.x)+(y-pos.y)*(y-pos.y));
                if(dist <= viewDist)
                    Scene.tiles[y][x].visible = state;
            }
        }
    }

    Engine.logic = function()
    {
        var lastPlayerPos = new Pos(Scene.objects.player.pos.x,Scene.objects.player.pos.y);
        var playerPos = Scene.objects.player.pos;

        //Двигаемся по заданному направлению
        playerPos.add(Scene.objects.player.delta.x, Scene.objects.player.delta.y);

        //Если непроходимый тайл, двигаемся обратно
        if(!Scene.tiles[playerPos.y][playerPos.x].pass) playerPos.add(-Scene.objects.player.delta.x, -Scene.objects.player.delta.y);
        Scene.objects.player.delta = new Pos(0,0);

        //Закрываем старое пространство туманом
        view(lastPlayerPos,Scene.objects.player.viewDist,false);
        //Открываем новое пространство
        view(playerPos,Scene.objects.player.viewDist,true);
        //Расчитываем локальную (на экране) позицию игрока
        Scene.objects.player.lpos.x = playerPos.x - Scene.camera.x;
        Scene.objects.player.lpos.y = playerPos.y - Scene.camera.y;
        //Вращает иконку игрока
        switch(Scene.objects.player.direction){
        case 'up': Scene.objects.player.resourceId = 'player_up'; break;
        case 'down': Scene.objects.player.resourceId = 'player_down'; break;
        case 'left': Scene.objects.player.resourceId = 'player_left'; break;
        case 'right': Scene.objects.player.resourceId = 'player_right'; break;
        }
        //Двигаем камеру
        var camDx = Math.floor(Field.width/3);
        var camDy = Math.floor(Field.height/3);
        if(Scene.objects.player.lpos.x <= 1){
            Scene.camera.add(-camDx,0);
        }
        if(Scene.objects.player.lpos.x >= Field.width - 2){
            Scene.camera.add(camDx,0);
        }
        if(Scene.objects.player.lpos.y <= 1){
            Scene.camera.add(0,-camDy);
        }
        if(Scene.objects.player.lpos.y >= Field.height - 2){
            Scene.camera.add(0,camDy);
        }
        //Сохраняем камеру в границах
        if( Scene.camera.x < 0 ){
            Scene.camera.x = 0;
        }
        if( Scene.camera.y < 0 ){
            Scene.camera.y = 0;
        }
        if( Scene.camera.x > Scene.width - Field.width ){
            Scene.camera.x = Scene.width- Field.width;
        }
        if( Scene.camera.y > Scene.height - Field.height ){
            Scene.camera.y = Scene.height - Field.height;
        }
    }

    Engine.play();
    //alert("Ходить стрелочками :)");
}



//Формируем игровой объект
// pass - возможность пройти через тайл
// interact - возможность взаимодействия с тайлом
//
function Tile(elem)
{
    this.resourceId = elem; //Обязательный, для определения элемента ресурса
    var pass = true,
        interact = false;
    //Настройки для определенного вида тайла
    switch(elem){
    case 'wall':
        pass = false;
        break;
    case 'tak':
        interact = true;
        break;
    }
    this.visible = false;
    this.interact = interact;
    this.pass = pass;
}
