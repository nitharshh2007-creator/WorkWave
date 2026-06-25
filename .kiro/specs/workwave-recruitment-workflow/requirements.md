# WorkWave Complete Recruitment Workflow Requirements

## Introduction

WorkWave ATS requires a complete end-to-end recruitment workflow with full backend synchronization. The system must manage the entire lifecycle from job posting through hiring, with real-time data synchronization between MongoDB and the frontend, eliminating all mock/frontend-only state. The workflow includes candidate application tracking, interview scheduling, and comprehensive notification systems for both candidates and employers.

The recruitment pipeline includes six primary statuses: Applied, Reviewed, Shortlisted, Interview Scheduled, Interview Completed, and terminal states (Hired/Rejected). The system tracks real-time status transitions, generates notifications for all state changes, and ensures all dashboards and analytics reflect backend data immediately.

## Glossary

- **Application**: A record of a candidate's application to a specific job posting, stored in MongoDB with status, timestamps, and interview details
- **Interview**: A scheduled meeting between a candidate and employer, tracked within the Application record with date, time, meeting link, and completion status
- **Status**: The current state of an application in the recruitment pipeline (Applied, Reviewed, Shortlisted, Interview Scheduled, Interview Completed, Hired, Rejected)
- **Notification**: A message stored in MongoDB that alerts users about application status changes, interview scheduling, or other ATS events
- **Dashboard**: An aggregated view that displays statistics, recent activity, and upcoming events calculated from backend MongoDB data
- **Interview Scheduled Status**: Application status indicating that an interview has been scheduled with a confirmed date, time, and meeting link
- **Backend Synchronization**: Real-time reflection of MongoDB data changes on the frontend without relying on local component state for data of record
- **Employer**: A user with role='employer' who posts jobs and manages candidates
- **Candidate**: A user with role='candidate' who applies for jobs and participates in interviews

## Requirements

### Requirement 1: Application Status Pipeline with Backend Synchronization

**User Story:** As an employer or candidate, I want the application to track and display the complete recruitment status pipeline, so that I can understand where each candidate is in the hiring process at any given moment.

#### Acceptance Criteria

1. WHEN an application is created, THE Application document SHALL be stored in MongoDB with status='Applied', createdAt timestamp (ISO 8601), user field (candidate ID), and job field (job ID)
2. WHEN an employer clicks 'Review' on an 'Applied' application, THE Application.status SHALL be updated to 'Reviewed' in MongoDB and synchronized to all frontend views within 1 second
3. WHEN an employer clicks 'Shortlist' on a 'Reviewed' application, THE Application.status SHALL be updated to 'Shortlisted' in MongoDB and synchronized to all frontend views within 1 second
4. WHEN an employer opens Interview Modal and saves, THE Application.status SHALL be updated to 'Interview Scheduled' in MongoDB, with interviewDate, interviewTime, meetingLink, and interviewMode fields populated and synchronized within 1 second
5. WHEN an employer marks interview as completed, THE Application.status SHALL be updated to 'Interview Completed' in MongoDB and synchronized within 1 second
6. WHEN an employer clicks 'Hire Candidate', THE Application.status SHALL be updated to 'Hired' in MongoDB within 500ms, and the associated Job.activeApplications count SHALL be decremented
7. WHEN an employer clicks 'Reject Candidate', THE Application.status SHALL be updated to 'Rejected' in MongoDB within 500ms
8. WHEN a candidate clicks 'Withdraw Application' (if implemented), THE Application.status SHALL be updated to 'Withdrawn' in MongoDB within 500ms
9. FOR ALL application status transitions, THE status value SHALL be one of the following enumerated values: Applied, Reviewed, Shortlisted, Interview Scheduled, Interview Completed, Hired, Rejected, Withdrawn
10. WHEN an application page is loaded by the candidate, THE Application details (including current status) SHALL be fetched from MongoDB via API call (GET /api/applications/:id or similar) and displayed; NO hardcoded or local storage values SHALL be used as the source of truth
11. WHEN an employer attempts an invalid status transition (e.g., Hired → Rejected), THE system SHALL reject the request with HTTP 400 error and message explaining the invalid transition
12. WHEN a valid status transition occurs, THE Application.updatedAt timestamp SHALL be set to the current ISO 8601 time in MongoDB for audit purposes

---

### Requirement 2: Candidate Dashboard Interview Counter Synchronization

**User Story:** As a candidate, I want my dashboard to display the correct count of scheduled interviews, so that I can see at a glance how many interviews I have upcoming.

#### Acceptance Criteria

