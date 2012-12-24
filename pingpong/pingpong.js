		
		
		// Поле для рисования
		var canvas;
		// Контекст для рисования
		var ctx;
		// Размеры, коэффициенты и радиус мяча для прорисовки
		var h, w, dh, dw, r, topv, botv;
		// Расположение и скорость игрока, компьютера, мяча
		var pldx, pldy, aidx, aidy, bdx, bdy;
		// Кто последним проиграл - у того мяч при инициализации 
		var lastLosed;
		// Коэффициент торможения
		var friction = 0.995;
		//
		var win=0,lose=0;
		
		var player = {
			color: "#00A",
			x: 10,	y: 10,	raius: 10, 
			draw: function() {
				ctx.beginPath();
				ctx.fillStyle = this.color;
				ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();

			}
		};
		
		var bot = {
			color: "#AA0",
			x: 10,	y: 10,	raius: 10, 
			draw: function() {
				ctx.beginPath();
				ctx.fillStyle = this.color;
				ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();	
			}
		};
		
		var ball = {
			color: "#333",
			x: 10,	y: 10,	raius: 10, 
			draw: function() {
				ctx.beginPath();
				ctx.fillStyle = this.color;
				ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();	
			}
		};
		
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
			ball.radius = r/3;   
			player.radius = r/2; 
			bot.radius = r/2;
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
			ctx.beginPath();
			ctx.moveTo(player.x, player.y);
			ctx.lineTo(player.x+pldx, player.y+pldy);
			ctx.stroke();

		}
		
		// Инициализация новой игры
		function Init() {
			document.getElementById("score").innerText = win+':'+lose;
			clearField();
			player.x = r;   
			player.y = h/2; 
			bot.x = w-r; 	
			bot.y = h/2; 	
			ball.y = h/2; 	
			bdy = 0;
			bdx = 0;
			if (lastLosed)
				ball.x = player.x+r; 
			else 
				ball.x = bot.x-r; 
		}
		

		// Перерасчет
		function calc() {
			// торможение
			bdx *= friction;
			bdy *= friction;
			// шар
			ball.x += bdx*2; 
			ball.y += bdy*2;
			// стенки
			if (ball.y < ball.radius) {
				bdy = -bdy;
				ball.y = ball.radius;
			}
			if (ball.y > h - ball.radius) {
				bdy = -bdy;
				ball.y = h - ball.radius;
			}
			// условия проигрыша
			if (ball.x < ball.radius) {
				bdx = -bdx;
				ball.x = ball.radius;
				if (ball.y > topv + ball.radius && ball.y < botv - ball.radius) {
					lose++;
					lastLosed = true;
					Init();
				}
			}
			// условия выйгрыша
			if (ball.x > w - ball.radius) {
				bdx = -bdx;
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
				pldx = 0;
			}
			if (player.y < player.radius) {
				player.y = player.radius;
				pldy = 0;
			}
			if (player.y > h - player.radius) {
				player.y = h - player.radius;
				pldy = 0;
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
				pldx = 0;
				pldy = 0;
			}
			// удар с мячом
			rast = Math.sqrt((player.x-ball.x)*(player.x-ball.x)+(player.y-ball.y)*(player.y-ball.y));
			if (rast<ball.radius+player.radius) {
				var proekp, proekb;
				proekp = (pldx*(ball.x-player.x) + pldy*(ball.y-player.y))/rast;
				proekb = (bdx*(player.x-ball.x) + bdy*(player.y-ball.y))/rast;
				bdx -= 2*bdx*proekb/rast
				bdy -= 2*bdy*proekb/rast
				bdx += (ball.x-player.x)*proekp/rast;
				bdy += (ball.y-player.y)*proekp/rast;
				ball.x = player.x + (ball.x-player.x)/rast*(ball.radius+player.radius) + bdx;
				ball.y = player.y + (ball.y-player.y)/rast*(ball.radius+player.radius) + bdy;
			}

			// компьютер
			var angle = Math.atan((ball.y-h/2)/(ball.x-w+r));
			var x=1,y=0,X,Y;
			X=x*Math.cos(angle)-y*Math.sin(angle);
			Y=y*Math.cos(angle)-x*Math.sin(angle);
			//Точка куда должен идти бот
			var px=w-r-X*h/4, py=h/2+Y*h/4;
			/*
			 //дебуг
			ctx.fillText(angle, 120, 20);
			ctx.fillText(X, 120, 40);
			ctx.fillText(Y, 120, 60);
			
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(w-r,h/2);
			ctx.lineTo(px,py);
			ctx.stroke();
			*/
			
	
			var rightx=w, righty=h/2;												
			if(Math.sqrt((ball.x-rightx)*(ball.x-rightx)+(ball.y-righty)*(ball.y-righty)) > h/2-ball.radius) /*шарик вне зоны ограничителя*/
			{ 	//Скорость бота .001 для предотвращения деления на 0 гдетотам
				var Speed = 2.0001;
				var Distx,Disty;
				Distx=Math.abs(px-bot.x);
				Disty=Math.abs(py-bot.y);
				if(Distx+Disty < 1) Speed = 0.1;
				var Direction=Math.atan(Disty/Distx);
				if(px<bot.x) Direction=-Direction+Math.PI;
				if(py<bot.y) Direction=-Direction;
				aidx=Speed*Math.cos(Direction); aidy=Speed*Math.sin(Direction);
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
				aidx=Speed*Math.cos(Direction); aidy=Speed*Math.sin(Direction);
			}
							
			//aidx = 5-Math.random()*10;
			//aidy = 5-Math.random()*10;
			bot.x += aidx;
			bot.y += aidy;
			
			// стенки
			if (bot.x>w-player.radius) {
				bot.x = w-player.radius;
				aidx = 0;
			}
			/* стенки по Y не в учёт
			if (bot.y<player.radius) {
				bot.y = player.radius;
				aidy = 0;
			}
			if (bot.y>h-player.radius) {
				bot.y = h-player.radius;
				aidy = 0;
			}
			*/
			// ограничитель
			var rast;
			rast = Math.sqrt((bot.x-w)*(bot.x-w)+(bot.y-h/2)*(bot.y-h/2));
			if (rast>h/2-player.radius) {
				var cosa, sina;
				cosa = (bot.x-w)/rast;
				bot.x = w + cosa*(h/2-player.radius);
				sina = (bot.y-h/2)/rast;
				bot.y = h/2 + sina*(h/2-player.radius);
				aidx = 0;
				aidy = 0;
			}
			// удар с мячом
			rast = Math.sqrt((bot.x-ball.x)*(bot.x-ball.x)+(bot.y-ball.y)*(bot.y-ball.y));
			if (rast<ball.radius+player.radius) {
				var proekp, proekb;
				proekp = (aidx*(ball.x-bot.x) + aidy*(ball.y-bot.y))/rast;
				proekb = (bdx*(bot.x-ball.x) + bdy*(bot.y-ball.y))/rast;
				bdx -= 2*bdx*proekb/rast
				bdy -= 2*bdy*proekb/rast
				bdx += (ball.x-bot.x)*proekp/rast;
				bdy += (ball.y-bot.y)*proekp/rast;
				ball.x = bot.x + (ball.x-bot.x)*rast/(ball.radius+player.radius) + bdx;
				ball.y = bot.y + (ball.y-bot.y)*rast/(ball.radius+player.radius) + bdy;
			}
			// в центре c почти нулевой скоростью?
			if (((ball.x-w)*(ball.x-w)+(ball.y-h/2)*(ball.y-h/2)>=(h/2-player.radius)*(h/2+ball.radius))&&
				((ball.x-1)*(ball.x-1)+(ball.y-h/2)*(ball.y-h/2)>=(h/2-player.radius)*(h/2+ball.radius))&&
				(bdx*bdx+bdy*bdy<0.01))
				Init();
		}

		// Таймер
		function Timer() {
				// Очищаем поле
				clearField();
				// перерасчет всего
				calc();
				// Ниже выполняем рисование
				drawField();
				// вызовем себя же через некоторое время
				setTimeout(Timer, 1000/60);
		}
		
		function startCanvas() {
			canvas = document.getElementById('pingpong');
			
			// Проверяем понимает ли браузер canvas
			if (canvas.getContext) {
				ctx = canvas.getContext('2d'); // Получаем 2D контекст
				// Изначально мяч у игрока
				lastLosed = true;
				Init();
				Timer();	
			}
		}
		
		function userClick(event) {

			var my, mx;
			my = event.pageY - canvas.offsetTop;
			mx = event.pageX - canvas.offsetLeft;
			pldx = mx - player.x;
			pldy = my - player.y;
			player.y = my;
			player.x = mx;
		}
