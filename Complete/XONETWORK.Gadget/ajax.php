<?
mysql_connect ("sql302.500mb.net", "runet_11844618", "qwerty");
mysql_select_db("runet_11844618_users");
$table = "status"; 	// <------------------------------------ таблица status
$tbl_turn = "turn";  	// <------------------------------------ таблица turn
switch($_POST['op'])
{
	case 'idchoise':
		$id = $_POST['id'];
		$query = "SELECT * FROM `$table` WHERE `id` = $id";  
		$res = mysql_query($query);
		$count = mysql_num_rows($res);
		if($count == 1)
		{
			if($id == 1)
			{
				mysql_query("UPDATE `$tbl_turn` SET `turn` = 1");
			}
			$data = "Игрок $id уже занят";
			$array = array("op" => $_POST['op'], "data" => $data, "access" => false);
			echo json_encode($array);
			
		}
		else
		{
			$now = date("Y-m-d H:i:s");
			$query = "INSERT INTO `$table`(`id`, `activedate`) VALUES ('$id','$now')";
			mysql_query($query);
			
			$data  = "<canvas id='XO' width='91' height='91' onclick='userClick(event);'>";
			$data .= "Извините у вас не поддерживается HTML5 =(";
			$data .= "</canvas>";
			$data .= "<input type='hidden' id=$id turn='0'>";
			$array = array("op" => $_POST['op'], "data" => $data, "access" => true, "id" => $id);
			echo json_encode($array);
		}
	break;
	case 'call':
		$query = "SELECT * FROM `$table`";  
		$res = mysql_query($query);
		while($row = mysql_fetch_assoc($res))
		{
			$date1 = strtotime($row['activedate']);  //В базе
			$date2 = strtotime("now"); 		//Текущее
			if($date2 - $date1 > 10)  //Если не было действий от пользователя 1 мин
			{
				$query = "DELETE FROM `$table` WHERE `id` = " . $row['id'];
				mysql_query($query);
			}
		}
		$query = "SELECT * FROM `$tbl_turn`";
		$res = mysql_query($query);
		$row = mysql_fetch_assoc($res);
		$turn = $row['turn'];
		$array = array("op" => $_POST['op'], "turn" => $turn, 
			"ij00"=> $row['ij00'], "ij01"=> $row['ij01'], "ij02"=> $row['ij02'], 	
			"ij10"=> $row['ij10'], "ij11"=> $row['ij11'], "ij12"=> $row['ij12'], 
			"ij20"=> $row['ij20'], "ij21"=> $row['ij21'], "ij22"=> $row['ij22']);
		echo json_encode($array);
	break;
	case 'step':
		$id = $_POST['id'];
		if($id == 1) mysql_query("UPDATE `$tbl_turn` SET `turn` = 2");
		if($id == 2) mysql_query("UPDATE `$tbl_turn` SET `turn` = 1");
		mysql_query("UPDATE `$tbl_turn` SET 
			`ij00`= ".$_POST['ij00'].", `ij01`= ".$_POST['ij01'].", `ij02`= ".$_POST['ij02'].", 	
			`ij10`= ".$_POST['ij10'].", `ij11`= ".$_POST['ij11'].", `ij12`= ".$_POST['ij12'].", 
			`ij20`= ".$_POST['ij20'].", `ij21`= ".$_POST['ij21'].", `ij22`= ".$_POST['ij22']);
		$array = array("op" => $_POST['op'], "id" => $id);
		echo json_encode($array);
	break;
	case 'restart':
		$id = $_POST['id'];
		mysql_query("UPDATE `$tbl_turn` SET `turn` = 1,
			`ij00`= 0, `ij01`= 0, `ij02`= 0, 	
			`ij10`= 0, `ij11`= 0, `ij12`= 0, 
			`ij20`= 0, `ij21`= 0, `ij22`= 0");
		$array = array("op" => $_POST['op']);
		echo json_encode($array);	
	break;
}

?>