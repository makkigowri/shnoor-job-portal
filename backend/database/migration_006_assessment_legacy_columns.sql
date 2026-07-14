BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_questions' AND column_name = 'question'
  ) THEN
    UPDATE assessment_questions
    SET question_text = question
    WHERE (question_text IS NULL OR question_text = '')
      AND question IS NOT NULL;

    ALTER TABLE assessment_questions ALTER COLUMN question DROP NOT NULL;
  END IF;
END $$;
DECLARE
  rec RECORD;
  known_columns TEXT[];
BEGIN
  known_columns := ARRAY['id','recruiter_id','job_id','title','description',
    'instructions','duration_minutes','total_marks','passing_marks','status',
    'created_at','updated_at'];
  FOR rec IN
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'assessments' AND is_nullable = 'NO'
      AND column_name <> ALL(known_columns)
  LOOP
    EXECUTE format('ALTER TABLE assessments ALTER COLUMN %I DROP NOT NULL', rec.column_name);
    RAISE NOTICE 'Relaxed NOT NULL on assessments.%', rec.column_name;
  END LOOP;
  known_columns := ARRAY['id','assessment_id','question_text','question_type',
    'options','correct_answer','marks','order_index','created_at','updated_at'];
  FOR rec IN
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'assessment_questions' AND is_nullable = 'NO'
      AND column_name <> ALL(known_columns)
  LOOP
    EXECUTE format('ALTER TABLE assessment_questions ALTER COLUMN %I DROP NOT NULL', rec.column_name);
    RAISE NOTICE 'Relaxed NOT NULL on assessment_questions.%', rec.column_name;
  END LOOP;
  known_columns := ARRAY['id','assessment_id','candidate_id','application_id',
    'recruiter_id','scheduled_start','scheduled_end','status','assigned_at','updated_at'];
  FOR rec IN
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'assessment_assignments' AND is_nullable = 'NO'
      AND column_name <> ALL(known_columns)
  LOOP
    EXECUTE format('ALTER TABLE assessment_assignments ALTER COLUMN %I DROP NOT NULL', rec.column_name);
    RAISE NOTICE 'Relaxed NOT NULL on assessment_assignments.%', rec.column_name;
  END LOOP;
  known_columns := ARRAY['id','assignment_id','assessment_id','candidate_id',
    'started_at','submitted_at','time_taken_seconds','total_score','max_score',
    'percentage','result','status','created_at','updated_at'];
  FOR rec IN
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'assessment_submissions' AND is_nullable = 'NO'
      AND column_name <> ALL(known_columns)
  LOOP
    EXECUTE format('ALTER TABLE assessment_submissions ALTER COLUMN %I DROP NOT NULL', rec.column_name);
    RAISE NOTICE 'Relaxed NOT NULL on assessment_submissions.%', rec.column_name;
  END LOOP;
  known_columns := ARRAY['id','submission_id','question_id','answer_text',
    'is_correct','marks_obtained','answered_at','updated_at'];
  FOR rec IN
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'assessment_answers' AND is_nullable = 'NO'
      AND column_name <> ALL(known_columns)
  LOOP
    EXECUTE format('ALTER TABLE assessment_answers ALTER COLUMN %I DROP NOT NULL', rec.column_name);
    RAISE NOTICE 'Relaxed NOT NULL on assessment_answers.%', rec.column_name;
  END LOOP;
END $$;
