<?php

class ControllerBase {
    protected mixed $request;
    protected $twig;
    protected $template;

    protected function __construct($request, $twig) {
        $this->request = $request;
        $this->twig = $twig;
    }

    protected function render($template, $params = []) {
        echo $this->twig->render($template, $params);
    }
}