var Intro = new GameState();

Intro.init = function()
{
    Resource.resources.intro_sound.play();
}

Intro.handle_events = function()
{
    if(Engine.keyboardEvent){
        set_next_state(STATE.LEVEL);
        Engine.keyboardEvent = null;
    }
}

Intro.logic = function()
{

}

Intro.render = function()
{
    Field.context.clearRect(0, 0, Field.canvas.width, Field.canvas.height);
    //Лого
    Field.context.drawImage(Resource.resources.logo,0,0);
    //Прэс эни батон
    Field.context.font = "30pt Arial";
    Field.context.lineWidth = 4;
    Field.context.textAlign = "center";
    var str = "Нажми любую клавишу";
    Field.context.strokeText(str,Field.canvas.width/2,Field.canvas.height/2);
}
