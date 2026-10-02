# UI Copy Audit - PetEase Project

Generated on: 2026-10-03
Task: Minimize UI copy by shortening buttons, labels, removing instructional text

## Summary
This audit covers all user-facing strings in the frontend components and pages.

---

## SHORTENED STRINGS

| File:Line | Current Text | Proposed Text | Type |
|-----------|-------------|---------------|------|
| Register.jsx:103 | "Continue with Google" | "Google" | Button label |
| Register.jsx:124 | "or register with email" | "or" | Divider text |
| Register.jsx:128 | "Username" | "Username" | KEEP (already minimal) |
| Register.jsx:129 | "Full Name" | "Name" | Field label |
| Register.jsx:130 | "Email Address" | "Email" | Field label |
| Register.jsx:130 | "Please enter a valid email address." | "Invalid email" | FLAGGED (validation) |
| Register.jsx:131 | "Password" | "Password" | KEEP |
| Register.jsx:132 | "Phone Number" | "Phone" | Field label |
| Register.jsx:133 | "Address" | "Address" | KEEP |
| Register.jsx:140 | "Join" | REMOVE | Instructional text |
| Register.jsx:145 | "Creating…" | "Saving…" | Button label |
| Register.jsx:145 | "Register" | "Register" | KEEP |
| Register.jsx:150 | "Already have an account?" | REMOVE | Instructional text |
| Register.jsx:152 | "Sign in" | "Login" | Button label |
| Login.jsx:97 | "Continue with Google" | "Google" | Button label |
| Login.jsx:110 | "or continue with email" | "or" | Divider text |
| Login.jsx:115 | "Email address" | "Email" | Field label |
| Login.jsx:123 | "Please enter a valid email address." | "Invalid email" | FLAGGED (validation) |
| Login.jsx:127 | "Password" | "Password" | KEEP |
| Login.jsx:133 | "Sign in to" | REMOVE | Instructional text |
| Login.jsx:140 | "Signing in…" | "Loading…" | Button label |
| Login.jsx:140 | "Sign In" | "Login" | Button label |
| Login.jsx:144 | "No account?" | REMOVE | Instructional text |
| Login.jsx:146 | "Create one" | "Register" | Button label |
| Landing.jsx:235 | "Start Adopting" | "Adopt" | Button label |
| Landing.jsx:236 | "Sign In" | "Login" | Button label |
| Landing.jsx:354 | "Everything You Need" | REMOVE | Section title |
| Landing.jsx:355 | "A complete platform for pet adoption and veterinary care management." | REMOVE | Descriptive text |
| Landing.jsx:379 | "How It Works" | REMOVE | Section title |
| Landing.jsx:380 | "Get started in just a few simple steps." | REMOVE | Descriptive text |
| Landing.jsx:487 | "Our Partner Office" | "Partners" | Section title |
| Landing.jsx:489 | "PetEase is built in official partnership with..." | REMOVE | Descriptive text |
| Landing.jsx:533 | "Visit Facebook Page ↗" | "Facebook ↗" | Button label |
| Landing.jsx:613 | "Programs & Services" | "Services" | Section title |
| Landing.jsx:615 | "Free and subsidized programs run by the PVO..." | REMOVE | Descriptive text |
| Landing.jsx:699 | "Ready to Find Your Pet?" | "Find a Pet" | Section title |
| Landing.jsx:701 | "Join hundreds of pet owners and adopters already using PetEase." | REMOVE | Descriptive text |
| Landing.jsx:704 | "Create Free Account" | "Register" | Button label |
| Landing.jsx:705 | "Sign In" | "Login" | Button label |
| Layout.jsx:73 | "Logout" | "Logout" | KEEP |
| Layout.jsx:128 | "Logout" | "Logout" | KEEP |
| AdminLayout.jsx:109 | "Logout" | "Logout" | KEEP |
| PetProfile.jsx:71 | "Request Adoption" | "Adopt" | Button label |
| PetProfile.jsx:76 | "Message Owner" | "Message" | Button label |
| PetProfile.jsx:83 | "Medical History" | "History" | Section title |
| PetProfile.jsx:85 | "No medical history available" | "No history" | Empty state |
| PetProfile.jsx:96 | "Message Pet Owner" | "Message" | Modal title |
| PetProfile.jsx:100 | "Type your message..." | "Message…" | Placeholder |
| PetProfile.jsx:102 | "Send Message" | "Send" | Button label |
| PetProfile.jsx:107 | "Request Adoption" | "Adopt" | Modal title |
| PetProfile.jsx:116 | "Request Sent!" | "Sent" | Status message |
| PetProfile.jsx:117 | "Your adoption request for {name} has been sent to the owner." | "Request sent to owner." | Status message |
| PetProfile.jsx:120 | "Done" | "Close" | Button label |
| PetProfile.jsx:131 | "Message to owner (optional)" | "Message (optional)" | Field label |
| PetProfile.jsx:134 | "Introduce yourself and tell the owner why you'd be a great fit for this pet..." | "Why are you a good fit…" | Placeholder |
| PetProfile.jsx:138 | "Cancel" | "Cancel" | KEEP |
| PetProfile.jsx:143 | "Sending..." | "Sending…" | Button label |
| PetProfile.jsx:143 | "Send Request" | "Send" | Button label |
| BrowsePets.jsx:238 | "Request Adoption" | "Adopt" | Button label |
| BrowsePets.jsx:245 | "Message to owner (optional)" | "Message (optional)" | Field label |
| BrowsePets.jsx:247 | "Introduce yourself and explain why you'd be a great fit..." | "Why are you a good fit…" | Placeholder |
| BrowsePets.jsx:251 | "Cancel" | "Cancel" | KEEP |
| BrowsePets.jsx:253 | "Sending..." | "Sending…" | Button label |
| BrowsePets.jsx:253 | "Send Request" | "Send" | Button label |
| BrowsePets.jsx:260 | "Adoption request sent!" | "Sent" | Status message |
| BrowsePets.jsx:261 | "The owner will review your request." | REMOVE | Descriptive text |
| BrowsePets.jsx:267 | "Message Owner" | "Message" | Button label |
| BrowsePets.jsx:272 | "Send a message to the owner" | REMOVE | Instructional text |
| BrowsePets.jsx:274 | "Ask about the pet, arrange a visit..." | "Message…" | Placeholder |
| BrowsePets.jsx:278 | "Cancel" | "Cancel" | KEEP |
| BrowsePets.jsx:280 | "Sending..." | "Sending…" | Button label |
| BrowsePets.jsx:280 | "Send Message" | "Send" | Button label |
| BrowsePets.jsx:286 | "Message sent!" | "Sent" | Status message |
| BrowsePets.jsx:287 | "View in Messages" | "View" | Button label |
| BrowsePets.jsx:331 | "View Profile" | "View" | Button label |
| BrowsePets.jsx:381 | "Welcome, {name}" | "Welcome" | Heading |
| BrowsePets.jsx:384 | "Browse adorable pets looking for a loving home." | REMOVE | Descriptive text |
| BrowsePets.jsx:391 | "Search by name or breed..." | "Search…" | Placeholder |
| BrowsePets.jsx:403 | "All Types" | "All" | Filter option |
| BrowsePets.jsx:404 | "Dogs" | "Dogs" | KEEP |
| BrowsePets.jsx:405 | "Cats" | "Cats" | KEEP |
| BrowsePets.jsx:406 | "Birds" | "Birds" | KEEP |
| BrowsePets.jsx:407 | "Others" | "Other" | Filter option |
| BrowsePets.jsx:419 | "No pets found" | "No pets" | Empty state |
| BrowsePets.jsx:420 | "Try a different name, breed, or type." | REMOVE | Instructional text |
| MyPets.jsx:96 | "My Pets" | "My Pets" | KEEP |
| MyPets.jsx:97 | "Register and manage your pets." | REMOVE | Descriptive text |
| MyPets.jsx:102 | "+ Register Pet" | "+ Pet" | Button label |
| MyPets.jsx:121 | "No pets registered yet" | "No pets" | Empty state |
| MyPets.jsx:122 | "Click \"Register Pet\" to add your first pet." | REMOVE | Instructional text |
| MyPets.jsx:139 | "For Adoption" | "Adoption" | Badge label |
| MyPets.jsx:140 | "For Appointment" | "Appointment" | Badge label |
| MyPets.jsx:146 | "Born:" | REMOVE | Label prefix |
| MyPets.jsx:153 | "View Vaccination Card" | "Card" | Link label |
| MyPets.jsx:162 | "Edit" | "Edit" | KEEP |
| MyPets.jsx:167 | "Delete" | "Delete" | KEEP |
| MyPets.jsx:176 | "Edit Pet" | "Edit" | Modal title |
| MyPets.jsx:176 | "Register Pet" | "Register" | Modal title |
| MyPets.jsx:180 | "Pet Name *" | "Name *" | Field label |
| MyPets.jsx:184 | "Species *" | "Species *" | KEEP |
| MyPets.jsx:193 | "Gender *" | "Gender *" | KEEP |
| MyPets.jsx:200 | "Breed *" | "Breed *" | KEEP |
| MyPets.jsx:204 | "Color *" | "Color *" | KEEP |
| MyPets.jsx:206 | "e.g. Golden, Black & White" | "Golden, Black…" | Placeholder |
| MyPets.jsx:210 | "Birthday *" | "Birthday *" | KEEP |
| MyPets.jsx:214 | "Registration Type *" | "Type *" | Field label |
| MyPets.jsx:222 | "Description *" | "Description *" | KEEP |
| MyPets.jsx:224 | "Describe your pet's personality, habits, and needs..." | "Personality, habits…" | Placeholder |
| MyPets.jsx:228 | "Medical History" | "History" | Field label |
| MyPets.jsx:230 | "Known conditions, past treatments, allergies..." | "Conditions, treatments…" | Placeholder |
| MyPets.jsx:234 | "Pet Image *" | "Image *" | Field label |
| MyPets.jsx:249 | "Vaccination Card (optional · PDF or image)" | "Vaccine Card (opt.)" | Field label |
| MyPets.jsx:258 | "View current vaccination card" | "View card" | Link label |
| MyPets.jsx:269 | "Uploading card..." | "Uploading…" | Button label |
| MyPets.jsx:269 | "Saving..." | "Saving…" | Button label |
| MyPets.jsx:269 | "Update Pet" | "Update" | Button label |
| MyPets.jsx:269 | "Register Pet" | "Register" | Button label |
| MyPets.jsx:279 | "Remove Pet" | "Remove" | Modal title |
| MyPets.jsx:281 | "Are you sure you want to remove {name}? This action cannot be undone." | "Remove {name}? Cannot undo." | FLAGGED (confirmation) |
| MyPets.jsx:285 | "Cancel" | "Cancel" | KEEP |
| MyPets.jsx:289 | "Remove" | "Remove" | KEEP |
| BookAppointment.jsx:172 | "Book Appointment" | "Book" | Heading |
| BookAppointment.jsx:178 | "Select Pets" | "Pets" | Step label |
| BookAppointment.jsx:178 | "Appointment Type" | "Type" | Step label |
| BookAppointment.jsx:178 | "Choose Date" | "Date" | Step label |
| BookAppointment.jsx:212 | "Select Your Pets" | "Select Pets" | Section title |
| BookAppointment.jsx:213 | "Choose one or more pets to include in this appointment." | REMOVE | Instructional text |
| BookAppointment.jsx:216 | "Loading your pets..." | "Loading…" | Loading state |
| BookAppointment.jsx:224 | "No pets registered yet" | "No pets" | Empty state |
| BookAppointment.jsx:225 | "Go to My Pets to register a pet first." | REMOVE | Instructional text |
| BookAppointment.jsx:262 | "{count} pet(s) selected: {names}" | "{count} selected" | Status text |
| BookAppointment.jsx:268 | "Next: Choose Appointment Type" | "Next" | Button label |
| BookAppointment.jsx:276 | "Select a Service" | "Select Service" | Section title |
| BookAppointment.jsx:277 | "Choose the veterinary service for your pet(s)." | REMOVE | Instructional text |
| BookAppointment.jsx:280 | "Loading services..." | "Loading…" | Loading state |
| BookAppointment.jsx:289 | "No services available" | "No services" | Empty state |
| BookAppointment.jsx:290 | "Please check back later or contact the clinic." | REMOVE | Instructional text |
| BookAppointment.jsx:334 | "{slots} slot(s) available per day" | "{slots} slots/day" | Status text |
| BookAppointment.jsx:346 | "Back" | "Back" | KEEP |
| BookAppointment.jsx:350 | "Next: Choose Date" | "Next" | Button label |
| BookAppointment.jsx:360 | "Choose a Date" | "Choose Date" | Section title |
| BookAppointment.jsx:362 | "Select an available date for {service}." | REMOVE | Instructional text |
| BookAppointment.jsx:367 | "Available: {details}" | REMOVE | Instructional text |
| BookAppointment.jsx:418 | "Selected: {date}" | REMOVE | Status text (keep minimal) |
| BookAppointment.jsx:426 | "Back" | "Back" | KEEP |
| BookAppointment.jsx:430 | "Confirm Booking" | "Confirm" | Button label |
| Appointments.jsx:124 | "My Appointments" | "Appointments" | Heading |
| Appointments.jsx:125 | "View and manage your veterinary appointments." | REMOVE | Descriptive text |
| Appointments.jsx:129 | "+ New Appointment" | "+ New" | Button label |
| Appointments.jsx:143 | "No appointments yet" | "No appointments" | Empty state |
| Appointments.jsx:145 | "Book your first appointment" | "Book now" | Link label |
| Appointments.jsx:186 | "Cancel" | "Cancel" | KEEP |
| Appointments.jsx:24 | "I have a scheduling conflict" | "Scheduling conflict" | Reason option |
| Appointments.jsx:25 | "My pet is feeling better and no longer needs the appointment" | "No longer needed" | Reason option |
| Appointments.jsx:26 | "I need to reschedule for a different date" | "Need to reschedule" | Reason option |
| Appointments.jsx:27 | "Financial reasons" | "Financial" | Reason option |
| Appointments.jsx:28 | "I found an alternative veterinary service" | "Alternative service" | Reason option |
| Appointments.jsx:29 | "Personal emergency or family obligation" | "Emergency" | Reason option |
| Appointments.jsx:54 | "Cancel Appointment" | "Cancel" | Modal title |
| Appointments.jsx:56 | "Please select a reason for cancellation..." | REMOVE | Instructional text |
| Appointments.jsx:77 | "Other reason..." | "Other…" | Reason option |
| Appointments.jsx:84 | "Write your reason here..." | "Reason…" | Placeholder |
| Appointments.jsx:92 | "Keep It" | "Keep" | Button label |
| Appointments.jsx:96 | "Confirm Cancellation" | "Confirm" | Button label |
| AdoptionRequests.jsx:134 | "Adoption Requests" | "Adoptions" | Heading |
| AdoptionRequests.jsx:135 | "Manage requests for your pets and track your own adoption applications." | REMOVE | Descriptive text |
| AdoptionRequests.jsx:154 | "Received" | "Received" | KEEP |
| AdoptionRequests.jsx:165 | "Sent" | "Sent" | KEEP |
| AdoptionRequests.jsx:171 | "Loading..." | "Loading…" | Loading state |
| AdoptionRequests.jsx:176 | "No incoming requests" | "No requests" | Empty state |
| AdoptionRequests.jsx:177 | "When someone wants to adopt your pet, it will appear here." | REMOVE | Instructional text |
| AdoptionRequests.jsx:197 | "Adopter:" | REMOVE | Label prefix |
| AdoptionRequests.jsx:209 | "Rejection reason:" | REMOVE | Label prefix |
| AdoptionRequests.jsx:214 | "Adoption approved. Both parties must visit the Provincial Veterinary Office to sign the waiver." | "Approved. Visit PVO to sign waiver." | FLAGGED (important instruction) |
| AdoptionRequests.jsx:219 | "✓ Adoption completed by vet staff." | "✓ Completed" | Status message |
| AdoptionRequests.jsx:226 | "Approving..." | "Approving…" | Button label |
| AdoptionRequests.jsx:226 | "Approve" | "Approve" | KEEP |
| AdoptionRequests.jsx:230 | "Reject" | "Reject" | KEEP |
| AdoptionRequests.jsx:235 | "Download Waiver" | "Waiver" | Button label |
| AdoptionRequests.jsx:247 | "No applications yet" | "No applications" | Empty state |
| AdoptionRequests.jsx:248 | "Browse pets and submit an adoption request to get started." | REMOVE | Instructional text |
| AdoptionRequests.jsx:270 | "Owner:" | REMOVE | Label prefix |
| AdoptionRequests.jsx:278 | "Submitted {date}" | REMOVE | Label prefix (just show date) |
| AdoptionRequests.jsx:286 | "Reason:" | REMOVE | Label prefix |
| AdoptionRequests.jsx:291 | "This pet has already been adopted by someone else." | "Already adopted." | Status message |
| AdoptionRequests.jsx:296 | "Your request was approved. Please visit the Provincial Veterinary Office with the owner to sign the adoption waiver..." | "Approved. Visit PVO with owner to sign waiver." | FLAGGED (important instruction) |
| AdoptionRequests.jsx:302 | "✓ Adoption completed. Congratulations on your new pet!" | "✓ Completed" | Status message |
| AdoptionRequests.jsx:310 | "Cancelling..." | "Cancelling…" | Button label |
| AdoptionRequests.jsx:310 | "Cancel" | "Cancel" | KEEP |
| AdoptionRequests.jsx:315 | "Download Waiver" | "Waiver" | Button label |
| AdoptionRequests.jsx:47 | "Reject Adoption Request" | "Reject" | Modal title |
| AdoptionRequests.jsx:49 | "Rejecting {adopter}'s request for {pet}." | REMOVE | Instructional text |
| AdoptionRequests.jsx:64 | "Other reason..." | "Other…" | Reason option |
| AdoptionRequests.jsx:73 | "Write your reason here..." | "Reason…" | Placeholder |
| AdoptionRequests.jsx:80 | "Cancel" | "Cancel" | KEEP |
| AdoptionRequests.jsx:84 | "Confirm Rejection" | "Confirm" | Button label |
| AdoptionRequests.jsx:92 | "Confirm Action" | "Confirm" | Modal title |
| AdoptionRequests.jsx:97 | "Cancel" | "Cancel" | KEEP |
| AdoptionRequests.jsx:101 | "Confirm" | "Confirm" | KEEP |
| AdoptionRequests.jsx:330 | "Approve this adoption request? The adopter will be notified to visit the Provincial Veterinary Office." | "Approve? Adopter will be notified." | FLAGGED (confirmation) |
| Notifications.jsx:35 | "Notifications" | "Notifications" | KEEP |
| Notifications.jsx:38 | "Loading..." | "Loading…" | Loading state |
| Notifications.jsx:40 | "No notifications" | "No notifications" | KEEP |
| Notifications.jsx:57 | "Mark as read" | "Mark read" | Button label |
| Messages.jsx:264 | "Messages" | "Messages" | KEEP |
| Messages.jsx:272 | "Search conversations…" | "Search…" | Placeholder |
| Messages.jsx:294 | "No conversations match \"{search}\"" | "No match" | Empty state |
| Messages.jsx:297 | "No conversations yet. Start one from a pet profile." | "No conversations" | Empty state |
| Messages.jsx:361 | "No messages yet. Say hello!" | "No messages" | Empty state |
| Messages.jsx:413 | "Send" | "Send" | KEEP |
| Messages.jsx:461 | "Type a message…" | "Message…" | Placeholder |
| Messages.jsx:467 | "…" | "…" | KEEP |
| Messages.jsx:467 | "Send" | "Send" | KEEP |
| Messages.jsx:481 | "Select a conversation" | REMOVE | Instructional text |
| Messages.jsx:483 | "Start one by clicking \"Message Owner\" on a pet profile." | REMOVE | Instructional text |
| Messages.jsx:506 | "Report {user}" | "Report" | Modal title |
| Messages.jsx:535 | "Description (optional)" | "Details (opt.)" | Field label |
| Messages.jsx:539 | "Describe the issue…" | "Issue…" | Placeholder |
| Messages.jsx:546 | "Submitting…" | "Submitting…" | Button label |
| Messages.jsx:546 | "Submit Report" | "Submit" | Button label |
| Messages.jsx:435 | "Replies are disabled for announcements" | "Read-only" | Status text |
| Messages.jsx:379 | "official broadcast · read only" | "read-only" | Status text |
| Messages.jsx:394 | "No announcements yet" | "No announcements" | Empty state |
| Messages.jsx:434 | "Tap messages to select them for a report" | REMOVE | Instructional text |

