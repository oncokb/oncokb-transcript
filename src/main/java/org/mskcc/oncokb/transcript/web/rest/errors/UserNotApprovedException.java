package org.mskcc.oncokb.transcript.web.rest.errors;

import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

public class UserNotApprovedException extends AbstractThrowableProblem {

    private static final long serialVersionUID = 1L;

    public UserNotApprovedException() {
        super(ErrorConstants.USER_NOT_APPROVED, "You are not approved to access this site", Status.UNAUTHORIZED);
    }
}
