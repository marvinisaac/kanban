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

        case 'GET': {
            $id = getTaskId();
            if ($id === null) {
                header("HTTP/1.0 200 OK");
                header('Content-Type: application/json');
                echo json_encode($tasks);
                break;
            }

            if (isset($tasks[$id])) {
                header("HTTP/1.0 200 OK");
                header('Content-Type: application/json');
                echo json_encode($tasks[$id]);
                break;
            }

            header("HTTP/1.0 404 Not Found");
            break;
        }

        default: {
            header("HTTP/1.0 405 Method Not Allowed");
            break;
        }
    }

    function getTaskId () {
        // Source: https://developer.okta.com/blog/2019/03/08/simple-rest-api-php#:~:text=$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = explode( '/', $uri );
        $id = null;
        if (isset($uri[4]) &&
            $uri[4] !== ''
        ) {
            $id = $uri[4] - 1;
        }
        
        return $id;
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
