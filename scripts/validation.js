//Corriger les réponses fournies

const corriger = function() {
	var texte = window.location.search
	//Obtenir les réponses fournies dans la barre URL de la page Web
	//La méthode window.location.search nous donne les réponses inscrite dane le formulaire.
	//Voici l'info dans ma barre URL à moi: "?question1=1972-04-17&question2=Thierry&question3=David&question4=volley&question5=Yukon&question5=Italie&question6=Candiac&question7=bleu&question8=Chien&question8=Serpent&question9=Honda"

	var tmp = texte.slice(1,texte.length)
	// slice permet de supprimer des caractères dans un string. Ici on veut supprimer le premier caractère ? pour obtenir :
	//"question1=1972-04-17&question2=Thierry&question3=David&question4=volley&question5=Yukon&question5=Italie&question6=Candiac&question7=bleu&question8=Chien&question8=Serpent&question9=Honda"

	infos = tmp.split("&")
	//split permet de séparer un string. Ici on sépare quand on rencontre le caractère "&" pour obtenir :
	//infos[0] = "question1=1972-04-17"
	//infos[1] = "question2=Thierry"
	//infos[2] = "question3=David"
	//...

	var reponses = infos.map((x) => decodeURIComponent(x.split("=")[1]).replaceAll("+"," "))
	//Recueillir les réponses avec map et split
	// reponses[0] = "1972-04-17"
	// reponses[1] = "Thierry"
	// reponses[2] = "David"

	// Ici, la méthode map est une boucle qui traite chaque élément du Array infos.
	// boucle 1 : element = "question1=1972-04-17"
	// boucle 2 : element = "question2=Thierry"
	// boucle 3 : element = "question3=David"

	// La méthode split sépare chaque element x selon le caractère =
	// Nous gardons seulement l'information ayant l'index 1
	// La vidéo explique cette ligne davantage

	var retroaction = ""

	//Q1
	element = document.getElementById("Q1")
	//La méthode document.getElementById obtient l'élément HTML qui porte le id spécifié.
	//Dans ce cas, nous voulons l'élement HTML qui porte le id "Q1"

	//Comparons les réponses fournis avec les bonnes réponses.
	if (reponses[0] === "Hanwen Qiu") {
		retroaction = "Bien!"
		//La méthode style modifie l'attribut spécifié. Ici, nous fixons color à Green
		element.style.color="Green"
	}
	else {
		retroaction = "Erreur!"
		//La méthode style modifie l'attribut spécifié. Ici, nous fixons color à Red
		element.style.color="Red"
	}
	// La méthode innerHTML remplace le code HTML de element par le nouveau code HTML fourni.
	element.innerHTML = reponses[0] + " : " + retroaction;

	// Q2: Quel est mon cours préféré?
	element = document.getElementById("Q2")
	if (reponses[1] === "Mathématiques") {
		retroaction = "Bien!"
		element.style.color="Green"
	}
	else {
		retroaction = "Erreur!"
		element.style.color="Red"
	}
	element.innerHTML = reponses[1] + " : " + retroaction;

	// Q3: Mon animal préféré
	element = document.getElementById("Q3")
	if (reponses[2] === "Chat")	{
		retroaction = "Bien!"
		element.style.color="Green"
	}
	else {
		retroaction = "Erreur!"
		element.style.color="Red"
	}
	element.innerHTML = reponses[2] + " : " + retroaction;

	// Q4: Quelle est ma date de naissance?
	element = document.getElementById("Q4")
	if (reponses[3] === "8122-11-11") {
		retroaction = "Bien!"
		element.style.color="Green"
	}
	else {
		retroaction = "Erreur!"
		element.style.color="Red"
	}
	element.innerHTML = reponses[3] + " : " + retroaction;

	// Q5: Quel âge ai-je?
	element = document.getElementById("Q5")
	if (reponses[4] === "15") {
		retroaction = "Bien!"
		element.style.color="Green"
	}
	else {
		retroaction = "Erreur!"
		element.style.color="Red"
	}
	element.innerHTML = reponses[4] + " : " + retroaction;

	// Q6: Quel est mon outil préféré pour écrire?
	element = document.getElementById("Q6")
	if (reponses[5] === "Pousse-mine") {
		retroaction = "Bien!"
		element.style.color="Green"
	}
	else {
		retroaction = "Erreur!"
		element.style.color="Red"
	}
	element.innerHTML = reponses[5] + " : " + retroaction;

	// Q7: Ma nourriture préférée
	element = document.getElementById("Q7")
	if (reponses[6] === "Pizza") {
		retroaction = "Bien!"
		element.style.color="Green"
	}
	else {
		retroaction = "Erreur!"
		element.style.color="Red"
	}
	element.innerHTML = reponses[6] + " : " + retroaction;

	// Q8: À quelles compétitions ai-je participé?
	element = document.getElementById("Q8")
	if (reponses[7] === "AQJM" && reponses[8] === "Gauss" && reponses[9] == null) {
		retroaction = "Bien!"
		element.style.color="Green"
	}
	else {
		retroaction = "Erreur!"
		element.style.color="Red"
	}
	element.innerHTML = reponses[7] + ", " + (reponses[8] ?? "rien") + " et " + (reponses[9] ?? "rien") + " : " + retroaction;

}