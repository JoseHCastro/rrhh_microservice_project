// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PlanillaRegistry
 * @dev Contrato para almacenar de forma inmutable los hashes (firmas digitales) 
 * de las planillas de sueldos generadas por el sistema RRHH.
 */
contract PlanillaRegistry {
    
    // Propietario del contrato (ej. cuenta de la empresa)
    address public owner;

    // Evento que se emite cada vez que se registra una planilla
    // Permite que las aplicaciones escuchen o busquen registros fácilmente
    event PlanillaRegistrada(
        string hashDocumento,
        uint256 empleadoId,
        string periodo,
        uint256 timestamp
    );

    // Estructura para almacenar los metadatos de la planilla
    struct PlanillaRecord {
        string hashDocumento;
        uint256 empleadoId;
        string periodo;
        uint256 timestamp;
        address registrador;
    }

    // Mapeo: hash del documento => PlanillaRecord
    mapping(string => PlanillaRecord) public registros;

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede realizar esta accion");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Registra el hash de una planilla en la blockchain.
     * @param _hashDocumento El hash SHA-256 del PDF de la planilla.
     * @param _empleadoId El ID del empleado en el sistema relacional.
     * @param _periodo El periodo de la planilla (ej. "2025-05").
     */
    function registrarPlanilla(
        string memory _hashDocumento,
        uint256 _empleadoId,
        string memory _periodo
    ) public onlyOwner {
        // Verificar que el documento no haya sido registrado antes
        require(registros[_hashDocumento].timestamp == 0, "Este documento ya fue registrado");

        PlanillaRecord memory nuevoRegistro = PlanillaRecord({
            hashDocumento: _hashDocumento,
            empleadoId: _empleadoId,
            periodo: _periodo,
            timestamp: block.timestamp,
            registrador: msg.sender
        });

        registros[_hashDocumento] = nuevoRegistro;

        // Emitir evento
        emit PlanillaRegistrada(_hashDocumento, _empleadoId, _periodo, block.timestamp);
    }

    /**
     * @dev Verifica si un hash existe en el registro.
     * @param _hashDocumento El hash SHA-256 a buscar.
     * @return true si existe, false si no.
     */
    function verificarPlanilla(string memory _hashDocumento) public view returns (bool) {
        return registros[_hashDocumento].timestamp != 0;
    }
}
