<?php
    $todo = json_decode($_GET['todo']);
    $doing = json_decode($_GET['doing']);
    $done = json_decode($_GET['done']);
    $tasks = [
        'todo' => $todo,
        'doing' => $doing,
        'done' => $done,
    ];

    $tasksJson = json_encode($tasks, JSON_PRETTY_PRINT);
    file_put_contents('../tasks.json', $tasksJson);

    header("HTTP/1.0 204 Created");
