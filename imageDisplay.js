// const mediaPath = 'http://localhost:8080/media/';
const mediaPath = 'media/';

async function loadJSON(path) {
    return  fetch(path, {
        // mode: 'no-cors',
        method: "GET"
    }
    )
    .then(res => {return res.json();})
    .then(json => {return json.pieces;})
    .catch(err => console.error(err));
}

async function getImage(path) {
    return fetch(path)
    .then(res => {return res;})
    .catch(err => {console.log(err);})
}

async function getFirstImage(path, folderPath) {
    console.log("first image starts with: " + folderPath);
    let mainPath = path + folderPath;
    locations = await loadJSON(mainPath+"/media.json");

    return getImage(mainPath+"/"+locations[0].path)
}

// for index.html
async function populateImageColumns() {
    const lc = document.getElementById("leftColumn")
    const rc = document.getElementById("rightColumn")
    let lcHeight = 0;
    let rcHeight = 0;

    let res = await loadJSON(mediaPath+"artworks.json");
    for (let i = 0; i < res.length; i++) {
        getFirstImage(mediaPath, res[i].folder) // we only need to load the first image from the artwork folders. The rest is shown on the artwork page
        .then(res => res.blob())
        .then(data => {
            let newImg = document.createElement("img");
            newImg.src = URL.createObjectURL(data);
            newImg.onload = function() {    // need to load the image before we do anything else
                let newText = document.createElement("a");  // image title
                newText.innerHTML = res[i].title;

                let newPiece = document.createElement("div");   // div wrapper
                newPiece.append(newImg)
                newPiece.append(newText);
                
                newPiece.onclick = function() {     // for changing to single view
                    window.localStorage.setItem('title', (res[i].title+""));
                    window.localStorage.setItem('folder', (res[i].folder+""));
                    window.location.href=("artwork.html");
                };

                // add the new div to the column with the lowest current height
                if (lcHeight <= rcHeight) {
                    lc.append(newPiece);
                    lcHeight += newImg.height;
                }
                else {
                    rc.append(newPiece);
                    rcHeight += newImg.height;
                }
            }
        })
    }
}

// for artwork.html
async function populateArtwork() {
    let folderPath = mediaPath + window.localStorage.getItem('folder');
    let artworkTitle = window.localStorage.getItem('title');
    let artworkDescription = await fetch(folderPath + "/description.txt")
                             .then((res) => {if (res.ok) {return res.text();} else {return "no description";}})        

    // adding title and description to the page
    const pageTitle = document.getElementById("artworkTitle");
    pageTitle.innerHTML = artworkTitle;
    const pageDescription = document.getElementById("artworkDescription");
    
    pageDescription.innerHTML = artworkDescription;

    // adding artwork to the page
    const col = document.getElementById("column");
    let paths = await loadJSON(folderPath+"/media.json");
    for (let i = 0; i < paths.length; i++) {
        getImage(folderPath+"/"+paths[i].path)
        .then(res => res.blob())
        .then(data => {
            let newImg = document.createElement("img");
            newImg.src = URL.createObjectURL(data);
            newImg.onload = function() {    // need to load the image before we do anything else
                let newText = document.createElement("a");  // image title
                newText.innerHTML = paths[i].title;

                let newPiece = document.createElement("div");   // div wrapper
                newPiece.append(newImg)
                newPiece.append(newText);

                col.append(newPiece);
            }
        })
    }
}