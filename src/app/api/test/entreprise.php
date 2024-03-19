<?php

require_once ('libs/controller.php');
require_once ('libs/sql.php');

class Controller extends ControllerBase {
    public function __construct($request, $twig) {
        parent::__construct($request, $twig);
    }

    public function run(){
        $host = "localhost";
        $dbname = "testdb";
        $username = "root";
        $password = "toor";

        $database = new Database($host, $dbname, $username, $password);

        $result = $database->fetchAll("SELECT * FROM entreprise");

        // Construct response (application/json, status code 200 OK, CORS headers, etc.)
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        http_response_code(200);
        echo json_encode($result);
    }
}