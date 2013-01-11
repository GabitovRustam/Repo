jQuery(document).ready(function($) {
	var rows, cols;
	var steps;
	var user_guide = true;
	var i,j;
	var mode = 0;
	var field;
	
	function Checkfield()
	{	
		var win = true;
		$("td").each(function(){
			var content = $(this).html();
			if(content == ""){ win = false; return; }
		});
		if(win){ alert("Маладэс! Справился за "+steps+" ходов"); $("#newgame-btn").click(); }
	}
	
	function Turn(elem)
	{
		var content = $(elem).html();
		
		if(content == "")
		{
			$(elem).html("X");
		}
		else 
		{
			$(elem).html("");
		}
		
	}
	
	function SetFalse(elem)
	{
		$(elem).html("");
	}
	
	function init(mod,row,col)
	{
		if(user_guide){ user_guide = false; alert("Заполни поле крестиками"); }
		mode = mod;
		rows = row;
		cols = col;
		steps = 0;
		field = new Array(rows);
		for(var i=0;i<rows;i++){ field[i] = new Array(cols); }
		
		
		var table="<table>";
		for(i=0;i<rows;i++)
		{
			table+="<tr>";
			for(j=0;j<cols;j++)
			{
				var b = j+cols*i;
				table+="<td id="+b+"></td>";
			}
			table+="</tr>";
		}
		table+="</table>";
		$("#field").html(table);
		$("#field").append("Ходов: <span id='steps'>0</span>");
	}

	$("#newgame-btn").click(function(){
		var mod = $(":radio[name=mode]:checked").val();
		var row = 6;
		var col = 6;
		init(mod,row,col);
	});
	
	$("td").live('click',function(){ 
		var id = $(this).attr('id');
		
		if(mode == 1){
			var center,left,right,up,down;
			center = id-0;
			left = center-1;
			if(center%cols == 0) left = -1; 
			right = center+1;
			if(center%cols == cols-1) right = -1; 
			up = center-cols;
			 down = center+cols;
			Turn("#"+center);	//Центральный
			Turn("#"+left); 	//Левый
			Turn("#"+right); 	//Правый
			Turn("#"+up);	 	//Верхний
			Turn("#"+down); 	//Нижний
		}
		if(mode == 2)
		{
			var center,r,c;
			var elem;
			center = id-0;
			r = Math.floor(center/cols);
			c = center%cols;
			Turn("#"+id);
			for(var i=0;i<rows;i++){ elem = r*cols+i; Turn("#"+elem); }
			Turn("#"+c);
			for(var i=1;i<cols;i++){ elem = i*cols+c; Turn("#"+elem); }
		}
		steps++;
		$("#steps").text(steps);
		Checkfield();
	}); 
});