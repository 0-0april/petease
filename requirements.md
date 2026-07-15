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

  11. In the user/Appointment.jsx page, do not change the ui's default backend, i want it to work as it used to be but just change the references of the data that it was coming from. it should automatically displays the appointment booked by the currently logged user. this is from Appointment table (check schema backend/petease.sql if it confuses you).
  
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

24. In the user/pages/Notifications.jsx, once there is changes or updates in the pages like new message received, appointment cancelled by vet staff, new adoption received, and announcement by vet staff/admin, it should all be displayed here. like the modern notification in other systems. 

25. the details  of the changes or updates should be added in the database and should be displayed accordingly in the page. once the notification card is being clicked by the currently logged in user it should direct the respected page of where the notification coming from. check the backend/petease.sql as your reference for you database connection.



FRONT END REQUIREMENTS UPDATE

I need to improve the UI/UX of my existing project while maintaining all backend functionality, database connections, and existing dependencies. Here are my specific requirements:

**Project Context:**
- I have an existing full-stack project with Supabase backend connection
- All backend logic, API routes, and database operations must remain untouched
- Dependencies and their versions must stay exactly as they are

**UI/UX Requirements:**
1. **Icon System:** Keep using the same icon source/library that's currently implemented. Don't change the icon provider or import method - just enhance how icons are displayed and integrated into the new UI.

2. **Color Theme:** Maintain the exact same color palette currently in use. Don't change hex codes, brand colors, or any established color system. Only enhance how these colors are applied (better contrast, spacing, hierarchy, etc.)

3. **Responsive Design:** Make the entire interface fully responsive for mobile devices (320px+), tablets (768px+), and desktop (1024px+). Use mobile-first approach.

4. **UI Improvements (without changing functionality):**
   - Better visual hierarchy and spacing
   - Improved typography (font sizes, weights, line heights)
   - Enhanced card/container designs with subtle shadows and borders
   - Better form inputs with focus states and validation styling
   - Smooth transitions and micro-interactions
   - Improved loading states and feedback
   - Better use of whitespace
   - More polished buttons and interactive elements
   - Improved data tables/list views
   - Better navigation/menu experience
   - Enhanced modals/dialogs

5. **Technical Constraints:**
   - Only modify components, styles, and layout files in the frontend folder
   - No changes to package.json, dependencies, or versions
   - No changes to Supabase client configuration or connection
   - No changes to API routes or backend logic
   - Keep all event handlers, form submissions, and data fetching logic intact
   - Use existing CSS framework if present, or add minimal additional CSS/Tailwind classes
   - Preserve all existing component props and state management

**Deliverables:**
- Clean, modern UI that looks professionally designed
- All existing functionality works exactly as before
- Fully responsive across all devices
- Consistent with the current brand colors and icon system
- Performance not degraded (no unnecessary re-renders)

**Current Tech Stack (please ask me if you need specifics):**
- Frontend Framework: React with Vite
- Styling:  Tailwind CSS
- UI Library: Custom React components
- Backend:Supabase with Express.js API routes
- Icon Library: Inline SVG icons

26. in the vet staff panel, in the vet/VetServices page: When the vet staff adds new service or edit existing service and selects the availability you should ask the days(Monday, Tuesday, Wenesday, Thursday to Sunday) it is going to be available. 

27. aside from the weekdays, the availability slection could be customized as well through a Specific date

The service availability choices should display:
- Monday
- Tuesday
- Wednesday
- thursday
- friday
- saturday
- sunday
- specific date (with input through calendar)

29.  vet staffs can select multiple if it is selecting Days but if the specific date it click it should be the only one selected so disable the specific date if there is day above selected and disable the day if there is date selected.

30. after implementing that, update the database connection that is invovled in that function. check the petease.sql as reference for you modification. 

do not explain too much, execute what i said and save credits.

31. make sure the availability is accurately visible in the user/BookAppointment. as what i have seen the consultation i selected is on mondays but the available day that is seen in the user panel is on tuesdays. there is somthing wrong with the calendar rendering fix it

