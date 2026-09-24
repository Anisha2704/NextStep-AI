import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  Clock3,
  RotateCcw,
  Trophy,
  X,
} from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProgressBar from '../../components/ui/ProgressBar';
import { formatDate } from '../../utils';
import {
  clearAssessmentError,
  clearAssessmentSuccess,
  clearCurrentAssessment,
  fetchAssessment,
  fetchAssessmentResult,
  fetchAssessmentResults,
  fetchAssessments,
  submitAssessment,
} from '../../store/slices/assessmentSlice';

const AssessmentPage = () => {
  const dispatch = useDispatch();
  const {
    assessments,
    results,
    activeAssessment,
    currentResult,
    loading,
    loadingAssessment,
    loadingResults,
    loadingReview,
    submitting,
    error,
    success,
  } = useSelector((state) => state.assessments);
  const [answers, setAnswers] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerError, setAnswerError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');

  useEffect(() => {
    if (!assessments.length) dispatch(fetchAssessments());
    if (!results.length) dispatch(fetchAssessmentResults());
  }, [dispatch, assessments.length, results.length]);

  const openAssessment = async (assessment) => {
    setAnswers({});
    setQuestionIndex(0);
    setAnswerError('');
    await dispatch(fetchAssessment(assessment.id));
  };

  const returnToCatalog = () => {
    setAnswers({});
    setQuestionIndex(0);
    setAnswerError('');
    dispatch(clearCurrentAssessment());
  };

  const handleSubmit = () => {
    const questions = activeAssessment?.questions || [];
    if (questions.some((question) => !Number.isInteger(answers[question.id]))) {
      setAnswerError('Answer every question before submitting.');
      return;
    }
    setAnswerError('');
    dispatch(submitAssessment({
      assessmentId: activeAssessment.id,
      answers: questions.map((question) => ({
        questionId: question.id,
        selectedOptionIndex: answers[question.id],
      })),
    }));
  };

  const subjects = [...new Map(assessments.map((assessment) => [assessment.subjectSlug, {
    slug: assessment.subjectSlug,
    name: assessment.subject,
  }]).filter(([slug]) => slug)).values()];
  const topics = assessments.filter((assessment) => selectedSubject === 'all' || assessment.subjectSlug === selectedSubject);
  const visibleAssessments = topics.filter((assessment) => selectedTopic === 'all' || assessment.topicSlug === selectedTopic);
  const groupedAssessments = visibleAssessments.reduce((groups, assessment) => {
    const key = assessment.subject || assessment.category;
    groups[key] = [...(groups[key] || []), assessment];
    return groups;
  }, {});

  if (loadingAssessment || loadingReview) {
    return <LoadingSpinner message={loadingReview ? 'Loading your saved result...' : 'Loading assessment...'} />;
  }

  if (currentResult) {
    const result = currentResult;
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Assessment results</p>
            <h2 className="mt-1 text-3xl font-bold text-text-main">{result.assessmentTitle}</h2>
            <p className="mt-2 text-sm text-text-secondary">{result.subject && `${result.subject} · `}{result.topic || result.assessmentSkill} · {formatDate(result.submittedAt)}</p>
          </div>
          <Button variant="outline" onClick={returnToCatalog}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All assessments
          </Button>
        </header>

        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} onClose={() => dispatch(clearAssessmentError())} />}

        <Card>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${result.passed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {result.passed ? <Trophy className="h-6 w-6" aria-hidden="true" /> : <BookOpenCheck className="h-6 w-6" aria-hidden="true" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main">{result.passed ? 'Assessment passed' : 'Keep practicing'}</h3>
                <p className="text-sm text-text-secondary">Passing score: {result.passingScore}%</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-bold text-text-main">{result.percentage}%</p>
              <p className="text-sm text-text-secondary">{result.score} of {result.totalQuestions} correct</p>
            </div>
          </div>
          <div className="mt-5">
            <ProgressBar value={result.percentage} showLabel size="lg" />
          </div>
        </Card>

        {result.skillBreakdown?.length > 0 && (
          <Card>
            <h3 className="text-lg font-bold text-text-main">Topic skill breakdown</h3>
            <p className="mt-1 text-sm text-text-secondary">See which specific concepts were strongest and which need more practice.</p>
            <div className="mt-4 divide-y divide-border">
              {result.skillBreakdown.map((item) => (
                <div key={item.skill} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-text-main">{item.skill}</span>
                  <span className="text-sm text-text-secondary">{item.correct}/{item.total} correct · {item.percentage}%</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <section className="space-y-4" aria-labelledby="answer-review-title">
          <div>
            <h3 id="answer-review-title" className="text-xl font-bold text-text-main">Answer review</h3>
            <p className="mt-1 text-sm text-text-secondary">Review the correct answers and explanations for each question.</p>
          </div>
          {result.answers.map((answer, index) => (
            <Card key={`${answer.questionId}-${index}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${answer.isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`} aria-hidden="true">
                  {answer.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-main">{index + 1}. {answer.question}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {answer.options.map((option, optionIndex) => {
                      const selected = optionIndex === answer.selectedAnswer;
                      const correct = optionIndex === answer.correctAnswer;
                      return (
                        <li key={optionIndex} className={`rounded-lg border px-3 py-2 ${correct ? 'border-success/30 bg-success/5 text-text-main' : selected ? 'border-error/30 bg-error/5 text-text-main' : 'border-border text-text-secondary'}`}>
                          {option}
                          {correct && <span className="ml-2 font-medium text-success">Correct answer</span>}
                          {selected && !correct && <span className="ml-2 font-medium text-error">Your answer</span>}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-3 text-sm leading-6 text-text-secondary"><span className="font-semibold text-text-main">Why:</span> {answer.explanation}</p>
                  <Badge className="mt-3">{answer.skill}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </section>
      </div>
    );
  }

  if (activeAssessment) {
    const question = activeAssessment.questions[questionIndex];
    const selectedAnswer = answers[question.id];
    const isLastQuestion = questionIndex === activeAssessment.questions.length - 1;
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button onClick={returnToCatalog} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Exit assessment
            </button>
            <h2 className="text-2xl font-bold text-text-main">{activeAssessment.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{activeAssessment.subject && `${activeAssessment.subject} · `}{activeAssessment.topic || activeAssessment.skill} · {activeAssessment.difficulty}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary"><Clock3 className="h-4 w-4" aria-hidden="true" />About {activeAssessment.durationMinutes} minutes</span>
        </header>

        {error && <Alert type="error" message={error} onClose={() => dispatch(clearAssessmentError())} />}
        {answerError && <Alert type="error" message={answerError} />}

        <Card>
          <div className="mb-6">
            <ProgressBar value={Math.round(((questionIndex + 1) / activeAssessment.questions.length) * 100)} showLabel />
            <p className="mt-2 text-xs text-text-secondary" aria-live="polite">
              Question {questionIndex + 1} of {activeAssessment.questions.length}
            </p>
          </div>
          <fieldset>
            <legend className="text-lg font-semibold leading-7 text-text-main">{question.prompt}</legend>
            <p className="mt-1 text-sm text-text-secondary">Topic: {question.skill}</p>
            <div className="mt-5 space-y-3">
              {question.options.map((option, optionIndex) => {
                const inputId = `assessment-${question.id}-option-${optionIndex}`;
                return (
                  <label key={inputId} htmlFor={inputId} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-primary ${selectedAnswer === optionIndex ? 'border-primary bg-primary-light/50' : 'border-border hover:bg-background'}`}>
                    <input
                      id={inputId}
                      type="radio"
                      name={`answer-${question.id}`}
                      value={optionIndex}
                      checked={selectedAnswer === optionIndex}
                      onChange={() => {
                        setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }));
                        setAnswerError('');
                      }}
                      className="mt-1 accent-primary"
                    />
                    <span className="text-sm leading-6 text-text-main">{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" disabled={questionIndex === 0 || submitting} onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous
            </Button>
            {isLastQuestion ? (
              <Button onClick={handleSubmit} loading={submitting} disabled={submitting || !Number.isInteger(selectedAnswer)}>
                Submit assessment
              </Button>
            ) : (
              <Button disabled={!Number.isInteger(selectedAnswer)} onClick={() => setQuestionIndex((index) => index + 1)}>
                Next question <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
          <p className="mt-3 text-xs text-text-secondary">Your answers are scored on the server when you submit.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Check your understanding</p>
        <h2 className="mt-1 text-3xl font-bold text-text-main">Skills assessment</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Take a short knowledge check, get a scored review with explanations, and track your attempts over time.
        </p>
      </header>

      {error && <Alert type="error" message={error} onClose={() => dispatch(clearAssessmentError())} />}
      {success && <Alert type="success" message={success} onClose={() => dispatch(clearAssessmentSuccess())} />}
      {error && !activeAssessment && !currentResult && (
        <Button variant="outline" onClick={() => {
          dispatch(clearAssessmentError());
          dispatch(fetchAssessments());
          dispatch(fetchAssessmentResults());
        }}>
          Retry loading assessments
        </Button>
      )}

      {loading ? (
        <LoadingSpinner message="Loading available assessments..." />
      ) : assessments.length ? (
        <section className="space-y-4" aria-labelledby="available-assessments-title">
          <div>
            <h3 id="available-assessments-title" className="text-xl font-bold text-text-main">Available assessments</h3>
            <p className="mt-1 text-sm text-text-secondary">Choose a topic to start. Your answers are not shown until you submit.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-text-main">
              Subject
              <select className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={selectedSubject} onChange={(event) => {
                setSelectedSubject(event.target.value);
                setSelectedTopic('all');
              }}>
                <option value="all">All subjects</option>
                {subjects.map((subject) => <option key={subject.slug} value={subject.slug}>{subject.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-text-main">
              Topic
              <select className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)}>
                <option value="all">All topics</option>
                {topics.map((assessment) => <option key={assessment.topicSlug || assessment.id} value={assessment.topicSlug}>{assessment.topic}</option>)}
              </select>
            </label>
          </div>
          {Object.entries(groupedAssessments).map(([subject, subjectAssessments]) => (
            <section key={subject} className="space-y-3" aria-label={`${subject} assessments`}>
              <h4 className="text-lg font-semibold text-text-main">{subject}</h4>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjectAssessments.map((assessment) => {
              const latestResult = results.find((result) => result.assessmentId === assessment.id);
              return (
                <Card key={assessment.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <Badge variant="outline">{assessment.difficulty}</Badge>
                  </div>
                  <h4 className="mt-4 text-lg font-bold text-text-main">{assessment.title}</h4>
                  <p className="mt-1 text-sm font-medium text-primary">{assessment.topic || assessment.title}</p>
                  <p className="mt-2 flex-1 text-sm leading-6 text-text-secondary">{assessment.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>{assessment.skill}</Badge>
                    <Badge variant="cyan">{assessment.subject || assessment.category}</Badge>
                  </div>
                  <p className="mt-4 flex items-center gap-3 text-xs text-text-secondary">
                    <span>{assessment.questionCount} questions</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{assessment.durationMinutes} min</span>
                    <span>Pass: {assessment.passingScore}%</span>
                  </p>
                  {latestResult && <p className="mt-3 text-sm text-text-secondary">Latest: {latestResult.percentage}% · {latestResult.passed ? 'Passed' : 'Keep practicing'}</p>}
                  <Button className="mt-5 w-full" onClick={() => openAssessment(assessment)}>
                    {latestResult ? <><RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again</> : 'Start assessment'}
                  </Button>
                </Card>
              );
            })}
              </div>
            </section>
          ))}
          {!visibleAssessments.length && <Card className="py-6 text-center text-sm text-text-secondary">No assessments match this subject and topic.</Card>}
        </section>
      ) : (
        <Card className="py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <BookOpenCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-text-main">No assessments are available yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">Please check back later or contact support if you expected an assessment here.</p>
        </Card>
      )}

      <section className="space-y-4" aria-labelledby="assessment-history-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 id="assessment-history-title" className="text-xl font-bold text-text-main">Your recent results</h3>
            <p className="mt-1 text-sm text-text-secondary">Your latest 20 submitted attempts are saved to your account.</p>
          </div>
          {loadingResults && <span className="text-xs text-text-secondary" role="status">Refreshing history…</span>}
        </div>
        {results.length ? (
          <div className="space-y-3">
            {results.map((result) => (
              <Card key={result.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-semibold text-text-main">{result.assessmentTitle}</h4>
                  <p className="mt-1 text-sm text-text-secondary">{result.subject && `${result.subject} · `}{result.topic || result.assessmentSkill} · {formatDate(result.submittedAt)} · {result.score}/{result.totalQuestions} correct</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={result.passed ? 'success' : 'warning'}>{result.percentage}% · {result.passed ? 'Passed' : 'Review'}</Badge>
                  <Button size="sm" variant="outline" loading={loadingReview} onClick={() => dispatch(fetchAssessmentResult(result.id))}>Review</Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-6 text-center text-sm text-text-secondary">
            {loadingResults ? 'Loading your saved results...' : 'Your submitted assessments will appear here.'}
          </Card>
        )}
      </section>
    </div>
  );
};

export default AssessmentPage;
