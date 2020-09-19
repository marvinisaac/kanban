// Add keypress event listener to input
var input = document.getElementById('taskNew');
input.addEventListener('keypress', taskCreate);

// Initialize task arrays and create columns
var tasksTodo = [];
var tasksDoing = [];
var tasksDone = [];
load();

// Saves tasks to backend
function save () {
    var url = 'api/save/' +
        '?todo=' + JSON.stringify(tasksTodo) +
        '&doing=' + JSON.stringify(tasksDoing) +
        '&done=' + JSON.stringify(tasksDone);
    fetch(url);
}

// Loads tasks from backend
function load () {
    var url = 'api/load/';
    fetch(url)
        .then(response => response.json())
        .then(tasks => {
            tasksTodo = tasks.todo;
            tasksDoing = tasks.doing;
            tasksDone = tasks.done;
            kanbanRedraw();
        });
}

// Redraws the whole kanban by:
// 1) clearing all columns
// 2) re-creating columns with updated array contents
function kanbanRedraw () {
    var cards = document.getElementsByTagName('li');
    for (var index = cards.length - 1; index >= 0; index--) {
        cards[index].remove();
    }
    columnCreate('todo', tasksTodo);
    columnCreate('doing', tasksDoing);
    columnCreate('done', tasksDone);
}

// Fill columns with tasks
function columnCreate(column, tasks) {
    for (var index = tasks.length - 1; index >= 0; index--) {
        cardCreate(tasks[index], column);
    }
}

// Create cards in specified column and add click event listeners
function cardCreate (task, column) {
    var column = document.getElementById(column);
    var card = document.createElement('li');
    var cardText = document.createTextNode(task);

    // Update button
    var buttonUpdate = document.createElement('span');
    var buttonUpdateIcon = document.createTextNode('✏️');
    buttonUpdate.appendChild(buttonUpdateIcon);
    buttonUpdate.addEventListener('click', taskUpdate);

    // Delete button
    var buttonDelete = document.createElement('span');
    var buttonDeleteIcon = document.createTextNode('🗑️');
    buttonDelete.appendChild(buttonDeleteIcon);
    buttonDelete.addEventListener('click', taskDelete);

    card.appendChild(buttonDelete);
    card.appendChild(buttonUpdate);
    card.appendChild(cardText);
    card.addEventListener('click', taskMove);
    column.prepend(card);
}

function taskUpdate (event) {
    var buttonUpdate = event.target;
    var task = taskFindText(buttonUpdate);

    // Display a prompt to update the selected task
    var taskUpdated = prompt('Update task', task);
    if (taskUpdated === null) {
        return false;
    }

    // If task was updated, find the original task and update it
    var origin = taskFindOrigin(buttonUpdate);
    var taskIndex = origin.indexOf(task);
    origin[taskIndex] = taskUpdated;
    save();
    kanbanRedraw();
}

function taskDelete (event) {
    var buttonDelete = event.target;
    var task = taskFindText(buttonDelete);

    // Display confirmation before deleting task
    var wasDeleteConfirmed = confirm(`Delete "${task}"? This is irreversible.`);
    if (!wasDeleteConfirmed) {
        return false;
    }

    // If delete was confirmed, find task and delete it
    var origin = taskFindOrigin(buttonDelete);
    var taskIndex = origin.indexOf(task);
    origin.splice(taskIndex, 1);
    save();
    kanbanRedraw();

}

function taskFindText (button) {
    var sibling = button.nextSibling;
    var text = undefined;

    // Loop through all siblings to find the only plaintext element
    while (sibling) {
        if (sibling.nodeName === '#text') {
            text = sibling.textContent;
            break;
        }

        sibling = sibling.nextSibling;
    }

    return text;
}

function taskFindOrigin (button) {
    var originId = button.parentNode.parentNode.id;
    var origin = undefined;
    switch (originId) {
        case 'todo':
            origin = tasksTodo
            break;
        case 'doing':
            origin = tasksDoing
            break;
        case 'done':
            origin = tasksDone
            break;
    }

    return origin;
}

// Handle addition of new tasks
function taskCreate (event) {
    if (event.key !== 'Enter') {
        return false;
    }

    var task = input.value;
    input.value = '';
    tasksTodo.unshift(task);
    save();
    kanbanRedraw();
}

// Handle movement of tasks to next 
function taskMove (event) {
    var task = event.target.lastChild.textContent;
    var originId = event.target.parentNode.id;
    var origin = undefined
    var destination = undefined;

    switch (originId) {
        case 'todo':
            origin = tasksTodo
            destination = tasksDoing;
            break;
        case 'doing':
            origin = tasksDoing
            destination = tasksDone;
            break;
    }

    if (destination === undefined) {
        return false;
    }

    var index = origin.indexOf(task);
    origin.splice(index, 1);
    destination.unshift(task);
    save();
    kanbanRedraw();
}
