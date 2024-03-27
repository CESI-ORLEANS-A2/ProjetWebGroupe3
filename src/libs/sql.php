<?php

class DatabaseConnection {
    private $pdo;

    public function __construct($host, $dbname, $username, $password) {
        try {
            // Create a new PDO instance
            $this->pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            
            // Set PDO error mode to exception
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Set default fetch mode to associative array
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
            
            // Additional PDO configurations if needed
            // ...
        } catch (PDOException $e) {
            // Handle any errors that occur during PDO connection
            echo "Connection failed: " . $e->getMessage();
            exit();
        }
    }

    public function getPdo() {
        return $this->pdo;
    }
}

class Database {
    private $connection;
    private $host;
    private $dbname;
    private $username;
    private $password;

    public function __construct($host, $dbname, $username, $password) {
        $this->host = $host;
        $this->dbname = $dbname;
        $this->username = $username;
        $this->password = $password;

        $this->connection = new DatabaseConnection($host, $dbname, $username, $password);
    }

    public function getConnection() {
        return $this->connection->getPdo();
    }

    public function prepare($query) {
        return $this->connection->getPdo()->prepare($query);
    }

    public function prepareAndExecute($query, $params = []) {
        $stmt = $this->connection->getPdo()->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }

    public function fetchAll($query, $params = []) {
        $stmt = $this->prepareAndExecute($query, $params);
        return $stmt->fetchAll();
    }

    public function fetch($query, $params = []) {
        $stmt = $this->prepareAndExecute($query, $params);
        return $stmt->fetch();
    }

    public function __wakeup(){
        $this->connection = new DatabaseConnection($this->host, $this->dbname, $this->username, $this->password);
    }

    public function __sleep(){
        return ['host', 'dbname', 'username', 'password'];
    }
}

class DBObjectInterface {
    public function toArray() {
        return get_object_vars($this);
    }

    public function __toString() {
        return json_encode($this->toArray());
    }

    public function toObject() {
        return (object) $this->toArray();
    }

    public function __serialize(){
        return $this->toArray();
    }

    public function fromArray($data){
        // Check
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function fromString($data){
        $this->fromArray(json_decode($data, true));
    }

    public function fromObject($data){
        $this->fromArray((array) $data);
    }

    public function __unserialize($data){
        $this->fromArray($data);
    }
}