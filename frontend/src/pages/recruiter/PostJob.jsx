import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { createJob } from "../../services/jobService";

const initialState = {
  title: "",
  department: "",
  employmentType: "Full Time",
  experience: "",
  salary: "",
  location: "",
  skills: "",
  openings: 1,
  description: "",
  responsibilities: "",
  requirements: "",
  assessment: {
    enabled: false,
    title: "",
    duration: "",
    passingPercentage: "",
    questions: []
  }
};

export default function PostJob() {
  const [job, setJob] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleAssessmentToggle = () => {
    setJob((prev) => {
      const isEnabled = !prev.assessment.enabled;
      return {
        ...prev,
        assessment: {
          ...prev.assessment,
          enabled: isEnabled,
          questions: isEnabled && prev.assessment.questions.length === 0
            ? [{ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", marks: 1 }]
            : prev.assessment.questions
        }
      };
    });
  };

  const handleAssessmentChange = (e) => {
    const { name, value } = e.target;
    setJob((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        [name]: value
      }
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setJob((prev) => {
      const updatedQuestions = [...prev.assessment.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      return {
        ...prev,
        assessment: {
          ...prev.assessment,
          questions: updatedQuestions
        }
      };
    });
  };

  const handleAddQuestion = () => {
    setJob((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        questions: [
          ...prev.assessment.questions,
          { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", marks: 1 }
        ]
      }
    }));
  };

  const handleRemoveQuestion = (index) => {
    setJob((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        questions: prev.assessment.questions.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createJob(job);
      alert("Job Posted Successfully!");
      setJob(initialState);
      navigate("/recruiter/my-jobs");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RecruiterDashboardLayout>
      <h1 className="text-4xl font-bold text-[#3E3A74]">Post New Job</h1>
      <p className="mt-2 text-gray-500">Create a professional job opening for SHNOOR Technologies.</p>
      
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white mt-8 rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-medium text-gray-900">Job Title</label>
            <input name="title" value={job.title} onChange={handleChange} required className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="Frontend Developer" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Department</label>
            <input name="department" value={job.department} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="Software Development" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Employment Type</label>
            <select name="employmentType" value={job.employmentType} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none">
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Internship</option>
              <option>Remote</option>
             
            </select>
          </div>
          <div>
            <label className="font-medium text-gray-900">Experience</label>
            <input name="experience" value={job.experience} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="2-4 Years" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Salary</label>
            <input name="salary" value={job.salary} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="6 LPA - 10 LPA" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Location</label>
            <input name="location" value={job.location} onChange={handleChange} required className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="Hyderabad" />
          </div>
          <div className="md:col-span-2">
            <label className="font-medium text-gray-900">Skills</label>
            <input name="skills" value={job.skills} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="React, JavaScript, HTML, CSS" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Number of Openings</label>
            <input type="number" min="1" name="openings" value={job.openings} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
        </div>

        <div className="mt-6">
          <label className="font-medium text-gray-900">Job Description</label>
          <textarea rows="6" name="description" value={job.description} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
        </div>
        <div className="mt-6">
          <label className="font-medium text-gray-900">Responsibilities</label>
          <textarea rows="5" name="responsibilities" value={job.responsibilities} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
        </div>
        <div className="mt-6">
          <label className="font-medium text-gray-900">Requirements</label>
          <textarea rows="5" name="requirements" value={job.requirements} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
        </div>

        {/* Technical Assessment Section */}
        <div className="bg-white mt-8 rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-[#3E3A74]">Technical Assessment</h2>
              <p className="text-sm text-gray-500 mt-1">Configure an online MCQ test for candidates.</p>
            </div>
            <button
              type="button"
              onClick={handleAssessmentToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${job.assessment.enabled ? 'bg-[#7393D3]' : 'bg-gray-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${job.assessment.enabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {job.assessment.enabled && (
            <div className="mt-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="font-medium text-gray-900">Assessment Title</label>
                  <input
                    name="title"
                    value={job.assessment.title}
                    onChange={handleAssessmentChange}
                    required={job.assessment.enabled}
                    className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
                    placeholder="Java Assessment"
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-900">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    name="duration"
                    value={job.assessment.duration}
                    onChange={handleAssessmentChange}
                    required={job.assessment.enabled}
                    className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-900">Passing Percentage</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    name="passingPercentage"
                    value={job.assessment.passingPercentage}
                    onChange={handleAssessmentChange}
                    required={job.assessment.enabled}
                    className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="space-y-6 mt-8">
                {job.assessment.questions.map((q, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                      <span className="font-semibold text-lg text-[#3E3A74]">Question {index + 1}</span>
                      {job.assessment.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-sm text-red-600 hover:text-red-800 font-semibold transition"
                        >
                          Remove Question
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="font-medium text-gray-700">Question</label>
                        <textarea
                          rows="2"
                          required={job.assessment.enabled}
                          value={q.question}
                          onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                          className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none bg-white"
                          placeholder="What is the output of..."
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-medium text-gray-700">Option A</label>
                          <input
                            required={job.assessment.enabled}
                            value={q.optionA}
                            onChange={(e) => handleQuestionChange(index, "optionA", e.target.value)}
                            className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none bg-white"
                            placeholder="Option A"
                          />
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">Option B</label>
                          <input
                            required={job.assessment.enabled}
                            value={q.optionB}
                            onChange={(e) => handleQuestionChange(index, "optionB", e.target.value)}
                            className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none bg-white"
                            placeholder="Option B"
                          />
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">Option C</label>
                          <input
                            required={job.assessment.enabled}
                            value={q.optionC}
                            onChange={(e) => handleQuestionChange(index, "optionC", e.target.value)}
                            className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none bg-white"
                            placeholder="Option C"
                          />
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">Option D</label>
                          <input
                            required={job.assessment.enabled}
                            value={q.optionD}
                            onChange={(e) => handleQuestionChange(index, "optionD", e.target.value)}
                            className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none bg-white"
                            placeholder="Option D"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 pt-2">
                        <div>
                          <label className="font-medium text-gray-700">Correct Answer</label>
                          <div className="flex gap-6 mt-3">
                            {["A", "B", "C", "D"].map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correctAnswer-${index}`}
                                  value={opt}
                                  checked={q.correctAnswer === opt}
                                  onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                                  className="h-4 w-4 text-[#7393D3] focus:ring-[#7393D3] border-gray-300"
                                />
                                <span className="font-semibold text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">Marks</label>
                          <input
                            type="number"
                            min="1"
                            required={job.assessment.enabled}
                            value={q.marks}
                            onChange={(e) => handleQuestionChange(index, "marks", parseInt(e.target.value) || 1)}
                            className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-[#7393D3] hover:border-[#7393D3] font-semibold transition"
                >
                  + Add Question
                </button>
              </div>
            </div>
          )}
        </div>

        <button disabled={submitting} className="mt-8 bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60">
          {submitting ? "Publishing..." : "Publish Job"}
        </button>
      </form>
    </RecruiterDashboardLayout>
  );
}