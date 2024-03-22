<?php

/**
 * The base controller class.
 */
class ControllerBase {
    protected mixed $request;
    protected $twig;
    protected $params;
    protected $template;
    protected $db;

    /**
     * Constructor for the ControllerBase class.
     *
     * @param mixed $request The request object.
     * @param mixed $twig The Twig object.
     * @param mixed $params The dynamic file parameters.
     * @param mixed $db The database object.
     */
    protected function __construct($request, $twig, $params, $db = null) {
        $this->request = $request;
        $this->twig = $twig;
        $this->params = $params;
        $this->db = $db;
    }

    /**
     * Renders the template with the given parameters.
     *
     * @param string $template The template file path.
     * @param array $params The parameters to pass to the template.
     * @return void
     */
    protected function render($template, $params = []) {
        echo $this->twig->render($template, $params);
    }
}

/**
 * The API controller class.
 */
class ControllerAPI extends ControllerBase {
    /**
     * Custom methods and their corresponding functions.
     *
     * @var array
     * @example ['METHOD' => function() { return 'Hello, World!'; }]
     */
    protected array $custom;

    /**
     * Constructor for the ControllerAPI class.
     *
     * @param mixed $request The request object.
     * @param mixed $twig The Twig object.
     * @param mixed $params The dynamic file parameters.
     * @param mixed $db The database object.
     * @param array $custom Custom methods and their corresponding functions.
     */
    protected function __construct($request, $twig, $params, $db = null, $custom = []) {
        $this->custom = $custom;

        parent::__construct($request, $twig, $params, $db);

        header('Content-Type: application/json');
    }

    /**
     * Handles errors and returns a JSON response.
     *
     * @param string $message The error message.
     * @return string The JSON response.
     */
    protected function onError($message) {
        http_response_code(500);
        return json_encode(['error' => $message]);
    }

    /**
     * Returns a JSON response for a successful operation.
     *
     * @param string $message The success message.
     * @return string The JSON response.
     */
    protected function onSuccess($message){
        return json_encode(['success' => $message]);
    }

    /**
     * Runs the API controller.
     *
     * @return string The JSON response.
     */
    public function run() {
        try {
            switch ($this->request['method']) {
                case 'GET':
                    return $this->get();
                    break;

                case 'POST':
                    return $this->post();
                    break;

                case 'PUT':
                    return $this->put();
                    break;

                case 'DELETE':
                    return $this->delete();
                    break;

                case 'PATCH':
                    return $this->patch();
                    break;
                
                case 'OPTIONS':
                    return $this->options();
                    break;
                
                case 'HEAD':
                    return $this->head();
                    break;

                default:
                    foreach ($this->custom as $key => $value) {
                        if ($key == $this->request['method']) {
                            return $value();
                        }
                    }

                    http_response_code(405);
                    return json_encode(['error' => 'Method not supported']);
                    break;
            }
        } catch (\Throwable $th) {
            $this->onError($th->getMessage());
        }

        return $this->onSuccess('Operation successful');
    }

    /**
     * Handles the GET method.
     *
     * @return string The JSON response.
     */
    protected function get() {
        http_response_code(405);
        return json_encode(['error' => 'Method not supported']);
    }

    /**
     * Handles the POST method.
     *
     * @return string The JSON response.
     */
    protected function post() {
        http_response_code(405);
        return json_encode(['error' => 'Method not supported']);
    }

    /**
     * Handles the PUT method.
     *
     * @return string The JSON response.
     */
    protected function put() {
        http_response_code(405);
        return json_encode(['error' => 'Method not supported']);
    }

    /**
     * Handles the DELETE method.
     *
     * @return string The JSON response.
     */
    protected function delete() {
        http_response_code(405);
        return json_encode(['error' => 'Method not supported']);
    }

    /**
     * Handles the PATCH method.
     *
     * @return string The JSON response.
     */
    protected function patch() {
        http_response_code(405);
        return json_encode(['error' => 'Method not supported']);
    }

    /**
     * Handles the OPTIONS method.
     *
     * @return string The JSON response.
     */
    protected function options() {
        http_response_code(405);
        return json_encode(['error' => 'Method not supported']);
    }

    /**
     * Handles the HEAD method.
     *
     * @return string The JSON response.
     */
    protected function head() {
        http_response_code(405);
        return json_encode(['error' => 'Method not supported']);
    }
}