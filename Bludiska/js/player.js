function PlayerObject(pos){
    this.resourceId = 'empty'; //Обязательное
    this.pos = new Pos(pos.x, pos.y); //Обязательная глобальная позиция
    this.viewDist = 1; //Дальность видимости
    this.direction = 'right';
    this.lpos = new Pos(0,0); //Локальная позиция
    this.delta = new Pos(0,0); //dx,dy, смещение игрока
    // переназночение евентов
    this.eventKeyUp = function() //TODO: сделать проверку на выход за пределы границ карты
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
