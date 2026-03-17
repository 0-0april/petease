// Post Announcement JavaScript for interactive functionality

document.addEventListener('DOMContentLoaded', function() {
    // Highlight active sidebar link based on current page
    const currentFile = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li a');

    sidebarLinks.forEach(link => {
        const linkFile = link.getAttribute('href').split('/').pop();
        if (currentFile === linkFile) {
            link.classList.add('active');
        }
    });
    const form = document.getElementById('announcement-form');
    const previewBtn = document.querySelector('.preview-btn');
    const previewSection = document.getElementById('preview-section');
    const editPreview = document.getElementById('edit-preview');
    const confirmPost = document.getElementById('confirm-post');

    // Set default publish date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('announcement-date').value = now.toISOString().slice(0, 16);

    // Preview functionality
    previewBtn.addEventListener('click', function(e) {
        e.preventDefault();

        const title = document.getElementById('announcement-title').value;
        const type = document.getElementById('announcement-type').value;
        const priority = document.getElementById('announcement-priority').value;
        const content = document.getElementById('announcement-content').value;
        const date = document.getElementById('announcement-date').value;
        const audienceCheckboxes = document.querySelectorAll('.checkbox-group input:checked');
        const audience = Array.from(audienceCheckboxes).map(cb => cb.value).join(', ');

        if (!title || !type || !content || !date) {
            alert('Please fill in all required fields before previewing.');
            return;
        }

        // Update preview
        document.getElementById('preview-title').textContent = title;
        document.getElementById('preview-type').textContent = type.charAt(0).toUpperCase() + type.slice(1);
        document.getElementById('preview-priority').textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
        document.getElementById('preview-content').textContent = content;
        document.getElementById('preview-date').textContent = `Publish: ${new Date(date).toLocaleString()}`;
        document.getElementById('preview-audience').textContent = `Audience: ${audience}`;

        // Set priority styling
        const priorityElement = document.getElementById('preview-priority');
        priorityElement.className = 'preview-priority';
        if (priority === 'high') {
            priorityElement.classList.add('high');
        } else if (priority === 'urgent') {
            priorityElement.classList.add('urgent');
        }

        // Show preview
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Edit preview
    editPreview.addEventListener('click', function() {
        previewSection.style.display = 'none';
    });

    // Confirm post
    confirmPost.addEventListener('click', function() {
        const title = document.getElementById('preview-title').textContent;
        alert(`Announcement "${title}" has been posted successfully!`);
        previewSection.style.display = 'none';
        form.reset();

        // Reset date to now
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('announcement-date').value = now.toISOString().slice(0, 16);
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('announcement-title').value;
        const type = document.getElementById('announcement-type').value;
        const priority = document.getElementById('announcement-priority').value;
        const content = document.getElementById('announcement-content').value;
        const date = document.getElementById('announcement-date').value;
        const audienceCheckboxes = document.querySelectorAll('.checkbox-group input:checked');
        const audience = Array.from(audienceCheckboxes).map(cb => cb.value);

        if (!title || !type || !content || !date) {
            alert('Please fill in all required fields.');
            return;
        }

        // In a real application, this would send data to the server
        console.log('Posting announcement:', {
            title,
            type,
            priority,
            content,
            date,
            audience
        });

        alert(`Announcement "${title}" has been posted successfully!`);
        form.reset();

        // Reset date to now
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('announcement-date').value = now.toISOString().slice(0, 16);
    });

    // Audience checkboxes - ensure "All Users" deselects others
    const allUsersCheckbox = document.querySelector('.checkbox-group input[value="all"]');
    const otherCheckboxes = document.querySelectorAll('.checkbox-group input:not([value="all"])');

    allUsersCheckbox.addEventListener('change', function() {
        if (this.checked) {
            otherCheckboxes.forEach(cb => cb.checked = false);
        }
    });

    otherCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            if (this.checked) {
                allUsersCheckbox.checked = false;
            }
        });
    });

    // Edit announcement functionality
    const editButtons = document.querySelectorAll('.edit-btn');
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    const editForms = document.querySelectorAll('.edit-form');

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const announcementItem = this.closest('.announcement-item');
            const viewMode = announcementItem.querySelector('.view-mode');
            const editMode = announcementItem.querySelector('.edit-mode');

            viewMode.style.display = 'none';
            editMode.style.display = 'block';
        });
    });

    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const announcementItem = this.closest('.announcement-item');
            const viewMode = announcementItem.querySelector('.view-mode');
            const editMode = announcementItem.querySelector('.edit-mode');

            editMode.style.display = 'none';
            viewMode.style.display = 'block';
        });
    });

    editForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const announcementItem = this.closest('.announcement-item');
            const viewMode = announcementItem.querySelector('.view-mode');
            const editMode = announcementItem.querySelector('.edit-mode');

            const titleInput = this.querySelector('input[type="text"]');
            const contentTextarea = this.querySelector('textarea');
            const dateInput = this.querySelector('input[id*="edit-date"]');

            const title = titleInput.value;
            const content = contentTextarea.value;
            const date = dateInput.value;

            // Update view mode
            viewMode.querySelector('h4').textContent = title;
            viewMode.querySelector('p').textContent = content;
            viewMode.querySelector('.announcement-date').textContent = date;

            // Hide edit mode, show view mode
            editMode.style.display = 'none';
            viewMode.style.display = 'block';

            alert('Announcement updated successfully!');
        });
    });

    console.log('Post Announcement page loaded successfully');
});
