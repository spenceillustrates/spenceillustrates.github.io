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

async function getImageWithIndex(path, folderPath, idx) {
    let mainPath = path + folderPath;
    locations = await loadJSON(mainPath+"/media.json");

    return getImage(mainPath+"/"+locations[idx].path)
}

// for index.html
async function populateImageRows() {
	const cc = document.getElementById("centralColumn");
	let res = await loadJSON(mediaPath+"artworks.json");
	
	let rowDiv = document.createElement("div");
	rowDiv.classList.add("rowContainer");
	for (let c = 0; c < res.length; c++){
		// row logic
		let currentCollage = res[c]["collage"];
		let spaceDiv = document.createElement("div");
		spaceDiv.style.width = "100%";
		spaceDiv.style.height = "50px";
		cc.append(spaceDiv);
		
		for (let i = 0; i < currentCollage.length; i++) {
			if (i % 2 == 0) {
				rowDiv = document.createElement("div");
				rowDiv.classList.add("rowContainer");
			}
			
			let newImg = document.createElement("img");
			newImg.classList.add("fade");
			
			let newText = document.createElement("a");  // image title (text not added until image is loaded)
			newText.classList.add("overlayed")
			
			let newPiece = document.createElement("div");   // div wrapper
			newPiece.append(newText);
			newPiece.onclick = function() {     // for changing to single view
				window.localStorage.setItem('title', (currentCollage[i].title+""));
				window.localStorage.setItem('folder', (currentCollage[i].folder+""));
				window.location.href=("artwork.html");
			};
		
			if (i == currentCollage.length-1 && currentCollage.length % 2 == 1) { // final image doesn't fit into row, center
				let tmpDiv = document.createElement("div");
				tmpDiv.style.float = "left";
				tmpDiv.style.width = "25%";
				rowDiv.append(tmpDiv);
				newPiece.style.float = "left";
			} 
			else if (i % 2 == 0) {	// first in the row, left
				newPiece.style.float = "left";
			}
			else {	// right
				newPiece.style.float = "right";
			}
			rowDiv.append(newPiece);
			
			// final row logic
			if (i % 2 == 1 || i == currentCollage.length-1) {
				cc.append(rowDiv);
			}
		
			selectedIndex = 0
			if (currentCollage[i].hasOwnProperty('altIndex')) {
				selectedIndex = currentCollage[i].altIndex
			}
			getImageWithIndex(mediaPath, currentCollage[i].folder, selectedIndex) // we only need to load the first image from the artwork folders. The rest is shown on the artwork page
			.then(res => res.blob())
			.then(data => {
				newImg.src = URL.createObjectURL(data);
				newImg.onload = function() {    // add image to div once loaded
					newText.innerHTML = currentCollage[i].title;
					newPiece.append(newImg);
				}
			})
		}
			
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
		if (paths[i].title != "DONOTSHOW") {
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
}