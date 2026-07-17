const technicalInterviewModel = require("../models/technicalInterviewModel");
const { findJobById } = require("../models/jobModel");
const { createNotification } = require("../models/notificationModel");
const { sendEmail } = require("./emailService");
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const buildMeetingLink = (roomCode) => `${CLIENT_URL}/technical-interview/room/${roomCode}`;

const scheduleAndNotify = async (recruiterId, payload) => {
  const interview = await technicalInterviewModel.scheduleTechnicalInterview(recruiterId, payload);
  if (!interview) {
    return null;
  }
  const job = await findJobById(interview.job_id).catch(() => null);
  const jobTitle = (job && job.title) || interview.job_title || "the role";
  const meetingLink = buildMeetingLink(interview.room_code);
  const dateLabel = interview.scheduled_date instanceof Date
    ? interview.scheduled_date.toISOString().slice(0, 10)
    : interview.scheduled_date;

  createNotification(interview.candidate_id, {
    title: "Technical Interview Scheduled",
    message: `Your Technical Interview for "${jobTitle}" is scheduled on ${dateLabel} at ${interview.scheduled_time}.`,
    type: "success",
    relatedJobId: interview.job_id
  }).catch((err) => console.error("Failed to create technical interview notification:", err.message));

  await sendEmail(
    interview.candidate_email,
    "Technical Interview Scheduled - SHNOOR Job Portal",
    `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">
      <h2>Technical Interview Scheduled</h2>
      <p>Dear ${interview.candidate_name},</p>
      <p>
        Congratulations on clearing the AI Interview for <strong>${jobTitle}</strong>. Your Technical Interview
        has been scheduled as follows:
      </p>
      <p>
        <strong>Date:</strong> ${dateLabel}<br>
        <strong>Time:</strong> ${interview.scheduled_time}<br>
        <strong>Duration:</strong> ${interview.duration_minutes} minutes
      </p>
      <p>Please join using the link below at the scheduled time. Camera and microphone access are compulsory for this interview.</p>
      <a href="${meetingLink}"
        style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px;">
        Join Technical Interview
      </a>
      <br><br>
      Regards,<br>
      <strong>SHNOOR Recruitment Team</strong>
    </div>`
  );

  return interview;
};

const recordResultAndNotify = async (interviewId, recruiterId, { result, feedback }) => {
  const updated = await technicalInterviewModel.updateResult(interviewId, recruiterId, { result, feedback });
  if (!updated) {
    return null;
  }
  const job = await findJobById(updated.job_id).catch(() => null);
  const jobTitle = (job && job.title) || updated.job_title || "the role";
  const finalStatus = result === "Selected" ? "Selected" : "Rejected";
  await technicalInterviewModel.updateApplicationStatusForResult(updated.application_id, finalStatus);

  if (result === "Selected") {
    createNotification(updated.candidate_id, {
      title: "You're Selected!",
      message: `Congratulations! You have been selected after the Technical Interview for "${jobTitle}".`,
      type: "success",
      relatedJobId: updated.job_id
    }).catch((err) => console.error("Failed to create selection notification:", err.message));

    await sendEmail(
      updated.candidate_email,
      "Congratulations! Job Offer - SHNOOR Job Portal",
      `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">
        <h2>Congratulations, ${updated.candidate_name}!</h2>
        <p>Congratulations! You have successfully cleared the Technical Interview.</p>
        <p>We are delighted to offer you the position of <strong>${jobTitle}</strong>.</p>
        <p>Please find your offer details attached.</p>
        <p>Welcome to our company.</p>
        <a href="${CLIENT_URL}/user/applied"
          style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px;">
          View Application
        </a>
        <br><br>
        Regards,<br>
        <strong>SHNOOR Recruitment Team</strong>
      </div>`
    );
  } else {
    createNotification(updated.candidate_id, {
      title: "Technical Interview Result",
      message: `Thank you for attending the Technical Interview for "${jobTitle}". Unfortunately you have not been selected.`,
      type: "warning",
      relatedJobId: updated.job_id
    }).catch((err) => console.error("Failed to create rejection notification:", err.message));

    await sendEmail(
      updated.candidate_email,
      "Technical Interview Result - SHNOOR Job Portal",
      `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:8px">
        <h2>Technical Interview Result</h2>
        <p>Dear ${updated.candidate_name},</p>
        <p>Thank you for taking the time to attend the Technical Interview for <strong>${jobTitle}</strong>.</p>
        <p>After careful evaluation, we regret to inform you that you have not been selected to move forward at this time.</p>
        <p>We appreciate your interest and encourage you to apply for future opportunities with us.</p>
        <br>
        Regards,<br>
        <strong>SHNOOR Recruitment Team</strong>
      </div>`
    );
  }

  return updated;
};

module.exports = {
  buildMeetingLink,
  scheduleAndNotify,
  recordResultAndNotify
};
