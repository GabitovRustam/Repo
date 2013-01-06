var Level = new GameState();
var cur_Level = 1;
Level.init = function()
{
    switch (cur_Level){
    case 1:
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
            new Array(1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
            new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1)
        );
        //Загрузим игрока
        var player = new PlayerObject(new Pos(1, 1));
        Scene.add_object('player',player);
        break;

    case 2:
        var map = new Array(
            new Array(1,1,1,1,1),
            new Array(1,0,0,9,1),
            new Array(1,1,1,1,1)
        );
        Scene.objects.player.pos = new Pos(1,1);

        break;

    default:
        set_next_state(STATE.END);
        return;

    }

    //Загрузка элементов
    Scene.init(map);
    for(var y = 0; y < Scene.height; y++){
        for(var x = 0; x < Scene.width; x++){
            //Определяем тайлы на карте
            var elem = TILE[map[y][x]];
            tile = new Tile(elem);
            Scene.set_tile(tile, new Pos(x, y));
        }
    }


}

Level.handle_events = function()
{
    if(Engine.keyboardEvent){
        switch(Engine.keyboardEvent.keyCode){
        case KEYCODE.aup:
        case KEYCODE.w:
            Scene.objects.player.move_up();
            break;
        case KEYCODE.adown:
        case KEYCODE.s:
            Scene.objects.player.move_down();
            break;
        case KEYCODE.aleft:
        case KEYCODE.a:
            Scene.objects.player.move_left();
            break;
        case KEYCODE.aright:
        case KEYCODE.d:
            Scene.objects.player.move_right();
            break;
        case KEYCODE.space: Scene.objects.player.interaction();
            break;
        //case KEYCODE.a : set_next_state(STATE.EXIT);
        //    break;
        }
        Engine.keyboardEvent = null;
    }

}

Level.logic = function()
{
    var lastPlayerPos = new Pos(Scene.objects.player.pos.x,Scene.objects.player.pos.y);
    var playerPos = Scene.objects.player.pos;


    //Двигаемся по заданному направлению
    playerPos.add(Scene.objects.player.delta.x, Scene.objects.player.delta.y);

    //Если непроходимый тайл, двигаемся обратно
    if(!Scene.tiles[playerPos.y][playerPos.x].pass)
        playerPos.add(-Scene.objects.player.delta.x, -Scene.objects.player.delta.y);
    Scene.objects.player.delta = new Pos(0,0);

    //Проверка на выход из уровня
    if( Scene.tiles[playerPos.y][playerPos.x].resourceId == 'exit'){
        cur_Level++;
        this.init();
        return;
    }

    //Открываем пространство которое видит игрок
    view(playerPos,Scene.objects.player.viewDist);
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
    //Сдвиги камеры
    var camDx = Math.floor(Field.width/3);
    var camDy = Math.floor(Field.height/3);
    //Двигаем камеру
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
    } //Scene.width > Field.width - если карта полностью влезла в окно
    if( Scene.camera.x > Scene.width - Field.width && Scene.width > Field.width ){
        Scene.camera.x = Scene.width - Field.width;
    }
    if( Scene.camera.y > Scene.height - Field.height && Scene.width > Field.width ){
        Scene.camera.y = Scene.height - Field.height;
    }
}

Level.render = function()
{
    //clear_screen();
    Field.context.clearRect(0, 0, Field.canvas.width, Field.canvas.height);
    //show_background();
    Field.context.drawImage(Resource.resources.background,
        Scene.camera.x * Field.tile_size, Scene.camera.y * Field.tile_size,
        Scene.width * Field.tile_size, Scene.height * Field.tile_size,
        0, 0, Field.canvas.width, Field.canvas.height);

    //Рамка
    Field.context.strokeStyle = '#000';
    Field.context.strokeRect(0, 0, Field.canvas.width, Field.canvas.height);

    //show_objects();
    //Отрисовка тайлов
    var size = Field.tile_size;
    for(var y = Scene.camera.y, yloc = 0; y < Field.height + Scene.camera.y && y < Scene.height; y++, yloc++){
        for(var x = Scene.camera.x, xloc = 0; x < Field.width + Scene.camera.x && x < Scene.width; x++, xloc++){
            if(Scene.tiles[y][x].visible){
                Field.context.drawImage(Resource.resources[Scene.tiles[y][x].resourceId], xloc*size, yloc*size, size, size);
                Scene.tiles[y][x].visible = false;
            }
        }
    }
    //Отрисовка объектов
    for(key in Scene.objects){
        if(Scene.objects[key].resourceId == "empty") continue;
        Field.context.drawImage(Resource.resources[Scene.objects[key].resourceId], (Scene.objects[key].pos.x - Scene.camera.x) * size, (Scene.objects[key].pos.y - Scene.camera.y) * size, size, size);
    }
}