32. In the vet/VetNotifications.jsx, once there is changes or updates in the pages like new appointment, new adoption and announcement by vet staff/admin, it should all be displayed here. like the modern notification in other systems. YOU CAN USE THE TEMPLATE that is being used in the user/Notifications page

33. the details  of the changes or updates should be added in the database and should be displayed accordingly in the page. once the notification card is being clicked by the currently logged in user it should direct the respected page of where the notification coming from. check the backend/petease.sql as your reference for you database connection.


34. In the use/Messages add a  card there named "Announcements" that in the conversations sidebar that behaves just like how the user messages displayed behave but only sends announcement from the vet staff and admin. user cannot reply to this but it sends the necessary information of the annoucement from the Annoucement table.


34.1. in the user/Messages page, the currently opened chat by the user should have report icon(behaves as button) in the left part of the opened chat heater, next to the user's name display, to report the user. 

34.2. the report modal value should be connected to REPORTS table. 

- check the petease.sql for your reference.

34.3 the user should be allowed to select a certain or multiple chat from her/himself and from the other user as well by js clicking it before showing the report button

34.4. it the selected message should be stored on the REPORT table ReportMessageLog column. solve first the problem here: the multiple selected chat reporte should be in one reportmessage log and should be separated based on the chat as well, did you get what i mean? 

- check the petease.sql for your reference.

35. connect the Announcements table to the user/Messages's announcement pinned chat. the announcement should behave like chats but with complete necessary details about the announcement. check backend/petease.sql as your reference






Act as an expert UI/UX developer. Generate a clean, modern, desktop and mobile-responsive checkout UI layout using Tailwind CSS based on the following precise visual specifications:

### 1. Theme, Background & Core Containers
* **Background Canvas:** A very clean, soft green-white canvas (`hsla(132, 79%, 89%, 1.00)`). To capture the image's dynamic feel, position multiple floating, deeply blurred, organic 3D spheres across the background. The spheres use a vibrant lime-to-mid-green radial gradient (`hsl(130, 100%, 30%)` to `hsl(135, 95%, 18%)`).
* **Main UI Container (Glass Card):** The central layout must resemble the image's premium frost effect. 
  * Use a highly translucent white fill with an aggressive frosted effect (`backdrop-blur-[25px] bg-white/40`).
  * Add a crisp, ultra-thin 1px solid white border (`border-white/60`) to define the shape.
  * Apply soft, heavily rounded corners (`rounded-[32px]`) and a subtle, wide-diffused shadow to give it an elegant, floating look against the background elements.

### 2. Layout (Two-Column Split on Desktop, Stacked on Mobile)
* **Left Column (Visual Credit Card Preview):**
  * **Card Design:** A floating, smaller glassmorphic element. It utilizes a slightly more opaque frost layer so text remains sharp. 
  * Incorporate an integrated, glowing green gradient orb (`hsl(130, 100%, 30%)`) masked into the bottom-right corner of the card itself, exactly mirroring how the green orb bleeds through the central panel in the reference image.
  * Elements include a clean icon chip, masked card numbers, and the cardholder's name.
* **Right Column (The Checkout Form):** Houses the navigation bar, input fields, and payment footer.

### 3. UI Component Specifications

* **Navigation Bar (3-Step Checkout Nav):**
  * **Structure:** A minimalist 3-step navigation link (Main page > Shipping details > Payment method) aligned to the top of the form.
  * **Styling:** Inactive steps use a low-opacity mid-tone green (`hsl(135, 95%, 18%, 0.5)`). The active "Payment method" step is rendered in bold mid-tone green with a sharp, vibrant green underline accent (`hsl(130, 100%, 30%)`).

* **Input Fields:**
  * **Style:** Sleek, borderless, low-profile text inputs. Instead of a box, each input uses a clean, thin solid horizontal bottom border (`border-b border-neutral-300`).
  * **Interactions:** The background inside the field is completely transparent. On focus, the bottom border smoothly transitions to a vivid green highlight (`hsl(130, 100%, 30%)`). 
  * **Labels & Icons:** Labels are positioned above the inputs in a muted forest-green (`hsl(140, 100%, 7%, 0.6)`). Include a subtle icon prefix for Cardholder, Card Number, and CVV fields.

