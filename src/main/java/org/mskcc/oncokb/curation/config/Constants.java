package org.mskcc.oncokb.curation.config;

/**
 * Application constants.
 */
public final class Constants {

    // Regex for acceptable logins
    public static final String LOGIN_REGEX = "^(?>[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)|(?>[_.@A-Za-z0-9-]+)$";

    public static final String SYSTEM = "system";
    public static final Integer ENSEMBL_POST_THRESHOLD = 100;
    public static final String DEFAULT_LANGUAGE = "en";

    // Firebase authentication custom token key
    public static final String FIREBASE_CUSTOM_TOKEN = "firebaseCustomToken";
    // Name of additional JWT claim added for authorization to firebase.
    public static final String FIREBASE_AUTHORIZED_CLAIM = "firebaseAuthorizedUser";

    private Constants() {}
}
