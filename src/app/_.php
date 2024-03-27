<?php

require_once ('libs/controller.php');
require_once ('libs/sql.php');

class Controller extends ControllerBase {
    public function __construct($request, $twig) {
        parent::__construct($request, $twig, null, null);
    }

    public function run(){
        $template = $this->twig->load('crampte.twig');
        echo $template->render([]);
    }
}