var logout = document.getElementById('logout')
var itemName = document.getElementById('itemname')
var price = document.getElementById('price')
var image = document.getElementById('image')
var pi = document.getElementById('pi')
var addBtn = document.getElementById('addBtn')
var row = document.getElementsByClassName('row')[0]
var modalWrap = document.createElement('div');
var img_url;
var files;
var updURL;
var updFiles;
var pKey;
var obj;
var db = firebase.database();
var strg = firebase.storage();

// Get Files
image.addEventListener('click', function () {
    image.onchange = e => {
        files = e.target.files
        console.log(files)
    }
})
// Add data to database
async function addItem() {
    if (itemName.value.length > 0 && price.value.length > 0 && image.value.length > 0) {
        pKey = db.ref(`products/`).push().getKey();
        obj = {
            itemName: itemName.value,
            price: price.value,
            pKey: pKey
        }
        await db.ref(`products/${pKey}`).set(obj)

        var uploadTask = strg.ref(`images/${pKey}/${files[0].name}`).put(files[0])
        uploadTask.on("state_changed", (snapshot) => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is : ${progress.toFixed(2)}% Done`);
        }, (error) = {
            // Handle errors
        }, () => {
            uploadTask.snapshot.ref.getDownloadURL().then(async (productURL) => {
                img_url = productURL;
                // db.ref(`products/${pKey}/`).
                obj.image = img_url
                await db.ref(`products/${pKey}`).set(obj)
                window.location.reload()
            })
        })
    } else {
        alert('One or more field is null')
    }
}
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
                <a id="${v.pKey}" onclick="edit(this)" class="btn btn-sm btn-primary">Edit</a>
                <a id="${v.pKey}" onclick="del(this)" class="btn btn-sm btn-danger">Delete</a>
              </div>
            </div>
          </div>
            `
        })
    })
}

async function edit(e) {
    var editItemName;
    var editPrice;
    var editPkey;
    editPkey = e.getAttribute('id')
    await db.ref(`products/${editPkey}`).once('value', (snapshot) => {
        var data = snapshot.toJSON();
        editItemName = data.itemName
        editPrice = data.price
        // console.log(editItemName+" "+editPrice)
    })

    // setTimeout(() => {
    modalWrap.innerHTML = "";
    modalWrap.innerHTML = `
            <div class="modal fade" tabindex="-1">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Details</h5>
                        </div>
                        <div class="modal-body">
                            <div class="container w-75">
                                <h3 class="text-center mb-5">Product Details</h3>
                                <label for="in" class="form-label">Item Name</label>
                                <input type="text" class="form-control mb-1" id ="in" placeholder="Item Name" value="${editItemName}">
                                <label for="pp" class="form-label">Price</label>
                                <input type="text" class="form-control mb-1" id ="pp" placeholder="Product Price" value="${editPrice}">
                                <label for="pi" class="form-label">Image</label>
                                <input id="pi" key="${editPkey}" class="form-control my-2" onchange="getUpdImg(event,this)" type="file" accept="image/*" placeholder="Product Image">
                                <span class="text-info" id="updMsg">...</span>
                            </div>
                        </div>
                        <div class="modal-footer">
                           <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" id="${editPkey}" class="btn btn-success" onclick="update(this)">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>`
    document.body.appendChild(modalWrap);
    var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'));
    modal.show();
    // }, 1000);
}

async function getUpdImg(e,t) {
    var updMsg = document.getElementsByTagName('span')[0];
    updPKey = t.getAttribute('key')
    updFiles = e.target.files;
    // console.log(updFiles[0])
    var uploadTask = strg.ref(`images/${updPKey}/${updFiles[0].name}`).put(updFiles[0])
    uploadTask.on("state_changed", (snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        updMsg.innerHTML = `Product image upload is : ${progress.toFixed(2)}% Done`;
    }, (error) = {
        // Handle errors
    }, () => {
        uploadTask.snapshot.ref.getDownloadURL().then(async (productURL) => {
            updURL = productURL;
            // console.log(updURL)
        })
    })
}

async function update(e) {
    var updItemName = document.getElementById('in').value
    var updPrice = document.getElementById('pp').value
    var updPKey = e.getAttribute('id')
    var currImage;
    await db.ref(`products/${updPKey}`).once('value', (snapshot) => {
        currImage = snapshot.toJSON().image
    })
    var updObj = db.ref(`products/${updPKey}`)
    if(updItemName.length > 0 && updPrice.length> 0){
        await updObj.update({
            itemName : updItemName,
            price : updPrice,
            image : updURL == undefined ? currImage : updURL
        })
        window.location.reload()
    }else{
        alert('All fields are required')
    }
}

function del(e) {
    var delPKey = e.getAttribute('id')
    db.ref(`products/${delPKey}`).remove()
    e.parentNode.parentNode.parentNode.remove()

}

logout.addEventListener('click', function () {
    firebase.auth().signOut();
    localStorage.removeItem('uid')
    localStorage.removeItem('email')
    window.location.replace('index.html')
})