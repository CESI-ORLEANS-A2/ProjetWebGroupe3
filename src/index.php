<?php 

require_once 'modules/vendor/autoload.php';
require_once 'libs/router.php';
require_once 'libs/twigHelpers.php';
require_once 'configs/twigConf.php';
require_once 'libs/sql.php';

$loader = new \Twig\Loader\FilesystemLoader(['./templates', './components', './static']);
$twig = new \Twig\Environment($loader);

$db = new Database('localhost', $DBNAME, 'root', 'toor');

$twig->addExtension(new \Odan\Twig\TwigAssetsExtension($twig, $options));
$twig->addExtension(new TwigHelper($twig));
$twig->addExtension(new \Twig\Extension\DebugExtension());

$router = new Router($twig);

$router->resolve($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD'], file_get_contents('php://input'), $db);
?>