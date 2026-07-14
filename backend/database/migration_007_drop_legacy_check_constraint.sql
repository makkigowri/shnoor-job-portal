DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'assessment_questions'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%correct_answer%'
  LOOP
    EXECUTE format('ALTER TABLE assessment_questions DROP CONSTRAINT %I', rec.conname);
    RAISE NOTICE 'Dropped legacy check constraint % on assessment_questions', rec.conname;
  END LOOP;
END $$;