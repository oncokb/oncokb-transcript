#!/bin/sh

echo "The application will start in ${ONCOKB_SLEEP}s..." && sleep ${ONCOKB_SLEEP}
exec java ${JAVA_OPTS} -noverify -XX:+AlwaysPreTouch -Djava.security.egd=file:/dev/./urandom -cp /app/resources/:/app/classes/:/app/libs/* "org.mskcc.oncokb.curation.OncokbCurationApp"  "$@"
