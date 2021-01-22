"use strict";

var DateTime = luxon.DateTime;
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
  $characters.on("select2:select", selectCharacterEventHandler);
  $quests = $("#Quests");
  $quests.on("select2:select", selectQuestEventHandler);
  $timers = $("#Timers tbody");
  $timers.on("click", ".add", addCompletionTableEventHandler);
  $timers.on("click", ".remove", deleteCompletionTableEventHandler);
  completionsTemplate = Handlebars.compile($("#CompletionTemplate").html());

  initializeSelect2(characters, $characters);
  initializeSelect2(quests, $quests);

  for (const character in completions) {
    if (Object.hasOwnProperty.call(completions, character)) {
      for (const quest in completions[character]) {
        if (Object.hasOwnProperty.call(completions[character], quest)) {
          const data = completions[character][quest];
          renderCompletion(character, quest, data);
        }
      } 
    }
  }
}

function initializeSelect2(data, $elem) {
  for (const item in data) {
    if (Object.hasOwnProperty.call(data, item)) {
      $elem.append(new Option(item));
    }
  }
}

function update() {

}


function loadData() {
  characters = JSON.parse(localStorage.getItem("characters"));
  quests = JSON.parse(localStorage.getItem("quests"));
  completions = JSON.parse(localStorage.getItem("completions"));
}

function saveData() {
  localStorage.setItem("characters",JSON.stringify(characters));
  localStorage.setItem("quests",JSON.stringify(quests));
  localStorage.setItem("completions",JSON.stringify(completions));
}

function addCharacter(character) {
  characters[character] = "";
  saveData();
}

function removeCharacter(character) {
  delete characters[character];
  saveData();
}

function addQuest(quest) {
  quests[quest] = "";
  saveData();
}

function removeQuest(quest) {
  delete quests[quest];
  saveData();
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
  saveData();
}

function deleteCompletion(character, quest) {
  delete completions[character][quest];
  let $completion = getCompletion(character, quest);
  $completion.remove();
  saveData();
}

function getCompletion(character, quest) {
  return $timers.children("tr[data-character='" + character + "'][data-quest='" + quest + "']");
}

function renderCompletion(character, quest, data) {
  let $completion = getCompletion(character, quest);
  if ($completion.length == 0) {
    $completion = $("<tr data-character='"+ character +"' data-quest='"+ quest +"'></tr>");
    $completion.appendTo($timers);
  }
  let expires = DateTime.fromMillis(data.time + sevenDays);
  let now = DateTime.local();
  let remaining = "Ransack Cleared!";
  if(expires > now) {
    let remainingObj = expires.diff(now, ["days", "hours", "minutes"]);
    remaining = "";
    remainingObj.days && (remaining += remainingObj.days + " days ");
    remainingObj.hours && (remaining += remainingObj.hours + " hours ");
    remainingObj.minutes && (remaining += Math.ceil(remainingObj.minutes) + " minutes ");
  }
  $completion.html(completionsTemplate({character: character, quest: quest, date: new Date(data.time).toLocaleString(), count: data.count, remaining: remaining}));
}

function addCompletionEventHandler() {
  var character = $characters.select2("data")[0].text;
  var quest = $quests.select2("data")[0].text;
  if(!character || !quest) {
    alert("Must select a character and a quest to mark a quest as completed");
  }

  addCompletion(character, quest)
}

function selectCharacterEventHandler(e) {
  var character = e.params.data.text;
  if (characters.hasOwnProperty(character)) {
    return;
  }
  addCharacter(character);
}

function selectQuestEventHandler(e) {
  var quest = e.params.data.text;
  if(quests.hasOwnProperty(quest)) {
    return;
  }
  addQuest(quest);
}

function addCompletionTableEventHandler(e) {
  const $completion = $(this).closest("tr");
  const character = $completion.data("character");
  const quest = $completion.data("quest");
  addCompletion(character, quest);
}

function deleteCompletionTableEventHandler(e) {
  const $completion = $(this).closest("tr");
  const character = $completion.data("character");
  const quest = $completion.data("quest");
  deleteCompletion(character, quest);
}

$(initialize);