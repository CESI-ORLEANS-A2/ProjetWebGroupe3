<?php

class TwigHelper extends \Twig\Extension\AbstractExtension implements \Twig\Extension\GlobalsInterface {
    protected $twig;
    protected $config;

    protected $css = [];
    protected $js = [];
    protected $name = 'crampte';

    public function __construct($twig) {
        $this->twig = $twig;
    }

    public function getFunctions() {
        return [
            new \Twig\TwigFunction('addCSS', [$this, 'addCSS']),
            new \Twig\TwigFunction('addJS', [$this, 'addJS']),
            new \Twig\TwigFunction('getCSS', [$this, 'getCSS']),
            new \Twig\TwigFunction('getJS', [$this, 'getJS']),
        ];
    }

    public function getGlobals(): array {
        return [
            'name' => $this->name,
            'twig' => $this->twig,
        ];
    }

    public function addCSS(string|array $value) {
        if (is_array($value)) {
            foreach ($value as $v) {
                if (!in_array($v, $this->css))
                    array_push($this->css, $v);
            }
        } else if (is_string($value)) {
            if (!in_array($value, $this->css))
                array_push($this->css, $value);
        }
    }

    public function addJS(string|array $value) {
        if (is_array($value)) {
            foreach ($value as $v) {
                if (!in_array($v, $this->js))
                    array_push($this->js, $v);
            }
        } else if (is_string($value)) {
            if (!in_array($value, $this->js))
                array_push($this->js, $value);
        }
    }

    public function getCSS() {
        return $this->css;
    }

    public function getJS() {
        return $this->js;
    }
}