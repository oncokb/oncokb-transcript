package org.mskcc.oncokb.curation.config;

import com.google.gson.*;
import java.lang.reflect.Type;
import java.time.Instant;

public class InstantTypeAdapter implements JsonSerializer<Instant>, JsonDeserializer<Instant> {

    @Override
    public Instant deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) {
        return Instant.parse(json.getAsString());
    }

    @Override
    public JsonElement serialize(Instant instant, Type type, JsonSerializationContext JsonDeserializationContext) {
        return new JsonPrimitive(instant.toString());
    }
}
