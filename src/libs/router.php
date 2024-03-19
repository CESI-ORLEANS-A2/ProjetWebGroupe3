<?php
class Router
{
    private string $startPath = "app";
    private \Twig\Environment $twig;

    public function __construct($twig){
        $this->twig = $twig;
    }

    public function resolve($uri, $method, $body){
        $parsedUrl = parse_url($uri);
        $urlPath = explode('/', $parsedUrl['path']);
        $request = [
            "url" => $uri,
            "method" => $method,
            "query" => $parsedUrl['query'] ?? "",
            "body" => $body
        ];

        foreach ($urlPath as $key => $value) {
            $path = implode('/', array_slice($urlPath, 0, $key + 1));

            if ((!preg_match('/^[a-zA-Z0-9_ -]+$/', $value) && $value !== '') ||
                strpos($value, '..') !== false ||
                (!file_exists($this->startPath . $path) && !file_exists($this->startPath . $path . ".php"))
            ) {
                return $this->render404();
            }
        }

        if ($urlPath[array_key_last($urlPath)] === "") {
            $path = $path . "_";
        }

        require($this->startPath . $path . ".php");
        $controller = new Controller($request, $this->twig);
        $controller->run();
    }

    public function render404()
    {
        // echo $this->twig->render("404.twig");
        echo "404 Not Found";
    }
}
