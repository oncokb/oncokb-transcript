package org.mskcc.oncokb.curation.util;

import static org.mskcc.oncokb.curation.config.Constants.NY_ZONE_ID;
import static org.mskcc.oncokb.curation.config.Constants.UTC_ZONE_ID;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.FormatStyle;
import java.time.temporal.ChronoField;
import java.util.Locale;

public class TimeUtil {

    public static String toSystemDefaultZoneTime(Instant time) {
        DateTimeFormatter formatter = DateTimeFormatter
            .ofLocalizedDateTime(FormatStyle.FULL)
            .withLocale(Locale.US)
            .withZone(ZoneId.systemDefault());
        return formatter.format(time);
    }

    public static String toNYZoneTime(Instant time) {
        DateTimeFormatter formatter = DateTimeFormatter
            .ofLocalizedDateTime(FormatStyle.FULL)
            .withLocale(Locale.US)
            .withZone(ZoneId.of(NY_ZONE_ID));
        return formatter.format(time);
    }

    public static ZonedDateTime getCurrentNYTime() {
        return ZonedDateTime.now(ZoneId.of(NY_ZONE_ID));
    }

    public static Instant parseDbStringInstant(String instantStr) {
        // 2020-10-23 08:00:00.000000
        DateTimeFormatter dateTimeFormatter = new DateTimeFormatterBuilder()
            .appendPattern("yyyy-MM-dd HH:mm:ss")
            .appendFraction(ChronoField.NANO_OF_SECOND, 1, 9, true)
            .toFormatter();
        LocalDateTime localDateTime = LocalDateTime.parse(instantStr, dateTimeFormatter);
        ZoneId zoneId = ZoneId.of(UTC_ZONE_ID);
        ZonedDateTime zonedDateTime = localDateTime.atZone(zoneId);
        return zonedDateTime.toInstant();
    }
}
