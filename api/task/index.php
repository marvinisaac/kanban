<?php
    $method = $_SERVER['REQUEST_METHOD'];
    $bodyRaw = file_get_contents('php://input');
    $body = json_decode($bodyRaw, true);

    $tasks = getTasks();

    switch ($method) {
        case 'POST': {
            array_push($tasks, [
                'list' => $body['list'],
                'task' => $body['task'],
            ]);
            saveTasks($tasks);

            header("HTTP/1.0 204 OK");
            header('Content-Type: application/json');
            break;
        }
    }

    function getTasks () {
        if (!file_exists('../tasksApi.json')) {
            $tasksEmpty = json_encode([], JSON_PRETTY_PRINT);
            file_put_contents('../tasksApi.json', $tasksEmpty);
            $tasksJson = file_get_contents('../tasksApi.json');
        }

        $tasksJson = file_get_contents('../tasksApi.json');
        $tasks = json_decode($tasksJson);
        return $tasks;
    }

    function saveTasks ($tasks) {
        $tasksJson = json_encode($tasks, JSON_PRETTY_PRINT);
        file_put_contents('../tasksApi.json', $tasksJson);
    }
