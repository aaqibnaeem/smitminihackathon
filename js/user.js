var logout = document.getElementById('logout')
var row = document.getElementsByClassName('row')[0]


var db = firebase.database()
logout.addEventListener('click', function () {
    firebase.auth().signOut();
    localStorage.removeItem('uid')
    localStorage.removeItem('email')
    window.location.replace('index.html')
})
getData()
function getData() {
    db.ref(`products/`).once('value', (snapshot) => {
        var data = Object.values(snapshot.toJSON())
        row.innerHTML = ""
        data.map((v, i) => {
            row.innerHTML += `
            <div class="col-sm-6 col-md-4 col-lg-3 my-3">
            <div  class="card h-100">
              <img src="${v.image}" alt="productImg">
              <div class="card-body text-start">
                <h5 class="card-title">${v.itemName}</h5>
                <p class="card-text">${v.price}.</p>
              </div>
            </div>
          </div>
            `
        })
    })
}