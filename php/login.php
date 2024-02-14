<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 获取用户提交的用户名和密码
    $username = $_POST["username"];
    $password = $_POST["password"];

    // 在实际项目中，这里应该连接数据库，验证用户名和密码
    // 这里简化为硬编码的用户名和密码
    $validUsername = "user";
    $validPassword = "password";

    if ($username == $validUsername && $password == $validPassword) {
        // 登录成功，可以跳转到其他页面
        header("Location: welcome.php");
        exit();
    } else {
        // 登录失败，返回错误信息
        echo "Invalid username or password.";
    }
}
?>
