const db = config.db;
document.getElementById('registerButton').addEventListener('click', () => {
    // 获取用户输入的用户名和密码
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log(username);
    BackEnd = config.backEndApi;
  
    // 发送注册请求
    fetch(BackEnd + '/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then(response => response.json())
      .then(data => {
        // 处理注册结果
        console.log(data);
        alert(data.message); // 弹出注册结果消息
      })
      .catch(error => console.error('Error:', error));
  });
  
  document.getElementById('loginButton').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // console.log('Username:', username);
    // console.log('Password:', password);

    fetch(BackEnd + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    })
    .then(response => {
        // console.log('Response:', response);
        return response.json();
    })
    .then(data => {
        console.log('Login response:', data);
        console.log(data.success);
        // Check if login was successful
        if (data.success) {
            // Redirect to the next login page or any other desired page
            window.location.href = '../index.html';
            
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message);
    });
});
