#!/usr/bin/env sh
BASEDIR=$(dirname "$0")
BASEDIR=${BASEDIR/\/scripts/}
DATABASE_PATH="${BASEDIR}/data"
TEST_DATA_BASE="$DATABASE_PATH/test.db3"
RUN_DATA_BASE="$DATABASE_PATH/user.db3"
SQLITE=${BASEDIR}/scripts/sqlite/sqlite3
SQL_FILE=${BASEDIR}/scripts/database.sql

if [ ! -f "$TEST_DATA_BASE" ]; then
    mkdir -p $DATABASE_PATH
    echo "Creating $TEST_DATA_BASE..."
    touch $TEST_DATA_BASE
    echo "Preparing $TEST_DATA_BASE..."
    $SQLITE $TEST_DATA_BASE < $SQL_FILE
fi
if [ ! -f "$RUN_DATA_BASE" ]; then
    echo "Creating $RUN_DATA_BASE..."
    touch $RUN_DATA_BASE
    echo "Preparing $RUN_DATA_BASE..."
    $SQLITE $RUN_DATA_BASE < $SQL_FILE
fi

echo "Backend all set!!!"