function loadLoginForm() {
    var loginHtml = `
        <div class="form">
          <h4>LOG IN</h4>
            <p>
              <label for="username">USERNAME</label>
              <input name="username" id="username" title="USERNAME" maxlength="25" type="text" size="40" autofocus />
            </p>
            <p>
              <label for="password">PASSWORD</label>
              <input name="password" id="password" autocomplete="off" type="password" maxlength="50" size="40" />
            </p>
            <div class="btn">
              <input id="submit_btn" type="submit" value="Login" />
            </div>
        </div>
        `;
    document.getElementById('login_area').innerHTML = loginHtml;
    
    var submit = document.getElementById('submit_btn');
    submit.onclick = function() {
        //make a request to the server and send the name
        //create a request object.
        var request = new XMLHttpRequest();
        
        //capture the response and store it in a variable.
        request.onreadystatechange = function() {
            if(request.readyState === XMLHttpRequest.DONE)
            {
                //take some action
                if(request.status === 200)
                {
                    submit.value = 'Sucess!';
                    location.reload();
                } else if (request.status === 403) {
                    submit.value = 'Invalid credentials. Try again?';
                } else if (request.status === 500) {
                    alert('Something went wrong on server side');
                    submit.value = 'Login';
                }
                else {
                    alert('Something went wrong on the server');
                    submit.value = 'Login';
                }
                loadLogin();
            }
        };
        //make a request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        //var name = nameInput.value;
        console.log(username);
        console.log(password);
        //request.open('GET', 'http://abhishek1036cse16.imad.hasura-app.io/submit-name?name=' + name, true);
        request.open('POST', '/login', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));
        submit.value = 'Logging in ....';
        //capture a list of names and render it as list
    };
}
//saravjeet.singh@chitkara.edu.in
/*
function loadLoggedInUser (username) {
    var loginArea = document.getElementById('login_area');
    loginArea.innerHTML = `
        <h3> Hi <i>${username}</i></h3>
        <a href="/logout">Logout</a>
        <div id="map" style="height:1000px"></div>
        <script>
            initMap()
        </script>
    `;
}
*/

function loadLogin() {
    // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                console.log('User logged in');
                //loadLoggedInUser(this.responseText);
            } else {
                loadLoginForm();
            }
        }
    };
    
    request.open('GET', '/check-login', true);
    request.send(null);
}

loadLoginForm();

