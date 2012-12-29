		
		
		// Поле для рисования
		var canvas;
		// Контекст для рисования
		var ctx;
		// Размеры, коэффициенты и радиус мяча для прорисовки
		var h, w, dh, dw, r, topv, botv;
		// Кто последним проиграл - у того мяч при инициализации 
		var lastLosed;
		// Коэффициент торможения
		var friction = 0.995;
		// Победы/Поражения
		var win=0,lose=0;
		var fpsOut;
		//Литеральная нотация player
		var player = {
			color: "#00A",
			x: 10,	y: 10,	raius: 10, 
			dx: 0, dy: 0, tempx:0, tempy:0,
			imageSrc: "data/klushka_blue.png",
			imageObj: null,
			draw: function() {
				ctx.beginPath();
				//Текстура
				ctx.drawImage(this.imageObj,
						this.x-this.radius,this.y-this.radius,
						this.radius*2,this.radius*2);
				ctx.closePath();
				//Вектор инерции
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(this.x+this.dx, this.y+this.dy);
				ctx.stroke();
			},
			init: function(){
				this.imageObj = new Image();
				this.imageObj.src = this.imageSrc;
			},
			check_ball_collision: function()
			{
				rast = Math.sqrt((this.x-ball.x)*(this.x-ball.x)+(this.y-ball.y)*(this.y-ball.y));
				if (rast<ball.radius+this.radius) {
					var proekp, proekb;
					proekp = (this.dx*(ball.x-this.x) + this.dy*(ball.y-this.y))/rast;
					proekb = (ball.dx*(this.x-ball.x) + ball.dy*(this.y-ball.y))/rast;
					ball.dx -= 2*ball.dx*proekb/rast
					ball.dy -= 2*ball.dy*proekb/rast
					ball.dx += (ball.x-this.x)*proekp/rast;
					ball.dy += (ball.y-this.y)*proekp/rast;
					ball.x = this.x + (ball.x-this.x)/rast*(ball.radius+this.radius) + ball.dx;
					ball.y = this.y + (ball.y-this.y)/rast*(ball.radius+this.radius) + ball.dy;
				}
			}
		};

		var bot = {
			color: "#AA0",
			x: 10,	y: 10,	raius: 10,
			dx: 0, dy: 0,
			imageSrc: "data/klushka_red.png",
			imageObj: null,
			draw: function() {
				ctx.beginPath();
				//ctx.fillStyle = this.color;
				//ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
				//ctx.fill();
				//Текстура
				ctx.drawImage(this.imageObj,
						this.x-this.radius,this.y-this.radius,
						this.radius*2,this.radius*2);
				ctx.closePath();	
			},
			init: function(){
				this.imageObj = new Image();
				this.imageObj.src = this.imageSrc;
			},
			check_ball_collision: function()
			{
				rast = Math.sqrt((this.x-ball.x)*(this.x-ball.x)+(this.y-ball.y)*(this.y-ball.y));
				if (rast<ball.radius+this.radius) {
					var proekp, proekb;
					proekp = (this.dx*(ball.x-this.x) + this.dy*(ball.y-this.y))/rast;
					proekb = (ball.dx*(this.x-ball.x) + ball.dy*(this.y-ball.y))/rast;
					ball.dx -= 2*ball.dx*proekb/rast
					ball.dy -= 2*ball.dy*proekb/rast
					ball.dx += (ball.x-this.x)*proekp/rast;
					ball.dy += (ball.y-this.y)*proekp/rast;
					ball.x = this.x + (ball.x-this.x)/rast*(ball.radius+this.radius) + ball.dx;
					ball.y = this.y + (ball.y-this.y)/rast*(ball.radius+this.radius) + ball.dy;
				}
			}
		};
		
		var ball = {
			color: "#0A0",
			x: 10,	y: 10,	raius: 10, 
			dx: 0, dy: 0,
			draw: function() {
				ctx.beginPath();
				ctx.fillStyle = this.color;
				ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();	
			}
		};

		function BallToBallDetection(b1, b2) {
			//set the speed variables
			var xmov1 = b1.dx, ymov1 = b1.dy;
			var xmov2 = b2.dx, ymov2 = b2.dy;
			//set the position variables
			var xl1 = b1.x, yl1 = b1.y;
			var xl2 = b2.x, yl2 = b2.y;
			//define the constants
			var R = b1.radius+b2.radius; 
			var a = -2*xmov1*xmov2+xmov1*xmov1+xmov2*xmov2; 
			var b = -2*xl1*xmov2-2*xl2*xmov1+2*xl1*xmov1+2*xl2*xmov2; 
			var c = -2*xl1*xl2+xl1*xl1+xl2*xl2; 
			var d = -2*ymov1*ymov2+ymov1*ymov1+ymov2*ymov2; 
			var e = -2*yl1*ymov2-2*yl2*ymov1+2*yl1*ymov1+2*yl2*ymov2; 
			var f = -2*yl1*yl2+yl1*yl1+yl2*yl2; 
			var g = a+d; 
			var h = b+e; 
			var k = c+f-R*R; 
			//solve the quadratic equation
			var sqRoot = Math.sqrt(h*h-4*g*k);
			var t1 = (-h+sqRoot)/(2*g);
			var t2 = (-h-sqRoot)/(2*g);
			if (t1>0 && t1<=1) {
				var whatTime = t1;
				var ballsCollided = true;
			}
			
			if (t2>0 && t2<=1) {
				if (whatTime == null || t2<t1) {
					var whatTime = t2;
					var ballsCollided = true;
				}
			}
			if (ballsCollided) {
				//Collision has happened, so throw a trace
				Ball2BallReaction(b1, b2, b1.x, b2.x, b1.y, b2.y, whatTime) ;		
			}
			else b1.check_ball_collision();
		}
		
		function Ball2BallReaction(b1,b2,x1,x2,y1,y2,time){
			//найти массы
			var mass1 = 2;
			var mass2 = 1;
			//-----установить переменные начальных векторных скоростей
			var xVel1 = b1.dx;
			var yVel1 = b1.dy;
			var xVel2 = b2.dx;
			var yVel2 = b2.dy;
			var run = (x1-x2);
			var rise = (y1-y2);
			var Theta = Math.atan2(rise,run);
			var cosTheta = Math.cos(Theta);
			var sinTheta = Math.sin(Theta);
			//найти векторные скорости вдоль линии действия
			var xVel1prime = xVel1*cosTheta+yVel1*sinTheta;
			var xVel2prime = xVel2*cosTheta+yVel2*sinTheta;
			//найти векторные скорости, перпендикулярные линии действия
			var yVel1prime = yVel1*cosTheta-xVel1*sinTheta;
			var yVel2prime = yVel2*cosTheta-xVel2*sinTheta;
			//уравнения сохранения
			var P = (mass1*xVel1prime+mass2*xVel2prime);
			var V = (xVel1prime-xVel2prime);
			var v2f = (P+mass1*V)/(mass1+mass2);
			var v1f = v2f-xVel1prime+xVel2prime;
			var xVel1prime = v1f;
			var xVel2prime = v2f;
			//проецирование в систему координат Flash на оси x и y
			var xVel1 = xVel1prime*cosTheta-yVel1prime*sinTheta;
			var yVel1 = yVel1prime*cosTheta+xVel1prime*sinTheta;
			var xVel2 = xVel2prime*cosTheta-yVel2prime*sinTheta;
			var yVel2 = yVel2prime*cosTheta+xVel2prime*sinTheta;
			//изменение старой позиции
			
			//b1.x = b1.x+b1.dx*time;
			//b1.y = b1.y+b1.dy*time;
			b2.x = b2.x+b2.dx*time;
			b2.y = b2.y+b2.dy*time;
			
			//b1.dx = xVel1;
			//b1.dy = yVel1;
			b2.dx = xVel2;
			b2.dy = yVel2;
		}
				// Очистка поля
		function clearField() {
			//Перерасчитываем коэффициенты на случай, если изменились размеры
			w = canvas.width;
			h = canvas.height;
			dw = w/20;
			dh = h/20;
			if (w>h)
				r = dh;
			else
				r = dw;
			ball.radius = r/2;   
			player.radius = bot.radius = r; 
			topv = h/2 - 2*r;
			botv = h/2 + 2*r;
			
			// Очищаем поле
			ctx.lineWidth = "2";
			ctx.clearRect(0, 0, w, h);
		}
		
		// Прорисовка поля
		function drawField() {
			//Рамка
			ctx.strokeStyle = "black";
			ctx.beginPath();
			ctx.moveTo(1, topv);
			ctx.lineTo(1, 1);
			ctx.lineTo(w-1, 1);
			ctx.lineTo(w-1, topv);
			ctx.moveTo(1, botv);
			ctx.lineTo(1, h-1);
			ctx.lineTo(w-1, h-1);
			ctx.lineTo(w-1, botv);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(1, h/2, h/2, 0, 2 * Math.PI, false);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(w-1, h/2, h/2, 0, 2 * Math.PI, false);
			ctx.stroke();	
			// мяч
			ball.draw();
			// пользователь
			player.draw();
			// компьютер
			bot.draw();

		}
		
		// Инициализация новой игры
		function Init() {
			fpsOut = document.getElementById('fps');
			player.init();
			bot.init();
			document.getElementById("score").innerText = win+':'+lose;
			clearField();
			player.x = r;   
			player.y = h/2; 
			bot.x = w-r; 	
			bot.y = h/2; 	
			ball.y = h/2; 	
			ball.dy = 0;
			ball.dx = 0;
			if (lastLosed)
				ball.x = player.x+2*player.radius; 
			else 
				ball.x = bot.x-2*bot.radius; 
		}
		
		//Расчет FPS
		var filterStrength = 20;
		var frameTime = 0, lastLoop = new Date, thisLoop;
		function computeFPS(){
		  var thisFrameTime = (thisLoop=new Date) - lastLoop;
		  frameTime+= (thisFrameTime - frameTime) / filterStrength;
		  lastLoop = thisLoop;
		}
		setInterval(function(){
		  fpsOut.innerHTML = (1000/frameTime).toFixed(1) + " fps";
		},1000);
		
		
		// Перерасчет
		function calc() {

	// шар
			// движение
			ball.x += ball.dx; 
			ball.y += ball.dy;
			// торможение
			ball.dx *= friction;
			ball.dy *= friction;
			// стенки
			if (ball.y < ball.radius) {
				ball.dy = -ball.dy;
				ball.y = ball.radius;
			}
			if (ball.y > h - ball.radius) {
				ball.dy = -ball.dy;
				ball.y = h - ball.radius;
			}
			// условия проигрыша
			if (ball.x < ball.radius) {
				ball.dx = -ball.dx;
				ball.x = ball.radius;
				if (ball.y > topv + ball.radius && ball.y < botv - ball.radius) {
					lose++;
					lastLosed = true;
					Init();
				}
			}
			// условия выйгрыша
			if (ball.x > w - ball.radius) {
				ball.dx = -ball.dx;
				ball.x = w - ball.radius;
				if (ball.y > topv + ball.radius && ball.y < botv - ball.radius) {
					win++;
					lastLosed = false;
					Init();
				}
			}
			
	// пользователь
			// стенки
			if (player.x < player.radius) {
				player.x = player.radius;
				player.dx = 0;
			}
			if (player.y < player.radius) {
				player.y = player.radius;
				player.dy = 0;
			}
			if (player.y > h - player.radius) {
				player.y = h - player.radius;
				player.dy = 0;
			}
			// ограничитель
			var rast;
			rast = Math.sqrt((player.x-1)*(player.x-1)+(player.y-h/2)*(player.y-h/2));
			if (rast > h/2-player.radius) {
				var cosa, sina;
				cosa = (player.x-1)/rast;
				player.x = 1 + cosa*(h/2-player.radius);
				sina = (player.y-h/2)/rast;
				player.y = h/2 + sina*(h/2-player.radius);
				player.dx = 0;
				player.dy = 0;
			}
			player.dx = player.x - player.tempx;
			player.dy = player.y - player.tempy;
			player.tempx = player.x;
			player.tempy = player.y;
			// удар с мячом
			//player.check_ball_collision();
			BallToBallDetection(player,ball);
	// компьютер
			var angle = Math.atan((ball.y-h/2)/(ball.x-w+r));
			var x=1,y=0,X,Y;
			X=x*Math.cos(angle)-y*Math.sin(angle);
			Y=y*Math.cos(angle)-x*Math.sin(angle);
			//Точка куда должен идти бот
			var px=w-r-X*h/4, py=h/2+Y*h/4;		
	
			var rightx=w, righty=h/2;												
			if(Math.sqrt((ball.x-rightx)*(ball.x-rightx)+(ball.y-righty)*(ball.y-righty)) > h/2) /*шарик вне зоны ограничителя*/
			{ 	//Скорость бота .001 для предотвращения деления на 0 гдетотам
				var Speed = 2.0001;
				var Distx,Disty;
				Distx=Math.abs(px-bot.x);
				Disty=Math.abs(py-bot.y);
				if(Distx+Disty < 1) Speed = 0.1;
				var Direction=Math.atan(Disty/Distx);
				if(px<bot.x) Direction=-Direction+Math.PI;
				if(py<bot.y) Direction=-Direction;
				bot.dx=Speed*Math.cos(Direction); 
				bot.dy=Speed*Math.sin(Direction);
			}
			else 
			{
				var Speed = 4.0001;
				var Distx,Disty;
				Distx=Math.abs(ball.x-bot.x);
				Disty=Math.abs(ball.y-bot.y);
				var Direction=Math.atan(Disty/Distx);
				if(ball.x<bot.x) Direction=-Direction+Math.PI;
				if(ball.y<bot.y) Direction=-Direction;
				bot.dx=Speed*Math.cos(Direction); 
				bot.dy=Speed*Math.sin(Direction);
			}
							
			// стенка, у ворот
			if (bot.x > w-bot.radius) {
				bot.x = w-bot.radius;
				bot.dx = 0;
			}
			if(bot.y > h-bot.radius){ 
				bot.y = h/2;
			}
			
			bot.x += bot.dx;
			bot.y += bot.dy;
			
			// удар с мячом
			//bot.check_ball_collision();
			BallToBallDetection(bot,ball);
			//Ограничитель бешеного шарика
			if(ball.dx > 20) ball.dx = 20; 
			if(ball.dy > 20) ball.dy = 20; 
			// в центре c почти нулевой скоростью?
			if (ball.dx*ball.dx+ball.dy*ball.dy<0.01)
				if(((ball.x-w)*(ball.x-w)+(ball.y-h/2)*(ball.y-h/2)>=(h/2-player.radius)*(h/2+ball.radius))&&
				   ((ball.x-1)*(ball.x-1)+(ball.y-h/2)*(ball.y-h/2)>=(h/2-player.radius)*(h/2+ball.radius))
				  ) Init();
		}

		// Таймер
		setInterval(function(){
			//Расчет FPS
			computeFPS();
			// Очищаем поле
			clearField();
			// перерасчет всего
			calc();
			// Ниже выполняем рисование
			drawField();
		},1000/60);
		
		function startCanvas() {
			canvas = document.getElementById('pingpong');
			
			// Проверяем понимает ли браузер canvas
			if (canvas.getContext) {
				ctx = canvas.getContext('2d'); // Получаем 2D контекст
				// Изначально мяч у игрока
				lastLosed = true;
				Init();
			}
		}
		
		function userClick(event) {
			var my, mx;
			my = event.pageY - canvas.offsetTop;
			mx = event.pageX - canvas.offsetLeft;
			/*player.dx = mx - player.x;
			player.dy = my - player.y;
			player.x += player.dx;
			player.y += player.dy;*/
			player.x = mx;
			player.y = my;
		}
