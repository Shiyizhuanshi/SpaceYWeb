<?php
// 检查用户是否已经登录，如果没有登录，则重定向回登录页面
session_start();
if (!isset($_SESSION["username"])) {
    header("Location: index.html");
    exit();
}

// 获取登录用户的用户名
$username = $_SESSION["username"];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
</head>
<body>
    <h1>Welcome, <?php echo $username; ?>!</h1>
    <p>This is your welcome page.</p>
    <p><a href="logout.php">Logout</a></p>
</body>
</html>
