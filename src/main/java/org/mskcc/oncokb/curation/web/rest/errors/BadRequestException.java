package org.mskcc.oncokb.curation.web.rest.errors;

import java.net.URI;
import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class BadRequestException extends AbstractThrowableProblem {

    private static final long serialVersionUID = 1L;

    public BadRequestException(String defaultMessage) {
        this(ErrorConstants.DEFAULT_TYPE, defaultMessage);
    }

    public BadRequestException(URI type, String defaultMessage) {
        super(type, defaultMessage, Status.BAD_REQUEST, null, null, null);
    }
}
