// Sélection des éléments HTML nécessaires
const searchBtn = document.getElementById("search-btn"); // Bouton de recherche
const mealList = document.getElementById("meal"); // Conteneur pour afficher les résultats des repas
const mealDetailsContent = document.querySelector(".meal-details-content"); // Contenu des détails du repas
const recipeCloseBtn = document.getElementById("recipe-close-btn"); // Bouton pour fermer les détails de la recette


/**__1__****les trois EventListners********/
// Ajout des écouteurs d'événements
searchBtn.addEventListener("click", getMealList); // Écouteur pour le clic sur le bouton de recherche
mealList.addEventListener("click", getMealRecipe); // Écouteur pour le clic sur un élément de repas
recipeCloseBtn.addEventListener("click", () => {

  // Écouteur pour le clic sur le bouton de fermeture des détails de la recette
  // ***__2__******Animation utiliser pour ferme la modale des détails de la recette*********
  mealDetailsContent.parentElement.classList.remove("showRecipe"); // Ferme la fenêtre modale des détails
});

// Fonction pour obtenir la liste des repas correspondant aux ingrédients
function getMealList() {
  let searchInputTxt = document.getElementById("search-input").value.trim(); // Récupère la valeur saisie dans le champ de recherche
  fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`
  ) // Appel à l'API avec l'ingrédient
    .then((response) => response.json()) // Conversion de la réponse en JSON
    .then((data) => {
      let html = "";
      if (data.meals) {
        // Si des repas sont trouvés
        data.meals.forEach((meal) => {
          // Génère le HTML pour chaque repas
          html += `
                        <div class = "meal-item" data-id = "${meal.idMeal}">
                            <div class = "meal-img">
                                <img src = "${meal.strMealThumb}" alt = "food"> <!-- Image du repas -->
                            </div>
                            <div class = "meal-name">
                                <h3>${meal.strMeal}</h3> <!-- Nom du repas -->
                                <a href = "#" class = "recipe-btn">Voir la Recette</a> <!-- Bouton pour voir la recette -->
                            </div>
                        </div>
                    `;
        });
        mealList.classList.remove("notFound"); // Retire la classe "notFound" si elle est présente
      } else {
        // Message si aucun repas n'est trouvé
        html = "Désolé, aucun repas trouvé !";
        mealList.classList.add("notFound"); // Ajoute la classe "notFound"
      }
// 
      mealList.innerHTML = html; // Insère le HTML généré dans le conteneur
    });
}

// Fonction pour obtenir les détails de la recette d'un repas
function getMealRecipe(e) {
  e.preventDefault(); // Empêche le comportement par défaut du clic
  if (e.target.classList.contains("recipe-btn")) {
    // Vérifie si le clic est sur un bouton de recette
    let mealItem = e.target.parentElement.parentElement; // Récupère l'élément parent du repas
    fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`
    ) // Appel à l'API avec l'ID du repas
      .then((response) => response.json()) // Conversion de la réponse en JSON
      .then((data) => mealRecipeModal(data.meals)); // Passe les données à la fonction pour afficher la modale
  }
}
/*__3__****Lapplication ne doit pas contenir  aucun rechergement de page*****/
// Fonction pour créer une fenêtre modale avec les détails de la recette
function mealRecipeModal(meal) {
  console.log(meal); // Affiche les données dans la console pour débogage
  meal = meal[0]; // Récupère le premier élément (le repas)
  let html = `
        <h2 class = "recipe-title">${meal.strMeal}</h2> <!-- Titre de la recette -->
        <p class = "recipe-category">${meal.strCategory}</p> <!-- Catégorie du repas -->
        <div class = "recipe-instruct">
            <h3>Instructions :</h3>
            <p>${meal.strInstructions}</p> <!-- Instructions pour préparer le repas -->
        </div>
        <div class = "recipe-meal-img">
            <img src = "${meal.strMealThumb}" alt = ""> <!-- Image du repas -->
        </div>
        <div class = "recipe-link">
            <a href = "${meal.strYoutube}" target = "_blank">Regarder la Vidéo</a> <!-- Lien vers une vidéo YouTube -->
        </div>
    `;
  mealDetailsContent.innerHTML = html; // Insère le HTML généré dans le conteneur des détails

  // Ajout des ingrédients à la modale
  // ***__4__******Animation est utilisée pour afficher  la fenêtre modaldes details d'une recette********************
  mealDetailsContent.parentElement.classList.add("showRecipe"); // Affiche la fenêtre modale

}
// **___5___****Requête AJAX pour récupérer des recettes depuis une API REST******* //

// Exemple de requête AJAX pour récupérer des recettes depuis une API REST
function fetchRecettesFromAPI(params) {
  axios
    .get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${params}`) // Appelle l'API avec un paramètre de recherche
    .then((response) => {
      console.log("Recettes récupérées depuis l'API", response.data);
      response.data.forEach((recette) => {
        // Ajoute chaque recette récupérée dans IndexedDB
        ajouterRecetteDansIndexedDB(
          recette.nom,
          recette.ingredients,
          recette.temps
        );
      });
      afficherRecettes(); // Met à jour la liste des recettes
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des recettes depuis l'API",
        error
      );
    });
}

// Appelle cette fonction au chargement de la page pour remplir la base de données avec des recettes depuis l'API
window.onload = function () {
  fetchRecettesFromAPI();
};

