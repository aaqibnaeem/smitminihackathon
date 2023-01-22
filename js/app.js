// console.log(firebase.database())
var username = document.getElementById("username")
var email = document.getElementById("email")
var password = document.getElementById("password")
var signup = document.getElementById("signup")
var signin = document.getElementById("signin")
var signout = document.getElementById("signout")
var role = document.getElementById('userRole')
var uid;
signup.addEventListener("click", function () {
    if (role.value !== "none" && username.value.length > 0) {
        firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
            .then(async (user) => {

                localStorage.setItem("email", email.value)
                localStorage.setItem("uid", user.user.uid)

                var obj = {
                    username: username.value,
                    email: email.value,
                    password: password.value,
                    role: role.value,
                    uid: user.user.uid
                }

                await firebase.database().ref("users/").child(user.user.uid).set(obj)
                console.log(obj)

                firebase.auth().signInWithEmailAndPassword(email.value, password.value)
                    .then((user) => {
                        uid = user.user.uid
                        firebase.database().ref(`users/${uid}`).once('value',(snapshot)=>{
                            var data = snapshot.toJSON()
                            var role = data.role;
                        
                            if(role == 'admin'){
                                window.location.replace('./admin.html')
                            }else if(role == 'user'){
                                window.location.replace('./user.html')
                            }else{
                                alert('Error Occured')
                            }
                        })

                    })
                    .catch((err) => {
                        alert(err.message)
                    })

            })
            .catch((e) => {
                alert(e.message)
            })
    } else {
        alert(' Role selection is mandatory \n Or \n Invalid username')
    }

})


signin.addEventListener("click", function () {
    firebase.auth().signInWithEmailAndPassword(email.value, password.value)
        .then((user1) => {

            uid = user1.user.uid
            localStorage.setItem("uid", user1.user.uid)
            localStorage.setItem("email", user1.user.email)

            firebase.database().ref(`users/${uid}`).once('value', (snapshot) => {
                var data = snapshot.toJSON()
                var role = data.role;

                if (role == 'admin') {
                    window.location.replace('./admin.html')
                } else if (role == 'user') {
                    window.location.replace('./user.html')
                } else {
                    alert('Error Occured')
                }
            })
        })
        .catch((err) => {
            alert(err.message)
        })
})
