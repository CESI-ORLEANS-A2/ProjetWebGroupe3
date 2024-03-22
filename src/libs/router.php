<?php

/**
 * The Router class handles the routing logic for the application.
 */
class Router
{
    private string $startPath = "app";
    private \Twig\Environment $twig;

    /**
     * Constructs a new Router instance.
     *
     * @param \Twig\Environment $twig The Twig environment.
     */
    public function __construct($twig){
        $this->twig = $twig;
    }

    /**
     * Checks if a file is dynamic and updates the parameters and path accordingly.
     *
     * @param string $file The file name.
     * @param string $value The value from the URL.
     * @param array $params The parameters array.
     * @param string $path The current path.
     * @return bool Returns true if the file is dynamic, false otherwise.
     */
    private function checkDynamic($file, $value, &$params, &$path){
        if (preg_match('/^\[.*\]($|\.php$)/', $file)){
            preg_match_all('/\[(.*)\]/', $file, $matches, PREG_SET_ORDER);
            $params[$matches[0][1]] = $value;
            $path .= "/" . $matches[0][0];
            return true;
        }
        return false;
    }

    /**
     * Resolves the request by matching the URL path with the corresponding file.
     *
     * @param string $uri The request URI.
     * @param string $method The request method.
     * @param string $body The request body.
     * @param mixed $db The database connection.
     * @return void
     */
    public function resolve($uri, $method, $body, $db){
        // Parse the URL
        $parsedUrl = parse_url($uri);
        // Extract the path from the parsed URL
        $urlPath = explode('/', $parsedUrl['path']);
        $urlPath = array_splice($urlPath, 1);
        $path = "";
        // Create a request object with URL, method, query, and body
        $request = [
            "url" => $uri,
            "method" => $method,
            "query" => $parsedUrl['query'] ?? "",
            "body" => json_decode($body, true) ?? []
        ];
        $found = false;
        $params = [];

        // Iterate through each segment of the URL path
        foreach ($urlPath as $key => $value) {
            $listOfFiles = [];
            // Check if the current path is a directory
            if (is_dir($this->startPath . "/" . $path)) {
                // Get the list of files in the directory
                $listOfFiles = array_slice(scandir($this->startPath . "/" . $path), 2);
            }

            // Check if the current value is not a file or a PHP file 
            // To check if a dynamic file exist in the directory or if the path is invalid
            if (!file_exists($this->startPath . "/" . $path . "/" . $value) &&
                !file_exists($this->startPath . "/" . $path . "/" . $value . ".php")
            ){
                // Check if the current value is dynamic and update the parameters and path accordingly
                // Iterate through the list of files in the directory
                foreach ($listOfFiles as $file) {
                    $found = $this->checkDynamic($file, $value, $params, $path);
                    if ($found){
                        break;
                    }
                }

                // If no dynamic file is found, render the 404 Not Found page
                if (!$found){
                    return $this->render404();
                }

                $found = false;
                
            } else {
                // Append the current value to the path
                $path .= "/" . $value;
            }
        }

        // Check if the last segment of the URL path is empty
        if ($urlPath[array_key_last($urlPath)] === "") {
            $path .= "_";
        } else if (is_dir($this->startPath . "/" . $path) && !is_file($this->startPath . "/" . $path . ".php")){
            $path .= "/_";
        }

        // Check if the PHP file exists
        if (!file_exists($this->startPath . $path . ".php")){
            return $this->render404();
        }

        // Require the PHP file and create a controller instance
        require_once($this->startPath . $path . ".php");
        $controller = new Controller($request, $this->twig, $params, $db);
        // Run the controller and echo the result
        echo $controller->run();
    }

    /**
     * Renders the 404 Not Found page.
     *
     * @return void
     */
    public function render404()
    {
        // echo $this->twig->render("404.twig");
        echo "404 Not Found";
    }
}
