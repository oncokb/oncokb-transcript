package org.mskcc.oncokb.curation.config;

import com.google.gson.*;
import java.lang.reflect.Type;
import java.time.Instant;

public class InstantTypeAdapter implements JsonSerializer<Instant>, JsonDeserializer<Instant> {

    @Override
    public Instant deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) {
        if (json.isJsonPrimitive()) {
            // Handle the ISO 8601 string format
            return Instant.parse(json.getAsString());
        } else if (json.isJsonObject()) {
            // Handle the {"seconds":..., "nanos":...} object format
            JsonObject jsonObject = json.getAsJsonObject();
            long seconds = jsonObject.get("seconds").getAsLong();
            int nanos = jsonObject.get("nanos").getAsInt();
            return Instant.ofEpochSecond(seconds, nanos);
        } else {
            throw new JsonParseException("Unexpected JSON type: " + json.getClass().getSimpleName());
        }
    }

    @Override
    public JsonElement serialize(Instant instant, Type type, JsonSerializationContext JsonDeserializationContext) {
        return new JsonPrimitive(instant.toString());
    }
}
