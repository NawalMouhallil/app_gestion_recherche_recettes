let db;
const request = indexedDB.open("RecettesDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  let store = db.createObjectStore("recettes", {
    keyPath: "id",
    autoIncrement: true,
  });
};

request.onsuccess = function (event) {
  db = event.target.result;
  afficherRecettes();
};

function ajouterRecette() {
  let nom = document.getElementById("nomNouvelleRecette").value;
  let ingredients = document.getElementById("ingredientsNouvelleRecette").value;
  let temps = document.getElementById("tempsRealisation").value;

  if (!nom || !ingredients || !temps) {
    alert("Tous les champs doivent être remplis !");
    return;
  }

  let transaction = db.transaction(["recettes"], "readwrite");
  let store = transaction.objectStore("recettes");
  store.add({ nom, ingredients, temps });

  afficherRecettes();
}

function afficherRecettes() {
  let transaction = db.transaction(["recettes"], "readonly");
  let store = transaction.objectStore("recettes");
  let request = store.getAll();

  request.onsuccess = function () {
    const liste = document.getElementById("listeRecettes");
    liste.innerHTML = "";
    request.result.forEach((recette) => {
      let div = document.createElement("div");
      div.classList.add("card", "p-3", "mb-3");
      div.innerHTML = `
                <h4>${recette.nom}</h4>
                <p><strong>Ingrédients:</strong> ${recette.ingredients}</p>
                <p><strong>Temps de réalisation:</strong> ${recette.temps}</p>
                <button onclick="modifierRecette(${recette.id})" class="btn btn-warning btn-sm">Modifier</button>
                <button onclick="supprimerRecette(${recette.id})" class="btn btn-danger btn-sm">Supprimer</button>
            `;
      liste.appendChild(div);
    });
  };
}

function supprimerRecette(id) {
  let transaction = db.transaction(["recettes"], "readwrite");
  let store = transaction.objectStore("recettes");
  store.delete(id);
  afficherRecettes();
}

function modifierRecette(id) {
  let transaction = db.transaction(["recettes"], "readwrite");
  let store = transaction.objectStore("recettes");
  let request = store.get(id);

  request.onsuccess = function () {
    let recette = request.result;
    document.getElementById("nomNouvelleRecette").value = recette.nom;
    document.getElementById("ingredientsNouvelleRecette").value =
      recette.ingredients;
    document.getElementById("tempsRealisation").value = recette.temps;

    document.getElementById("ajouter").innerText = "Modifier Recette";
    document.getElementById("ajouter").onclick = function () {
      recette.nom = document.getElementById("nomNouvelleRecette").value;
      recette.ingredients = document.getElementById(
        "ingredientsNouvelleRecette"
      ).value;
      recette.temps = document.getElementById("tempsRealisation").value;

      store.put(recette);
      document.getElementById("ajouter").innerText = "Ajouter Recette";
      document.getElementById("ajouter").onclick = ajouterRecette;

      afficherRecettes();
    };
  };
}

document.getElementById("ajouter").addEventListener("click", ajouterRecette);


