let db;

// Fonction exécutée au chargement de la page
window.onload = function () {
  // Ouverture de la base de données IndexedDB
  let request = indexedDB.open("RecettesDB", 1);

  // Gestion des erreurs lors de l'ouverture de la base de données
  request.onerror = function (event) {
    console.error("Erreur d'ouverture de IndexedDB", event);
  };

  // Succès de l'ouverture de la base de données
  request.onsuccess = function (event) {
    db = event.target.result; // Stocke la base de données dans une variable globale
    afficherRecettes(); // Affiche les recettes existantes
  };

  // Mise à jour ou création de la base de données (si elle n'existe pas encore)
  request.onupgradeneeded = function (event) {
    db = event.target.result;
    // Création d'un object store pour les recettes
    let store = db.createObjectStore("recettes", {
      keyPath: "id", // Clé primaire
      autoIncrement: true, // Incrémentation automatique des IDs
    });
    // Création d'index pour faciliter les recherches
    store.createIndex("nom", "nom", { unique: false });
    store.createIndex("ingredients", "ingredients", { unique: false });
    store.createIndex("temps", "temps", { unique: false });
  };

  // Ajout des gestionnaires d'événements pour les boutons
  document
    .getElementById("ajouterRecetteBtn")
    .addEventListener("click", ajouterRecette);
  document
    .getElementById("modifierRecetteBtn")
    .addEventListener("click", updateRecette);
};

// Fonction pour ajouter une nouvelle recette
function ajouterRecette() {
  // Récupération des valeurs des champs du formulaire
  let nom = document.getElementById("nomRecette").value;
  let ingredients = document.getElementById("ingredientsRecette").value;
  let temps = document.getElementById("tempsRecette").value;

  // Vérification que tous les champs sont remplis
  if (!nom || !ingredients || !temps) {
    alert("Tous les champs doivent être remplis !");
    return;
  }

  // Création d'une transaction en lecture/écriture
  let transaction = db.transaction(["recettes"], "readwrite");
  let store = transaction.objectStore("recettes");
  // Ajout de la recette dans la base de données
  let ajout = store.add({ nom, ingredients, temps });

  // Succès de l'ajout
  ajout.onsuccess = function () {
    afficherRecettes(); // Met à jour la liste des recettes
    resetForm(); // Réinitialise le formulaire
  };
}

// Fonction pour charger une recette dans le formulaire pour modification
function modifierRecette(id) {
  // Création d'une transaction en lecture seule
  let transaction = db.transaction(["recettes"], "readonly");
  let store = transaction.objectStore("recettes");
  // Récupération de la recette par son ID
  let request = store.get(id);

  // Succès de la récupération
  request.onsuccess = function () {
    let recette = request.result;

    // Remplissage des champs du formulaire avec les données de la recette
    document.getElementById("recetteId").value = recette.id;
    document.getElementById("nomRecette").value = recette.nom;
    document.getElementById("ingredientsRecette").value = recette.ingredients;
    document.getElementById("tempsRecette").value = recette.temps;

    // Affiche le bouton "Modifier" et masque le bouton "Ajouter"
    document.getElementById("ajouterRecetteBtn").classList.add("d-none");
    document.getElementById("modifierRecetteBtn").classList.remove("d-none");
  };
}

// Fonction pour mettre à jour une recette existante
function updateRecette() {
  // Récupération des valeurs des champs du formulaire
  let id = Number(document.getElementById("recetteId").value);
  let nom = document.getElementById("nomRecette").value;
  let ingredients = document.getElementById("ingredientsRecette").value;
  let temps = document.getElementById("tempsRecette").value;

  // Vérification que tous les champs sont remplis
  if (!nom || !ingredients || !temps) {
    alert("Tous les champs doivent être remplis !");
    return;
  }

  // Création d'une transaction en lecture/écriture
  let transaction = db.transaction(["recettes"], "readwrite");
  let store = transaction.objectStore("recettes");

  // Mise à jour de la recette dans la base de données
  let recetteModifiee = { id, nom, ingredients, temps };
  store.put(recetteModifiee);

  // Succès de la mise à jour
  transaction.oncomplete = function () {
    afficherRecettes(); // Met à jour la liste des recettes
    resetForm(); // Réinitialise le formulaire
  };
}

// Fonction pour supprimer une recette
function supprimerRecette(id) {
  // Création d'une transaction en lecture/écriture
  let transaction = db.transaction(["recettes"], "readwrite");
  let store = transaction.objectStore("recettes");
  // Suppression de la recette par son ID
  store.delete(id);

  // Succès de la suppression
  transaction.oncomplete = function () {
    afficherRecettes(); // Met à jour la liste des recettes
  };
}

// Fonction pour afficher toutes les recettes
function afficherRecettes() {
  // Création d'une transaction en lecture seule
  let transaction = db.transaction(["recettes"], "readonly");
  let store = transaction.objectStore("recettes");
  let request = store.openCursor(); // Parcours des recettes avec un curseur
  let liste = document.getElementById("listeRecettes");
  liste.innerHTML = ""; // Vide la liste avant de la remplir

  // Succès du parcours
  request.onsuccess = function (event) {
    let cursor = event.target.result;
    if (cursor) {
      let recette = cursor.value;
      // Création d'un élément HTML pour chaque recette
      let li = document.createElement("li");
      li.classList.add("list-group-item");
      li.innerHTML = `
        <strong>${recette.nom}</strong> - 
        Ingrédients : ${recette.ingredients} - 
        Temps : ${recette.temps}
        <button class="btn btn-warning btn-sm mx-1 float-end" onclick="modifierRecette(${recette.id})">Modifier</button>
        <button class="btn btn-danger btn-sm float-end" onclick="supprimerRecette(${recette.id})">Supprimer</button>
      `;
      liste.appendChild(li); // Ajoute l'élément à la liste
      cursor.continue(); // Passe à la recette suivante
    }
  };
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
  document.getElementById("recetteId").value = ""; // Vide le champ ID
  document.getElementById("nomRecette").value = ""; // Vide le champ Nom
  document.getElementById("ingredientsRecette").value = ""; // Vide le champ Ingrédients
  document.getElementById("tempsRecette").value = ""; // Vide le champ Temps
  document.getElementById("ajouterRecetteBtn").classList.remove("d-none"); // Affiche le bouton "Ajouter"
  document.getElementById("modifierRecetteBtn").classList.add("d-none"); // Masque le bouton "Modifier"
}