var KEYCODE  = {
    // Alphabet
    a:65, b:66, c:67, d:68, e:69,
    f:70, g:71, h:72, i:73, j:74,
    k:75, l:76, m:77, n:78, o:79,
    p:80, q:81, r:82, s:83, t:84,
    u:85, v:86, w:87, x:88, y:89, z:90,
    // Numbers
    n0:48, n1:49, n2:50, n3:51, n4:52,
    n5:53, n6:54, n7:55, n8:56, n9:57,
    // Controls
    tab:  9, enter:13, shift:16, backspace:8,
    ctrl:17, alt  :18, esc  :27, space    :32,
    menu:93, pause:19, cmd  :91,
    insert  :45, home:36, pageup  :33,
    'delete':46, end :35, pagedown:34,
    // F*
    f1:112, f2:113, f3:114, f4 :115, f5 :116, f6 :117,
    f7:118, f8:119, f9:120, f10:121, f11:122, f12:123,
    // numpad
    np0: 96, np1: 97, np2: 98, np3: 99, np4:100,
    np5:101, np6:102, np7:103, np8:104, np9:105,
    npslash:11,npstar:106,nphyphen:109,npplus:107,npdot:110,
    // Lock
    capslock:20, numlock:144, scrolllock:145,
    // Symbols
    equals: 61, hyphen   :109, coma  :188, dot:190,
    gravis:192, backslash:220, sbopen:219, sbclose:221,
    slash :191, semicolon: 59, apostrophe: 222,
    // Arrows
    aleft:37, aup:38, aright:39, adown:40
};

function rand(min, max)
{
    if(max) return Math.floor(Math.random() * (max - min + 1)) + min;
    else return Math.floor(Math.random() * (min + 1));
}

//Количество объктов в массиве
function sizeOf(obj)
{
    var count = 0;
    for (key in obj) count++;
    return count;
}

//Настрйоки
var Settings = {
    _settings : {},
    init : function (settings) //Сохраняем массив параметров
    {
        this._settings = settings;
    },
    get : function(param) //Получает значение требуегомого param
    {
        if(!this._settings[param]) return false;
        return this._settings[param];
    }
}

//Уровни
//Game states enum
var STATE = {
    NULL : 0,
    INTRO : 1,
    LEVEL : 2,
    END : 3,
    EXIT : 4
};

var stateID = STATE.NULL;
var nextState = STATE.NULL;

function GameState (){
    this.init = function(){}
    this.handle_events = function(){}
    this.loigc = function(){}
    this.render = function(){}
    //this.destructor = function(){}
}
var currentState;

function set_next_state(newState)
{   //Елси пользователь не хочет выходить
    if(nextState != STATE.EXIT){
        nextState = newState;
    }
}

//Двигло
var Engine = {
    status : 'init',
    isPlay : false, //состояние паузы/игры

    init_resource : function(resource)
    {
        Resource.init(resource)
    },

    init : function(settings) //Инициализация с массивом параметров
    {
        Settings.init(settings);
        Field.init();
        this.fps = Settings.get("fps");
    },

    loop : function(){ //игровой цикл
        switch(this.status){
        case 'load':
            var percent = Resource.load_percent();
            if (percent == true){
                this.status = 'play';
            }
            else Field.render_load(percent);
            break;

        case 'play':
            //TODO: прикрутить fps
            if(stateID == STATE.EXIT){ this.status = 'exit'; break; }
            //Do state event handling
            currentState.handle_events();
            //Do state logic
            currentState.logic();
            //Change state if needed
            change_state();
            //Do state rendering
            currentState.render();
            break;

        case 'exit':
            alert("Молодец, прошел игру");
            this.pause();
            break;
        }
    },

    //Функции запуска/остановки игрового цикла
    play : function(){
        if(this.isPlay) return false;
        this.isPlay = setInterval('Engine.loop()', 1000 / this.fps);
    },
    pause : function(){
        if(!this.isPlay) return false;
        clearInterval(this.isPlay);
    }
};

//Поле из плиток
var Field = {
    init : function()
    {
        this.game_name = Settings.get("game_name");
        this.canvas = document.getElementById(this.game_name);
        this.tile_size = Settings.get('size');
        if(!this.canvas){
            alert("Ошибка инициализации canvas");
            return false;
        }
        this.canvas.width  = Settings.get("width");
        this.canvas.height = Settings.get("height");
        //Вместимость тайлов в окно канваса
        this.width  = Math.floor( this.canvas.width  / this.tile_size );
        this.height = Math.floor( this.canvas.height / this.tile_size );
        //this.count = this.width * this.height;

        if(!this.canvas.getContext){
            alert("Ошибка поддержки canvas браузером");
            return false;
        }
        this.context = this.canvas.getContext("2d");

        this.context.fillStyle = "#DDD";
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    },

    render_load : function(percent)
    {
        this.context.font = "30pt Arial";
        this.context.lineWidth = 4;
        this.context.clearRect(0, 0, Field.canvas.width, Field.canvas.height);
        this.context.textAlign = "center";
        var str = "Грузимся... "+percent+"%";
        this.context.strokeText(str,this.canvas.width/2,this.canvas.height/2);
        //Прогресс бар
        this.context.beginPath();
        this.context.rect(this.canvas.width*0.25, this.canvas.height/2+50, percent/100 * this.canvas.width*0.5, this.canvas.height*0.10);
        this.context.fill();

        this.context.stroke();
    }
}

//Координаты ячеек на поле
function Pos(x, y)
{
    this.x = Math.ceil(x);
    this.y = Math.ceil(y);
    this.add = function(dx, dy)
    {
        this.x += dx;
        this.y += dy;
    }

}

//Храним картинки для тайлов
var Resource = {
    resources : {},
    _preLoad : {},
    _preLoad_count : 0,
    init : function(resources)
    {
        Engine.status = 'load';
        _pre_load = resources;
        _pre_load_count = sizeOf(resources);
        var imgs = {};
        for(key in resources){
            imgs[key] = new Image;
            imgs[key].key = key;
            imgs[key].onload = function()
            {
                Resource.resources[this.key] = this;
            }
            imgs[key].src = resources[key];
        }
    },
    //Возращает процент загруженных ресурсов либо true если всё загружено
    load_percent : function(){
        var count = sizeOf(this.resources)
        //count = 3;
        if(count < _pre_load_count){
            return Math.floor(count * 100 / _pre_load_count);
        }
        else return true;
    },
}

var Scene = {
    tiles : {},
    objects : {},
    init : function(map)
    {
        this.camera = new Pos(0,0);
        this.width  = map[0].length;
        this.height = map.length;
        this.tiles = new Array (this.height);
        for(var i = 0; i < this.height; i++){
            this.tiles[i] = new Array(this.width);
        }
    },
    //Установка тайла
    set_tile : function(tile, pos)
    {
        this.tiles[pos.y][pos.x] = tile;
    },
    //Добавления объекта
    add_object : function(key,obj)
    {
        this.objects[key] = obj;
    }
}

document.onkeydown = function key_down(event)
{
    Engine.keyboardEvent = event;
}