* **Primary CTA Button ("PAY" Button):**
  * **Shape & Fill:** A distinct capsule/pill-shaped button (`rounded-full`) that acts as the primary action.
  * **Aesthetic:** To match the graphic elements in the image, the button features a smooth, vibrant lime-to-mid-green linear gradient (`from-[hsl(130,100%,40%)] to-[hsl(135,95%,22%)]`).
  * **Text:** The word "PAY" is set in crisp, stark white (`hsl(0, 0%, 100%)`), All-Caps, and Bold.
  * **Hover Effect:** Add a subtle brightness lift and a soft green glow shadow on hover.

### 4. Typography & Visual Hierarchy
* **Font Family:** Clean, geometric Neo-Grotesque Sans-Serif (such as Inter, SF Pro, or Helvetica Neue).
* **Color Palette for Text:** For maximum readability on this light theme, all primary headings and structural labels use a deep forest-green base (`hsl(140, 100%, 7%)`) instead of black. Secondary subtext uses a lighter, mid-tone green opacity.
* **Styling Hierarchy:** 
  * **Main Titles & Active States:** Set in **All-Caps, Bold/Heavy** weights with tight, compressed tracking (letter-spacing) to anchor sections.
  * **Subtext & Descriptions:** Set in **Regular/Light** weight, using standard lowercase prose with looser tracking for an open, airy, modern aesthetic.



  ADMIN requirements

  1. when the accid was in the admin table, direct that account to the admin panel. just like what you did to vet staff auth, but this time its for admin.

- read petease.sql for you to understand the intruction more and for your reference


2. in the admin/AdminDashboard page, there should be accurate line graphs based on the active users and it should be filtered as this week, this month, and this year( it depends on the filter button clicked by the currently login in admin), the filter should be based on the USER table's UserLastLogin column. 

3. it should b accuratelydisplayed based on the count of the user outcome after the filter

4. in the admin/AdminUsers page, the page should display real users from the USER table, it should display its email, (remove the role part/column), last login, status, leave the action the same.

- read petease.sql for you to understand the intruction more and for your reference

5. in the admin/AdminReports page, connect its data displayed to the REPORTS table from the real data of supabase

6. there would be choices given to the admin either suspend, warning, or dismiss the report, once it is clicked the system should ask for the admin's confirmation and once it is confirmed it updates the report status directly

7. in admin/AdminReports page, once the admin suspends the reported user, the user's AccStatus should be "Suspended" and therefore unable to login/register again with the same email. tho, if it is "Warning", when that certain user logs in, there should be yellow container floating above about the warning(allow the user to close it through (x) button on the left side of the statement/warning). only "Active" User account should be logged/register normally.

- read petease.sql for you to understand the intruction more and for your reference

4.1 in the dmin/AdminReports page, once the reportedUser account's status was suspended, also display the status of the rest of the report towards the same suspended user as suspended

5. when the user account's status is suspended, the user's shouldn't be allowed to login into the system, it should show an error in the login/register page.

6. if the user's account staus is warning, the system would still be allow the user to login but before proceeding the user to dashboard, it should display inside the container first when the user click the (x) button for it to close it, it should propced the user to the user's dashboard

7. in the admin/AdminAnnouncement, connect the frontend data to the supabase database without damaging the ui, just change the reference of its database

- make sure you correctly apply the filter based on the roles where the announcement came from, the admin is for system announcement, and vet is for vet annoucements. it is connected to the vet services as well where the vetstaff updates the services and they put it to the announcement.

- read petease.sql for you to understand the intruction more and for your reference


8. in the vet/VetServices page, once the vet staff updated the vet services and puts check to announce it, it should write the changes made in the AnnouncementContent database, like for example:

Neuter Services has been updated!

Neuter is now available on:
- Monday
- Wednesday

(or if the neuter or any services updated is changed/updated to a specific schedule):

Neuter is now available on:
- July 17, 2026, Friday

- take note it depends on the changes made in the vet services page

