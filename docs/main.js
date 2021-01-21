"use strict";

var characters,quests,completions;

function initialize() {
  loadData();
}

function update() {
  
}


function loadData() {
  characters = JSON.parse(localStorage.getItem("characters")) || {};
  quests = JSON.parse(localStorage.getItem("quests")) || {};
  completions = JSON.parse(localStorage.getItem("completions")) || {};
}

function saveData() {
  localStorage.setItem("characters",JSON.stringify(characters));
  localStorage.setItem("quests",JSON.stringify(quests));
  localStorage.setItem("completions",JSON.stringify(completions));
}

function addCharacter(character) {

}

function removeCharacter(character) {

}

function addQuest(quest) {

}

function addCompletion(character, quest) {

}

$(initialize);