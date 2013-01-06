
var TILE_SIZE = 32; //размер тайла в пикселях
var MAX_FPS = 10;   //кадров в секунду
var WIDTH = 800; //размеры канвы в пикселях
var HEIGHT = 450;
var GAME_NAME = "labyrinth"
var RESOURCE = {
    'logo' : 'logo/logo.png',
    'background': 'tiles/background.jpg', //обязательный ресурс background
    'empty': 'tiles/empty.jpg', //для пустых клеток
    'tak'  : 'logo/prostotak.gif',
    'wall' : 'tiles/wall.png',
    'hren' : 'tiles/mario.png',
    'fog'  : 'tiles/fog.jpg',
    'player_up' : 'tiles/player_up.png',
    'player_down' : 'tiles/player_down.png',
    'player_left' : 'tiles/player_left.png',
    'player_right' : 'tiles/player_right.png',
};


window.onload = init;



function change_state()
{
    //If the state needs to be changed
    if(nextState != STATE.NULL)
    {
        //Delete the current state
        if(nextState != STATE.EXIT)
        {
            currentState = undefined;
        }
        //Change the state
        switch(nextState)
        {
            case STATE.INTRO:
                currentState = Intro;
                break;
            case STATE.LEVEL:
                currentState = Level;
                break;
            case STATE.END:
                currentState = End;
                break;
        }
        //Change the current state ID
        stateID = nextState;
        //NULL the next state ID
        nextState = STATE.NULL;
        //Ициализация нового состояния (типа конструктора)
        currentState.init();
    }
}

function init()
{
    Engine.init_resource(RESOURCE);
    Engine.init({
        width : WIDTH,
        height : HEIGHT,
        game_name : GAME_NAME,
        size : TILE_SIZE,
        fps : MAX_FPS
    });

    //Начальное состояние
    stateID = STATE.INTRO;
    currentState = Intro;
    currentState.init();

    Engine.play();
}

//Формируем игровой объект
//  pass - возможность пройти через тайл
//  interact - возможность взаимодействия с тайлом
//  transparency - прозрачность тайла
function Tile(elem)
{
    this.resourceId = elem; //Обязательный, для определения элемента ресурса
    var pass = true,
        interact = false,
        trasparency = true;
    //Настройки для определенного вида тайла
    switch(elem){
    case 'wall':
        pass = false;
        trasparency = false;
        break;
    case 'tak':
        interact = true;
        break;
    }
    this.visible = false;
    this.interact = interact;
    this.trasparency = trasparency;
    this.pass = pass;
}

//Видимость тайлов от позиции pos, на расстояние viewDist
function view(pos,viewDist)
{
    var toCheck = [];
    for(y = pos.y-viewDist; y <= pos.y+viewDist; y++){
        for(x = pos.x-viewDist; x <= pos.x+viewDist; x++){
            //Отбраываем выходы за массив
            if(x < 0 || y < 0) continue;
            if(x >= Scene.width || y >= Scene.height) continue;
            var dist = Math.sqrt((x-pos.x)*(x-pos.x)+(y-pos.y)*(y-pos.y));

            if(dist <= viewDist)
            {
                //Добавить на рассмотрение видимости
                toCheck.push([x,y]);
            }
        }
    }

    //Проверка на видимость
    for(var key in toCheck){
        //Разность координат точки на проверки с расположением глаз
        var dx = toCheck[key][0] - pos.x,
            dy = toCheck[key][1] - pos.y;

        var max = Math.max(Math.abs(dx),Math.abs(dy));
        //Сами себя мы видим
        if(max == 0){ Scene.tiles[pos.y][pos.x].visible = true; continue; }

        var stepx = dx/max,
            stepy = dy/max;

        var curx = pos.x,
            cury = pos.y;

        for(var i = 0; i < max; i++){

            curx += stepx;
            cury += stepy;

            //некое округление .5 в обе стороны 0_о
            if(stepx > 0) curx+=0.001;
            if(stepx < 0) curx-=0.001;
            if(stepy > 0) cury+=0.001;
            if(stepy < 0) cury-=0.001;

            x = Math.round(curx);
            y = Math.round(cury);

            if( Scene.tiles[y][x].trasparency == true ){
                Scene.tiles[y][x].visible = true;
            }
            else {
                Scene.tiles[y][x].visible = true;
                break;
            }
        }
    }
}


function PlayerObject(pos){
    this.resourceId = 'empty'; //Обязательное
    this.pos = new Pos(pos.x, pos.y); //Обязательная глобальная позиция
    this.viewDist = 2; //Дальность видимости
    this.direction = 'right';
    this.lpos = new Pos(0,0); //Локальная позиция
    this.delta = new Pos(0,0); //dx,dy, смещение игрока
    // переназночение евентов
    this.eventKeyUp = function()
    {   // стрелка вверх
        this.delta.add(0, -1);
        this.direction = 'up';
    }
    this.eventKeyLeft = function()
    {   // влево
        this.delta.add(-1, 0);
        this.direction = 'left';
    }
    this.eventKeyRight = function()
    {   // вправо
        this.delta.add(1, 0);
        this.direction = 'right';
    }
    this.eventKeyDown = function()
    {   // вниз
        this.delta.add(0, 1);
        this.direction = 'down';
    }

    this.eventKeySpace = function(){ // пробел
        //Взаимодейтсвие с тайлом
        this.viewDist++;
    }
}
