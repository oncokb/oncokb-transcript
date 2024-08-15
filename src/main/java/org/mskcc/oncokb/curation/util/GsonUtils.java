package org.mskcc.oncokb.curation.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.time.Instant;
import org.mskcc.oncokb.curation.config.InstantTypeAdapter;

public class GsonUtils {

    public static Gson create() {
        // https://medium.com/@pratiktikarye/instant-to-gson-conversion-in-java-17-2673bb59fbea
        return new GsonBuilder().registerTypeAdapter(Instant.class, new InstantTypeAdapter()).create();
    }
}