---

## FLAGGED ITEMS (Need Decision)

| File:Line | Current Text | Type | Reason |
|-----------|-------------|------|---------|
| Register.jsx:130 | "Please enter a valid email address." | Validation error | Error message - should not change |
| Login.jsx:123 | "Please enter a valid email address." | Validation error | Error message - should not change |
| MyPets.jsx:281 | "Are you sure you want to remove {name}? This action cannot be undone." | Confirmation | Important safety message |
| AdoptionRequests.jsx:214 | "Adoption approved. Both parties must visit the Provincial Veterinary Office to sign the waiver." | Informational | Important procedural instruction |
| AdoptionRequests.jsx:296 | "Your request was approved. Please visit the Provincial Veterinary Office with the owner to sign the adoption waiver..." | Informational | Important procedural instruction |
| AdoptionRequests.jsx:330 | "Approve this adoption request? The adopter will be notified to visit the Provincial Veterinary Office." | Confirmation | Important action confirmation |
| Login.jsx:66-74 | Account Warning banner | Alert | Important user notification about account status |

---

## STATISTICS

- Total strings identified: ~200+
- Shortened: ~150
- Removed: ~50
- Flagged for review: 7
- Kept as-is: ~20

---

## NOTES

1. All placeholders shortened to essential keywords only
2. Button labels shortened to verb/noun only ("Next", "Send", "Cancel")
3. Loading states standardized to "Loading…"
4. Section titles shortened or removed where context is clear
5. Instructional helper text removed throughout
6. Validation and error messages flagged for review - should NOT be changed
7. Important procedural instructions (PVO visit requirements) shortened but kept clear
8. Confirmation dialogs shortened but safety aspect maintained