- read petease.sql for you to understand the intruction more and for your reference



Navigation Bar and Browse For Pets UI Update:

I want you to restyle the UI of my existing project to match a reference design, without changing any backend logic, data bindings, API calls, database queries, props, or state management. This is a pure presentational/UI refactor. Do not touch functions that fetch or mutate data — only the JSX/HTML/CSS markup and layout. My project uses Tailwind CSS.

Critical constraints:


Preserve all existing data connections (props, hooks, API/database calls, loops/.map() rendering, conditional rendering logic).
Preserve my project's existing color theme/brand colors exactly — do not adopt the reference image's navy/pink palette. Before writing any styles, first inspect my tailwind.config.js/tailwind.config.ts (or theme block / CSS @theme layer if using Tailwind v4) and list out the existing custom color tokens (e.g. primary, secondary, accent, background, muted, etc.).
Only use Tailwind utility classes built from my existing theme tokens (e.g. bg-primary, text-primary, bg-accent, border-muted) — never hardcode new hex values or Tailwind's default palette colors (like bg-pink-500 or bg-indigo-900) unless that exact shade already exists in my config.
Map the reference design's structural color roles onto my tokens like this:

Reference's dark navy text/buttons → my theme's primary (or darkest brand color)
Reference's pink/coral accent (ribbon badge, icons) → my theme's accent/secondary color
Reference's white card backgrounds → my theme's background/card color
Reference's gray body text → my theme's muted/foreground-secondary text color
Reference's light hero gradient → a subtle gradient or tint built from my primary/accent at low opacity (e.g. from-primary/10 to-accent/10), not a new pink/lavender



If my config has no matching token for a given role, tell me instead of inventing a new color.
Reuse existing components where possible; only adjust classNames, layout structure, and styling.
Keep it fully responsive (the reference is a 3-column desktop grid that should collapse to 1–2 columns on smaller screens) using Tailwind's responsive prefixes (sm:, md:, lg:).


Build the layout in this exact top-to-bottom order:


Navbar — floating pill-shaped rounded container with soft shadow, slightly inset from the page edges (not full-width). Left: logo/icon + brand name. Center: horizontal nav links, with two of them as dropdown menus (chevron icon). Right: a pill-shaped outlined "Contact Us" style CTA button.
Hero section — full-width band directly below the navbar, soft gradient/tinted background (light, low-saturation), with a subtle background texture (soft dot or wave pattern). Content is centered: a large bold heading, a shorter muted paragraph beneath it (2–3 lines, centered, max-width constrained). Bottom edge of this section has a wavy/curved SVG divider transitioning into the page's base background color.

IN THE user/BrowseForPets page:

pet Card grid section — white/base background, generous top padding after the wave divider. Grid of cards, 3 columns on desktop, 2 on tablet, 1 on mobile, with consistent gutter spacing. Each card:

Rounded corners with a subtle dashed border and soft shadow.
Top: image (rounded corners, fixed aspect ratio, object-fit: cover) — bind this to the existing data source's image field.
A small pill-shaped ribbon/badge overlapping the top-left corner of the image (icon + brand/category label) — bind label to existing data field if applicable, otherwise keep static.
Below the image: bold title (bind to record name/title field), then a short muted description line (bind to description field, truncate if needed).
A meta row with two small icon+text stats side by side (e.g., a metric icon + value, and a calendar/date icon + value) — bind both to relevant data fields.
A full-width or auto-width pill-shaped primary action button at the bottom (bind onClick to existing action/handler, e.g., navigate to detail page or trigger existing function).
Loop this card over the existing dataset/array exactly as it's currently rendered — just change the markup/styling per card, not the data source.



Empty/loading states — if the existing project has loading or empty-state handling for this data, preserve it and restyle it to match the same card shape (e.g., skeleton cards).


Deliverable: Updated component(s)/file(s) with new Tailwind-based markup and styles applied, using only my project's existing tailwind.config color tokens, existing data-fetching logic untouched, and the same component/data structure — only the visual layer changes.


remove the user dashboard, once the user logs it it should automatically displays browse for pets page