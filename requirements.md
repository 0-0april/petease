Here's a polished version of your prompt, structured for clarity and precision:

---

### Role  
You are a senior developer.

### Project Overview  
Build **PetEase**, a web-based Pet Adoption & Veterinary Appointment System.

### Tech Stack (Strict)  
- **Frontend:** HTML5, Tailwind CSS, React.js (functional components only)  
- **Backend:** Node.js  
- **File Format:** All source files must be in `.jsx` format. Do not use `.js` for components.

---

### System Panels & Features

#### 0. Landing Page



#### 1. Users Panel (Owners / Adopters)
- **Login / Registration**  
- **Browse Available Pets**  
  - Search, filter, and view pet profiles in a floating container.  
  - From the same container, users can request adoption and message the owner.  
- **Adoption Requests**  
  - View sent and received adoption requests.  
    - **Sent:** Displays pet image, pet name, and owner’s name(once it is clicked it directs to messages where their chat with the user is open).  
    - **Received:** Displays pet image, pet name, and adopter’s name(once it is clicked it directs to messages where their chat with the user is open).  
  - Approve or reject received requests (for pets owned).  
  - Cancel sent requests (for pets now owned).  
  - Every action must include feedback and confirmation.  
- **Register Pet**  
  - Required fields: pet name, gender, species, breed, color, birthday, description, medical history, registration type (for adoption or appointment), pet image, vaccination card (optional).  
  - Users can edit or delete registered pets.  
- **Messages**  
  - Conversations can only be initiated via the “message” button on a pet profile.  
  - Search messages by user name.  
- **Notifications**  
  - Receive alerts for new announcements, adoption requests, and status updates.  
- **Book Veterinary Appointment**  
  - On the appointments tab, a “New Appointment” button appears at the top right.  
  - Step 1: Select one or more pets.  
  - Step 2: Choose a service (Consultation, Rabies Vaccination, Spay, Neuter). Unavailable services are grayed out.  
  - Step 3: Select a date using a month-flippable calendar.  
    - Consultation: Mondays only.  
    - Rabies Vaccination: Weekdays only.  
    - Spay/Neuter: Availability based on updates from veterinary staff.  
  - Users can cancel appointments.

---

#### 2. Veterinary Staff Panel
- **Dashboard**  
  - Filter appointments by year, month, or week.  
  - View service usage statistics and species distribution.  
  - Clicking any record shows full appointment details.  


Here’s a polished version of the **Appointments** section under the Veterinary Staff Panel, restructured into three clear subsections:

---

#### 2. Veterinary Staff Panel

- **Appointments**  
  - **Pending Appointments**  
    - View appointments awaiting confirmation.  
    - Confirm or cancel appointments.  
    - Supports filtering by date and sorting.  
    - Paginated list.

  - **Confirmed Appointments**  
    - View appointments that have been confirmed.  
    - Mark attendance as “Show” or “No Show”.  
    - If marked “Show,” automatically update the pet’s medical record with the date, time, and service performed.  
    - Paginated list.

  - **Completed Appointments**  
    - View appointment history where the client showed up.  
    - Sort, filter, and search by user name.  
    - Export records to CSV.  
    - Pagination required.
    
- **Announcements**  
  - Upload and edit service announcements (e.g., spay/neuter availability).  
- **Adoption List**  
  - View adoption requests with details.  
  - Approve adoptions after in-office meeting and signed waiver.  
- **Services**  
  - Edit and update services and their availability.  
  - Upon update, automatically notify all users with details of available services and dates.  
  - Choose availability: specific date or recurring (default: weekdays).  
- **Notifications**  
  - View alerts for new appointments and adoption requests.

---

#### 3. Admin Panel
Pages:
- **Dashboard**  
  - Chart displaying active users over time (month, week, year).  
- **Manage Users**  
  - Filter users by last login (days, years). include select multiple or one users and add suspend button to suspend them, with pretemplate reason of suspension.
  - suspension could be for one user only that the button is displayed in the actions column and nothing else. with crud operations.  
- **Manage Reports**
  - Review reports, disable accounts, or ignore.  
- **Announcements**  
  - Create, review, approve, reject, or edit announcements (including those submitted by veterinary staff).
- **Notification**
  - notifies if there is new user report and new announcement created by vet staff

---

### UI & Design Guidelines
- **Color Palette:** Dark green accents on a white and light gray background.  
- **Quality:** Academic / capstone-project level — clean, professional, and polished.  
- **Language:** Use simple, clear English for all UI text.

---

### Important Instructions
- Do not add features beyond those listed.  
- You may state assumptions where necessary (e.g., mock data, local storage, or basic state management context).