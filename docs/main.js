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
  $("#RemoveCharacter").on("click", removeCharacterEventHandler);
  $("#RemoveQuest").on("click", removeQuestEventHandler);
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

  renderAllCompletions();
  setInterval(renderAllCompletions,1000);
}

function renderAllCompletions() {
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
  const list = [];
  for (const item in data) {
    if (Object.hasOwnProperty.call(data, item)) {
      list.push(item);
    }
  }
  list.sort().forEach((item) => $elem.append(new Option(item)));
}

function update() {
  renderAllCompletions();
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
  characters[character] = "";
  saveData();
}

function removeCharacter(character) {
  delete characters[character];
  delete completions[character];
  saveData();
  location.reload();
}

function addQuest(quest) {
  quests[quest] = "";
  saveData();
}

function removeQuest(quest) {
  delete quests[quest];
  for (const character in completions) {
    if (Object.hasOwnProperty.call(completions, character)) {
      delete completions[character][quest];
    }
  }
  saveData();
  location.reload();
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
    let remainingObj = expires.diff(now, ["days", "hours", "minutes", "seconds"]);
    remaining = "";
    remainingObj.days && (remaining += remainingObj.days + " days ");
    remainingObj.hours && (remaining += remainingObj.hours + " hours ");
    remainingObj.minutes && (remaining += remainingObj.minutes + " minutes ");
    remainingObj.seconds && (remaining += Math.ceil(remainingObj.seconds) + " seconds ");
  }

  $completion.removeClass("completed ransacked lastrun");
  if(expires < now) {
    $completion.addClass("completed");
  } else if (data.count > 8) {
    $completion.addClass("ransacked");
  } else if (data.count === 8) {
    $completion.addClass("lastrun");
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
  const quest = e.params.data.text;
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

function removeCharacterEventHandler(e) {
  const character = $characters.select2("data")[0].text;
  if(!character || !confirm("Delete the character " + character + " and any associated timers")) {
    return;
  }
  removeCharacter(character);
}

function removeQuestEventHandler(e) {
  const quest = $quests.select2("data")[0].text;
  if(!quest || !confirm("Delete the quest " + quest + " and any associated timers")) {
    return;
  }
  removeQuest(quest);
}

$(initialize);