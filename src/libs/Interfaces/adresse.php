<?php 

include_once 'libs/sql.php';

class Address extends DBObjectInterface {
    private int $IdAdresse;
    private int $Numero;
    private string $NomRue;
    private int $IdVille;

    public function __construct($IdAdresse, $Numero, $NomRue, $IdVille) {
        $this->IdAdresse = $IdAdresse;
        $this->Numero = $Numero;
        $this->NomRue = $NomRue;
        $this->IdVille = $IdVille;
    }

    public function IdAdresse($IdAdresse) {
        if (isset($IdAdresse)) {
            $this->IdAdresse = $IdAdresse;
            return $this;
        }
        return $this->IdAdresse;
    }

    public function Numero($Numero) {
        if (isset($Numero)) {
            $this->Numero = $Numero;
            return $this;
        }
        return $this->Numero;
    }

    public function NomRue($NomRue) {
        if (isset($NomRue)) {
            $this->NomRue = $NomRue;
            return $this;
        }
        return $this->NomRue;
    }

    public function IdVille($IdVille) {
        if (isset($IdVille)) {
            $this->IdVille = $IdVille;
            return $this;
        }
        return $this->IdVille;
    }
}

// SELECT `adresse`.`IdAdresse`,
//     `adresse`.`Numero`,
//     `adresse`.`NomRue`,
//     `adresse`.`IdVille`
// FROM `testdb`.`adresse`;


class AddressInterface {
    protected $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAddresses() {
        $query = "SELECT * FROM `adresse`;";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}