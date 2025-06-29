// src/main/java/com/zusa/backend/config/RestExceptionHandler.java
package com.zusa.backend.config;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String,Object> notFound(EntityNotFoundException ex){
        return Map.of("timestamp", Instant.now(),"message", ex.getMessage());
    }

    @ExceptionHandler({IllegalArgumentException.class, BindException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String,Object> badRequest(Exception ex){
        return Map.of("timestamp", Instant.now(),"message", ex.getMessage());
    }

    @ExceptionHandler(SecurityException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Map<String,Object> forbidden(SecurityException ex){
        return Map.of("timestamp", Instant.now(),"message", ex.getMessage());
    }
}