1. WHEN the candidate dashboard loads, THE Interview counter SHALL fetch the count of applications with status='Interview Scheduled' from MongoDB for the current candidate
2. WHEN an employer schedules an interview for a candidate, THE Interview counter SHALL update within 1 second to reflect the new count via real-time mechanism (polling or WebSocket)
3. WHEN a candidate's interview is completed (Application status changes from 'Interview Scheduled' to 'Interview Completed'), THE Interview counter SHALL decrement by 1 in the dashboard
4. WHEN a candidate's interview is cancelled (Application interviewStatus changes to 'Cancelled'), THE Interview counter SHALL decrement by 1 in the dashboard
5. THE Interview counter SHALL display the correct numeric value (actual count from MongoDB), not 0 when interviews are scheduled in the backend
6. WHEN the dashboard is refreshed, THE Interview counter SHALL be recalculated from the MongoDB backend via fresh API call, not from local browser storage
7. IF the count calculation fails or times out, THE system SHALL display the previous cached value and retry the fetch in the background
8. THE Interview counter value SHALL be visible in a clearly labeled card or metric (e.g., "Upcoming Interviews: 3")

---

### Requirement 3: Candidate Upcoming Interviews Display

**User Story:** As a candidate, I want to see my upcoming interviews on my dashboard with details like job title, date, time, and meeting link, so that I can prepare and join interviews on time.

#### Acceptance Criteria

