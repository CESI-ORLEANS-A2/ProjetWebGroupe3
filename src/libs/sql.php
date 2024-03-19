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
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
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

    public function __construct($host, $dbname, $username, $password) {
        $this->connection = new DatabaseConnection($host, $dbname, $username, $password);
    }

    public function getConnection() {
        return $this->connection->getPdo();
    }

    public function executeQuery($query, $params = []) {
        $stmt = $this->connection->getPdo()->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }

    public function fetchAll($query, $params = []) {
        $stmt = $this->executeQuery($query, $params);
        return $stmt->fetchAll();
    }

    public function fetch($query, $params = []) {
        $stmt = $this->executeQuery($query, $params);
        return $stmt->fetch();
    }

    public function insert($table, $data) {
        $columns = implode(", ", array_keys($data));
        $values = ":" . implode(", :", array_keys($data));
        $query = "INSERT INTO $table ($columns) VALUES ($values)";
        $this->executeQuery($query, $data);
    }

    public function update($table, $data, $condition) {
        $set = "";
        foreach ($data as $column => $value) {
            $set .= "$column = :$column, ";
        }
        $set = rtrim($set, ", ");
        $query = "UPDATE $table SET $set WHERE $condition";
        $this->executeQuery($query, $data);
    }

    public function delete($table, $condition) {
        $query = "DELETE FROM $table WHERE $condition";
        $this->executeQuery($query);
    }
}