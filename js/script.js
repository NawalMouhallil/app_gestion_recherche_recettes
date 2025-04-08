document
  .getElementById("ajouterRecette")
  .addEventListener("click", function () {
    afficherPopup();
  });

function afficherPopup() {
  const popup = document.createElement("div");
  popup.classList.add("popup");
  popup.innerHTML = "<p>Recette ajoutée !</p>";
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 3000);
}

document
  .getElementById("ajouterRecetteBtn")
  .addEventListener("click", ajouterRecette);
document
  .getElementById("modifierRecetteBtn")
  .addEventListener("click", modifierRecette);

function ajouterRecette() {
  const nom = document.getElementById("nomRecette").value;
  const ingredients = document.getElementById("ingredientsRecette").value;
  const temps = document.getElementById("tempsRecette").value;

  if (nom && ingredients && temps) {
    // Ajout de la recette dans IndexedDB
    ajouterRecetteDansIndexedDB(nom, ingredients, temps);

    // Afficher le popup
    showPopup("Recette ajoutée avec succès!");

    // Réinitialiser le formulaire
    resetForm();
  }
}

function afficherRecettes() {
  const listeRecettes = document.getElementById("listeRecettes");
  listeRecettes.innerHTML = "";

  let transaction = db.transaction(["recettes"], "readonly");
  let objectStore = transaction.objectStore("recettes");

  objectStore.openCursor().onsuccess = function (event) {
    let cursor = event.target.result;
    if (cursor) {
      const recetteDiv = document.createElement("div");
      recetteDiv.className = "recette list-group-item";
      recetteDiv.innerHTML = `<h2>${cursor.value.nom}</h2>
                                    <div class="details hidden">
                                        <p>Ingrédients: ${cursor.value.ingredients}</p>
                                        <p>Temps: ${cursor.value.temps}</p>
                                    </div>
                                    <button class="btn btn-warning" onclick="editRecette(${cursor.value.id})">Modifier</button>
                                    <button class="btn btn-danger" onclick="deleteRecette(${cursor.value.id})">Supprimer</button>`;

      recetteDiv.querySelector("h2").addEventListener("click", toggleDetails);

      listeRecettes.appendChild(recetteDiv);
      cursor.continue();
    }
  };
}

function editRecette(id) {
  let transaction = db.transaction(["recettes"], "readonly");
  let objectStore = transaction.objectStore("recettes");
  let request = objectStore.get(id);

  request.onsuccess = function (event) {
    let recette = event.target.result;
    document.getElementById("recetteId").value = recette.id;
    document.getElementById("nomRecette").value = recette.nom;
    document.getElementById("ingredientsRecette").value = recette.ingredients;
    document.getElementById("tempsRecette").value = recette.temps;

    document.getElementById("ajouterRecetteBtn").classList.add("d-none");
    document.getElementById("modifierRecetteBtn").classList.remove("d-none");
  };
}

function modifierRecette() {
  const id = parseInt(document.getElementById("recetteId").value);
  const nom = document.getElementById("nomRecette").value;
  const ingredients = document.getElementById("ingredientsRecette").value;
  const temps = document.getElementById("tempsRecette").value;

  let transaction = db.transaction(["recettes"], "readwrite");
  let objectStore = transaction.objectStore("recettes");
  let request = objectStore.put({
    id: id,
    nom: nom,
    ingredients: ingredients,
    temps: temps,
  });

  request.onsuccess = function (event) {
    afficherRecettes();
    resetForm();
  };
}

function deleteRecette(id) {
  let transaction = db.transaction(["recettes"], "readwrite");
  let objectStore = transaction.objectStore("recettes");
  let request = objectStore.delete(id);

  request.onsuccess = function (event) {
    afficherRecettes();
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

function showPopup(message) {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerText = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);

  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 300);
  }, 3000);
}

function toggleDetails(event) {
  const details = event.target.nextElementSibling;
  details.classList.toggle("hidden");
}

// Exemple de requête AJAX pour récupérer les recettes depuis une API REST
function fetchRecettesFromAPI(params) {
  axios
    .get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${params}`)
    .then((response) => {
      console.log("Recettes récupérées depuis l'API", response.data);
      response.data.forEach((recette) => {
        ajouterRecetteDansIndexedDB(
          recette.nom,
          recette.ingredients,
          recette.temps
        );
      });
      afficherRecettes();
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des recettes depuis l'API",
        error
      );
    });
}

// Appeler cette fonction pour remplir la base de données avec des recettes depuis l'API
window.onload = function () {
  fetchRecettesFromAPI();
};


