package com.example.rrhh.shared.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " no encontrado con id: " + id);
    }
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
