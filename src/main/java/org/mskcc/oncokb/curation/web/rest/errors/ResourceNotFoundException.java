package org.mskcc.oncokb.curation.web.rest.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.ErrorResponseException;
import tech.jhipster.web.rest.errors.ProblemDetailWithCause.ProblemDetailWithCauseBuilder;

public class ResourceNotFoundException extends ErrorResponseException {

    private static final long serialVersionUID = 1L;

    private final String entityName;

    private final String errorKey;

    public ResourceNotFoundException(String defaultMessage, String entityName, String errorKey) {
        super(
            HttpStatus.NOT_FOUND,
            ProblemDetailWithCauseBuilder.instance()
                .withStatus(HttpStatus.NOT_FOUND.value())
                .withType(ErrorConstants.RESOURCE_NOT_FOUND)
                .withTitle(defaultMessage)
                .withProperty("message", "error." + errorKey)
                .withProperty("params", entityName)
                .build(),
            null
        );
        this.entityName = entityName;
        this.errorKey = errorKey;
    }

    public String getEntityName() {
        return entityName;
    }

    public String getErrorKey() {
        return errorKey;
    }
}
