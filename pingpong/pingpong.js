		
		
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

		//Литеральная нотация player
		var player = {
			color: "#00A",
			x: 10,	y: 10,	raius: 10, 
			dx: 0, dy: 0,
			draw: function() {
				ctx.beginPath();
				ctx.fillStyle = this.color;
				ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();
				//Вектор инерции
				ctx.beginPath();
				ctx.moveTo(player.x, player.y);
				ctx.lineTo(player.x+player.dx, player.y+player.dy);
				ctx.stroke();

			}
		};
		
		var bot = {
			color: "#AA0",
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
		
		var ball = {
			color: "#333",
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
		

		// FPS
		var previous = [];
		
		// Функция расчета расчета FPS
		function computeFPS() {
			var stats = document.getElementById("stats");
			if (previous.length > 60) 
			{
				previous.splice(0, 1);
			}
			var start = (new Date).getTime();
			previous.push(start);
			var sum = 0.0000001;
			for (var id = 0; id < previous.length - 1; id++) 
			{
				sum += previous[id + 1] - previous[id];
			}
			var diff = 1000.0 / (sum / previous.length);

			stats.innerHTML = diff.toFixed() + " fps";
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
			ball.dy = 0;
			ball.dx = 0;
			if (lastLosed)
				ball.x = player.x+r; 
			else 
				ball.x = bot.x-r; 
		}
		

		// Перерасчет
		function calc() {
			//Расчет FPS
			computeFPS();
			// торможение
			ball.dx *= friction;
			ball.dy *= friction;
			// шар
			ball.x += ball.dx*2; 
			ball.y += ball.dy*2;
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
			// удар с мячом
			rast = Math.sqrt((player.x-ball.x)*(player.x-ball.x)+(player.y-ball.y)*(player.y-ball.y));
			if (rast<ball.radius+player.radius) {
				var proekp, proekb;
				proekp = (player.dx*(ball.x-player.x) + player.dy*(ball.y-player.y))/rast;
				proekb = (ball.dx*(player.x-ball.x) + ball.dy*(player.y-ball.y))/rast;
				ball.dx -= 2*ball.dx*proekb/rast
				ball.dy -= 2*ball.dy*proekb/rast
				ball.dx += (ball.x-player.x)*proekp/rast;
				ball.dy += (ball.y-player.y)*proekp/rast;
				ball.x = player.x + (ball.x-player.x)/rast*(ball.radius+player.radius) + ball.dx;
				ball.y = player.y + (ball.y-player.y)/rast*(ball.radius+player.radius) + ball.dy;
			}
			if(ball.dx > 10) ball.dx = 10; 
			if(ball.dy > 10) ball.dy = 10; 

			// компьютер
			var angle = Math.atan((ball.y-h/2)/(ball.x-w+r));
			var x=1,y=0,X,Y;
			X=x*Math.cos(angle)-y*Math.sin(angle);
			Y=y*Math.cos(angle)-x*Math.sin(angle);
			//Точка куда должен идти бот
			var px=w-r-X*h/4, py=h/2+Y*h/4;		
	
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
				bot.dx=Speed*Math.cos(Direction); bot.dy=Speed*Math.sin(Direction);
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
				bot.dx=Speed*Math.cos(Direction); bot.dy=Speed*Math.sin(Direction);
			}
							
			bot.x += bot.dx;
			bot.y += bot.dy;
			
			// стенки
			if (bot.x > w-player.radius) {
				bot.x = w-player.radius;
				bot.dx = 0;
			}
			/* стенки по Y не в учёт
			if (bot.y<player.radius) {
				bot.y = player.radius;
				bot.dy = 0;
			}
			if (bot.y>h-player.radius) {
				bot.y = h-player.radius;
				bot.dy = 0;
			}
			*/
			// ограничитель
			/* ограничитель для бота нах нада
			var rast;
			rast = Math.sqrt((bot.x-w)*(bot.x-w)+(bot.y-h/2)*(bot.y-h/2));
			if (rast>h/2-player.radius) {
				var cosa, sina;
				cosa = (bot.x-w)/rast;
				bot.x = w + cosa*(h/2-player.radius);
				sina = (bot.y-h/2)/rast;
				bot.y = h/2 + sina*(h/2-player.radius);
				bot.dx = 0;
				bot.dy = 0;
			}
			*/
			// удар с мячом
			rast = Math.sqrt((bot.x-ball.x)*(bot.x-ball.x)+(bot.y-ball.y)*(bot.y-ball.y));
			if (rast<ball.radius+player.radius) {
				var proekp, proekb;
				proekp = (bot.dx*(ball.x-bot.x) + bot.dy*(ball.y-bot.y))/rast;
				proekb = (ball.dx*(bot.x-ball.x) + ball.dy*(bot.y-ball.y))/rast;
				ball.dx -= 2*ball.dx*proekb/rast
				ball.dy -= 2*ball.dy*proekb/rast
				ball.dx += (ball.x-bot.x)*proekp/rast;
				ball.dy += (ball.y-bot.y)*proekp/rast;
				ball.x = bot.x + (ball.x-bot.x)*rast/(ball.radius+player.radius) + ball.dx;
				ball.y = bot.y + (ball.y-bot.y)*rast/(ball.radius+player.radius) + ball.dy;
			}
			// в центре c почти нулевой скоростью?
			if (ball.dx*ball.dx+ball.dy*ball.dy<0.01)
				if(((ball.x-w)*(ball.x-w)+(ball.y-h/2)*(ball.y-h/2)>=(h/2-player.radius)*(h/2+ball.radius))&&
				   ((ball.x-1)*(ball.x-1)+(ball.y-h/2)*(ball.y-h/2)>=(h/2-player.radius)*(h/2+ball.radius))
				  ) Init();
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
			player.dx = mx - player.x;
			player.dy = my - player.y;
			player.y = my;
			player.x = mx;
		}
