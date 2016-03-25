CREATE KEYSPACE sensors WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

USE sensors;

CREATE TABLE readings (
  id text PRIMARY KEY,
  external_id int,
  type text,
  date timestamp,
  temperature double,
  humidity double,
  concentration double
);
