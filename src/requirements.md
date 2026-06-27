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


### Backend
1. Set up Supabase PostgreSQL backend. Use the petease.sql schema (already configured in Supabase). Connect authentication (login/register) to the existing database tables.

2. connect the data from the supabase db (use 'backend/petease.sql' as the reference because that is the schema) to the 'user/BrowsePets.jsx' page. remove the connection from the mockData and use the values on the actual supabase. 

follow the following references, don't change the ui, just change the reference for the data that is being displayed here.

  pet.name should be replace with PetName,
  pet.birthday should be replaced with PetBDay,
  pet.species = PetSpecie 
  pet.breed = PetBreed
  pet.markings = PetMarkings 
  pet.gender = PetGender 

  and so on, just read all the Pet table attributes from the 'backend/petease.sql' and connect it here. use the same conditions from the mock data just change the reference for the data displayed there

  3. read the 'backend/petease.sql' again and find the userpets table. this your basis for display for user/MyPets.jsx page and user/BrowsePets.jsx, and BookAppointment.js page as well. again do not change the UI, just change the data from mock data to supabase data. 

  4. make sure that the following uploaded file is stored in the supabase bucket that named the following:
  
  adoption-waivers for AdoptionWaiver from ADOPTION table(the file name when it gets inside the bucket should be changes from its original file name to the Adopter's User's username + upload file name), and
  pet-images for petImg attribute from PET table the file(the file name when it gets inside the bucket should be changes from its original file name to the User's username + uploded file name)

  5. make sure the name of the logged in user is displayed in the navigation bar between notification and logout button.

  6. the user who owned the pet shouldn't be allowed to adopt its own. it should display "you owned this pet" or something instead of message owner or request adoption. it should only be displayed when it was owne by other user

  7. when the user edit the pet, it should not reset the information that has ben already place. make sure the birthday is still there when the user hit edit. instead of asking the user to input birthday again.

8. now connect the user/AdoptionRequest.jsx to the supabase based on the schema given in the backend/petease.sql. make sure it connect correctly use the same logic as the UI have(read the like 29 to 35 of this file for the reference), you just have to change the reference of that data


  UserID is always the adopter who sent request and
  UserPetsID is always the owner of pet who receive the request.
  since there is sent and recieved part (read the like 29 to 35 of this file for the reference), it should be logically sorted.

  you can get the data through logically reading the backend/petease.sql
 
11. connect the supabase to the messages, maintain the ui's logic, but just change the reference fro the database based on the backend/petease.sql schema from the MESSAGE Table. 

  MessFrom uuid is from userID that sent the message
  MessTo uuid is from the userID who is going to receive the message. 
  MessContent is for the message content
  
  read the backend/petease.sql for the reference. the sender's message that is logged in to the current account should be on the right and the user's message that the logged in user that is talking/chatting to is on the . make sure it is well arranged based on the timestamp. i will leave the rest to you to implement and please do it right.

  10. now connect the supabase to the user/Appointment.jsx based on the appointment table and any related table on the backend/petease.sql schema

  11. In the user/Appointment.jsx page, do not change the ui's default backend, i want it to work as it used to be but just change the references of the data that it was coming from. it should automatically displays the appointment booked by the currently logged user. this is from Appointment table (check schema given if it confuses you).
  
  you can compare whether the pet's owner from UserPets table's userID through the Appointment's table FK which is UserPetID, if is equal then display the pets that is owned by the user logged in.

  12. Step ServID, list the name of the services from thet FK, and so on.

  13. it should also be connected to the veterinary appointment page as well. once the appointment was booked and again do not change the Ui's logic, just change the reference of the date that was being displayed and manipulated there.



  14. the accountID linked in VETSTAFF table should be directed to Vet Staff panel instead of user panel

  15.  the accountID linked in the ADMIN table should be directed to Admin panel instead of user panel

  16. in the vetAdoption page, it should display all the user-approved adoption request and do the same logic as the ui had. don't change ui, just change the content or data displayed and connect it the supabase db. 
  
  it should display the adoption that is marked as approve and when the vet staff upload the waiver, it should upload and stored to the adoption-waivers bucket once it was marked as completed. then change the status from Approved to Completed

  use the backend/petease.sql for reference for your task

  17. allow vet staffs to add, edit and modify existing services

  18. remove the time column in the vet staff panel, appointments page. 
  
  19. after that maintain now the use and just use the data from supabase instead of from mock data. when vet staff clicks the view button, it should display the following information:

  owner name, owner phone number, address, pet name, pet specie, pet gender, pet markings, pet breed, pet age,  scheduled date, status, pet medical record

  scan backend/petease.sql schema as reference


20. allow multiple select in all the appointment sub parts and give the vet staff option to either confirm or cancel appointment


21. scan backend/petease.sql schema as reference for this task

- when vet staff cancelled appointment from pending, it should change the Appointment Table status to Cancelled, and confirmed should be changed to Confirmed.

- confirmed Appointment should be removed from Vet panel's Appointment page's Pending Appointment tab and appear to the Confirmed Appointment Tab.

22. when the vet staff marked the attendance (show/ no-show), the record should be moved to the  AppointmentLogs Table. 

if the customer's attendande showed up, the LogAttendance should be true, if not it's false. the LogStaffAssigned should be the one who marker it, and logNote too if there is. and the created_at time stamp to which id default now.

23. the appointment that has status of Pending should be listed/ displayed in the Pending Tab of Vet's Appointment Page, the appointment that has status of confirmed should be in the Confirmed Appointment tab, and the appointment's attendance that is marked as 'Show' should be displayed in the Completed Appointment tab

