const monthYear = document.getElementById('month-year');
const daysContainer = document.getElementById('days');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Clear previous days
    daysContainer.innerHTML = '';

    // Get first day of the month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'other-month');
        daysContainer.appendChild(emptyDiv);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        const dayOfWeek = new Date(year, month, day).getDay(); // 0 = Sunday, 6 = Saturday

        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
            dayDiv.classList.add('weekend');
        } else {
            dayDiv.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
                // Select this day
                dayDiv.classList.add('selected');
                console.log(`Selected: ${monthNames[month]} ${day}, ${year}`);
            });
        }

        daysContainer.appendChild(dayDiv);
    }

    // Add empty cells for days after the last day of the month to fill the grid
    const totalCells = startDay + totalDays;
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days = 42
    for (let i = 0; i < remainingCells; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'other-month');
        daysContainer.appendChild(emptyDiv);
    }
}

// Event listeners for navigation
prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Initial render
renderCalendar();
