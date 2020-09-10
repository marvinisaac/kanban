<?php
    $tasksJson = file_get_contents('../tasks.json');

    header("HTTP/1.0 200 OK");
    header('Content-Type: application/json');
    echo $tasksJson;
