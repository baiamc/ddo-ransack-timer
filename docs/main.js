"use strict";

var characters,quests,completions,$characters,$quests,$timers,completionsTemplate;

var sevenDays = 1000 * 60 * 60 * 24 * 7; // miliseconds in 7 days


function initialize() {
  loadData();
  $(".select2").select2({
    tags: true,
    placeholder: "Select an option or enter a new value"
  });
  $("#AddCompletion").on("click", addCompletionEventHandler);
  $characters = $("#Characters");
  $quests = $("#Quests");
  $timers = $("#Timers tbody");
  completionsTemplate = Handlebars.compile($("#CompletionTemplate").html());
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
  if (!completions[character]) {
    completions[character] = {};
  }
  if(!completions[character][quest]) {
    completions[character][quest] = {};
  }
  var completion = completions[character][quest];

  if(!completion.time || completion.time + sevenDays < Date.now()) {
    completion.time = Date.now();
    completion.count = 1;
  } else {
    completion.count += 1;
  }
  renderCompletion(character, quest, completion);
}

function renderCompletion(character, quest, data) {
  var $completion = $timers.children("tr[data-character='" + character + "'][data-quest='" + quest + "']");
  if ($completion.length == 0) {
    $completion = $("<tr data-character='"+ character +"' data-quest='"+ quest +"'></tr>");
    $completion.appendTo($timers);
  }
  var expires = new DateTime(data.time + sevenDays);
  var now = new DateTime.local();
  var remaining = "Ransack Cleared!";
  if(expires > now) {
    var remainingObj = expires.diff(now, ["days", "hours", "minutes"]);
    remaining = "";
    remainingObj.days && (remaining += remainingObj.days + " days ");
    remainingObj.hours && (remaining += remainingObj,hours + " hours ");
    remainingObj.minutes && (remaining += remainingObj.minutes + " minutes ");
  }
  $completion.html(completionsTemplate({character: character, quest: quest, date: new Date(data.time).toISOString(), count: data.count, remaining: remaining}));
}

function addCompletionEventHandler() {
  var character = $characters.select2("data")[0].text;
  var quest = $quests.select2("data")[0].text;
  if(!character || !quest) {
    alert("Must select a character and a quest to mark a quest as completed");
  }

  addCompletion(character, quest)
}

$(initialize);