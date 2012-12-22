		// Поле для рисования
		var canvas;
		// Контекст для рисования
		var ctx;
		// Размеры, коэффициенты и радиус мяча для прорисовки
		var h, w, dh, dw, r, rball, rpl, topv, botv;
		// Расположение и скорость игрока, компьютера, мяча
		var plx, ply, pldx, pldy, aix, aiy, aidx, aidy, ballx, bally, bdx, bdy;
		// Кто последним проиграл - у того мяч при инициализации 
		var lastLosed;
		
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
			rball = r/4;
			rpl = r/2;
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
			ctx.strokeStyle = "black";
			ctx.beginPath();
			ctx.arc(ballx, bally, rball, 0, 2 * Math.PI, false);
			ctx.stroke();
			
			// пользователь
			ctx.strokeStyle = "black";
			ctx.beginPath();
			ctx.arc(plx, ply, rpl, 0, 2 * Math.PI, false);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(plx, ply);
			ctx.lineTo(plx+pldx, ply+pldy);
			ctx.stroke();
			
			// компьютер
			ctx.strokeStyle = "black";
			ctx.beginPath();
			ctx.arc(aix, aiy, rpl, 0, 2 * Math.PI, false);
			ctx.stroke();
		}
		
		// Инициализация новой игры
		function Init() {
			clearField();
			plx = r;
			ply = h/2;
			aix = w-r;
			aiy = h/2;
			bally = h/2;
			bdy = 0;
			bdx = 0;
			if (lastLosed)
				ballx = plx+r;
			else 
				ballx = aix-r;
		}
		
		// Перерасчет
		function calc() {
			// шар
			ballx += bdx;
			bally += bdy;
			// стенки
			if (bally<rball)
				bdy = -bdy;
			if (bally>h-rball)
				bdy = -bdy;
			// условия проигрыша
			if (ballx<rball) {
				bdx = -bdx;
				if (bally>topv+rball && bally<botv-rball) {
					lastLosed = true;
					Init();
				}
			}
			// условия выйгрыша
			if (ballx>w-rball) {
				bdx = -bdx;
				if (bally>topv+rball && bally<botv-rball) {
					lastLosed = false;
					Init();
				}
			}
			
			// пользователь
			// стенки
			if (plx<rpl) {
				plx = rpl;
				pldx = 0;
			}
			if (ply<rpl) {
				ply = rpl;
				pldy = 0;
			}
			if (ply>h-rpl) {
				ply = h-rpl;
				pldy = 0;
			}
			// ограничитель
			var rast;
			rast = Math.sqrt((plx-1)*(plx-1)+(ply-h/2)*(ply-h/2));
			if (rast>h/2-rpl) {
				var cosa, sina;
				cosa = (plx-1)/rast;
				plx = 1 + cosa*(h/2-rpl);
				sina = (ply-h/2)/rast;
				ply = h/2 + sina*(h/2-rpl);
				pldx = 0;
				pldy = 0;
			}
			// удар с мячом
			rast = Math.sqrt((plx-ballx)*(plx-ballx)+(ply-bally)*(ply-bally));
			if (rast<rball+rpl) {
				bdx = pldx;
				bdy = pldy;
			}

			// компьютер
			aidx = 5-Math.random()*10;
			aidy = 5-Math.random()*10;
			aix += aidx;
			aiy += aidy;
			// стенки
			if (aix>w-rpl) {
				aix = w-rpl;
				aidx = 0;
			}
			if (aiy<rpl) {
				aiy = rpl;
				aidy = 0;
			}
			if (aiy>h-rpl) {
				aiy = h-rpl;
				aidy = 0;
			}
			// ограничитель
			var rast;
			rast = Math.sqrt((aix-w)*(aix-w)+(aiy-h/2)*(aiy-h/2));
			if (rast>h/2-rpl) {
				var cosa, sina;
				cosa = (aix-w)/rast;
				aix = w + cosa*(h/2-rpl);
				sina = (aiy-h/2)/rast;
				aiy = h/2 + sina*(h/2-rpl);
				aidx = 0;
				aidy = 0;
			}
			// удар с мячом
			rast = Math.sqrt((aix-ballx)*(aix-ballx)+(aiy-bally)*(aiy-bally));
			if (rast<rball+rpl) {
				bdx = aidx;
				bdy = aidy;
			}
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
			my = event.clientY;
			mx = event.clientX;
			pldx = mx - plx;
			pldy = my - ply;
			ply = my;
			plx = mx;
		}
