function PlayerObject(pos){
    this.direction = 'right';
    this.pos = new Pos(pos.x, pos.y);

    // переназночение евентов
    this.eventKeyUp = function()
    { // стрелка вверх
        if(this.direction == 'up'){  //TODO: сделать проверку на выход за пределы границ
            this.pos.add(0, -1);
            //Если непроходимый тайл, двигаемся обратно
            if(!Scene.tiles[this.pos.y][this.pos.x].pass) this.pos.add(0, 1);
        }
        else this.direction = 'up';
    }
    this.eventKeyLeft = function()
    { // влево
        if(this.direction == 'left'){
            this.pos.add(-1, 0);
            if(!Scene.tiles[this.pos.y][this.pos.x].pass) this.pos.add(1, 0);
        }
        else this.direction = 'left';
    }
    this.eventKeyRight = function()
    { // вправо
        if(this.direction == 'right'){
            this.pos.add(1, 0);
            if(!Scene.tiles[this.pos.y][this.pos.x].pass) this.pos.add(-1, 0);
        }
        else this.direction = 'right';
    }
    this.eventKeyDown = function()
    { // вниз
        if(this.direction == 'down'){
            this.pos.add(0, 1);
            if(!Scene.tiles[this.pos.y][this.pos.x].pass) this.pos.add(0, -1);
        }
        else this.direction = 'down';
    }

    this.eventKeySpace = function(){ // пробел
        //Взаимодейтсвие с тайлом
    }

}
