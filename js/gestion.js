let db;

window.onload = function () {
  let request = indexedDB.open("RecettesDB", 1);

  request.onerror = function (event) {
    console.error("Erreur d'ouverture de IndexedDB", event);
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    afficherRecettes();
  };

  request.onupgradeneeded = function (event) {
    db = event.target.result;
    let store = db.createObjectStore("recettes", {
      keyPath: "id",
      autoIncrement: true,
    });
    store.createIndex("nom", "nom", { unique: false });
    store.createIndex("ingredients", "ingredients", { unique: false });
    store.createIndex("temps", "temps", { unique: false });
  };

  // Ajout des listeners globaux
  document
    .getElementById("ajouterRecetteBtn")
    .addEventListener("click", ajouterRecette);
  document
    .getElementById("modifierRecetteBtn")
    .addEventListener("click", updateRecette);
};

function ajouterRecette() {
  let nom = document.getElementById("nomRecette").value;
  let ingredients = document.getElementById("ingredientsRecette").value;
  let temps = document.getElementById("tempsRecette").value;

  if (!nom || !ingredients || !temps) {
    alert("Tous les champs doivent être remplis !");
    return;
  }

  let transaction = db.transaction(["recettes"], "readwrite");
  let store = transaction.objectStore("recettes");
  let ajout = store.add({ nom, ingredients, temps });

  ajout.onsuccess = function () {
    afficherRecettes();
    resetForm();
  };
}

function modifierRecette(id) {
  let transaction = db.transaction(["recettes"], "readonly");
  let store = transaction.objectStore("recettes");
  let request = store.get(id);

  request.onsuccess = function () {
    let recette = request.result;

    document.getElementById("recetteId").value = recette.id;
    document.getElementById("nomRecette").value = recette.nom;
    document.getElementById("ingredientsRecette").value = recette.ingredients;
    document.getElementById("tempsRecette").value = recette.temps;

    document.getElementById("ajouterRecetteBtn").classList.add("d-none");
    document.getElementById("modifierRecetteBtn").classList.remove("d-none");
  };
}

function updateRecette() {
  let id = Number(document.getElementById("recetteId").value);
  let nom = document.getElementById("nomRecette").value;
  let ingredients = document.getElementById("ingredientsRecette").value;
  let temps = document.getElementById("tempsRecette").value;

  if (!nom || !ingredients || !temps) {
    alert("Tous les champs doivent être remplis !");
    return;
  }

  let transaction = db.transaction(["recettes"], "readwrite");
  let store = transaction.objectStore("recettes");

  let recetteModifiee = { id, nom, ingredients, temps };
  store.put(recetteModifiee);

  transaction.oncomplete = function () {
    afficherRecettes();
    resetForm();
  };
}

function supprimerRecette(id) {
  let transaction = db.transaction(["recettes"], "readwrite");
  let store = transaction.objectStore("recettes");
  store.delete(id);

  transaction.oncomplete = function () {
    afficherRecettes();
  };
}

function afficherRecettes() {
  let transaction = db.transaction(["recettes"], "readonly");
  let store = transaction.objectStore("recettes");
  let request = store.openCursor();
  let liste = document.getElementById("listeRecettes");
  liste.innerHTML = "";

  request.onsuccess = function (event) {
    let cursor = event.target.result;
    if (cursor) {
      let recette = cursor.value;
      let li = document.createElement("li");
      li.classList.add("list-group-item");
      li.innerHTML = `
        <strong>${recette.nom}</strong> - 
        Ingrédients : ${recette.ingredients} - 
        Temps : ${recette.temps}
        <button class="btn btn-warning btn-sm mx-1 float-end" onclick="modifierRecette(${recette.id})">Modifier</button>
        <button class="btn btn-danger btn-sm float-end" onclick="supprimerRecette(${recette.id})">Supprimer</button>
      `;
      liste.appendChild(li);
      cursor.continue();
    }
  };
}

function resetForm() {
  document.getElementById("recetteId").value = "";
  document.getElementById("nomRecette").value = "";
  document.getElementById("ingredientsRecette").value = "";
  document.getElementById("tempsRecette").value = "";
  document.getElementById("ajouterRecetteBtn").classList.remove("d-none");
  document.getElementById("modifierRecetteBtn").classList.add("d-none");
}


