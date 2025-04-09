let db;
const request = indexDB.open("RecettesDB", 1);

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("Base de données ouverte !");
};

request.onupgradeneeded = function (event) {
  let db = event.target.result;
  let store = db.createObjectStore("recettes", {
    keyPath: "id",
    autoIncrement: true,
  });
  store.createIndex("nom", "nom", { unique: false });
};


window.onload = function () {
  let request = window.indexedDB.open("RecettesDB", 1);

  request.onerror = function (event) {
    console.error("Erreur d'ouverture de IndexDB", event);
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    console.log("IndexDB ouverte avec succès");
    afficherRecettes();
  };

  request.onupgradeneeded = function (event) {
    let db = event.target.result;
    let objectStore = db.createObjectStore("recettes", {
      keyPath: "id",
      autoIncrement: true,
    });
    objectStore.createIndex("nom", "nom", { unique: false });
    objectStore.createIndex("ingredients", "ingredients", { unique: false });
    objectStore.createIndex("temps", "temps", { unique: false });
  };
};

function ajouterRecetteDansIndexedDB(nom, ingredients, temps) {
  let transaction = db.transaction(["recettes"], "readwrite");
  let objectStore = transaction.objectStore("recettes");
  let request = objectStore.add({
    nom: nom,
    ingredients: ingredients,
    temps: temps,
  });

  request.onsuccess = function (event) {
    console.log("Recette ajoutée dans IndexDB");
    afficherRecettes();
  };

  request.onerror = function (event) {
    console.error("Erreur d'ajout de recette dans IndexDB", event);
  };
}

function afficherRecettes() {
  let transaction = db.transaction(["recettes"], "readonly");
  let objectStore = transaction.objectStore("recettes");
  let request = objectStore.getAll();

  request.onsuccess = function (event) {
    let recettes = event.target.result;
    let listeRecettes = document.getElementById("listeRecettes");
    listeRecettes.innerHTML = ""; // Réinitialise la liste avant d'ajouter les nouvelles recettes

    recettes.forEach((recette) => {
      let div = document.createElement("div");
      div.classList.add("recette-item");
      div.innerHTML = `
        <h3>${recette.nom}</h3>
        <p>Ingrédients: ${recette.ingredients}</p>
        <p>Temps de réalisation: ${recette.temps}</p>
        <button onclick="editRecette(${recette.id})">Modifier</button>
        <button onclick="deleteRecette(${recette.id})">Supprimer</button>
      `;
      listeRecettes.appendChild(div);
    });
  };
}
  


