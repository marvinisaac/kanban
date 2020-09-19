// Add keypress event listener to input
var input = document.getElementById('taskNew');
input.addEventListener('keypress', taskCreate);

// Initialize task array and read from API
var tasksAll = []
read();

// Loads tasks from backend
function read () {
    var url = 'api/task/';
    return fetch(url)
        .then(response => response.json())
        .then(response => {
            tasksAll = response;
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
    tasksAll.forEach(task => {
        if (task === null) {
            return -1;
        }

        cardCreate(task.task, task.list);
    });
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
    var taskOriginal = taskFindText(buttonUpdate);

    // Display a prompt to update the selected task
    var taskUpdated = prompt('Update task', taskOriginal);
    if (taskUpdated === null) {
        return false;
    }

    // If task was updated, find the original task and update it
    var taskIndex = taskFindIndex(taskOriginal);
    tasksAll[taskIndex].task = taskUpdated;
    // Request API to update task
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
    var taskIndex = taskFindIndex(task);
    tasksAll[taskIndex] = null;
    // Request API to delete task
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

function taskFindIndex (taskOriginal) {
    var index = tasksAll.findIndex(task => {
        if (task === null) {
            return false;
        }

        return task.task === taskOriginal;
    });

    return index;
}

// Handle addition of new tasks
function taskCreate (event) {
    if (event.key !== 'Enter') {
        return false;
    }

    var task = input.value;
    input.value = '';
    tasksAll.push({
        list: 'todo',
        task: task
    });
    // Request API to create task
    kanbanRedraw();
}

// Handle movement of tasks to next 
function taskMove (event) {
    var task = event.target.lastChild.textContent;
    var origin = event.target.parentNode.id;
    var destination = undefined;

    switch (origin) {
        case 'todo':
            destination = 'doing';
            break;
        case 'doing':
            destination = 'done';
            break;
    }

    if (destination === undefined) {
        return false;
    }

    var taskIndex = taskFindIndex(task);
    tasksAll[taskIndex].list = destination;
    // Request API to update task
    kanbanRedraw();
}