1. WHEN the candidate dashboard loads, THE system SHALL fetch all Application documents with status='Interview Scheduled' AND user=current candidate from MongoDB and display them within 2 seconds
2. WHEN displaying upcoming interviews, THE system SHALL show: job title, candidate name, interview date (YYYY-MM-DD format), interview time (HH:MM 24-hour format), and meeting link for each interview
3. WHEN a candidate clicks on a meeting link in the Upcoming Interviews section, THE system SHALL open the URL in a new browser tab (target='_blank', rel='noopener noreferrer')
4. WHEN an interview is rescheduled in the backend (interviewDate or interviewTime updated), THE Candidate Upcoming Interviews list SHALL refresh within 1 second to reflect the new date and time
5. IF the current date and time are past the interviewDate and interviewTime, THE system SHALL display the interview row with a red background (#FEE2E2 or similar error-state color) and a label 'Overdue - Please reschedule' to indicate the interview is no longer current
6. WHEN the candidate opens the dashboard, THE Upcoming Interviews list SHALL be sorted in ascending order by interviewDate (nearest interviews first)
7. IF multiple interviews have the same interviewDate, THE sort order SHALL be by interviewTime in ascending order (earlier times first)
8. IF there are no upcoming interviews (zero 'Interview Scheduled' applications), THE Upcoming Interviews section SHALL display an empty state message 'No upcoming interviews scheduled'
9. WHEN the dashboard is actively displayed and an interview is rescheduled, THE list SHALL auto-refresh via polling (every 5-10 seconds) or WebSocket subscription within 1 second of the backend update
10. WHEN a candidate clicks 'Join Meeting' button, THE system SHALL validate that meetingLink is not empty and is a valid URL before opening; IF invalid, display error toast 'Invalid meeting link'

---

### Requirement 4: Candidate Applications Page with Full Pipeline Status

**User Story:** As a candidate, I want to see all my applications with their current status in the recruitment pipeline, so that I can track my progress with each employer.

#### Acceptance Criteria

1. WHEN the candidate applications page loads, THE system SHALL fetch all applications from MongoDB for the current candidate (user._id), including all status values: Applied, Reviewed, Shortlisted, Interview Scheduled, Interview Completed, Hired, Rejected, Withdrawn
2. WHEN displaying applications, THE system SHALL show the application status (as a badge) for each application with consistent color coding matching Requirement 18
3. WHEN an application status changes in the backend, THE applications page SHALL update within 1 second without requiring a manual refresh (via polling or WebSocket)
4. THE applications list SHALL display in chronological order with the most recent applications first (sorted by createdAt descending)
5. WHEN an application transitions from Applied to Reviewed to Shortlisted, THE visual representation and status badge SHALL reflect each change immediately as it occurs
6. WHEN a candidate views an application detail view, THE system SHALL display the full status history if available (timestamps and sequence of status changes)
7. WHEN a candidate scrolls through applications, THE system SHALL load applications progressively without lag (lazy load or pagination if > 50 applications)
8. WHEN an application transitions to 'Interview Scheduled' status, THE card SHALL also display interview details (date, time, meeting link) fetched from Application.interviewDate, interviewTime, meetingLink
9. IF a candidate has no applications, THE page SHALL display an empty state message 'No applications yet. Start applying to jobs to track them here.'

---

### Requirement 5: Employer Dashboard Statistics Backend Calculation

**User Story:** As an employer, I want my dashboard to display accurate statistics calculated from backend MongoDB data, so that I can see the true state of my recruitment efforts.

#### Acceptance Criteria

1. WHEN the employer dashboard loads, THE Active Jobs count SHALL be calculated from Job documents with status='active' and createdBy=current employer, excluding jobs with status='closed', 'archived', or 'paused'
2. WHEN the employer dashboard loads, THE Closed Jobs count SHALL be calculated from Job documents with status='closed' and createdBy=current employer
3. WHEN the employer dashboard loads, THE Total Applications count SHALL be calculated from Application documents where the associated job was created by (createdBy) the current employer
4. WHEN the employer dashboard loads, THE Interview Scheduled count SHALL be calculated from Application documents where job.createdBy=current employer AND Application.status='Interview Scheduled'
5. WHEN the employer dashboard loads, THE Rejected count SHALL be calculated from Application documents where job.createdBy=current employer AND Application.status='Rejected'
6. WHEN the employer dashboard loads, THE Hired count SHALL be calculated from Application documents where job.createdBy=current employer AND Application.status='Hired'
7. WHEN a job status changes to 'closed', THE Active Jobs count SHALL immediately decrement by 1 and Closed Jobs count SHALL immediately increment by 1
8. WHEN a new application is submitted, THE Total Applications count SHALL immediately increment by 1
9. WHEN an application status changes to 'Interview Scheduled', THE Interview Scheduled count SHALL immediately increment by 1
10. WHEN an application status changes from 'Interview Scheduled' to another status ('Interview Completed', 'Hired', 'Rejected', or 'Cancelled'), THE Interview Scheduled count SHALL immediately decrement by 1
11. IF a calculation query fails or times out, THE system SHALL display the previous cached value and attempt to refresh in the background
12. IF statistics show 0 counts but the user perceives incorrect data, THE system SHALL provide a 'Refresh' button to manually recalculate all counts

---

### Requirement 6: Employer Applicant Workflow Actions and Status Transitions

**User Story:** As an employer, I want to have action buttons for managing applicants at each stage, so that I can move candidates through the recruitment pipeline efficiently.

#### Acceptance Criteria

1. WHEN an application is in status='Applied', THE applicant card SHALL display a 'Review' button (primary action button)
2. WHEN an application is in status='Reviewed', THE applicant card SHALL display 'Shortlist' and 'Reject' buttons
3. WHEN an application is in status='Shortlisted', THE applicant card SHALL display 'Schedule Interview', 'Reject', and 'Hire' buttons
4. WHEN an application is in status='Interview Scheduled', THE applicant card SHALL display 'Reschedule Interview', 'Mark Interview Completed', 'Hire Candidate', 'Reject Candidate', and 'Cancel Interview' buttons
5. WHEN an application is in status='Interview Completed', THE applicant card SHALL display 'Hire Candidate', 'Reject Candidate', and 'Reschedule Interview' buttons
6. WHEN the employer clicks 'Review', THE Application.status SHALL be updated to 'Reviewed' in MongoDB within 500ms
7. WHEN the employer clicks 'Shortlist', THE Application.status SHALL be updated to 'Shortlisted' in MongoDB within 500ms
8. WHEN the employer clicks 'Schedule Interview', THE Interview Modal SHALL open allowing selection/input of: interviewDate (date picker), interviewTime (time picker), interviewMode (radio: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'Offline'), meetingLink (text input for online modes), and interviewLocation (text input for Offline mode)
9. WHEN the employer clicks 'Mark Interview Completed', THE Application.status SHALL be updated to 'Interview Completed' AND Application.interviewStatus SHALL be updated to 'Completed' in MongoDB within 500ms
10. WHEN the employer clicks 'Cancel Interview', THE Application.status SHALL revert to 'Shortlisted' AND interview fields (interviewDate, interviewTime, meetingLink, interviewLocation, interviewMode) SHALL be cleared (set to empty strings or defaults) in MongoDB within 500ms
11. DURING an async action (while button is clicked and API call in progress), THE button SHALL be disabled and display a loading spinner or 'Loading...' text
12. IF an action button click results in error response from server, THE system SHALL display an error toast and the button state SHALL return to normal (enabled) with original text
13. WHEN any application status changes via button action, THE applicant card buttons SHALL immediately update to show the new action set for the new status (within 500ms)

---

### Requirement 7: Hire Candidate Action Workflow

**User Story:** As an employer, I want to hire a candidate through a single action that updates all necessary systems, so that the entire application, dashboards, and notifications are synchronized immediately.

#### Acceptance Criteria

1. WHEN the employer clicks 'Hire Candidate' on an application in status='Shortlisted' or 'Interview Completed', THE Application status SHALL be updated to 'Hired' in MongoDB within 500ms
2. WHEN an application status transitions to 'Hired', THE Application.hiredDate SHALL be set to the current ISO 8601 timestamp in MongoDB
3. WHEN an application is marked as 'Hired', THE associated Job document SHALL have its activeApplications count decremented by 1 in MongoDB within 500ms (if activeApplications exists and is > 0)
4. WHEN an application is marked as 'Hired', THE Employer Dashboard stats SHALL update within 1 second: Hired count SHALL increment by 1, and if previously Interview Scheduled, Interview Scheduled count SHALL decrement by 1
5. WHEN an application is marked as 'Hired', THE Applicant List view SHALL immediately reflect the status change to 'Hired' without requiring a manual page refresh (within 2 seconds)
6. WHEN an application is marked as 'Hired', THE Candidate Dashboard applications list SHALL immediately update to show the application with status='Hired' (within 2 seconds)
7. WHEN an application status transitions to 'Hired', A Notification SHALL be created in MongoDB with type='status_update', title 'Congratulations! You have been hired', and message 'Congratulations! You have been hired for [Job Title] at [Company]. Your start date and next steps will be communicated shortly.' within 500ms
8. WHEN a Notification is created for hiring, THE recipient field SHALL reference the candidate's User._id, the isRead flag SHALL be set to false, and the relatedApplication field SHALL reference the Application._id
9. WHEN a notification is created, THE Candidate Notifications page SHALL display the notification immediately when the page loads or is already open (via polling or WebSocket subscription)
10. WHEN a notification is created, THE Candidate notification badge in the sidebar SHALL increment by 1 within 500ms
11. WHEN an application is marked as 'Hired', THE Recent Activity timeline on the employer dashboard SHALL add a new entry within 2 seconds indicating 'Candidate Hired'
12. WHEN an application is marked as 'Hired', THE Recent Activity timeline on the candidate dashboard SHALL add a new entry within 2 seconds indicating 'Hired'
13. WHEN an application is marked as 'Hired', THE Analytics page charts (Applications by Status, Applications This Month) SHALL update within 2 seconds if the Analytics page is currently open
14. IF the hire action fails (network error, database error, transaction failure), THE system SHALL display error toast 'Failed to hire candidate. Please try again.' and the Application status SHALL remain unchanged in both UI and database
15. IF the hire action encounters the activeApplications field missing on the Job, THE system SHALL treat it as 0 and proceed with hire action without error

---

### Requirement 8: Reject Candidate Action Workflow

**User Story:** As an employer, I want to reject a candidate through an action that updates all systems consistently, so that the rejection is reflected everywhere immediately.

#### Acceptance Criteria

1. WHEN the employer clicks 'Reject Candidate' on an application in status='Shortlisted', 'Interview Scheduled', or 'Interview Completed', THE Application status SHALL be updated to 'Rejected' in MongoDB within 500ms
2. WHEN an application status transitions to 'Rejected', THE Employer Dashboard stats SHALL update within 1 second: Rejected count SHALL increment by 1, and if previously Interview Scheduled, Interview Scheduled count SHALL decrement by 1
3. WHEN an application is marked as 'Rejected', THE Applicant List view SHALL immediately reflect the status change without requiring a page refresh (within 2 seconds via UI state update)
4. WHEN an application is marked as 'Rejected', THE Candidate Dashboard SHALL immediately update to show the application with status='Rejected' within 2 seconds (via component re-render or polling)
5. WHEN an application status transitions to 'Rejected', A Notification SHALL be created in MongoDB with type='status_update', title 'Application Result for [Job Title]', and message 'Unfortunately, your application was not selected for [Job Title] at [Company]' within 500ms
6. WHEN a Notification is created for rejection, THE recipient field SHALL reference the candidate's User._id, the isRead flag SHALL be set to false, and the relatedApplication field SHALL reference the Application._id
7. WHEN a notification is created, THE Candidate notification badge in the sidebar SHALL increment by 1 within 500ms
8. IF the reject action fails (network error, database error), THE system SHALL display error toast 'Failed to reject candidate. Please try again.' and the Application status SHALL remain unchanged in the UI and database
9. WHEN an application is rejected, THE Recent Activity timeline on both employer and candidate dashboards SHALL add a new entry within 2 seconds indicating 'Candidate Rejected' with timestamp
10. WHERE a rejection is initiated from Interview Scheduled status, THE interviewStatus field SHALL be updated to 'Cancelled' and interview details (date, time, link) SHALL remain in the document for audit purposes

---

### Requirement 9: Candidate Notifications for Status Changes

**User Story:** As a candidate, I want to receive notifications for all important status changes in my applications, so that I stay informed without needing to manually check the dashboard.

#### Acceptance Criteria

1. WHEN an Application.status transitions to 'Reviewed', A Notification SHALL be created in MongoDB within 1 second with: recipient=candidate ID, type='status_update', title='[Job Title] - Application Reviewed', message='Your application for [Job Title] at [Company] has been reviewed'
2. WHEN an Application.status transitions to 'Shortlisted', A Notification SHALL be created in MongoDB within 1 second with: recipient=candidate ID, type='status_update', title='[Job Title] - Shortlisted!', message='Congratulations! You have been shortlisted for [Job Title] at [Company]'
3. WHEN an Application.status transitions to 'Interview Scheduled', A Notification SHALL be created in MongoDB within 1 second with: recipient=candidate ID, type='interview', title='Interview Scheduled for [Job Title]', message='Your interview for [Job Title] at [Company] is scheduled for [DATE in YYYY-MM-DD] at [TIME in HH:MM] [TIMEZONE]'
4. WHEN an interview is rescheduled (Application.interviewDate or interviewTime updated while status='Interview Scheduled'), A Notification SHALL be created in MongoDB within 1 second with: recipient=candidate ID, type='interview', title='Interview Rescheduled for [Job Title]', message='Your interview has been rescheduled to [NEW DATE in YYYY-MM-DD] at [NEW TIME in HH:MM] [TIMEZONE]'
5. WHEN an Application.status transitions to 'Interview Completed', A Notification SHALL be created in MongoDB within 1 second with: recipient=candidate ID, type='status_update', title='[Job Title] - Interview Completed', message='Your interview for [Job Title] at [Company] has been marked as completed'
6. WHEN an Application.status transitions to 'Hired', A Notification SHALL be created in MongoDB within 1 second with: recipient=candidate ID, type='status_update', title='Congratulations! You are Hired!', message='Congratulations! You have been hired for [Job Title] at [Company]. We look forward to working with you!'
7. WHEN an Application.status transitions to 'Rejected', A Notification SHALL be created in MongoDB within 1 second with: recipient=candidate ID, type='status_update', title='[Job Title] - Application Decision', message='Unfortunately, your application for [Job Title] at [Company] was not selected for this position'
8. WHEN an Application.status transitions to 'Withdrawn' (candidate-initiated), A Notification SHALL be created in MongoDB within 1 second for the employer (recipient=job.createdBy) with: type='info', title='Application Withdrawn', message='[Candidate Name] has withdrawn their application for [Job Title]'
9. FOR ALL candidate status-change notifications, THE relatedApplication field SHALL be set to the Application._id, and isRead field SHALL be set to false
10. FOR ALL candidate status-change notifications, THE Application.status field value in the database SHALL match the notification title/message exactly (case-insensitive comparison allowed for dates/times)

---

### Requirement 10: Employer Notifications for Key Events

**User Story:** As an employer, I want to receive notifications when key recruitment events occur, so that I stay informed about candidate actions and application progress.

#### Acceptance Criteria

1. WHEN a candidate applies for a job, A Notification SHALL be created in MongoDB for the employer within 1 second with type='info', title 'New Application', recipient=employer User._id, and message containing candidate name and job title
2. WHEN a candidate accepts an interview invitation, A Notification SHALL be created for the employer with type='interview' and message 'Candidate accepted interview invitation'
3. WHEN a candidate cancels an interview, A Notification SHALL be created for the employer with type='interview' and message 'Candidate cancelled interview'
4. WHEN a candidate withdraws an application (Application status changes to 'Withdrawn'), A Notification SHALL be created for the employer within 1 second with type='info', title 'Application Withdrawn', recipient=job.createdBy (employer), and message '[Candidate Name] has withdrawn their application for [Job Title]'
5. FOR ALL employer notifications, THE recipient field SHALL reference the employer's User._id (either job.createdBy or job.employer field)
6. FOR ALL employer notifications, THE isRead flag SHALL be set to false when created
7. FOR ALL employer notifications, THE relatedApplication field (if applicable) SHALL reference the Application._id
8. IF a candidate applies for multiple jobs from the same employer, EACH application SHALL generate a separate notification (not batched or deduplicated)

---

### Requirement 11: Notification Badge Display and Updates

**User Story:** As a user, I want to see the count of unread notifications in the sidebar, so that I know when I have new messages without needing to open the notifications page.

#### Acceptance Criteria

1. WHEN a user loads the dashboard, THE notification badge SHALL display the count of unread notifications from MongoDB where recipient=current user AND isRead=false
2. WHEN a new notification is created for the user, THE notification badge count SHALL immediately increment by 1 (within 500ms) via real-time mechanism (polling or WebSocket)
3. WHEN a user reads a notification on the notifications page, THE notification isRead flag SHALL be updated to true in MongoDB within 500ms
4. WHEN a user marks a notification as read, THE notification badge count SHALL immediately decrement by 1 (within 500ms)
5. WHEN the notification badge count is 0, THE badge element SHALL be hidden completely or display with full transparency (opacity: 0 or display: none)
6. WHEN a user clicks 'Mark All as Read' button, THE notification badge SHALL immediately disappear within 500ms
7. THE notification badge SHALL be displayed consistently in the sidebar for both employer and candidate roles, positioned next to the 'Notifications' menu item
8. IF the badge count exceeds 99, THE badge SHALL display '99+' to prevent visual overflow
9. THE badge styling SHALL use a contrasting color (e.g., red #EF4444 or similar alert color) to draw user attention

---

### Requirement 12: Dashboard Recent Activity Timeline

**User Story:** As a user, I want to see recent activity on my dashboard, so that I can quickly understand what has happened in my recruitment workflow.

#### Acceptance Criteria

1. WHEN the employer dashboard loads, THE Recent Activity timeline SHALL display events in chronological order with newest first (sorted by createdAt or updatedAt descending)
2. WHEN the employer dashboard loads, THE Recent Activity timeline SHALL include the following event types: 'Candidate Applied', 'Candidate Reviewed', 'Candidate Shortlisted', 'Interview Scheduled', 'Interview Rescheduled', 'Interview Completed', 'Candidate Hired', 'Candidate Rejected', 'Job Posted'
3. WHEN the employer dashboard loads, THE Recent Activity SHALL display only events from the last 30 days (calculated from current server date)
4. WHEN the employer dashboard loads, THE Recent Activity SHALL show timestamps from the Application.createdAt (for 'Candidate Applied', 'Job Posted') or Application.updatedAt fields (for status changes and interview updates)
5. WHEN the candidate dashboard loads, THE Recent Activity timeline SHALL display events in chronological order with newest first
6. WHEN the candidate dashboard loads, THE Recent Activity timeline SHALL include the following event types: 'Applied for Job', 'Application Reviewed', 'Application Shortlisted', 'Interview Scheduled', 'Interview Rescheduled', 'Interview Completed', 'Hired', 'Rejected', 'Withdrawn'
7. WHEN the candidate dashboard loads, THE Recent Activity SHALL display only events from the last 30 days
8. FOR ALL Recent Activity entries, THE system SHALL fetch data from MongoDB Application records with relevant Application.status values and timestamps
9. WHEN an application status changes, THE Recent Activity timeline SHALL update within 2 seconds to reflect the new activity with exact timestamp
10. WHEN an interview is rescheduled, THE event type SHALL be recorded as 'Interview Rescheduled' (distinct from 'Interview Scheduled') to differentiate between initial scheduling and rescheduling

---

### Requirement 13: Employer Upcoming Interviews Display

**User Story:** As an employer, I want to see upcoming interviews on my dashboard, so that I can prepare and join interviews with candidates.

#### Acceptance Criteria

1. WHEN the employer dashboard loads, THE Upcoming Interviews section SHALL fetch all Application documents with status='Interview Scheduled' for jobs where createdBy=current employer from MongoDB
2. WHEN displaying upcoming interviews, THE system SHALL show for each interview: job title, candidate name, interview date (ISO 8601 YYYY-MM-DD format), interview time (HH:MM 24-hour format), and meeting link (if available)
3. WHEN an interview date/time has passed (current date/time > interviewDate + interviewTime) and the interview is still in 'Interview Scheduled' status, THE system SHALL display the interview row with a red background (#FEE2E2) and label 'Overdue - Action Required' to visually indicate it needs attention
4. WHEN a candidate's interview is rescheduled (interviewDate or interviewTime updated in backend), THE Employer Upcoming Interviews list SHALL refresh within 1 second via polling or WebSocket
5. WHEN the employer clicks the 'Join Meeting' button next to an interview, THE system SHALL validate the meetingLink is a valid URL and open it in a new browser tab (target='_blank', rel='noopener noreferrer')
6. IF the meetingLink field is empty or invalid (not a valid URL), THE 'Join Meeting' button SHALL be disabled and show tooltip 'Meeting link not available'
7. THE Upcoming Interviews list SHALL be sorted by interviewDate in ascending order (nearest interviews first); IF multiple interviews have same date, sort by interviewTime in ascending order
8. WHEN there are no upcoming interviews (zero 'Interview Scheduled' applications for employer's jobs), THE Upcoming Interviews section SHALL display an empty state message: 'No upcoming interviews scheduled. Start scheduling interviews with shortlisted candidates.'
9. WHEN the employer dashboard is actively displayed, THE Upcoming Interviews list SHALL auto-refresh via polling (every 5-10 seconds) or WebSocket within 1 second of any interview rescheduling in the backend
10. WHEN an interview transitions out of 'Interview Scheduled' status (to 'Interview Completed' or 'Cancelled'), IT SHALL be automatically removed from the Upcoming Interviews list within 1 second

---

### Requirement 14: Analytics Real-Time Synchronization

**User Story:** As an employer, I want all charts and statistics on the Analytics page to update in real-time when applications, interviews, or hiring decisions change, so that I have current data for decision-making.

#### Acceptance Criteria

1. WHEN the Analytics page loads, THE Applications by Status chart SHALL display counts calculated from Application documents grouped by status for jobs owned by the current employer
2. WHEN the Analytics page loads, THE Applications This Month line chart SHALL display daily application counts from Application.createdAt timestamps for the current calendar month
3. WHEN the Analytics page loads, THE Applications Per Job bar chart SHALL display application counts for each active job (status='active') created by the current employer
4. WHEN an application status changes, THE Applications by Status chart SHALL update within 2 seconds (via real-time subscription or polling)
5. WHEN a new application is submitted, THE Applications This Month chart SHALL update to increment today's count within 1 second
6. WHEN a job status changes to 'closed', THE Applications Per Job chart SHALL immediately exclude that job or show it as archived/disabled
7. FOR ALL analytics charts, THE data SHALL be fetched from MongoDB Application, Job, and User models and calculated server-side
8. WHEN the Analytics page is open and an application status changes, THE relevant charts SHALL automatically refresh without user interaction or manual refresh button click
9. IF a chart data query fails or times out, THE system SHALL display the previous cached chart data and show a 'Data may be out of date' warning
10. THE page SHALL include a 'Last Updated: [timestamp]' indicator showing when charts were last refreshed from MongoDB

---

### Requirement 15: Complete End-to-End Recruitment Workflow

**User Story:** As an employer and candidate, I want the entire recruitment process to flow seamlessly from job posting through hiring, with all systems staying synchronized, so that we have a reliable ATS workflow.

#### Acceptance Criteria

1. WHEN an employer posts a job, THE Job SHALL be created in MongoDB with status='active' and createdBy field set to the employer's User._id
2. WHEN a candidate applies for a job, THE Application SHALL be created in MongoDB with status='Applied' and createdAt timestamp set to current ISO 8601 time
3. WHEN an employer clicks 'Review' on an Applied application, THE Application status SHALL transition Applied → Reviewed in MongoDB within 500ms
4. WHEN an employer clicks 'Shortlist' on a Reviewed application, THE Application status SHALL transition Reviewed → Shortlisted in MongoDB within 500ms
5. WHEN an employer opens the Interview Modal and saves interview details, THE Application status SHALL transition Shortlisted → Interview Scheduled with interviewDate, interviewTime, and meetingLink stored within 500ms
6. WHEN the employer marks interview completed, THE Application status SHALL transition Interview Scheduled → Interview Completed within 500ms
7. WHEN the employer clicks 'Hire Candidate', THE Application status SHALL transition to 'Hired' and Job.activeApplications SHALL decrement within 500ms
8. WHEN the employer clicks 'Reject Candidate' (at any pre-hired status), THE Application status SHALL transition to 'Rejected' within 500ms, and IF status was Interview Scheduled, interviewStatus SHALL change to 'Cancelled'
9. WHEN a candidate withdraws an application, THE Application status SHALL transition to 'Withdrawn' and a notification SHALL be created for the employer within 500ms
10. FOR any invalid state transition (e.g., attempting to hire from Applied status), THE system SHALL return HTTP 400 error with message describing the invalid transition
11. WHEN an application is marked as 'Hired', THE Employer Dashboard, Applicant List, and Candidate Dashboard SHALL all update within 1 second
12. WHEN an application is marked as 'Hired', THE notification badge for the candidate SHALL increment by 1 within 500ms
13. WHEN an application status changes, THE Analytics page charts SHALL update within 2 seconds if the page is currently open
14. WHEN a new application is created, THE Recent Activity timeline SHALL add an entry within 2 seconds on the employer dashboard
15. WHEN an application status changes to any terminal state (Hired or Rejected), THE Recent Activity timeline SHALL add an entry within 2 seconds
16. FOR THE entire workflow, ALL status transitions SHALL be logged in MongoDB with fields: fromStatus, toStatus, changedAt (ISO 8601 timestamp), changedBy (User._id of employer), and reason (if applicable)
17. FOR THE entire workflow, NO frontend component local state SHALL override MongoDB as the source of truth for application status (all status reads must fetch from backend API)
18. WHEN any application or interview data is modified, THE frontend SHALL verify changes were persisted in MongoDB before updating UI state (read-after-write consistency check)

---

### Requirement 16: Reschedule Interview Action

**User Story:** As an employer, I want to reschedule a candidate's interview with an updated date and time, so that I can accommodate scheduling conflicts.

#### Acceptance Criteria

1. WHEN the employer clicks 'Reschedule Interview' on an application with status='Interview Scheduled', THE Interview Modal SHALL open pre-populated with the current interviewDate, interviewTime, meetingLink, interviewMode, and interviewLocation values
2. WHEN the employer updates the interviewDate field and saves, THE Application.interviewDate SHALL be updated to the new date in MongoDB within 500ms
3. WHEN the employer updates the interviewTime field and saves, THE Application.interviewTime SHALL be updated to the new time (HH:MM 24-hour format) in MongoDB within 500ms
4. WHEN the employer updates the meetingLink field and saves, THE Application.meetingLink SHALL be updated to the new link in MongoDB within 500ms
5. WHEN any interview field (date, time, or link) is updated and saved successfully, THE Candidate Upcoming Interviews list SHALL refresh within 1 second to display the updated date and time
6. WHEN any interview field is updated and saved successfully, THE Employer Upcoming Interviews list SHALL refresh within 1 second
7. WHEN an interview is rescheduled, A Notification SHALL be created in MongoDB for the candidate with type='interview', title 'Interview Rescheduled for [Job Title]', and message 'Your interview has been rescheduled to [DATE] at [TIME] [TIMEZONE]' within 500ms
8. WHEN any interview field is updated, THE Recent Activity timeline SHALL add a new entry within 2 seconds showing the reschedule event on both employer and candidate dashboards
9. IF the modal is closed without saving changes, THE original interview details SHALL remain unchanged in MongoDB and no notification SHALL be generated
10. IF an error occurs during reschedule (network failure, validation error), THE system SHALL display an error toast and rollback to the previous interview state in the UI

---

### Requirement 17: Interview Details Persistence

**User Story:** As an employer and candidate, I want all interview details to be stored and retrieved correctly, so that we have a complete record of scheduled interviews.

#### Acceptance Criteria

1. WHEN an interview is scheduled, THE Application SHALL store the following interview fields in MongoDB: interviewDate (YYYY-MM-DD format), interviewTime (HH:MM 24-hour format), meetingLink (URL string), interviewMode ('Google Meet' | 'Microsoft Teams' | 'Zoom' | 'Offline'), interviewLocation (string, only for 'Offline' mode), interviewDuration (string), interviewMessage (string), and interviewNotes (string)
2. WHEN an interview is scheduled, THE Application interviewStatus SHALL be set to 'Upcoming' in MongoDB
3. IF interviewMode is 'Google Meet', 'Microsoft Teams', or 'Zoom' AND meetingLink is missing or invalid (not a valid URL), THE system SHALL reject the scheduling request and return status 400 with error message 'Please provide a valid meeting URL for online interviews'
4. IF interviewMode is 'Offline' AND interviewLocation is empty or whitespace-only, THE system SHALL reject the scheduling request and return status 400 with error message 'Please provide a location/venue for offline interviews'
5. WHEN an employer marks an interview as completed, THE Application interviewStatus SHALL be updated to 'Completed' in MongoDB and Application status SHALL transition to 'Interview Completed'
6. WHEN an employer cancels an interview, THE Application interviewStatus SHALL be updated to 'Cancelled' in MongoDB and Application status SHALL revert to 'Shortlisted'
7. WHEN displaying interview details to a candidate, THE system SHALL fetch and display all 8 interview fields (date, time, link, mode, location, duration, message, notes) from the Application record in MongoDB
8. WHEN a candidate views their upcoming interview, THE meetingLink field SHALL be rendered as a clickable hyperlink element that opens the URL in a new browser tab when clicked (with target='_blank')
9. WHEN an interview is rescheduled, THE previous interview details (old date, old time, old link) SHALL be overwritten with new values in MongoDB using atomic update operation (no intermediate state exposed)
10. WHEN an application status transitions to 'Interview Completed', 'Hired', or 'Rejected', THE Application interviewDate, interviewTime, meetingLink, and interviewStatus fields SHALL remain present and unchanged in the MongoDB document for audit and historical purposes

---

### Requirement 18: Multi-Status Application View

**User Story:** As a user, I want to understand which applications are in each stage of the pipeline at a glance, so that I can prioritize my next actions.

#### Acceptance Criteria

1. WHEN the employer views the Applicants page, THE system SHALL provide a status filter dropdown OR visual grouping mechanism that allows filtering by application status
2. WHEN the candidate views their applications page (MyApplications), THE system SHALL display all applications with their current status clearly visible in a status badge element
3. WHEN the employer selects a status filter on the Applicants page, THE system SHALL fetch from MongoDB only Application documents matching the selected status for jobs owned by the current employer and display them within 1 second
4. WHEN a status filter is applied and an application status changes in the backend, THE applicant list SHALL automatically update within 1 second (via polling or WebSocket) to reflect the status change
5. THE status badges SHALL use consistent color coding throughout the application: Applied=gray (#9CA3AF), Reviewed=yellow (#FBBF24), Shortlisted=blue (#3B82F6), Interview Scheduled=purple (#A855F7), Interview Completed=orange (#F97316), Hired=green (#10B981), Rejected=red (#EF4444)
6. WHEN viewing an application detail view or card, THE current status in the pipeline SHALL be displayed with the corresponding color badge and status text
7. WHEN an application status changes in MongoDB, THE application card or row in the list SHALL automatically move to the correct status group within 2 seconds (if using status grouping) or update its badge color/text (if using status filtering)
8. IF the Applicants list is currently filtering by a status and an application transitions out of that status, THE application SHALL be removed from the visible list within 1 second
9. WHEN the MyApplications page is viewed by a candidate, THE applications SHALL be organized by status groups (Applied, Reviewed, Shortlisted, Interview Scheduled, Interview Completed, Hired, Rejected, Withdrawn) with section headers for each group
10. IF there are no applications in a particular status group, THAT status group section SHALL either be hidden or display an empty state message within that section

