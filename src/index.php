<?php 

require_once 'modules/vendor/autoload.php';
require_once 'libs/router.php';

$loader = new \Twig\Loader\FilesystemLoader(['./templates', './components']);
$twig = new \Twig\Environment($loader);

$router = new Router($twig);

$router->resolve($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD'], file_get_contents('php://input'));
?>